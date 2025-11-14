// src/utils/DataManager.js
// OPRAVENÁ VERZIA - Zachováva unlocked stavy

import * as XLSX from 'xlsx';

class DataManager {
  constructor() {
    this.centralStorageKey = 'allParticipantsData';
    this.adminUserId = 'RF9846';
    this.cache = new Map();
    this.allParticipantsCache = null;
    
    this.apiBase = '/.netlify/functions/progress';

    this.clearAllData = () => {
      this.cache.clear();
      this.allParticipantsCache = null;
      Object.keys(localStorage)
        .filter(
          key =>
            key.startsWith('fullProgress_') ||
            key === this.centralStorageKey
        )
        .forEach(key => localStorage.removeItem(key));
      sessionStorage.removeItem('participantCode');
      sessionStorage.removeItem('referralCode');
      console.log('❌ Všetky dáta boli vymazané.');
    };
  }

  getVariableList() {
    return [
      'participant_code',
      'blocked',
      'group_assignment',
      'sharing_code',
      'referral_code',
      'used_referral_code',
      'referred_by',
      'timestamp_start',
      'timestamp_last_update',
      'session_count',
      'total_time_spent',
      'instruction_completed',
      'intro_completed',
      'user_stats_points',
      'user_stats_mission_points',
      'user_stats_level',
      'referrals_count',
      'referred_users',
      'completedMissions',
      'mainmenu_visits',
      'mission0_unlocked',
      'mission0_completed',
      'mission1_unlocked',
      'mission1_completed',
      'mission2_unlocked',
      'mission2_completed',
      'mission3_unlocked',
      'mission3_completed',
      'all_missions_completed'
    ];
  }

  async isUserBlocked(participantCode) {
    try {
      const userData = await this.loadUserProgress(participantCode);
      return userData?.blocked || false;
    } catch (error) {
      console.error('Error checking blocked status:', error);
      return false;
    }
  }

  async setBlockedState(participantCode, blocked) {
    try {
      console.log(`${blocked ? '🚫 Blokovanie' : '✅ Odblokovanie'} používateľa ${participantCode}...`);
      
      const userData = await this.loadUserProgress(participantCode);
      if (!userData) {
        throw new Error('Používateľ nenájdený');
      }

      userData.blocked = blocked;
      userData.blocked_at = blocked ? new Date().toISOString() : null;
      
      await this.saveProgress(participantCode, userData);
      
      console.log(`✅ Používateľ ${participantCode} ${blocked ? 'zablokovaný' : 'odblokovaný'}`);
      return true;
      
    } catch (error) {
      console.error('❌ Error setting blocked state:', error);
      throw error;
    }
  }

  async validateReferralCode(code) {
    if (!code) return false;
    
    try {
      await this.syncAllFromServer();
      
      const all = this.getAllParticipantsData();
      const exists = Object.values(all).some(d => d.sharing_code === code.toUpperCase());
      
      console.log(`🔍 Validating referral code ${code}: ${exists ? 'FOUND' : 'NOT FOUND'}`);
      return exists;
    } catch (error) {
      console.error('Error validating referral code:', error);
      return false;
    }
  }

  async validateSharingCode(code) {
    return await this.validateReferralCode(code);
  }

  async getUserSharingCode(userId) {
    try {
      const userData = await this.loadUserProgress(userId);
      return userData?.sharing_code || null;
    } catch (error) {
      console.error('Error getting sharing code:', error);
      return null;
    }
  }

  async processReferral(participantCode, referralCode) {
    try {
      console.log(`🎁 Processing referral: ${participantCode} → ${referralCode}`);
      
      await this.syncAllFromServer();
      const all = this.getAllParticipantsData();
      
      const isValid = await this.validateReferralCode(referralCode);
      if (!isValid) {
        console.warn(`⚠️ Referral kód ${referralCode} neexistuje v systéme`);
        throw new Error('Tento referral kód neexistuje v systéme');
      }
      
      const entry = Object.entries(all).find(([_, d]) => 
        d.sharing_code === referralCode.toUpperCase()
      );
      
      if (!entry) {
        console.warn(`⚠️ Referral kód ${referralCode} nenájdený (unexpected)`);
        throw new Error('Neplatný referral kód');
      }
      
      const [refCode, refData] = entry;
      console.log(`✅ Referral kód patrí používateľovi: ${refCode}`);
      
      const newUserData = await this.loadUserProgress(participantCode);
      
      if (newUserData?.used_referral_code) {
        console.warn(`⚠️ ${participantCode} už použil referral kód: ${newUserData.used_referral_code}`);
        throw new Error('Už ste použili referral kód. Môžete ho použiť iba raz.');
      }
      
      if (refCode === participantCode) {
        console.warn(`⚠️ ${participantCode} sa pokúsil použiť svoj vlastný referral kód`);
        throw new Error('Nemôžete použiť svoj vlastný zdieľací kód!');
      }
      
      refData.referred_users = refData.referred_users || [];
      if (refData.referred_users.includes(participantCode)) {
        console.warn(`⚠️ ${participantCode} už bol pridaný do referred_users pre ${refCode}`);
        throw new Error('Tento referral už bol spracovaný');
      }
      
      refData.referrals_count = (refData.referrals_count || 0) + 1;
      refData.referred_users.push(participantCode);
      
      const missionPoints = refData.user_stats_mission_points || 0;
      const bonusPoints = refData.referrals_count * 10;
      refData.user_stats_points = missionPoints + bonusPoints;
      
      newUserData.used_referral_code = referralCode.toUpperCase();
      newUserData.referred_by = refCode;
      newUserData.referral_code = referralCode.toUpperCase();
      
      await this.saveProgress(refCode, refData);
      await this.saveProgress(participantCode, newUserData);
      
      console.log(`✅ Referral spracovaný úspešne!`);
      console.log(`   - ${refCode}: ${refData.referrals_count} referralov, +${bonusPoints} bodov`);
      console.log(`   - ${participantCode}: označený ako použil referral`);
      
      return {
        success: true,
        referrerCode: refCode,
        referrerCount: refData.referrals_count,
        bonusPoints: bonusPoints
      };
      
    } catch (error) {
      console.error('❌ Error processing referral:', error);
      throw error;
    }
  }

  async unlockMissionForAll(missionId) {
    console.log(`🔓 Odomykám misiu ${missionId} pre všetkých...`);
    
    try {
      const response = await fetch(`${this.apiBase}?code=missions-unlock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId, adminCode: this.adminUserId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Batch unlock ${missionId} na serveri (${result.modifiedCount} používateľov)`);

      await this.fetchAllParticipantsData();
      this.cache.clear();
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: this.centralStorageKey,
        newValue: localStorage.getItem(this.centralStorageKey),
        url: window.location.href
      }));

      console.log(`✅ Misia ${missionId} odomknutá pre všetkých`);
      return result;
      
    } catch (error) {
      console.error('❌ Unlock failed:', error);
      throw error;
    }
  }

  async lockMissionForAll(missionId) {
    console.log(`🔒 Zamykám misiu ${missionId} pre všetkých...`);
    
    try {
      const response = await fetch(`${this.apiBase}?code=missions-lock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId, adminCode: this.adminUserId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Batch lock ${missionId} na serveri (${result.modifiedCount} používateľov)`);

      await this.fetchAllParticipantsData();
      this.cache.clear();
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: this.centralStorageKey,
        newValue: localStorage.getItem(this.centralStorageKey),
        url: window.location.href
      }));

      console.log(`✅ Misia ${missionId} zamknutá pre všetkých`);
      return result;
      
    } catch (error) {
      console.error('❌ Lock failed:', error);
      throw error;
    }
  }

  async fetchAllParticipantsData() {
    try {
      console.log('📥 Načítavam všetkých používateľov z backendu...');
      const resp = await fetch(`${this.apiBase}?code=all`);
      
      if (!resp.ok) {
        console.warn('⚠️ Server vrátil chybu:', resp.status);
        return this.getAllParticipantsData();
      }
      
      const allData = await resp.json();
      
      this.allParticipantsCache = allData;
      localStorage.setItem(this.centralStorageKey, JSON.stringify(allData));
      
      Object.entries(allData).forEach(([code, data]) => {
        localStorage.setItem(`fullProgress_${code}`, JSON.stringify(data));
      });
      
      console.log(`✅ Načítaných ${Object.keys(allData).length} používateľov z backendu`);
      return allData;
      
    } catch (e) {
      console.warn('⚠️ Fetch všetkých dát zlyhal:', e);
      return this.getAllParticipantsData();
    }
  }

  async syncAllFromServer() {
    return await this.fetchAllParticipantsData();
  }

  async loadUserProgress(participantCode) {
    if (!participantCode) return null;
    if (this.cache.has(participantCode)) {
      return this.cache.get(participantCode);
    }

    try {
      const resp = await fetch(`${this.apiBase}?code=${participantCode}`);

      if (!resp.ok) {
        if (resp.status === 404) {
          console.log(`🆕 Používateľ ${participantCode} neexistuje, vytváram nový záznam...`);
          const rec = this.createNewUserRecord(participantCode);
          await this.syncToServer(participantCode, rec);
          return rec;
        }
        console.warn(`Server error ${resp.status}: ${resp.statusText}`);
        throw new Error(`HTTP ${resp.status}`);
      }

      const data = await resp.json();
      if (!data || Object.keys(data).length === 0) {
        console.log(`🆕 Server vrátil prázdne dáta, registrujem nového používateľa...`);
        const rec = this.createNewUserRecord(participantCode);
        await this.syncToServer(participantCode, rec);
        return rec;
      }

      const prog = this.validateAndFixData(data.progress || data, participantCode);
      this._cacheAndStore(participantCode, prog);
      return prog;
    } catch (error) {
      console.warn('Server nedostupný, používam localStorage:', error.message);
    }

    const saved = localStorage.getItem(`fullProgress_${participantCode}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const prog = this.validateAndFixData(data, participantCode);
        this.cache.set(participantCode, prog);
        this.syncToServer(participantCode, prog).catch(e =>
          console.warn('Background sync failed:', e)
        );
        return prog;
      } catch (e) {
        console.error('localStorage data corrupted:', e);
      }
    }

    const central = this.getAllParticipantsData();
    if (central[participantCode]) {
      const prog = this.validateAndFixData(central[participantCode], participantCode);
      this._cacheAndStore(participantCode, prog);
      return prog;
    }

    console.log(`🆕 Lokálne vytváram nového používateľa ${participantCode}`);
    const rec = this.createNewUserRecord(participantCode);
    await this.syncToServer(participantCode, rec);
    return rec;
  }

  async syncToServer(participantCode, data) {
    try {
      const resp = await fetch(`${this.apiBase}?code=${participantCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!resp.ok) {
        console.warn(`Sync failed for ${participantCode}: HTTP ${resp.status}`);
        if (resp.status === 404) {
          console.log(`🆕 Používateľ ${participantCode} neexistuje, vytváram ho na serveri...`);
          const rec = this.createNewUserRecord(participantCode);
          return await this.syncToServer(participantCode, rec);
        }
        return false;
      }

      console.log(`✅ Synced ${participantCode}`);
      return true;
    } catch (error) {
      console.warn('Sync na server zlyhal:', error.message);
      return false;
    }
  }

  // ✅ OPRAVENÉ - Zachováva existujúce boolean hodnoty vrátane false
  validateAndFixData(data, participantCode) {
    data.participant_code = participantCode;
    
    if (!data.sharing_code) {
      data.sharing_code = this.generatePersistentSharingCode(participantCode);
    }
    
    if (!['0', '1', '2'].includes(data.group_assignment)) {
      data.group_assignment = Math.random() < 0.33 ? '0' : Math.random() < 0.66 ? '1' : '2';
    }
    
    if (data.blocked === undefined) {
      data.blocked = false;
    }
    
    const defaults = this.getDefaultFields();
    
    // ✅ KĽÚČOVÁ OPRAVA - Pole, ktoré sa NIKDY NEPREPÍŠU (zachovajú existujúce hodnoty)
    const preserveFields = [
      'mission0_unlocked',
      'mission1_unlocked',
      'mission2_unlocked',
      'mission3_unlocked',
      'mission0_completed',
      'mission1_completed',
      'mission2_completed',
      'mission3_completed',
      'all_missions_completed',
      'instruction_completed',
      'intro_completed'
    ];
    
    Object.entries(defaults).forEach(([k, v]) => {
      // ✅ Ak je to preserve field, zachovaj existujúcu hodnotu (aj false!)
      if (preserveFields.includes(k)) {
        if (data[k] === undefined) {
          data[k] = v;
        }
        // Inak nech zostane pôvodná hodnota (true alebo false)
      } else {
        // Pre ostatné fieldy použij bežnú logiku
        if (data[k] == null) {
          data[k] = v;
        }
      }
    });
    
    data.timestamp_last_update = new Date().toISOString();
    
    console.log(`🔍 ValidateAndFixData pre ${participantCode} - unlocked stavy:`, {
      m0: data.mission0_unlocked,
      m1: data.mission1_unlocked,
      m2: data.mission2_unlocked,
      m3: data.mission3_unlocked
    });
    
    return data;
  }

  getDefaultFields() {
    return {
      timestamp_start: new Date().toISOString(),
      current_progress_step: 'instruction',
      session_count: 1,
      total_time_spent: 0,
      blocked: false,
      blocked_at: null,
      instruction_completed: false,
      intro_completed: false,
      user_stats_points: 0,
      user_stats_mission_points: 0,
      user_stats_level: 1,
      completedSections: [],
      completedMissions: [],
      referrals_count: 0,
      referred_users: [],
      used_referral_code: null,
      referred_by: null,
      mainmenu_visits: 0,
      mission0_completed: false,
      mission0_unlocked: false,
      mission1_completed: false,
      mission1_unlocked: false,
      mission2_completed: false,
      mission2_unlocked: false,
      mission3_completed: false,
      mission3_unlocked: false,
      all_missions_completed: false,
      responses: {}
    };
  }

  createNewUserRecord(participantCode) {
    const defaults = this.getDefaultFields();
    const rec = {
      participant_code: participantCode,
      group_assignment: Math.random() < 0.33 ? '0' : Math.random() < 0.66 ? '1' : '2',
      sharing_code: this.generatePersistentSharingCode(participantCode),
      referral_code: sessionStorage.getItem('referralCode') || null,
      ...defaults
    };
    this.saveProgress(participantCode, rec);
    return rec;
  }

  generatePersistentSharingCode(participantCode) {
    const existing = this.getSharingCode(participantCode);
    if (existing) return existing;
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let hash = this.hashCode(participantCode + 'SALT2025' + Date.now());
    let code = '';
    
    for (let i = 0; i < 6; i++) {
      hash = (hash * 9301 + 49297) % 233280;
      code += chars[hash % chars.length];
    }
    
    const used = Object.values(this.getAllParticipantsData()).map(d => d.sharing_code);
    
    while (used.includes(code)) {
      const randomChar = chars[Math.floor(Math.random() * chars.length)];
      code = code.slice(0, -1) + randomChar;
    }
    
    console.log(`✅ Vygenerovaný sharing code pre ${participantCode}: ${code}`);
    return code;
  }

  hashCode(str) {
    let h = 0;
    for (const c of str) {
      h = (h << 5) - h + c.charCodeAt(0);
      h &= h;
    }
    return Math.abs(h);
  }

  getSharingCode(participantCode) {
    const prog =
      this.cache.get(participantCode) ||
      JSON.parse(localStorage.getItem(`fullProgress_${participantCode}`) || '{}');
    return prog.sharing_code || null;
  }

  async saveProgress(participantCode, data) {
    // ✅ PRIDANÝ DEBUG LOG
    console.log(`💾 Ukladám progress pre ${participantCode} - unlocked stavy:`, {
      m0: data.mission0_unlocked,
      m1: data.mission1_unlocked,
      m2: data.mission2_unlocked,
      m3: data.mission3_unlocked
    });
    
    data.timestamp_last_update = new Date().toISOString();
    this.cache.set(participantCode, data);
    localStorage.setItem(`fullProgress_${participantCode}`, JSON.stringify(data));
    this.saveToCentralStorage(participantCode, data);
    await this.syncToServer(participantCode, data);
  }

  async loadComponentData(participantCode, componentKey) {
    if (!participantCode) return {};
    const prog = await this.loadUserProgress(participantCode);
    return prog ? prog[`${componentKey}_data`] || {} : {};
  }

  async saveComponentData(participantCode, componentKey, data) {
    if (!participantCode) return;
    const prog = await this.loadUserProgress(participantCode);
    prog[`${componentKey}_data`] = data;
    await this.saveProgress(participantCode, prog);
  }

  saveToCentralStorage(participantCode, data) {
    const all = this.getAllParticipantsData();
    all[participantCode] = data;
    localStorage.setItem(this.centralStorageKey, JSON.stringify(all));
    if (this.allParticipantsCache) {
      this.allParticipantsCache[participantCode] = data;
    }
  }

  getAllParticipantsData() {
    if (this.allParticipantsCache) {
      return this.allParticipantsCache;
    }
    return JSON.parse(localStorage.getItem(this.centralStorageKey) || '{}');
  }

  exportAllParticipantsCSV() {
    const all = this.getAllParticipantsData();
    const codes = Object.keys(all);
    if (!codes.length) return alert('Žiadni účastníci');
    const variables = this.getVariableList();
    const rows = codes.map(code => {
      const rec = all[code];
      return variables.map(varName => JSON.stringify(rec[varName] ?? '')).join(',');
    });
    const header = variables.join(',');
    const csvContent = [header, ...rows].join('\n');
    this.downloadCSV(csvContent);
  }

  exportAllParticipantsXLSX() {
    const all = this.getAllParticipantsData();
    const variables = this.getVariableList();
    const data = [variables];
    Object.values(all).forEach(rec => data.push(variables.map(v => rec[v] ?? '')));
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Participants');
    XLSX.writeFile(wb, `export_${Date.now()}.xlsx`);
  }

  downloadCSV(content) {
    const blob = new Blob([content], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `export_${new Date().toISOString()}.csv`;
    link.click();
  }

  isAdmin(code) {
    return code === this.adminUserId;
  }

  _cacheAndStore(participantCode, data) {
    this.cache.set(participantCode, data);
    localStorage.setItem(`fullProgress_${participantCode}`, JSON.stringify(data));
    this.saveToCentralStorage(participantCode, data);
  }
}

const dataManager = new DataManager();
export default dataManager;
