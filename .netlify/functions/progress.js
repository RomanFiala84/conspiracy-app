const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;

// OPRAVA #1: Lepšie connection pooling
const getConnection = (() => {
  let cachedClient = null;
  
  return async () => {
    if (cachedClient && cachedClient.topology && cachedClient.topology.isConnected()) {
      console.log('♻️ Using cached MongoDB connection');
      return cachedClient;
    }
    
    console.log('🔌 Creating new MongoDB connection...');
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,        // OPRAVA: zvýšená z 1
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });
    
    await client.connect();
    cachedClient = client;
    console.log('✅ MongoDB connected');
    return cachedClient;
  };
})();

// OPRAVA #2: CORS Headers helper
const getCorsHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-cache'
});

exports.handler = async (event) => {
  try {
    // OPRAVA #3: Handle OPTIONS for CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: ''
      };
    }

    if (!uri) {
      console.error('❌ MONGO_URI nie je nastavená!');
      return {
        statusCode: 500,
        headers: getCorsHeaders(),
        body: JSON.stringify({ error: 'MONGO_URI not configured' })
      };
    }

    const client = await getConnection();
    const db = client.db('conspiracy');
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
      try {
        if (code === 'all') {
          const docs = await col.find({}).toArray();
          const allData = {};
          docs.forEach(doc => {
            allData[doc.participant_code] = doc;
          });
          console.log(`✓ Vrátené ${Object.keys(allData).length} záznamov`);
          return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify(allData)
          };
        }

        const doc = await col.findOne({ participant_code: code });
        if (!doc) {
          console.log(`❌ Používateľ ${code} nenájdený`);
          return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({})
          };
        }
        console.log(`✓ Vrátený používateľ ${code}`);
        return {
          statusCode: 200,
          headers: getCorsHeaders(),
          body: JSON.stringify(doc)
        };
      } catch (dbError) {
        console.error('❌ GET database error:', dbError.message);
        return {
          statusCode: 500,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'Database query failed', details: dbError.message })
        };
      }
    }

    if (event.httpMethod === 'PUT') {
      let data;
      try {
        data = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      } catch (e) {
        console.error('❌ Chyba pri parsovaní JSON:', e);
        return {
          statusCode: 400,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'Invalid JSON' })
        };
      }

      try {
        if (code === 'missions-unlock') {
          console.log(`🔓 Odomykám misiu ${data.missionId} pre všetkých...`);
          if ((!data.missionId && data.missionId !== 0) || !data.adminCode) {
            return {
              statusCode: 400,
              headers: getCorsHeaders(),
              body: JSON.stringify({ error: 'Missing missionId or adminCode' })
            };
          }
          if (data.adminCode !== 'RF9846') {
            console.log(`❌ Nesprávny admin kód: ${data.adminCode}`);
            return {
              statusCode: 403,
              headers: getCorsHeaders(),
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
            headers: getCorsHeaders(),
            body: JSON.stringify({ modifiedCount: result.modifiedCount })
          };
        }

        if (code === 'missions-lock') {
          console.log(`🔒 Zamykám misiu ${data.missionId} pre všetkých...`);
          if ((!data.missionId && data.missionId !== 0) || !data.adminCode) {
            return {
              statusCode: 400,
              headers: getCorsHeaders(),
              body: JSON.stringify({ error: 'Missing missionId or adminCode' })
            };
          }
          if (data.adminCode !== 'RF9846') {
            console.log(`❌ Nesprávny admin kód: ${data.adminCode}`);
            return {
              statusCode: 403,
              headers: getCorsHeaders(),
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
            headers: getCorsHeaders(),
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
          headers: getCorsHeaders(),
          body: JSON.stringify(updated)
        };
      } catch (dbError) {
        console.error('❌ PUT database error:', dbError.message);
        return {
          statusCode: 500,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'Database update failed', details: dbError.message })
        };
      }
    }

    // OPRAVA #4: DELETE endpoint
    if (event.httpMethod === 'DELETE') {
      let data;
      try {
        data = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      } catch (e) {
        console.error('❌ JSON parse error:', e);
        return {
          statusCode: 400,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'Invalid JSON' })
        };
      }

      try {
        if (!data || !data.adminCode) {
          return {
            statusCode: 400,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: 'Missing adminCode' })
          };
        }

        if (data.adminCode !== 'RF9846') {
          console.log(`❌ Unauthorized delete attempt: ${data.adminCode}`);
          return {
            statusCode: 403,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: 'Forbidden' })
          };
        }

        if (code === 'all') {
          const result = await col.deleteMany({});
          console.log(`🗑️ Vymazáno ${result.deletedCount} záznamov`);
          return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({ success: true, deletedCount: result.deletedCount })
          };
        }

        const result = await col.deleteOne({ participant_code: code });
        console.log(`🗑️ Vymazaný účastník ${code}`);
        return {
          statusCode: 200,
          headers: getCorsHeaders(),
          body: JSON.stringify({ success: true, deletedCount: result.deletedCount })
        };
      } catch (dbError) {
        console.error('❌ DELETE database error:', dbError.message);
        return {
          statusCode: 500,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'Database delete failed', details: dbError.message })
        };
      }
    }

    return {
      statusCode: 405,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  } catch (error) {
    console.error('❌ Serverová chyba:', error);
    console.error('Stack:', error.stack);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
};