import * as XLSX from 'xlsx';

class DataManager {
  constructor() {
    this.centralStorageKey = 'allParticipantsData';
    this.adminUserId = 'RF9846';
    this.cache = new Map();
    this.codes = [];

    this.clearAllData = () => {
      this.cache.clear();
      Object.keys(localStorage)
        .filter(
          key =>
            key.startsWith('fullProgress_') ||
            key === this.centralStorageKey ||
            key === 'usedCodes'
        )
        .forEach(key => localStorage.removeItem(key));
      sessionStorage.removeItem('participantCode');
      sessionStorage.removeItem('referralCode');
      console.log('❌ Všechna data byla smazána.');
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

  async loadCodes() {
    if (this.codes.length) return this.codes;
    const resp = await fetch('/codes.xlsx');
    const buffer = await resp.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    this.codes = rows.flat().filter(cell => typeof cell === 'string');
    return this.codes;
  }

  getUsedCodes() {
    const json = localStorage.getItem('usedCodes');
    return json ? JSON.parse(json) : [];
  }

  markCodeUsed(code) {
    const used = this.getUsedCodes();
    localStorage.setItem('usedCodes', JSON.stringify([...used, code]));
  }

  async assignParticipantCode() {
    let code = sessionStorage.getItem('participantCode');
    if (code) return code;
    const codes = await this.loadCodes();
    const used = this.getUsedCodes();
    const available = codes.filter(c => !used.includes(c));
    if (!available.length) throw new Error('Žiadne voľné kódy.');
    code = available[0];
    this.markCodeUsed(code);
    sessionStorage.setItem('participantCode', code);
    return code;
  }

  async validateReferralCode(code) {
    const all = this.getAllParticipantsData();
    return Object.values(all).some(d => d.sharing_code === code);
  }

  async processReferral(participantCode, referralCode) {
    const all = this.getAllParticipantsData();
    const entry = Object.entries(all).find(([_, d]) => d.sharing_code === referralCode);
    if (!entry) return;
    const [refCode, data] = entry;
    data.referrals_count = (data.referrals_count || 0) + 1;
    await this.saveProgress(refCode, data);
  }

  async unlockMissionForAll(missionId) {
    console.log(`🔓 Odomykám misiu ${missionId} pre všetkých...`);
    try {
      await fetch('/api/progress?code=missions-unlock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId, adminCode: this.adminUserId })
      });
      console.log(`✅ Batch unlock ${missionId} na serveri`);
    } catch (e) {
      console.warn('Batch unlock na server zlyhal, pokračujem lokálne.');
    }

    const all = this.getAllParticipantsData();
    Object.values(all).forEach(data => {
      data[`mission${missionId}_unlocked`] = true;
      data.timestamp_last_update = new Date().toISOString();
    });
    localStorage.setItem(this.centralStorageKey, JSON.stringify(all));
    console.log(`✅ Lokálne odomknutá misia ${missionId}`);

    this.cache.forEach((data, code) => {
      data[`mission${missionId}_unlocked`] = true;
      data.timestamp_last_update = new Date().toISOString();
    });
    console.log(`✅ Cache aktualizovaný pre misiu ${missionId}`);
  }

  async lockMissionForAll(missionId) {
    console.log(`🔒 Zamykám misiu ${missionId} pre všetkých...`);
    try {
      await fetch('/api/progress?code=missions-lock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId, adminCode: this.adminUserId })
      });
      console.log(`✅ Batch lock ${missionId} na serveri`);
    } catch (e) {
      console.warn('Batch lock na server zlyhal, pokračujem lokálne.');
    }

    const all = this.getAllParticipantsData();
    Object.values(all).forEach(data => {
      data[`mission${missionId}_unlocked`] = false;
      data.timestamp_last_update = new Date().toISOString();
    });
    localStorage.setItem(this.centralStorageKey, JSON.stringify(all));
    console.log(`✅ Lokálne zamknutá misia ${missionId}`);

    this.cache.forEach((data, code) => {
      data[`mission${missionId}_unlocked`] = false;
      data.timestamp_last_update = new Date().toISOString();
    });
    console.log(`✅ Cache aktualizovaný pre misiu ${missionId}`);
  }

  async syncAllFromServer() {
    try {
      console.log('🔄 Synchronizujem dáta zo servera...');
      const resp = await fetch('/api/progress?code=all');
      
      // OPRAVA #1: Kontrola HTTP status
      if (!resp.ok) {
        console.warn('⚠️ Server vrátil chybu:', resp.status);
        return this.getAllParticipantsData();
      }
      
      const allData = await resp.json();
      localStorage.setItem(this.centralStorageKey, JSON.stringify(allData));
      console.log('✅ Dáta synchronizované zo servera');
      return allData;
    } catch (e) {
      console.warn('⚠️ Sync všetkých dáta zo servera zlyhal:', e);
      return this.getAllParticipantsData();
    }
  }

  async loadUserProgress(participantCode) {
    if (!participantCode) return null;
    if (this.cache.has(participantCode)) {
      return this.cache.get(participantCode);
    }

    try {
      const resp = await fetch(`/api/progress?code=${participantCode}`);
      
      // OPRAVA #2: Kontrola HTTP status (nie len network error)
      if (!resp.ok) {
        console.warn(`Server error ${resp.status}: ${resp.statusText}`);
        throw new Error(`HTTP ${resp.status}`);
      }
      
      const data = await resp.json();
      const prog = this.validateAndFixData(data.progress || data, participantCode);
      this._cacheAndStore(participantCode, prog);
      return prog;
    } catch (error) {
      console.warn('Server nedostupný, používam localStorage:', error.message);
    }

    // Fallback 1: localStorage
    const saved = localStorage.getItem(`fullProgress_${participantCode}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const prog = this.validateAndFixData(data, participantCode);
        this.cache.set(participantCode, prog);
        // Try async sync in background
        this.syncToServer(participantCode, prog).catch(e => 
          console.warn('Background sync failed:', e)
        );
        return prog;
      } catch (e) {
        console.error('localStorage data corrupted:', e);
      }
    }

    // Fallback 2: centrálne storage
    const central = this.getAllParticipantsData();
    if (central[participantCode]) {
      const prog = this.validateAndFixData(central[participantCode], participantCode);
      this._cacheAndStore(participantCode, prog);
      return prog;
    }

    // Fallback 3: nový záznam
    return this.createNewUserRecord(participantCode);
  }

  async syncToServer(participantCode, data) {
    try {
      const resp = await fetch(`/api/progress?code=${participantCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // OPRAVA #3: Kontrola HTTP status
      if (!resp.ok) {
        console.warn(`Sync failed for ${participantCode}: HTTP ${resp.status}`);
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
      mission3_unlocked: false
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
    let hash = this.hashCode(participantCode + 'SALT2025');
    let code = '';
    for (let i = 0; i < 4; i++) {
      hash = (hash * 9301 + 49297) % 233280;
      code += chars[hash % chars.length];
    }
    const used = Object.values(this.getAllParticipantsData()).map(d => d.sharing_code);
    while (used.includes(code)) {
      code = code.slice(0, -1) + chars[Math.floor(Math.random() * chars.length)];
    }
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
    const prog = this.cache.get(participantCode) || JSON.parse(localStorage.getItem(`fullProgress_${participantCode}`) || '{}');
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
  }

  getAllParticipantsData() {
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