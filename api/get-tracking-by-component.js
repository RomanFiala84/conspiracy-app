// api/get-tracking-by-component.js
// Získa agregované tracking dáta pre konkrétny komponent

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

    // Agreguj tracking dáta
    const aggregatedPositions = [];
    const users = new Set();
    let totalHoverTime = 0;
    let componentTemplateUrl = null;
    let containerDimensions = null;

    records.forEach(record => {
      // Agreguj pozície
      if (record.mousePositions && Array.isArray(record.mousePositions)) {
        aggregatedPositions.push(...record.mousePositions);
      }

      // Zber metadáta
      users.add(record.userId);
      totalHoverTime += record.hoverMetrics?.totalHoverTime || 0;

      // Zachytaj component template URL (z najnovšieho záznamu s Cloudinary dátami)
      if (record.cloudinaryData?.url && !componentTemplateUrl) {
        componentTemplateUrl = record.cloudinaryData.url;
      }

      // Zachytaj rozmery containera
      if (record.containerDimensions && !containerDimensions) {
        containerDimensions = record.containerDimensions;
      }
    });

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
        containerDimensions,
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
