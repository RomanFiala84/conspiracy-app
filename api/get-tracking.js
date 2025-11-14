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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contentType, userId, limit = '50' } = req.query;

    const client = await connectToDatabase();
    const db = client.db('conspiracy');

    const query = {};
    if (contentType) query.contentType = contentType;
    if (userId) query.userId = userId;

    const data = await db.collection('hover_tracking')
      .find(query)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      data: data,
      total: data.length,
    });

  } catch (error) {
    console.error('❌ Function error:', error);
    return res.status(500).json({ error: error.message });
  }
}
