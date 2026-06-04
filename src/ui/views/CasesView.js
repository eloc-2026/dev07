/**
 * CasesView - Active cases dashboard
 */
import stateManager from '../../core/StateManager.js';

export class CasesView {
  constructor(container) {
    this.container = container;
    this.element = null;
    this.unsubscribers = [];
  }

  render() {
    const view = document.createElement('div');
    view.className = 'cases-view';
    view.innerHTML = `
      <div class="view-header">
        <h1 class="view-title">📋 Active Cases</h1>
      </div>
      <div class="view-content">
        <div class="cases-grid grid grid-cols-2" id="cases-grid">
          ${this.renderCasesList()}
        </div>
      </div>
    `;
    return view;
  }

  renderCasesList() {
    const cases = stateManager.getState('activeCases');

    if (!cases || cases.length === 0) {
      return `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">📋</div>
          <h2 class="empty-state-title">No Active Cases</h2>
          <p class="empty-state-description">Cases will appear here once created from the Dispatch view.</p>
        </div>
      `;
    }

    return cases.map(caseData => this.renderCaseCard(caseData)).join('');
  }

  renderCaseCard(caseData) {
    const statusClass = `badge-status-${caseData.status || 'investigating'}`;
    const progressPercent = caseData.progress || 0;

    return `
      <div class="card case-card" data-case-id="${caseData.id}">
        <div class="card-header">
          <div>
            <h3 class="card-title">${caseData.caseNumber}</h3>
          </div>
          <span class="badge ${statusClass}">
            ${caseData.status || 'Investigating'}
          </span>
        </div>
        <div class="card-body">
          <div class="case-info">
            <p><strong>Departments:</strong> ${caseData.assignedDepartments.join(', ')}</p>
            <p><strong>Evidence:</strong> ${caseData.evidence.length} items</p>
            <p><strong>Interviews:</strong> ${caseData.interviews.length}</p>
            <p><strong>Suspects:</strong> ${caseData.suspects.length}</p>
            <p><strong>Started:</strong> ${new Date(caseData.startTime).toLocaleString()}</p>
          </div>
          <div class="progress-bar mt-md">
            <div class="progress-label">Progress: ${progressPercent}%</div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${progressPercent}%"></div>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-view-case" data-case-id="${caseData.id}">
            View Case
          </button>
          ${progressPercent >= 50 ? `
            <button class="btn btn-success btn-solve-case" data-case-id="${caseData.id}">
              Solve Case
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  mount() {
    this.element = this.render();
    this.container.appendChild(this.element);

    // Attach event listeners
    this.attachEventListeners();

    // Subscribe to state changes
    this.unsubscribers.push(
      stateManager.subscribe('activeCases', () => {
        this.updateCasesList();
      })
    );
  }

  unmount() {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];

    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  attachEventListeners() {
    this.element.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-view-case')) {
        const caseId = e.target.dataset.caseId;
        this.handleViewCase(caseId);
      } else if (e.target.classList.contains('btn-solve-case')) {
        const caseId = e.target.dataset.caseId;
        this.handleSolveCase(caseId);
      }
    });
  }

  handleViewCase(caseId) {
    stateManager.setState('selectedCase', caseId);
    stateManager.addNotification('Case details view coming in Phase 3', 'info');
  }

  async handleSolveCase(caseId) {
    const cases = stateManager.getState('activeCases');
    const caseData = cases.find(c => c.id === caseId);

    if (!caseData) {
      stateManager.addNotification('Case not found', 'error');
      return;
    }

    // Import CaseManager
    const { default: caseManager } = await import('../../systems/CaseManager.js');

    // Load case into manager
    const { default: Case } = await import('../../models/Case.js');
    const caseObj = Case.fromJSON(caseData);
    caseManager.cases.set(caseObj.id, caseObj);

    // For now, solve with the first suspect (if any)
    const primarySuspect = caseData.suspects[0] || null;

    // Solve the case
    caseManager.solveCase(caseId, primarySuspect);
  }

  updateCasesList() {
    const grid = this.element?.querySelector('#cases-grid');
    if (grid) {
      grid.innerHTML = this.renderCasesList();
      this.attachEventListeners();
    }
  }
}

export default CasesView;
