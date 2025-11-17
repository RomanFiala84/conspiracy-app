// api/get-tracking-by-component.js
// Získa agregované tracking dáta pre konkrétny komponent s landmarks

import { MongoClient } from 'mongodb';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedClient = client;
  
  return client;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { contentId, contentType } = req.query;

    if (!contentId || !contentType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing contentId or contentType' 
      });
    }

    const client = await connectToDatabase();
    const db = client.db('conspiracy');

    // Načítaj všetky tracking záznamy pre tento komponent
    const records = await db.collection('hover_tracking')
      .find({ 
        contentId: contentId,
        contentType: contentType 
      })
      .toArray();

    if (records.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'No tracking data found for this component' 
      });
    }

    console.log(`✅ Found ${records.length} tracking records for ${contentId}`);

    // ✅ Agreguj tracking dáta zo všetkých používateľov
    const aggregatedPositions = [];
    const users = new Set();
    let totalHoverTime = 0;
    let componentTemplateUrl = null;
    let containerDimensions = null;
    let aggregatedLandmarks = [];

    records.forEach(record => {
      // Agreguj pozície
      if (record.mousePositions && Array.isArray(record.mousePositions)) {
        aggregatedPositions.push(...record.mousePositions);
      }

      // Zber metadáta
      users.add(record.userId);
      totalHoverTime += record.hoverMetrics?.totalHoverTime || 0;

      // ✅ Zachytaj landmarks (použij prvý záznam alebo najnovší)
      if (record.landmarks && record.landmarks.length > 0 && aggregatedLandmarks.length === 0) {
        aggregatedLandmarks = record.landmarks;
      }

      // Zachytaj rozmery containera (mali by byť štandardné)
      if (record.containerDimensions && !containerDimensions) {
        containerDimensions = record.containerDimensions;
      }
    });

    // ✅ Hľadaj component template v Cloudinary
    // Skúsime nájsť cez Cloudinary API alebo MongoDB
    try {
      // Príklad: template môže byť uložený v samostatnej kolekcii alebo v Cloudinary
      const templatePublicId = `conspiracy-app/component-templates/template_${contentId}`;
      componentTemplateUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${templatePublicId}.png`;
      
      console.log('🎨 Component template URL:', componentTemplateUrl);
    } catch (error) {
      console.warn('⚠️ Component template not found:', error.message);
    }

    const avgHoverTime = records.length > 0 ? totalHoverTime / records.length : 0;

    return res.status(200).json({
      success: true,
      data: {
        contentId,
        contentType,
        aggregatedPositions,
        totalPositions: aggregatedPositions.length,
        usersCount: users.size,
        recordsCount: records.length,
        totalHoverTime,
        avgHoverTime,
        componentTemplateUrl,
        containerDimensions: containerDimensions || { width: 1200, height: 2000 },
        landmarks: aggregatedLandmarks,
      }
    });

  } catch (error) {
    console.error('❌ Get tracking by component error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
