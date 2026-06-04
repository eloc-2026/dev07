/**
 * Crime Model - Represents a reported crime
 */
import { randomId } from '../utils/random.js';
import { CRIME_TYPES, CASE_STATUS } from '../utils/constants.js';

export class Crime {
  constructor(data = {}) {
    this.id = data.id || randomId('crime');
    this.type = data.type || CRIME_TYPES.THEFT;
    this.severity = data.severity || 1;
    this.location = data.location || {
      address: 'Unknown Location',
      lat: 0,
      lng: 0,
      description: ''
    };
    this.timeOccurred = data.timeOccurred || Date.now();
    this.timeReported = data.timeReported || Date.now();
    this.description = data.description || '';
    this.suspects = data.suspects || [];
    this.victims = data.victims || [];
    this.witnesses = data.witnesses || [];
    this.evidenceRequired = data.evidenceRequired || [];
    this.evidenceAvailable = data.evidenceAvailable || [];
    this.status = data.status || CASE_STATUS.REPORTED;
    this.assignedCase = data.assignedCase || null;
    this.notes = data.notes || '';
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      severity: this.severity,
      location: this.location,
      timeOccurred: this.timeOccurred,
      timeReported: this.timeReported,
      description: this.description,
      suspects: this.suspects,
      victims: this.victims,
      witnesses: this.witnesses,
      evidenceRequired: this.evidenceRequired,
      evidenceAvailable: this.evidenceAvailable,
      status: this.status,
      assignedCase: this.assignedCase,
      notes: this.notes
    };
  }

  /**
   * Create Crime instance from JSON
   */
  static fromJSON(json) {
    return new Crime(json);
  }

  /**
   * Get crime severity label
   */
  getSeverityLabel() {
    const labels = {
      1: 'Low',
      2: 'Low-Medium',
      3: 'Medium',
      4: 'High',
      5: 'Critical'
    };
    return labels[this.severity] || 'Unknown';
  }

  /**
   * Get time elapsed since crime occurred (in hours)
   */
  getTimeElapsed() {
    return Math.floor((Date.now() - this.timeOccurred) / (1000 * 60 * 60));
  }

  /**
   * Check if crime is urgent (high severity or recent critical crime)
   */
  isUrgent() {
    return this.severity >= 4 || (this.severity === 5 && this.getTimeElapsed() < 24);
  }

  /**
   * Assign to a case
   */
  assignToCase(caseId) {
    this.assignedCase = caseId;
    this.status = CASE_STATUS.INVESTIGATING;
  }

  /**
   * Mark as solved
   */
  markSolved() {
    this.status = CASE_STATUS.SOLVED;
  }
}

export default Crime;
