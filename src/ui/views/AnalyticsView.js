/**
 * AnalyticsView - Statistics and performance metrics
 */
import stateManager from '../../core/StateManager.js';

export class AnalyticsView {
  constructor(container) {
    this.container = container;
    this.element = null;
  }

  render() {
    const stats = stateManager.getState('statistics');
    const view = document.createElement('div');
    view.className = 'analytics-view';
    view.innerHTML = `
      <div class="view-header">
        <h1 class="view-title">📊 Analytics & Statistics</h1>
      </div>
      <div class="view-content">
        <div class="grid grid-cols-4">
          <div class="card text-center">
            <div class="card-body">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
              <h3 style="font-size: 2rem; margin: 0;">${stats.totalCases}</h3>
              <p class="text-secondary">Total Cases</p>
            </div>
          </div>
          <div class="card text-center">
            <div class="card-body">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
              <h3 style="font-size: 2rem; margin: 0;">${stats.solvedCases}</h3>
              <p class="text-secondary">Solved Cases</p>
            </div>
          </div>
          <div class="card text-center">
            <div class="card-body">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎯</div>
              <h3 style="font-size: 2rem; margin: 0;">${stats.averageAccuracy}%</h3>
              <p class="text-secondary">Avg Accuracy</p>
            </div>
          </div>
          <div class="card text-center">
            <div class="card-body">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏱️</div>
              <h3 style="font-size: 2rem; margin: 0;">${stats.averageSolveTime}h</h3>
              <p class="text-secondary">Avg Solve Time</p>
            </div>
          </div>
        </div>
        <div class="card mt-lg">
          <div class="card-header">
            <h3 class="card-title">Performance Overview</h3>
          </div>
          <div class="card-body">
            <p class="text-secondary">Detailed analytics coming in Phase 7</p>
          </div>
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

export default AnalyticsView;
