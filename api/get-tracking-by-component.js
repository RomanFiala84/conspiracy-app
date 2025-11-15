// api/get-tracking-by-component.js
// Získava tracking dáta pre konkrétny contentId a contentType

import { MongoClient } from 'mongodb';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    // Získaj všetky tracking záznamy pre daný komponent
    const records = await db.collection('hover_tracking')
      .find({
        contentId: contentId,
        contentType: contentType
      })
      .sort({ timestamp: -1 })
      .toArray();

    // Agreguj všetky pozície myši do jedného datasetu pre heatmap
    const allPositions = [];
    let totalHoverTime = 0;
    const uniqueUsers = new Set();

    records.forEach(record => {
      uniqueUsers.add(record.userId);
      
      if (record.mousePositions && Array.isArray(record.mousePositions)) {
        allPositions.push(...record.mousePositions);
      }
      
      if (record.hoverMetrics?.totalHoverTime) {
        totalHoverTime += record.hoverMetrics.totalHoverTime;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        contentId,
        contentType,
        usersCount: uniqueUsers.size,
        recordsCount: records.length,
        totalPositions: allPositions.length,
        totalHoverTime,
        avgHoverTime: uniqueUsers.size > 0 ? Math.round(totalHoverTime / uniqueUsers.size) : 0,
        aggregatedPositions: allPositions,
        individualRecords: records,
        containerDimensions: records[0]?.containerDimensions || null
      }
    });

  } catch (error) {
    console.error('❌ Get tracking by component error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
