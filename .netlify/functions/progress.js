/**
 * /netlify/functions/progress.js
 * Serverless MongoDB API pre CPASS Game – verzia s globálnym stavom misií
 */

const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('❌ Environment variable MONGO_URI nie je nastavená!');
}

//
// 🧩 1️⃣ Connection pooling
//
const getConnection = (() => {
  let cachedClient = null;

  return async () => {
    if (cachedClient) {
      console.log('♻️ Using cached MongoDB connection');
      return cachedClient;
    }

    console.log('🔌 Creating new MongoDB connection...');
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 60000,
      retryWrites: true,
      w: 'majority',
    });

    await client.connect();
    console.log('✅ MongoDB connected');
    cachedClient = client;
    return cachedClient;
  };
})();

//
// 🧩 2️⃣ CORS Helper
//
const getCorsHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-cache',
});

//
// 🧩 3️⃣ Helper – načítanie globálneho stavu misií
//
const getGlobalMissionsState = async (db) => {
  const configCol = db.collection('missions_config');
  let config = await configCol.findOne({ _id: 'global_missions' });
  
  if (!config) {
    console.log('🆕 Vytváram globálny stav misií');
    config = {
      _id: 'global_missions',
      mission0_unlocked: false,
      mission1_unlocked: false,
      mission2_unlocked: false,
      mission3_unlocked: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await configCol.insertOne(config);
  }
  
  return config;
};

//
// 🧩 4️⃣ Helper – vytvorenie nového používateľa
//
const createNewParticipant = async (code, db) => {
  const group = Math.random() < 0.33 ? '0' : Math.random() < 0.66 ? '1' : '2';
  
  // Načítaj globálny stav misií
  const globalState = await getGlobalMissionsState(db);
  
  return {
    participant_code: code,
    group_assignment: group,
    completedSections: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // Použij globálny stav namiesto hard-coded false
    mission0_unlocked: globalState.mission0_unlocked,
    mission0_completed: false,
    mission1_unlocked: globalState.mission1_unlocked,
    mission1_completed: false,
    mission2_unlocked: globalState.mission2_unlocked,
    mission2_completed: false,
    mission3_unlocked: globalState.mission3_unlocked,
    mission3_completed: false,
    
    // User stats
    user_stats_points: 0,
    user_stats_level: 1,
    referrals_count: 0,
    instruction_completed: false,
    intro_completed: false,
    mainmenu_visits: 0,
    session_count: 1,
    total_time_spent: 0,
    current_progress_step: 'instruction',
    timestamp_start: new Date().toISOString(),
    timestamp_last_update: new Date().toISOString(),
    sharing_code: null,
    referral_code: null
  };
};

//
// 🧩 5️⃣ Main Handler
//
exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: getCorsHeaders(), body: '' };
    }

    if (!uri) {
      return {
        statusCode: 500,
        headers: getCorsHeaders(),
        body: JSON.stringify({ error: 'MONGO_URI not configured' }),
      };
    }

    const client = await getConnection();
    const db = client.db('conspiracy');
    const col = db.collection('participants');

    const code =
      event.queryStringParameters?.code ||
      (event.path ? event.path.split('/').pop() : null);

    console.log(`📝 Request: ${event.httpMethod} ${event.path} (code: ${code})`);

    //
    // 📖 GET – Načítanie alebo automatická registrácia
    //
    if (event.httpMethod === 'GET') {
      try {
        if (code === 'all') {
          const docs = await col.find({}).toArray();
          const allData = {};
          docs.forEach((doc) => (allData[doc.participant_code] = doc));
          console.log(`✓ Vrátené ${Object.keys(allData).length} záznamov`);
          return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify(allData),
          };
        }

        let doc = await col.findOne({ participant_code: code });
        if (!doc) {
          console.log(`🆕 Automatická registrácia nového účastníka: ${code}`);
          const newUser = await createNewParticipant(code, db);
          await col.insertOne(newUser);
          doc = newUser;
          console.log(`✅ Vytvorený nový user ${code} s globálnym stavom misií`);
        }

        console.log(`✓ Vrátený používateľ ${code}`);
        return {
          statusCode: 200,
          headers: getCorsHeaders(),
          body: JSON.stringify(doc),
        };
      } catch (dbError) {
        console.error('❌ GET database error:', dbError);
        return {
          statusCode: 500,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'Database query failed', details: dbError.message }),
        };
      }
    }

    //
    // 💾 PUT – Uloženie progresu alebo zámkov
    //
    if (event.httpMethod === 'PUT') {
      let data;
      try {
        data = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      } catch (e) {
        console.error('❌ Chyba pri parsovaní JSON:', e);
        return {
          statusCode: 400,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'Invalid JSON' }),
        };
      }

      try {
        // 🔒 / 🔓 Admin operácie
        if (code === 'missions-lock' || code === 'missions-unlock') {
          const lock = code === 'missions-lock';
          console.log(`${lock ? '🔒' : '🔓'} ${lock ? 'Zamykám' : 'Odomykám'} misiu ${data.missionId}`);
          
          if ((!data.missionId && data.missionId !== 0) || !data.adminCode) {
            return {
              statusCode: 400,
              headers: getCorsHeaders(),
              body: JSON.stringify({ error: 'Missing missionId or adminCode' }),
            };
          }
          
          if (data.adminCode !== 'RF9846') {
            console.log(`❌ Nesprávny admin kód: ${data.adminCode}`);
            return {
              statusCode: 403,
              headers: getCorsHeaders(),
              body: JSON.stringify({ error: 'Forbidden' }),
            };
          }

          const missionField = `mission${data.missionId}_unlocked`;
          
          // 1. Aktualizuj globálny stav
          const configCol = db.collection('missions_config');
          await configCol.updateOne(
            { _id: 'global_missions' },
            { 
              $set: { 
                [missionField]: !lock,
                updatedAt: new Date()
              }
            },
            { upsert: true }
          );
          console.log(`✅ Globálny stav: ${missionField} = ${!lock}`);
          
          // 2. Aktualizuj všetkých existujúcich používateľov
          const result = await col.updateMany(
            {},
            { $set: { [missionField]: !lock, updatedAt: new Date() } }
          );

          console.log(`✓ ${lock ? 'Zamknutá' : 'Odomknutá'} misia ${data.missionId} (${result.modifiedCount} účastníkov)`);
          
          const countAfter = await col.countDocuments({ [missionField]: !lock });
          console.log(`📊 Počet používateľov s ${missionField}=${!lock}: ${countAfter}`);
          
          return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({ 
              modifiedCount: result.modifiedCount,
              globalStateUpdated: true,
              usersWithUnlock: countAfter
            }),
          };
        }

        // 💾 Bežný update / auto-registrácia
        console.log(`💾 Ukladám progres pre ${code}`);
        const group =
          data.group_assignment ||
          (Math.random() < 0.33 ? '0' : Math.random() < 0.66 ? '1' : '2');

        const { participant_code, ...dataToUpdate } = data;

        // Načítaj globálny stav pre $setOnInsert
        const globalState = await getGlobalMissionsState(db);

        await col.updateOne(
          { participant_code: code },
          {
            $setOnInsert: {
              participant_code: code,
              group_assignment: group,
              createdAt: new Date(),
              
              // Použij globálny stav
              mission0_unlocked: globalState.mission0_unlocked,
              mission0_completed: false,
              mission1_unlocked: globalState.mission1_unlocked,
              mission1_completed: false,
              mission2_unlocked: globalState.mission2_unlocked,
              mission2_completed: false,
              mission3_unlocked: globalState.mission3_unlocked,
              mission3_completed: false,
              
              completedSections: [],
              user_stats_points: 0,
              user_stats_level: 1,
              referrals_count: 0,
              instruction_completed: false,
              intro_completed: false,
              mainmenu_visits: 0,
              session_count: 1,
              total_time_spent: 0,
              current_progress_step: 'instruction',
              timestamp_start: new Date().toISOString(),
              timestamp_last_update: new Date().toISOString(),
              sharing_code: null,
              referral_code: null
            },
            $set: {
              ...dataToUpdate,
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        );

        const updated = await col.findOne({ participant_code: code });
        console.log(`✓ Uložený progres pre ${code}`);
        return {
          statusCode: 200,
          headers: getCorsHeaders(),
          body: JSON.stringify(updated),
        };
      } catch (dbError) {
        console.error('❌ PUT database error:', dbError);
        return {
          statusCode: 500,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'Database update failed', details: dbError.message }),
        };
      }
    }

    //
    // 🗑️ DELETE – Mazanie dát
    //
    if (event.httpMethod === 'DELETE') {
      let data;
      try {
        data = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      } catch (e) {
        console.error('❌ JSON parse error:', e);
        return {
          statusCode: 400,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'Invalid JSON' }),
        };
      }

      try {
        if (!data || !data.adminCode) {
          return {
            statusCode: 400,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: 'Missing adminCode' }),
          };
        }

        if (data.adminCode !== 'RF9846') {
          console.log(`❌ Unauthorized delete attempt: ${data.adminCode}`);
          return {
            statusCode: 403,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: 'Forbidden' }),
          };
        }

        if (code === 'all') {
          // Vymaž všetkých používateľov
          const result = await col.deleteMany({});
          
          // Reset globálneho stavu misií
          const configCol = db.collection('missions_config');
          await configCol.updateOne(
            { _id: 'global_missions' },
            {
              $set: {
                mission0_unlocked: false,
                mission1_unlocked: false,
                mission2_unlocked: false,
                mission3_unlocked: false,
                updatedAt: new Date()
              }
            },
            { upsert: true }
          );
          
          console.log(`🗑️ Vymazaných ${result.deletedCount} záznamov a resetovaný globálny stav`);
          return {
            statusCode: 200,
            headers: getCorsHeaders(),
            body: JSON.stringify({ 
              success: true, 
              deletedCount: result.deletedCount,
              globalStateReset: true
            }),
          };
        }

        const result = await col.deleteOne({ participant_code: code });
        console.log(`🗑️ Vymazaný účastník ${code}`);
        return {
          statusCode: 200,
          headers: getCorsHeaders(),
          body: JSON.stringify({ success: true, deletedCount: result.deletedCount }),
        };
      } catch (dbError) {
        console.error('❌ DELETE database error:', dbError);
        return {
          statusCode: 500,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'Database delete failed', details: dbError.message }),
        };
      }
    }

    //
    // ❌ Nepodporovaná metóda
    //
    return {
      statusCode: 405,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  } catch (error) {
    console.error('❌ Serverová chyba:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message }),
    };
  }
};