const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI;
let client;
let db;

async function getDb() {
  if (!client) {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, maxPoolSize: 1 });
    await client.connect();
    db = client.db('conspiracy');
  }
  return db;
}

exports.handler = async (event) => {
  try {
    if (!uri) {
      return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'No URI' }) };
    }

    const database = await getDb();
    const col = database.collection('participants');
    const code = event.queryStringParameters?.code;

    if (event.httpMethod === 'GET') {
      if (code === 'all') {
        const docs = await col.find({}).toArray();
        const allData = {};
        docs.forEach(doc => { allData[doc.participant_code] = doc; });
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(allData)
        };
      }

      const doc = await col.findOne({ participant_code: code });
      if (!doc) {
        return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) };
      }
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(doc) };
    }

    if (event.httpMethod === 'PUT') {
      const data = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

      if (code === 'missions-unlock') {
        await col.updateMany({}, { $set: { [`mission${data.missionId}_unlocked`]: true, updatedAt: new Date() } });
        return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ success: true }) };
      }

      if (code === 'missions-lock') {
        await col.updateMany({}, { $set: { [`mission${data.missionId}_unlocked`]: false, updatedAt: new Date() } });
        return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ success: true }) };
      }

      await col.updateOne(
        { participant_code: code },
        { $set: { ...data, updatedAt: new Date() } },
        { upsert: true }
      );
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: error.message }) };
  }
};
