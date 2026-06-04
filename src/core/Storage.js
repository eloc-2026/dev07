/**
 * Storage - LocalStorage persistence layer
 * Handles saving and loading application state
 */

const STORAGE_KEY = 'law_enforcement_sim';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export class Storage {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.autoSaveTimer = null;
  }

  /**
   * Save state to localStorage
   * @param {object} state - State object to save
   */
  save(state) {
    try {
      const dataToSave = {
        activeCases: state.activeCases || [],
        evidence: state.evidence || [],
        officers: state.officers || [],
        persons: state.persons || [],
        crimes: state.crimes || [],
        statistics: state.statistics || {},
        gameTime: state.gameTime || Date.now(),
        savedAt: Date.now()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      console.log('State saved to localStorage');
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  /**
   * Load state from localStorage
   * @returns {object|null} Loaded state or null
   */
  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;

      const parsed = JSON.parse(data);
      console.log('State loaded from localStorage');
      return parsed;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear saved state
   */
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Storage cleared');
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Start auto-save timer
   */
  startAutoSave() {
    this.stopAutoSave(); // Clear any existing timer

    this.autoSaveTimer = setInterval(() => {
      if (this.stateManager) {
        const state = this.stateManager.getAllState();
        this.save(state);
      }
    }, AUTO_SAVE_INTERVAL);

    console.log('Auto-save started');
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
      console.log('Auto-save stopped');
    }
  }

  /**
   * Export save data as JSON file
   * @returns {string} JSON string of save data
   */
  export() {
    const state = this.stateManager.getAllState();
    return JSON.stringify(state, null, 2);
  }

  /**
   * Import save data from JSON
   * @param {string} jsonString - JSON string to import
   * @returns {boolean} Success status
   */
  import(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error importing save data:', error);
      return false;
    }
  }

  /**
   * Check if save exists
   * @returns {boolean} True if save exists
   */
  hasSave() {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  /**
   * Get save metadata
   * @returns {object|null} Save metadata
   */
  getSaveInfo() {
    const data = this.load();
    if (!data) return null;

    return {
      savedAt: data.savedAt,
      caseCount: data.activeCases?.length || 0,
      evidenceCount: data.evidence?.length || 0,
      solvedCases: data.statistics?.solvedCases || 0
    };
  }
}

export default Storage;
