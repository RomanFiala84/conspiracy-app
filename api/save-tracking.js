// api/save-tracking.js
// OPRAVENÁ VERZIA - Lepšia štruktúra pre agregáciu a Cloudinary

import { MongoClient } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';

// Konfigurácia Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB connection (s cachovaním)
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

// Helper funkcia - analýza pohybu
function analyzeMouseMovement(positions) {
  if (!positions || positions.length < 2) {
    return {
      pattern: 'insufficient_data',
      averageSpeed: 0,
      totalPoints: 0,
    };
  }

  let horizontalMovements = 0;
  let verticalMovements = 0;
  let totalSpeed = 0;

  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];

    const deltaX = Math.abs(curr.x - prev.x);
    const deltaY = Math.abs(curr.y - prev.y);
    const deltaTime = curr.timestamp - prev.timestamp;

    if (deltaX > deltaY * 1.5) horizontalMovements++;
    if (deltaY > deltaX * 1.5) verticalMovements++;

    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const speed = deltaTime > 0 ? distance / deltaTime : 0;
    totalSpeed += speed;
  }

  const avgSpeed = totalSpeed / (positions.length - 1);
  
  let pattern = 'mixed';
  if (horizontalMovements > verticalMovements * 2) {
    pattern = 'horizontal_reading';
  } else if (verticalMovements > horizontalMovements * 2) {
    pattern = 'vertical_scanning';
  }

  return {
    pattern,
    averageSpeed: Math.round(avgSpeed * 1000) / 1000,
    totalPoints: positions.length,
  };
}

// Vercel Function Handler
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { visualization, ...trackingData } = req.body;

    console.log('📥 Received tracking data for:', trackingData.contentId);

    let cloudinaryData = null;

    // ✅ Upload vizualizácie do Cloudinary
    if (visualization) {
      try {
        const filename = `${trackingData.userId}_${trackingData.contentId}_${Date.now()}`;
        
        const result = await cloudinary.uploader.upload(visualization, {
          folder: 'hover-tracking-visualizations',
          public_id: filename,
          resource_type: 'image',
          format: 'png', // ✅ PNG namiesto webp pre lepšiu kompatibilitu
          transformation: [
            { width: 1200, crop: 'limit', quality: 'auto:good' },
          ],
        });

        cloudinaryData = {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          createdAt: new Date().toISOString(),
        };

        console.log('✅ Cloudinary upload successful:', cloudinaryData.url);
      } catch (uploadError) {
        console.error('❌ Cloudinary upload failed:', uploadError);
        // Pokračuj bez vizualizácie
      }
    }

    // Analýza pohybu myši
    const movementAnalysis = analyzeMouseMovement(trackingData.mousePositions || []);

    // ✅ Uloženie do MongoDB
    const client = await connectToDatabase();
    const db = client.db('conspiracy');
    
    const trackingRecord = {
      userId: trackingData.userId,
      contentId: trackingData.contentId,
      contentType: trackingData.contentType,
      timestamp: new Date(),
      hoverMetrics: {
        totalHoverTime: trackingData.hoverMetrics?.totalHoverTime || 0,
        hoverStartTime: trackingData.hoverMetrics?.hoverStartTime,
        hoverEndTime: trackingData.hoverMetrics?.hoverEndTime,
      },
      mousePositions: trackingData.mousePositions || [],
      movementAnalysis,
      cloudinaryData, // ✅ Ukladá URL, publicId, atď.
      containerDimensions: trackingData.containerDimensions,
    };

    // ✅ Uložiť ako samostatný dokument (lepšie pre agregáciu)
    const result = await db.collection('hover_tracking').insertOne(trackingRecord);

    console.log('✅ MongoDB save successful:', result.insertedId);

    return res.status(200).json({
      success: true,
      trackingId: result.insertedId,
      imageUrl: cloudinaryData?.url || null,
      cloudinaryPublicId: cloudinaryData?.publicId || null,
    });

  } catch (error) {
    console.error('❌ Function error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
