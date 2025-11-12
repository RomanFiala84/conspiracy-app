// src/utils/ResponseManager.js
// Univerzálny systém na záznam odpovedí z dotazníkov a hier

class ResponseManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
  }

  /**
   * Univerzálne uloženie odpovede
   * @param {string} participantCode - Kód účastníka
   * @param {string} componentId - Identifikátor komponenty (napr. "mission1_questionnaire1a")
   * @param {string} questionId - Identifikátor otázky (napr. "trust_media_1")
   * @param {any} value - Hodnota odpovede
   * @param {object} metadata - Dodatočné metadáta (voliteľné)
   */
  async saveAnswer(participantCode, componentId, questionId, value, metadata = {}) {
    if (!participantCode) {
      console.warn('❌ Missing participantCode');
      return false;
    }

    try {
      // Načítaj aktuálny progress
      const progress = await this.dataManager.loadUserProgress(participantCode);
      
      // Inicializuj responses objekt ak neexistuje
      if (!progress.responses) {
        progress.responses = {};
      }
      
      // Inicializuj component responses ak neexistuje
      if (!progress.responses[componentId]) {
        progress.responses[componentId] = {
          answers: {},
          metadata: {
            started_at: new Date().toISOString()
          }
        };
      }
      
      // Ulož odpoveď
      progress.responses[componentId].answers[questionId] = value;
      
      // Aktualizuj metadata
      progress.responses[componentId].metadata.last_updated = new Date().toISOString();
      
      // Pridaj custom metadata ak sú poskytnuté
      if (Object.keys(metadata).length > 0) {
        progress.responses[componentId].metadata = {
          ...progress.responses[componentId].metadata,
          ...metadata
        };
      }
      
      // Ulož do DB
      await this.dataManager.saveProgress(participantCode, progress);
      
      console.log(`✅ Saved: ${componentId}.${questionId} = ${value}`);
      return true;
      
    } catch (error) {
      console.error('❌ Error saving answer:', error);
      return false;
    }
  }

  /**
   * Uloženie viacerých odpovede naraz (celý dotazník)
   * @param {string} participantCode
   * @param {string} componentId
   * @param {object} answers - Objekt všetkých odpovede { questionId: value }
   * @param {object} metadata - Metadata pre celý komponent
   */
  async saveMultipleAnswers(participantCode, componentId, answers, metadata = {}) {
    if (!participantCode) {
      console.warn('❌ Missing participantCode');
      return false;
    }

    try {
      const progress = await this.dataManager.loadUserProgress(participantCode);
      
      if (!progress.responses) {
        progress.responses = {};
      }
      
      // Zachovaj existujúce metadata (napr. started_at)
      const existingMetadata = progress.responses[componentId]?.metadata || {
        started_at: new Date().toISOString()
      };
      
      // Ulož všetky odpovede
      progress.responses[componentId] = {
        answers: answers,
        metadata: {
          ...existingMetadata,
          completed_at: new Date().toISOString(),
          ...metadata
        }
      };
      
      // Označ komponent ako completed
      progress[`${componentId}_completed`] = true;
      
      await this.dataManager.saveProgress(participantCode, progress);
      
      console.log(`✅ Saved ${Object.keys(answers).length} answers for ${componentId}`);
      return true;
      
    } catch (error) {
      console.error('❌ Error saving multiple answers:', error);
      return false;
    }
  }

  /**
   * Načítanie odpovede
   * @param {string} participantCode
   * @param {string} componentId
   * @returns {object} { answers: {}, metadata: {} }
   */
  async loadResponses(participantCode, componentId) {
    if (!participantCode) return { answers: {}, metadata: {} };
    
    try {
      const progress = await this.dataManager.loadUserProgress(participantCode);
      
      if (!progress.responses || !progress.responses[componentId]) {
        return { answers: {}, metadata: {} };
      }
      
      return progress.responses[componentId];
      
    } catch (error) {
      console.error('❌ Error loading responses:', error);
      return { answers: {}, metadata: {} };
    }
  }

  /**
   * Načítanie konkrétnej odpovede
   * @param {string} participantCode
   * @param {string} componentId
   * @param {string} questionId
   * @returns {any} Hodnota odpovede alebo null
   */
  async loadAnswer(participantCode, componentId, questionId) {
    const responses = await this.loadResponses(participantCode, componentId);
    return responses.answers[questionId] || null;
  }

  /**
   * Zmazanie odpovede (napr. pri restartu misie)
   * @param {string} participantCode
   * @param {string} componentId
   */
  async deleteResponses(participantCode, componentId) {
    if (!participantCode) return false;
    
    try {
      const progress = await this.dataManager.loadUserProgress(participantCode);
      
      if (progress.responses && progress.responses[componentId]) {
        delete progress.responses[componentId];
        delete progress[`${componentId}_completed`];
        
        await this.dataManager.saveProgress(participantCode, progress);
        console.log(`✅ Deleted responses for ${componentId}`);
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Error deleting responses:', error);
      return false;
    }
  }

  /**
   * Získanie všetkých question IDs zo všetkých účastníkov
   * (Použije sa pri exporte na vytvorenie všetkých stĺpcov)
   */
  getAllQuestionIds() {
    const allData = this.dataManager.getAllParticipantsData();
    const questionIds = new Map(); // componentId -> Set(questionIds)
    
    Object.values(allData).forEach(participant => {
      if (!participant.responses) return;
      
      Object.entries(participant.responses).forEach(([componentId, data]) => {
        if (!questionIds.has(componentId)) {
          questionIds.set(componentId, new Set());
        }
        
        Object.keys(data.answers).forEach(questionId => {
          questionIds.get(componentId).add(questionId);
        });
      });
    });
    
    // Convert Sets to Arrays
    const result = {};
    questionIds.forEach((ids, componentId) => {
      result[componentId] = Array.from(ids).sort();
    });
    
    return result;
  }

  /**
   * Export všetkých odpovedí do formátu pre analýzu
   * @returns {Array} Array objektov ready pre CSV/XLSX export
   */
  exportAllResponses() {
    const allData = this.dataManager.getAllParticipantsData();
    const allQuestionIds = this.getAllQuestionIds();
    
    const rows = Object.values(allData).map(participant => {
      const row = {
        participant_code: participant.participant_code,
        group_assignment: participant.group_assignment,
        user_stats_points: participant.user_stats_points || 0,
        user_stats_level: participant.user_stats_level || 1,
        timestamp_start: participant.timestamp_start,
        timestamp_last_update: participant.timestamp_last_update
      };
      
      // Pridaj všetky odpovede
      if (participant.responses) {
        Object.entries(allQuestionIds).forEach(([componentId, questionIds]) => {
          const componentData = participant.responses[componentId];
          
          if (componentData) {
            // Pridaj odpovede
            questionIds.forEach(questionId => {
              const columnName = `${componentId}__${questionId}`;
              row[columnName] = componentData.answers[questionId] ?? '';
            });
            
            // Pridaj metadata
            if (componentData.metadata) {
              row[`${componentId}__started_at`] = componentData.metadata.started_at || '';
              row[`${componentId}__completed_at`] = componentData.metadata.completed_at || '';
              row[`${componentId}__time_spent`] = componentData.metadata.time_spent_seconds || '';
            }
          } else {
            // Participant nemá odpovede pre tento komponent - pridaj prázdne hodnoty
            questionIds.forEach(questionId => {
              row[`${componentId}__${questionId}`] = '';
            });
          }
        });
      }
      
      return row;
    });
    
    return rows;
  }

  /**
   * Export do CSV
   */
  exportToCSV() {
    const data = this.exportAllResponses();
    if (data.length === 0) {
      alert('Žiadne dáta na export');
      return;
    }
    
    // Get all column names
    const columns = Object.keys(data[0]);
    
    // Create CSV header
    const header = columns.join(',');
    
    // Create CSV rows
    const rows = data.map(row => {
      return columns.map(col => {
        const value = row[col];
        // Escape values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });
    
    const csvContent = [header, ...rows].join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `responses_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    
    console.log(`✅ Exported ${data.length} participants to CSV`);
  }

  /**
   * Export do XLSX (Excel)
   */
  async exportToXLSX() {
    // Dynamically import XLSX only when needed
    const XLSX = await import('xlsx');
    
    const data = this.exportAllResponses();
    if (data.length === 0) {
      alert('Žiadne dáta na export');
      return;
    }
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Responses');
    
    // Download
    const filename = `responses_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    console.log(`✅ Exported ${data.length} participants to XLSX`);
  }
}

// Export singleton instance
let responseManagerInstance = null;

export const getResponseManager = (dataManager) => {
  if (!responseManagerInstance) {
    responseManagerInstance = new ResponseManager(dataManager);
  }
  return responseManagerInstance;
};

export default ResponseManager;