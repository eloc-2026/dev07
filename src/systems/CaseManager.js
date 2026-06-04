/**
 * CaseManager - Manages case lifecycle and operations
 */
import Case from '../models/Case.js';
import stateManager from '../core/StateManager.js';
import eventBus from '../core/EventBus.js';

export class CaseManager {
  constructor() {
    this.cases = new Map();
  }

  /**
   * Create a new case from a crime
   */
  createCase(crime, departments = []) {
    const caseObj = new Case({
      crimeId: crime.id
    });

    // Assign departments
    departments.forEach(dept => {
      caseObj.assignDepartment(dept);
    });

    // Add initial timeline event
    caseObj.addTimelineEvent('case_created', `Case created for ${crime.type} at ${crime.location.address}`);

    // Store case
    this.cases.set(caseObj.id, caseObj);

    // Update crime status
    crime.assignToCase(caseObj.id);

    // Update state
    stateManager.addCase(caseObj.toJSON());

    // Emit event
    eventBus.emit('case:created', { caseId: caseObj.id, crime });

    console.log(`Case ${caseObj.caseNumber} created for crime ${crime.id}`);

    return caseObj;
  }

  /**
   * Get a case by ID
   */
  getCase(caseId) {
    return this.cases.get(caseId);
  }

  /**
   * Get all cases
   */
  getAllCases() {
    return Array.from(this.cases.values());
  }

  /**
   * Get active cases
   */
  getActiveCases() {
    return this.getAllCases().filter(c =>
      c.status === 'investigating' || c.status === 'reported'
    );
  }

  /**
   * Get solved cases
   */
  getSolvedCases() {
    return this.getAllCases().filter(c => c.status === 'solved');
  }

  /**
   * Update a case
   */
  updateCase(caseId, updates) {
    const caseObj = this.cases.get(caseId);
    if (!caseObj) {
      console.error(`Case not found: ${caseId}`);
      return null;
    }

    // Apply updates
    Object.assign(caseObj, updates);

    // Update state
    stateManager.updateCase(caseId, caseObj.toJSON());

    // Emit event
    eventBus.emit('case:updated', { caseId, updates });

    return caseObj;
  }

  /**
   * Add evidence to a case
   */
  addEvidence(caseId, evidenceId) {
    const caseObj = this.cases.get(caseId);
    if (!caseObj) {
      console.error(`Case not found: ${caseId}`);
      return false;
    }

    caseObj.addEvidence(evidenceId);
    stateManager.updateCase(caseId, caseObj.toJSON());
    eventBus.emit('case:evidence_added', { caseId, evidenceId });

    return true;
  }

  /**
   * Add interview to a case
   */
  addInterview(caseId, interviewId) {
    const caseObj = this.cases.get(caseId);
    if (!caseObj) {
      console.error(`Case not found: ${caseId}`);
      return false;
    }

    caseObj.addInterview(interviewId);
    stateManager.updateCase(caseId, caseObj.toJSON());
    eventBus.emit('case:interview_added', { caseId, interviewId });

    return true;
  }

  /**
   * Attempt to solve a case
   */
  solveCase(caseId, primarySuspectId) {
    const caseObj = this.cases.get(caseId);
    if (!caseObj) {
      console.error(`Case not found: ${caseId}`);
      return null;
    }

    // Set primary suspect
    if (primarySuspectId) {
      caseObj.setPrimarySuspect(primarySuspectId);
    }

    // Solve the case
    caseObj.solve();

    // Update state
    stateManager.updateCase(caseId, caseObj.toJSON());

    // Update statistics
    const stats = stateManager.getState('statistics');
    const solvedCases = stats.solvedCases + 1;
    const totalAccuracy = stats.averageAccuracy * stats.solvedCases + caseObj.solutionAccuracy;
    const totalTime = stats.averageSolveTime * stats.solvedCases + caseObj.getTimeSpent();

    stateManager.updateState('statistics', s => ({
      ...s,
      solvedCases,
      averageAccuracy: Math.round(totalAccuracy / solvedCases),
      averageSolveTime: Math.round(totalTime / solvedCases)
    }));

    // Emit event
    eventBus.emit('case:solved', {
      caseId,
      accuracy: caseObj.solutionAccuracy,
      timeSpent: caseObj.getTimeSpent()
    });

    // Show notification
    stateManager.addNotification(
      `Case ${caseObj.caseNumber} solved with ${caseObj.solutionAccuracy}% accuracy!`,
      caseObj.solutionAccuracy >= 80 ? 'success' : 'warning'
    );

    return caseObj;
  }

  /**
   * Close a case without solving
   */
  closeCase(caseId, reason) {
    const caseObj = this.cases.get(caseId);
    if (!caseObj) {
      console.error(`Case not found: ${caseId}`);
      return null;
    }

    caseObj.status = 'closed';
    caseObj.addTimelineEvent('case_closed', reason);

    stateManager.updateCase(caseId, caseObj.toJSON());
    eventBus.emit('case:closed', { caseId, reason });

    return caseObj;
  }

  /**
   * Load cases from state
   */
  loadFromState() {
    const activeCases = stateManager.getState('activeCases');

    activeCases.forEach(caseData => {
      const caseObj = Case.fromJSON(caseData);
      this.cases.set(caseObj.id, caseObj);
    });

    console.log(`Loaded ${this.cases.size} cases from state`);
  }

  /**
   * Clear all cases
   */
  clear() {
    this.cases.clear();
    stateManager.setState('activeCases', []);
  }
}

// Create singleton instance
const caseManager = new CaseManager();
export default caseManager;
