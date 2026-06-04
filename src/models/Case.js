/**
 * Case Model - Represents an investigation case
 */
import { randomId } from '../utils/random.js';
import { CASE_STATUS } from '../utils/constants.js';

export class Case {
  constructor(data = {}) {
    this.id = data.id || randomId('case');
    this.caseNumber = data.caseNumber || this.generateCaseNumber();
    this.crimeId = data.crimeId || null;
    this.assignedDepartments = data.assignedDepartments || [];
    this.leadDetective = data.leadDetective || null;
    this.evidence = data.evidence || [];
    this.interviews = data.interviews || [];
    this.timeline = data.timeline || [];
    this.progress = data.progress || 0;
    this.solutionAccuracy = data.solutionAccuracy || 0;
    this.status = data.status || CASE_STATUS.INVESTIGATING;
    this.startTime = data.startTime || Date.now();
    this.solvedTime = data.solvedTime || null;
    this.notes = data.notes || '';
    this.suspects = data.suspects || [];
    this.primarySuspect = data.primarySuspect || null;
    this.actualPerpetrator = data.actualPerpetrator || null;
  }

  /**
   * Generate a case number (e.g., CASE-2024-001234)
   */
  generateCaseNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `CASE-${year}-${random}`;
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      caseNumber: this.caseNumber,
      crimeId: this.crimeId,
      assignedDepartments: this.assignedDepartments,
      leadDetective: this.leadDetective,
      evidence: this.evidence,
      interviews: this.interviews,
      timeline: this.timeline,
      progress: this.progress,
      solutionAccuracy: this.solutionAccuracy,
      status: this.status,
      startTime: this.startTime,
      solvedTime: this.solvedTime,
      notes: this.notes,
      suspects: this.suspects,
      primarySuspect: this.primarySuspect,
      actualPerpetrator: this.actualPerpetrator
    };
  }

  /**
   * Create Case instance from JSON
   */
  static fromJSON(json) {
    return new Case(json);
  }

  /**
   * Add evidence to case
   */
  addEvidence(evidenceId) {
    if (!this.evidence.includes(evidenceId)) {
      this.evidence.push(evidenceId);
      this.addTimelineEvent('evidence_collected', `Evidence ${evidenceId} added to case`);
      this.recalculateProgress();
    }
  }

  /**
   * Add interview to case
   */
  addInterview(interviewId) {
    if (!this.interviews.includes(interviewId)) {
      this.interviews.push(interviewId);
      this.addTimelineEvent('interview_conducted', `Interview ${interviewId} completed`);
      this.recalculateProgress();
    }
  }

  /**
   * Add timeline event
   */
  addTimelineEvent(type, description, officerId = null) {
    this.timeline.push({
      timestamp: Date.now(),
      type,
      description,
      officer: officerId
    });
  }

  /**
   * Assign department to case
   */
  assignDepartment(department) {
    if (!this.assignedDepartments.includes(department)) {
      this.assignedDepartments.push(department);
      this.addTimelineEvent('department_assigned', `${department} department assigned to case`);
    }
  }

  /**
   * Set lead detective
   */
  setLeadDetective(officerId) {
    this.leadDetective = officerId;
    this.addTimelineEvent('lead_assigned', `Officer ${officerId} assigned as lead detective`);
  }

  /**
   * Add suspect to case
   */
  addSuspect(personId) {
    if (!this.suspects.includes(personId)) {
      this.suspects.push(personId);
      this.addTimelineEvent('suspect_identified', `Suspect ${personId} added to case`);
      this.recalculateProgress();
    }
  }

  /**
   * Set primary suspect
   */
  setPrimarySuspect(personId) {
    this.primarySuspect = personId;
    this.addTimelineEvent('primary_suspect_identified', `${personId} identified as primary suspect`);
    this.recalculateProgress();
  }

  /**
   * Recalculate case progress
   */
  recalculateProgress() {
    let progress = 0;

    // Evidence collected (40% weight)
    if (this.evidence.length > 0) {
      progress += Math.min(40, this.evidence.length * 10);
    }

    // Interviews conducted (30% weight)
    if (this.interviews.length > 0) {
      progress += Math.min(30, this.interviews.length * 10);
    }

    // Suspects identified (20% weight)
    if (this.suspects.length > 0) {
      progress += Math.min(20, this.suspects.length * 5);
    }

    // Primary suspect identified (10% weight)
    if (this.primarySuspect) {
      progress += 10;
    }

    this.progress = Math.min(100, progress);
  }

  /**
   * Calculate solution accuracy
   */
  calculateAccuracy() {
    if (!this.actualPerpetrator) return 0;

    let accuracy = 0;

    // Correct suspect identified (50% weight)
    if (this.primarySuspect === this.actualPerpetrator) {
      accuracy += 50;
    }

    // Evidence quality (30% weight)
    if (this.evidence.length >= 3) {
      accuracy += 30;
    } else {
      accuracy += this.evidence.length * 10;
    }

    // Investigation thoroughness (20% weight)
    if (this.interviews.length >= 2 && this.suspects.length >= 2) {
      accuracy += 20;
    }

    this.solutionAccuracy = Math.min(100, accuracy);
    return this.solutionAccuracy;
  }

  /**
   * Attempt to solve the case
   */
  solve() {
    this.calculateAccuracy();
    this.solvedTime = Date.now();
    this.status = CASE_STATUS.SOLVED;
    this.addTimelineEvent('case_solved', `Case solved with ${this.solutionAccuracy}% accuracy`);
  }

  /**
   * Get time spent on case (in hours)
   */
  getTimeSpent() {
    const endTime = this.solvedTime || Date.now();
    return Math.floor((endTime - this.startTime) / (1000 * 60 * 60));
  }

  /**
   * Check if case is cold (no progress in 48 hours)
   */
  isCold() {
    if (this.timeline.length === 0) return false;
    const lastActivity = this.timeline[this.timeline.length - 1].timestamp;
    const hoursSinceActivity = (Date.now() - lastActivity) / (1000 * 60 * 60);
    return hoursSinceActivity > 48 && this.status === CASE_STATUS.INVESTIGATING;
  }
}

export default Case;
