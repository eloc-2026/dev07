/**
 * StateManager - Central state management with pub/sub pattern
 * Manages application state and notifies subscribers of changes
 */
export class StateManager {
  constructor() {
    this.state = {
      currentView: 'dispatch',
      activeCases: [],
      evidence: [],
      officers: [],
      persons: [],
      crimes: [],
      gameTime: Date.now(),
      notifications: [],
      selectedCase: null,
      selectedEvidence: null,
      statistics: {
        totalCases: 0,
        solvedCases: 0,
        averageAccuracy: 0,
        averageSolveTime: 0
      }
    };

    this.listeners = {};
    this.initialized = false;
  }

  /**
   * Subscribe to state changes for a specific key
   * @param {string} key - State key to watch
   * @param {Function} callback - Function to call when state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
    };
  }

  /**
   * Set state value and notify subscribers
   * @param {string} key - State key
   * @param {any} value - New value
   */
  setState(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    this.notify(key, value, oldValue);
  }

  /**
   * Get current state value
   * @param {string} key - State key
   * @returns {any} Current state value
   */
  getState(key) {
    return this.state[key];
  }

  /**
   * Get entire state object (use sparingly)
   * @returns {object} Full state
   */
  getAllState() {
    return { ...this.state };
  }

  /**
   * Update nested state properties
   * @param {string} key - State key
   * @param {Function} updater - Function that receives current value and returns new value
   */
  updateState(key, updater) {
    const currentValue = this.state[key];
    const newValue = updater(currentValue);
    this.setState(key, newValue);
  }

  /**
   * Notify all subscribers of a state change
   * @param {string} key - State key that changed
   * @param {any} newValue - New value
   * @param {any} oldValue - Previous value
   */
  notify(key, newValue, oldValue) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(callback => {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          console.error(`Error in state subscriber for ${key}:`, error);
        }
      });
    }
  }

  /**
   * Add a case to active cases
   * @param {object} case - Case object
   */
  addCase(caseObj) {
    this.updateState('activeCases', cases => [...cases, caseObj]);
    this.updateState('statistics', stats => ({
      ...stats,
      totalCases: stats.totalCases + 1
    }));
  }

  /**
   * Update a case
   * @param {string} caseId - Case ID
   * @param {object} updates - Properties to update
   */
  updateCase(caseId, updates) {
    this.updateState('activeCases', cases =>
      cases.map(c => c.id === caseId ? { ...c, ...updates } : c)
    );
  }

  /**
   * Add evidence
   * @param {object} evidence - Evidence object
   */
  addEvidence(evidenceObj) {
    this.updateState('evidence', evidence => [...evidence, evidenceObj]);
  }

  /**
   * Add a notification
   * @param {string} message - Notification message
   * @param {string} type - Type: 'info', 'success', 'warning', 'error'
   */
  addNotification(message, type = 'info') {
    const notification = {
      id: `notif_${Date.now()}_${Math.random()}`,
      message,
      type,
      timestamp: Date.now()
    };

    this.updateState('notifications', notifications => [...notifications, notification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000);
  }

  /**
   * Remove a notification
   * @param {string} notificationId - Notification ID
   */
  removeNotification(notificationId) {
    this.updateState('notifications', notifications =>
      notifications.filter(n => n.id !== notificationId)
    );
  }

  /**
   * Initialize state from storage or defaults
   */
  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('StateManager initialized');
  }

  /**
   * Reset state to initial values
   */
  reset() {
    this.state = {
      currentView: 'dispatch',
      activeCases: [],
      evidence: [],
      officers: [],
      persons: [],
      crimes: [],
      gameTime: Date.now(),
      notifications: [],
      selectedCase: null,
      selectedEvidence: null,
      statistics: {
        totalCases: 0,
        solvedCases: 0,
        averageAccuracy: 0,
        averageSolveTime: 0
      }
    };

    // Notify all subscribers of reset
    Object.keys(this.listeners).forEach(key => {
      this.notify(key, this.state[key], undefined);
    });
  }
}

// Create singleton instance
const stateManager = new StateManager();
export default stateManager;
