// src/utils/DataManager.js
// OPRAVA: správne URL pre Netlify Functions

import * as XLSX from 'xlsx';

class DataManager {
  constructor() {
    this.centralStorageKey = 'allParticipantsData';
    this.adminUserId = 'RF9846';
    this.cache = new Map();
    this.allParticipantsCache = null;
    
    // ✅ NOVÉ - API base URL
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
      'group_assignment',
      'sharing_code',
      'referral_code',
      'timestamp_start',
      'timestamp_last_update',
      'session_count',
      'total_time_spent',
      'instruction_completed',
      'intro_completed',
      'user_stats_points',
      'user_stats_level',
      'referrals_count',
      'mainmenu_visits',
      'mission0_unlocked',
      'mission0_completed',
      'mission1_unlocked',
      'mission1_completed',
      'mission2_unlocked',
      'mission2_completed',
      'mission3_unlocked',
      'mission3_completed'
    ];
  }

  async validateReferralCode(code) {
    const all = this.getAllParticipantsData();
    return Object.values(all).some(d => d.sharing_code === code);
  }

  async validateSharingCode(code) {
    const all = this.getAllParticipantsData();
    return Object.values(all).some(d => d.sharing_code === code.toUpperCase());
  }

  async processReferral(participantCode, referralCode) {
    const all = this.getAllParticipantsData();
    
    const entry = Object.entries(all).find(([_, d]) => d.sharing_code === referralCode);
    if (!entry) {
      console.warn(`⚠️ Referral kód ${referralCode} neexistuje`);
      return;
    }
    
    const [refCode, refData] = entry;
    
    if (refCode === participantCode) {
      console.warn(`⚠️ Nemôžeš použiť svoj vlastný referral kód`);
      return;
    }
    
    refData.referrals_count = (refData.referrals_count || 0) + 1;
    refData.user_stats_points = (refData.user_stats_points || 0) + 10;
    
    await this.saveProgress(refCode, refData);
    
    console.log(`✅ Referral bonus: ${refCode} získal +10 bodov (celkom: ${refData.referrals_count} referralov)`);
    
    return {
      success: true,
      referrerCode: refCode,
      referrerPoints: refData.user_stats_points,
      referrerCount: refData.referrals_count
    };
  }

  // ✅ OPRAVA: správna URL
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

  // ✅ OPRAVA: správna URL
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

  // ✅ OPRAVA: správna URL
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

  // ✅ OPRAVA: správna URL
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

  // ✅ OPRAVA: správna URL
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

  validateAndFixData(data, participantCode) {
    data.participant_code = participantCode;
    if (!data.sharing_code) {
      data.sharing_code = this.generatePersistentSharingCode(participantCode);
    }
    if (!['0', '1', '2'].includes(data.group_assignment)) {
      data.group_assignment = Math.random() < 0.33 ? '0' : Math.random() < 0.66 ? '1' : '2';
    }
    const defaults = this.getDefaultFields();
    Object.entries(defaults).forEach(([k, v]) => {
      if (data[k] == null) data[k] = v;
    });
    data.timestamp_last_update = new Date().toISOString();
    return data;
  }

  getDefaultFields() {
    return {
      timestamp_start: new Date().toISOString(),
      current_progress_step: 'instruction',
      session_count: 1,
      total_time_spent: 0,
      instruction_completed: false,
      intro_completed: false,
      user_stats_points: 0,
      user_stats_level: 1,
      completedSections: [],
      referrals_count: 0,
      mainmenu_visits: 0,
      mission0_completed: false,
      mission0_unlocked: false,
      mission1_completed: false,
      mission1_unlocked: false,
      mission2_completed: false,
      mission2_unlocked: false,
      mission3_completed: false,
      mission3_unlocked: false,
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