/**
 * /api/progress.js
 * ✅ OPRAVENÁ VERZIA - fix pre individuálne odomykanie misií
 * Správne responses merge + náhodné skupiny + informovaný súhlas
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
const assignBalancedGroup = async (col) => {
  const count0 = await col.countDocuments({ group_assignment: '0' });
  const count1 = await col.countDocuments({ group_assignment: '1' });
  const count2 = await col.countDocuments({ group_assignment: '2' });
  const minCount = Math.min(count0, count1, count2);
  const tied = [];
  if (count0 === minCount) tied.push('0');
  if (count1 === minCount) tied.push('1');
  if (count2 === minCount) tied.push('2');
  return tied[Math.floor(Math.random() * tied.length)];
};

const assignBalancedVersion = async (col, group) => {  // ← pridaj group parameter
  const countA = await col.countDocuments({ group_assignment: group, question_version: 'A' });
  const countB = await col.countDocuments({ group_assignment: group, question_version: 'B' });
  if (countA <= countB) return 'A';
  return 'B';
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
  const col = db.collection('participants');
  const group = await assignBalancedGroup(col);
  const version = await assignBalancedVersion(col, group);
  const globalState = await getGlobalMissionsState(db);
  
  const newUser = {
    participant_code: code,
    group_assignment: group,
    question_version: version,
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
    
    // Informovaný súhlas a súťaž
    informed_consent_given: false,
    informed_consent_timestamp: null,
    competition_consent_given: false,
    competition_consent_timestamp: null,
    competition_email: null,
    used_referral_code: null,
    blocked: false,
    
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
        // 🔒 / 🔓 Admin operácie - BATCH unlock/lock
        if (code === 'missions-lock' || code === 'missions-unlock') {
          const lock = code === 'missions-lock';
          console.log(`${lock ? '🔒' : '🔓'} ${lock ? 'Zamykám' : 'Odomykám'} misiu ${data.missionId}`);
          
          if ((!data.missionId && data.missionId !== 0) || !data.adminCode) {
            return res.status(400).json({ error: 'Missing missionId or adminCode' });
          }
          
          const ADMIN_CODE = process.env.ADMIN_CODE;
          if (data.adminCode !== ADMIN_CODE) {
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
        
        // ✅ FIX: Nepoužívaj destructuring - zachováme všetky fieldy
        const dataToUpdate = { ...data };
        delete dataToUpdate.participant_code;
        delete dataToUpdate._id;
        delete dataToUpdate.createdAt;

        // Načítaj existujúci dokument
        const existing = await col.findOne({ participant_code: code });
        
        if (!existing) {
          // ✅ Nový používateľ - vytvor s náhodnou skupinou
          console.log(`🆕 Vytváram nového používateľa ${code}`);
          const globalState = await getGlobalMissionsState(db);
          const group = dataToUpdate.group_assignment || await assignBalancedGroup(col);
          const version = dataToUpdate.question_version || await assignBalancedVersion(col, group);
          const newUser = {
            ...dataToUpdate,
            participant_code: code,
            group_assignment: group,        // ← použij premennú
            question_version: version,      // ← použij premennú
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
            
            informed_consent_given: false,
            informed_consent_timestamp: null,
            competition_consent_given: false,
            competition_consent_timestamp: null,
            competition_email: null,
            used_referral_code: null,
            blocked: false,
            
            responses: {},
            
            // ✅ Merge s dataToUpdate (obsahuje mission fieldy!)
          };
          
          await col.insertOne(newUser);
          console.log(`✅ Vytvorený nový používateľ ${code} v skupine ${newUser.group_assignment}`);
          
          return res.status(200).json(newUser);
        }
        
        // ✅ Existujúci používateľ - smart merge
        console.log(`📝 Aktualizujem existujúceho používateľa ${code}`);
        
        // Deep merge pre responses objekt
        const mergedResponses = { ...(existing.responses || {}) };
        
        if (dataToUpdate.responses) {
          Object.entries(dataToUpdate.responses).forEach(([componentId, componentData]) => {
            if (componentData && typeof componentData === 'object') {
              mergedResponses[componentId] = componentData;
            }
          });
          console.log(`📊 Merging responses components: ${Object.keys(dataToUpdate.responses).join(', ')}`);
        }
        
        // ✅ FIX: Priprav update data so všetkými fieldmi
        const updateData = {
          ...dataToUpdate,
          group_assignment: existing.group_assignment,
          question_version: existing.question_version,
          responses: mergedResponses,
          updatedAt: new Date(),
          timestamp_last_update: new Date().toISOString()
        };
        
        // ✅ FIX: Jednoduchý $set s celým updateData objektom
        await col.updateOne(
          { participant_code: code },
          { $set: updateData }
        );

        const updated = await col.findOne({ participant_code: code });
        console.log(`✅ Aktualizovaný používateľ ${code}`);
        
        // Debug log
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

        const ADMIN_CODE = process.env.ADMIN_CODE;
        if (!ADMIN_CODE || data.adminCode !== ADMIN_CODE) {
          console.log(`❌ Unauthorized delete attempt`);
          return res.status(403).json({ error: 'Forbidden' });
        }

        if (code === 'all') {
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
