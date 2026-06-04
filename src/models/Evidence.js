/**
 * Evidence Model - Represents physical or digital evidence
 */
import { randomId } from '../utils/random.js';
import { EVIDENCE_TYPES } from '../utils/constants.js';

export class Evidence {
  constructor(data = {}) {
    this.id = data.id || randomId('evidence');
    this.caseId = data.caseId || null;
    this.type = data.type || EVIDENCE_TYPES.DOCUMENT;
    this.description = data.description || '';
    this.collectedBy = data.collectedBy || null;
    this.collectedAt = data.collectedAt || Date.now();
    this.location = data.location || '';
    this.chainOfCustody = data.chainOfCustody || [];
    this.analyzed = data.analyzed || false;
    this.analysisResults = data.analysisResults || null;
    this.integrity = data.integrity || 100;
    this.relevance = data.relevance || 0;
    this.tags = data.tags || [];
    this.notes = data.notes || '';
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      caseId: this.caseId,
      type: this.type,
      description: this.description,
      collectedBy: this.collectedBy,
      collectedAt: this.collectedAt,
      location: this.location,
      chainOfCustody: this.chainOfCustody,
      analyzed: this.analyzed,
      analysisResults: this.analysisResults,
      integrity: this.integrity,
      relevance: this.relevance,
      tags: this.tags,
      notes: this.notes
    };
  }

  /**
   * Create Evidence instance from JSON
   */
  static fromJSON(json) {
    return new Evidence(json);
  }

  /**
   * Add chain of custody entry
   */
  addCustodyEntry(officerId, action) {
    this.chainOfCustody.push({
      timestamp: Date.now(),
      officer: officerId,
      action
    });

    // Slight integrity degradation with each transfer
    if (action === 'transferred') {
      this.integrity = Math.max(0, this.integrity - 1);
    }
  }

  /**
   * Transfer evidence to another officer
   */
  transferTo(officerId) {
    this.addCustodyEntry(officerId, 'transferred');
  }

  /**
   * Log evidence in evidence locker
   */
  logInLocker(officerId) {
    this.addCustodyEntry(officerId, 'logged_in_locker');
  }

  /**
   * Check out evidence for analysis
   */
  checkOut(officerId) {
    this.addCustodyEntry(officerId, 'checked_out');
  }

  /**
   * Analyze evidence
   */
  analyze(results, relevance = 50) {
    this.analyzed = true;
    this.analysisResults = results;
    this.relevance = relevance;
  }

  /**
   * Check if evidence is properly handled
   */
  isProperlyHandled() {
    return this.integrity >= 80 && this.chainOfCustody.length > 0;
  }

  /**
   * Get custody history summary
   */
  getCustodyHistory() {
    return this.chainOfCustody.map(entry => ({
      time: new Date(entry.timestamp).toLocaleString(),
      officer: entry.officer,
      action: entry.action
    }));
  }

  /**
   * Check if evidence is admissible (high integrity)
   */
  isAdmissible() {
    return this.integrity >= 70 && this.chainOfCustody.length > 0;
  }

  /**
   * Damage evidence (reduces integrity)
   */
  damage(amount = 20) {
    this.integrity = Math.max(0, this.integrity - amount);
    this.addCustodyEntry(null, 'integrity_compromised');
  }

  /**
   * Get evidence age (in hours)
   */
  getAge() {
    return Math.floor((Date.now() - this.collectedAt) / (1000 * 60 * 60));
  }
}

export default Evidence;
