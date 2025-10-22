const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
let client;
let db;

exports.handler = async (event) => {
  try {
    if (!uri) {
      console.error('❌ MONGO_URI nie je nastavená!');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'MONGO_URI not configured' })
      };
    }

    if (!client) {
      console.log('🔌 Pripájam sa na MongoDB...');
      client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      db = client.db('conspiracy');
      console.log('✅ MongoDB pripojené');
    }
    const col = db.collection('participants');

    let code;
    if (event.queryStringParameters && event.queryStringParameters.code) {
      code = event.queryStringParameters.code;
    } else if (event.path) {
      code = event.path.split('/').pop();
    } else {
      code = null;
    }

    console.log(`📝 Request: ${event.httpMethod} ${event.path} (code: ${code})`);

    if (event.httpMethod === 'GET') {
      if (code === 'all') {
        const docs = await col.find({}).toArray();
        const allData = {};
        docs.forEach(doc => {
          allData[doc.participant_code] = doc;
        });
        console.log(`✓ Vrátené ${Object.keys(allData).length} záznamov`);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(allData)
        };
      }

      const doc = await col.findOne({ participant_code: code });
      if (!doc) {
        console.log(`❌ Používateľ ${code} nenájdený`);
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Not found' })
        };
      }
      console.log(`✓ Vrátený používateľ ${code}`);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      };
    }

    if (event.httpMethod === 'PUT') {
      let data;
      try {
        data = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      } catch (e) {
        console.error('❌ Chyba pri parsovaní JSON:', e);
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid JSON' })
        };
      }

      if (code === 'missions-unlock') {
        console.log(`🔓 Odomykám misiu ${data.missionId} pre všetkých...`);
        if ((!data.missionId && data.missionId !== 0) || !data.adminCode) {
          return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Missing missionId or adminCode' })
          };
        }
        if (data.adminCode !== 'RF9846') {
          console.log(`❌ Nesprávny admin kód: ${data.adminCode}`);
          return {
            statusCode: 403,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Forbidden' })
          };
        }
        const missionField = `mission${data.missionId}_unlocked`;
        const result = await col.updateMany(
          {},
          { $set: { [missionField]: true, updatedAt: new Date() } }
        );
        console.log(`✓ Odomknutá misia ${data.missionId} pre ${result.modifiedCount} účastníkov`);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ modifiedCount: result.modifiedCount })
        };
      }

      if (code === 'missions-lock') {
        console.log(`🔒 Zamykám misiu ${data.missionId} pre všetkých...`);
        if ((!data.missionId && data.missionId !== 0) || !data.adminCode) {
          return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Missing missionId or adminCode' })
          };
        }
        if (data.adminCode !== 'RF9846') {
          console.log(`❌ Nesprávny admin kód: ${data.adminCode}`);
          return {
            statusCode: 403,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Forbidden' })
          };
        }
        const missionField = `mission${data.missionId}_unlocked`;
        const result = await col.updateMany(
          {},
          { $set: { [missionField]: false, updatedAt: new Date() } }
        );
        console.log(`✓ Zamknutá misia ${data.missionId} pre ${result.modifiedCount} účastníkov`);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ modifiedCount: result.modifiedCount })
        };
      }

      console.log(`💾 Ukladám progres pre ${code}`);
      const group = data.group_assignment || (Math.random() < 0.33 ? '0' : Math.random() < 0.66 ? '1' : '2');

      await col.updateOne(
        { participant_code: code },
        {
          $setOnInsert: {
            participant_code: code,
            group_assignment: group,
            createdAt: new Date()
          },
          $set: {
            ...data,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

      const updated = await col.findOne({ participant_code: code });
      console.log(`✓ Uložený progres pre ${code}`);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      };
    }

    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  } catch (error) {
    console.error('❌ Serverová chyba:', error);
    console.error('Stack:', error.stack);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
};
