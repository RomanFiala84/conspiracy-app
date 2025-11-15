// api/admin-tracking-components.js
// Agregácia tracking dát pre AdminPanel

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
  // CORS headers
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
    const client = await connectToDatabase();
    const db = client.db('conspiracy');

    // Agregácia tracking dát podľa contentId a contentType
    const aggregation = await db.collection('hover_tracking').aggregate([
      {
        $group: {
          _id: {
            contentId: '$contentId',
            contentType: '$contentType'
          },
          usersCount: { $addToSet: '$userId' },
          totalPoints: { $sum: { $size: '$mousePositions' } },
          avgHoverTime: { $avg: '$hoverMetrics.totalHoverTime' },
          recordsCount: { $sum: 1 },
          lastUpdated: { $max: '$timestamp' },
          visualizations: { $push: '$cloudinaryData.url' }
        }
      },
      {
        $project: {
          contentId: '$_id.contentId',
          contentType: '$_id.contentType',
          usersCount: { $size: '$usersCount' },
          totalPoints: 1,
          avgHoverTime: 1,
          recordsCount: 1,
          lastUpdated: 1,
          visualizations: {
            $filter: {
              input: '$visualizations',
              as: 'viz',
              cond: { $ne: ['$$viz', null] }
            }
          }
        }
      },
      { $sort: { recordsCount: -1 } }
    ]).toArray();

    return res.status(200).json({
      success: true,
      components: aggregation.map(item => ({
        contentId: item.contentId,
        contentType: item.contentType,
        usersCount: item.usersCount,
        totalPoints: item.totalPoints,
        avgHoverTime: Math.round(item.avgHoverTime || 0),
        recordsCount: item.recordsCount,
        lastUpdated: item.lastUpdated,
        visualizationsCount: item.visualizations.length,
        latestVisualization: item.visualizations[item.visualizations.length - 1] || null
      })),
      total: aggregation.length
    });

  } catch (error) {
    console.error('❌ Admin tracking components error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
