/**
 * DispatchView - Incoming crimes and dispatch dashboard
 * Shows reported crimes that need to be assigned to cases
 */
import stateManager from '../../core/StateManager.js';

export class DispatchView {
  constructor(container, params = {}) {
    this.container = container;
    this.params = params;
    this.element = null;
    this.unsubscribers = [];
  }

  render() {
    const view = document.createElement('div');
    view.className = 'dispatch-view';
    view.innerHTML = `
      <div class="view-header">
        <h1 class="view-title">
          📡 Dispatch Center
        </h1>
        <button class="btn btn-primary" id="generate-crime-btn">
          Generate New Crime
        </button>
      </div>

      <div class="view-content">
        <div class="crimes-grid grid grid-cols-2" id="crimes-grid">
          ${this.renderCrimesList()}
        </div>
      </div>
    `;

    return view;
  }

  renderCrimesList() {
    const crimes = stateManager.getState('crimes');

    if (!crimes || crimes.length === 0) {
      return `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">📭</div>
          <h2 class="empty-state-title">No Active Crimes</h2>
          <p class="empty-state-description">
            Click "Generate New Crime" to create a crime scenario for investigation.
          </p>
        </div>
      `;
    }

    return crimes.map(crime => this.renderCrimeCard(crime)).join('');
  }

  renderCrimeCard(crime) {
    const severityClass = `badge-severity-${crime.severity || 1}`;
    const statusClass = `badge-status-${crime.status || 'reported'}`;

    return `
      <div class="card crime-card" data-crime-id="${crime.id}">
        <div class="card-header">
          <div>
            <span class="badge ${severityClass}">
              Severity ${crime.severity || 1}
            </span>
            <span class="badge ${statusClass}">
              ${crime.status || 'Reported'}
            </span>
          </div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${crime.type || 'Unknown Crime'}</h3>
          <div class="crime-details">
            <p><strong>Location:</strong> ${crime.location?.address || 'Unknown'}</p>
            <p><strong>Time Occurred:</strong> ${new Date(crime.timeOccurred).toLocaleString()}</p>
            <p class="text-secondary">${crime.description || 'No description available'}</p>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-create-case" data-crime-id="${crime.id}">
            Create Case
          </button>
          <button class="btn btn-secondary btn-view-details" data-crime-id="${crime.id}">
            View Details
          </button>
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
      stateManager.subscribe('crimes', () => {
        this.updateCrimesList();
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
    const generateBtn = this.element.querySelector('#generate-crime-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.handleGenerateCrime());
    }

    // Event delegation for crime card buttons
    this.element.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-create-case')) {
        const crimeId = e.target.dataset.crimeId;
        this.handleCreateCase(crimeId);
      } else if (e.target.classList.contains('btn-view-details')) {
        const crimeId = e.target.dataset.crimeId;
        this.handleViewDetails(crimeId);
      }
    });
  }

  async handleGenerateCrime() {
    const btn = this.element.querySelector('#generate-crime-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Generating...';
    }

    try {
      // Import CrimeGenerator dynamically
      const { default: crimeGenerator } = await import('../../systems/CrimeGenerator.js');

      // Generate a crime
      const result = await crimeGenerator.generate();

      if (result) {
        // Add crime to state
        stateManager.updateState('crimes', crimes => [...crimes, result.crime.toJSON()]);

        // Add persons to state
        result.persons.forEach(person => {
          stateManager.updateState('persons', persons => [...persons, person.toJSON()]);
        });

        stateManager.addNotification(
          `New ${result.crime.type} reported at ${result.crime.location.address}`,
          'warning'
        );
      }
    } catch (error) {
      console.error('Error generating crime:', error);
      stateManager.addNotification('Error generating crime', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Generate New Crime';
      }
    }
  }

  async handleCreateCase(crimeId) {
    try {
      // Import CaseManager dynamically
      const { default: caseManager } = await import('../../systems/CaseManager.js');

      // Find the crime
      const crimes = stateManager.getState('crimes');
      const crime = crimes.find(c => c.id === crimeId);

      if (!crime) {
        stateManager.addNotification('Crime not found', 'error');
        return;
      }

      // Import Crime model to recreate object
      const { default: Crime } = await import('../../models/Crime.js');
      const crimeObj = Crime.fromJSON(crime);

      // Determine departments based on crime type
      const departmentMap = {
        'theft': ['patrol', 'detective'],
        'homicide': ['patrol', 'detective', 'forensics'],
        'assault': ['patrol', 'detective'],
        'fraud': ['detective', 'cybercrime'],
        'cybercrime': ['cybercrime'],
        'drug_offense': ['patrol', 'detective', 'k9'],
        'burglary': ['patrol', 'detective', 'forensics'],
        'robbery': ['patrol', 'detective', 'swat']
      };

      const departments = departmentMap[crime.type] || ['detective'];

      // Create case
      const newCase = caseManager.createCase(crimeObj, departments);

      // Update crime in state
      stateManager.updateState('crimes', crimes =>
        crimes.map(c => c.id === crimeId ? crimeObj.toJSON() : c)
      );

      stateManager.addNotification(
        `Case ${newCase.caseNumber} created successfully`,
        'success'
      );

      // Navigate to cases view
      const { default: router } = await import('../../core/Router.js');
      router.navigate('cases');
    } catch (error) {
      console.error('Error creating case:', error);
      stateManager.addNotification('Error creating case', 'error');
    }
  }

  handleViewDetails(crimeId) {
    const crimes = stateManager.getState('crimes');
    const crime = crimes.find(c => c.id === crimeId);

    if (!crime) {
      stateManager.addNotification('Crime not found', 'error');
      return;
    }

    // Import Modal dynamically and show details
    import('../components/Modal.js').then(({ Modal }) => {
      const modal = new Modal({
        title: `Crime Details - ${crime.type}`,
        content: `
          <div class="crime-details-modal">
            <p><strong>Location:</strong> ${crime.location.address}</p>
            <p><strong>Time Occurred:</strong> ${new Date(crime.timeOccurred).toLocaleString()}</p>
            <p><strong>Time Reported:</strong> ${new Date(crime.timeReported).toLocaleString()}</p>
            <p><strong>Severity:</strong> ${crime.severity}</p>
            <p><strong>Status:</strong> ${crime.status}</p>
            <p><strong>Description:</strong> ${crime.description}</p>
            <p><strong>Suspects:</strong> ${crime.suspects.length}</p>
            <p><strong>Victims:</strong> ${crime.victims.length}</p>
            <p><strong>Witnesses:</strong> ${crime.witnesses.length}</p>
          </div>
        `
      });
      modal.show();
    });
  }

  updateCrimesList() {
    const grid = this.element?.querySelector('#crimes-grid');
    if (grid) {
      grid.innerHTML = this.renderCrimesList();
    }
  }
}

export default DispatchView;
