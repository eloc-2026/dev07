/**
 * EvidenceView - Evidence locker and management
 */
export class EvidenceView {
  constructor(container) {
    this.container = container;
    this.element = null;
  }

  render() {
    const view = document.createElement('div');
    view.className = 'evidence-view';
    view.innerHTML = `
      <div class="view-header">
        <h1 class="view-title">🔬 Evidence Locker</h1>
      </div>
      <div class="view-content">
        <div class="empty-state">
          <div class="empty-state-icon">🔬</div>
          <h2 class="empty-state-title">No Evidence Collected</h2>
          <p class="empty-state-description">Evidence will appear here as it's collected during investigations.</p>
        </div>
      </div>
    `;
    return view;
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

export default EvidenceView;
