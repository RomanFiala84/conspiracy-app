/**
 * /api/progress.js
 * KOMPLETNÁ OPRAVENÁ VERZIA - správne responses merge + náhodné skupiny
 * Upravené pre Vercel
 */

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ Environment variable MONGODB_URI nie je nastavená!');
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
const getCorsHeaders = (res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache');
};

//
// 🧩 3️⃣ Helper – náhodné priradenie skupiny
//
const assignRandomGroup = () => {
  const rand = Math.random();
  if (rand < 0.33) return '0';      // 33% šanca
  if (rand < 0.66) return '1';      // 33% šanca
  return '2';                        // 34% šanca
};

//
// 🧩 4️⃣ Helper – načítanie globálneho stavu misií
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
// 🧩 5️⃣ Helper – vytvorenie nového používateľa
//
const createNewParticipant = async (code, db) => {
  const group = assignRandomGroup();  // ✅ Náhodná skupina
  const globalState = await getGlobalMissionsState(db);
  
  const newUser = {
    participant_code: code,
    group_assignment: group,
    completedSections: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // Mission status z globálneho stavu
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
    referral_code: null,
    
    // ✅ KRITICKÉ: Inicializuj responses objekt
    responses: {}
  };
  
  console.log(`✅ Vytvorený nový používateľ ${code} v skupine ${group}`);
  return newUser;
};

//
// 🧩 6️⃣ Main Handler
//
export default async function handler(req, res) {
  try {
    getCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (!uri) {
      return res.status(500).json({ error: 'MONGODB_URI not configured' });
    }

    const client = await getConnection();
    const db = client.db('conspiracy');
    const col = db.collection('participants');

    const code = req.query.code;

    console.log(`📝 Request: ${req.method} ${req.url} (code: ${code})`);

    //
    // 📖 GET – Načítanie alebo automatická registrácia
    //
    if (req.method === 'GET') {
      try {
        if (code === 'all') {
          const docs = await col.find({}).toArray();
          const allData = {};
          docs.forEach((doc) => (allData[doc.participant_code] = doc));
          console.log(`✓ Vrátené ${Object.keys(allData).length} záznamov`);
          return res.status(200).json(allData);
        }

        let doc = await col.findOne({ participant_code: code });
        if (!doc) {
          console.log(`🆕 Automatická registrácia nového účastníka: ${code}`);
          const newUser = await createNewParticipant(code, db);
          await col.insertOne(newUser);
          doc = newUser;
        }

        console.log(`✓ Vrátený používateľ ${code} (skupina: ${doc.group_assignment})`);
        return res.status(200).json(doc);
      } catch (dbError) {
        console.error('❌ GET database error:', dbError);
        return res.status(500).json({ 
          error: 'Database query failed', 
          details: dbError.message 
        });
      }
    }

    //
    // 💾 PUT – Uloženie progresu alebo zámkov
    //
    if (req.method === 'PUT') {
      const data = req.body;

      try {
        // 🔒 / 🔓 Admin operácie
        if (code === 'missions-lock' || code === 'missions-unlock') {
          const lock = code === 'missions-lock';
          console.log(`${lock ? '🔒' : '🔓'} ${lock ? 'Zamykám' : 'Odomykám'} misiu ${data.missionId}`);
          
          if ((!data.missionId && data.missionId !== 0) || !data.adminCode) {
            return res.status(400).json({ error: 'Missing missionId or adminCode' });
          }
          
          if (data.adminCode !== 'RF9846') {
            console.log(`❌ Nesprávny admin kód: ${data.adminCode}`);
            return res.status(403).json({ error: 'Forbidden' });
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
          
          return res.status(200).json({ 
            modifiedCount: result.modifiedCount,
            globalStateUpdated: true
          });
        }

        // 💾 Bežný update / auto-registrácia
        console.log(`💾 Ukladám progres pre ${code}`);
        
        const { participant_code, _id, createdAt, ...dataToUpdate } = data;

        // Načítaj existujúci dokument
        const existing = await col.findOne({ participant_code: code });
        
        if (!existing) {
          // ✅ Nový používateľ - vytvor s náhodnou skupinou
          console.log(`🆕 Vytváram nového používateľa ${code}`);
          const globalState = await getGlobalMissionsState(db);
          
          const newUser = {
            participant_code: code,
            group_assignment: dataToUpdate.group_assignment || assignRandomGroup(),  // ✅ Náhodná skupina
            createdAt: new Date(),
            updatedAt: new Date(),
            
            // Mission status
            mission0_unlocked: globalState.mission0_unlocked,
            mission0_completed: false,
            mission1_unlocked: globalState.mission1_unlocked,
            mission1_completed: false,
            mission2_unlocked: globalState.mission2_unlocked,
            mission2_completed: false,
            mission3_unlocked: globalState.mission3_unlocked,
            mission3_completed: false,
            
            // Default values
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
            referral_code: null,
            responses: {},  // ✅ Inicializuj responses
            
            // Merge s dataToUpdate
            ...dataToUpdate
          };
          
          await col.insertOne(newUser);
          console.log(`✅ Vytvorený nový používateľ ${code} v skupine ${newUser.group_assignment}`);
          
          return res.status(200).json(newUser);
        }
        
        // ✅ Existujúci používateľ - smart merge pre responses
        console.log(`📝 Aktualizujem existujúceho používateľa ${code}`);
        
        // Deep merge pre responses objekt
        const mergedResponses = { ...(existing.responses || {}) };
        
        if (dataToUpdate.responses) {
          Object.entries(dataToUpdate.responses).forEach(([componentId, componentData]) => {
            // Merge každý komponent samostatne
            if (componentData && typeof componentData === 'object') {
              mergedResponses[componentId] = componentData;
            }
          });
          console.log(`📊 Merging responses components: ${Object.keys(dataToUpdate.responses).join(', ')}`);
        }
        
        // Priprav update data
        const updateData = {
          ...dataToUpdate,
          responses: mergedResponses,  // ✅ Použiť merged responses
          updatedAt: new Date(),
          timestamp_last_update: new Date().toISOString()
        };
        
        // Vymaž responses z dataToUpdate ak je prázdny
        delete updateData.responses;
        
        await col.updateOne(
          { participant_code: code },
          { 
            $set: {
              ...updateData,
              // Nastav responses samostatne aby sa zachoval merge
              ...Object.keys(mergedResponses).reduce((acc, key) => {
                acc[`responses.${key}`] = mergedResponses[key];
                return acc;
              }, {})
            }
          }
        );

        const updated = await col.findOne({ participant_code: code });
        console.log(`✅ Aktualizovaný používateľ ${code}`);
        
        // Debug log pre responses
        if (updated.responses && Object.keys(updated.responses).length > 0) {
          console.log(`📊 Responses components uložené: ${Object.keys(updated.responses).join(', ')}`);
        }
        
        return res.status(200).json(updated);
        
      } catch (dbError) {
        console.error('❌ PUT database error:', dbError);
        console.error('Stack trace:', dbError.stack);
        return res.status(500).json({ 
          error: 'Database update failed', 
          details: dbError.message,
          stack: dbError.stack 
        });
      }
    }

    //
    // 🗑️ DELETE – Mazanie dát
    //
    if (req.method === 'DELETE') {
      const data = req.body;

      try {
        if (!data || !data.adminCode) {
          return res.status(400).json({ error: 'Missing adminCode' });
        }

        if (data.adminCode !== 'RF9846') {
          console.log(`❌ Unauthorized delete attempt: ${data.adminCode}`);
          return res.status(403).json({ error: 'Forbidden' });
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
          return res.status(200).json({ 
            success: true, 
            deletedCount: result.deletedCount,
            globalStateReset: true
          });
        }

        const result = await col.deleteOne({ participant_code: code });
        console.log(`🗑️ Vymazaný účastník ${code}`);
        return res.status(200).json({ 
          success: true, 
          deletedCount: result.deletedCount 
        });
      } catch (dbError) {
        console.error('❌ DELETE database error:', dbError);
        return res.status(500).json({ 
          error: 'Database delete failed', 
          details: dbError.message 
        });
      }
    }

    //
    // ❌ Nepodporovaná metóda
    //
    return res.status(405).json({ error: 'Method Not Allowed' });
    
  } catch (error) {
    console.error('❌ Serverová chyba:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      stack: error.stack 
    });
  }
}
