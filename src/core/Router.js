/**
 * Router - Tab-based navigation system
 * Manages view switching and routing for the application
 */
import stateManager from './StateManager.js';
import eventBus from './EventBus.js';

export class Router {
  constructor() {
    this.routes = new Map();
    this.currentView = null;
    this.container = null;
  }

  /**
   * Register a route
   * @param {string} name - Route name (e.g., 'dispatch', 'cases')
   * @param {object} viewClass - View class to instantiate
   */
  register(name, viewClass) {
    this.routes.set(name, viewClass);
  }

  /**
   * Set the container element for views
   * @param {HTMLElement} container - Container element
   */
  setContainer(container) {
    this.container = container;
  }

  /**
   * Navigate to a view
   * @param {string} viewName - Name of view to navigate to
   * @param {object} params - Optional parameters to pass to view
   */
  navigate(viewName, params = {}) {
    if (!this.routes.has(viewName)) {
      console.error(`Route not found: ${viewName}`);
      return;
    }

    if (!this.container) {
      console.error('Router container not set');
      return;
    }

    // Unmount current view
    if (this.currentView && this.currentView.unmount) {
      this.currentView.unmount();
    }

    // Clear container
    this.container.innerHTML = '';

    // Create and mount new view
    const ViewClass = this.routes.get(viewName);
    this.currentView = new ViewClass(this.container, params);

    if (this.currentView.mount) {
      this.currentView.mount();
    } else if (this.currentView.render) {
      const element = this.currentView.render();
      this.container.appendChild(element);
    }

    // Update state
    stateManager.setState('currentView', viewName);

    // Emit navigation event
    eventBus.emit('route:changed', { viewName, params });
  }

  /**
   * Get current view instance
   * @returns {object} Current view instance
   */
  getCurrentView() {
    return this.currentView;
  }

  /**
   * Check if route exists
   * @param {string} name - Route name
   * @returns {boolean} True if route exists
   */
  has(name) {
    return this.routes.has(name);
  }
}

// Create singleton instance
const router = new Router();
export default router;
