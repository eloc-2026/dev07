/**
 * DepartmentsView - Department tools and operations
 */
export class DepartmentsView {
  constructor(container) {
    this.container = container;
    this.element = null;
  }

  render() {
    const view = document.createElement('div');
    view.className = 'departments-view';
    view.innerHTML = `
      <div class="view-header">
        <h1 class="view-title">👮 Departments & Tools</h1>
      </div>
      <div class="view-content">
        <div class="grid grid-cols-3">
          ${this.renderDepartmentCards()}
        </div>
      </div>
    `;
    return view;
  }

  renderDepartmentCards() {
    const departments = [
      { name: 'Patrol', icon: '🚔', color: '#3a7bc8' },
      { name: 'Detective', icon: '🔍', color: '#8b5cf6' },
      { name: 'Forensics', icon: '🔬', color: '#10b981' },
      { name: 'Cybercrime', icon: '💻', color: '#06b6d4' },
      { name: 'K-9 Unit', icon: '🐕', color: '#f59e0b' },
      { name: 'SWAT', icon: '🛡️', color: '#ef4444' }
    ];

    return departments.map(dept => `
      <div class="card">
        <div class="card-header">
          <div style="font-size: 2rem;">${dept.icon}</div>
        </div>
        <div class="card-body text-center">
          <h3 class="card-title">${dept.name}</h3>
          <p class="text-secondary">Tools coming in Phase 4-6</p>
        </div>
      </div>
    `).join('');
  }

  mount() {
    this.element = this.render();
    this.container.appendChild(this.element);
  }

  unmount() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}

export default DepartmentsView;
