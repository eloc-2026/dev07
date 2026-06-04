/**
 * Main application entry point
 * Initializes the Law Enforcement Simulation application
 */

// Core systems
import stateManager from './src/core/StateManager.js';
import router from './src/core/Router.js';
import Storage from './src/core/Storage.js';

// UI Components
import { Header } from './src/ui/components/Header.js';
import { TabNav } from './src/ui/components/TabNav.js';

// Views
import { DispatchView } from './src/ui/views/DispatchView.js';
import { CasesView } from './src/ui/views/CasesView.js';
import { DepartmentsView } from './src/ui/views/DepartmentsView.js';
import { EvidenceView } from './src/ui/views/EvidenceView.js';
import { AnalyticsView } from './src/ui/views/AnalyticsView.js';

/**
 * Initialize the application
 */
function init() {
  console.log('🚔 Initializing Law Enforcement Simulation...');

  // Initialize state manager
  stateManager.initialize();

  // Initialize storage
  const storage = new Storage(stateManager);

  // Try to load saved state
  const savedState = storage.load();
  if (savedState) {
    console.log('📁 Loaded saved state');
    // Restore state
    Object.keys(savedState).forEach(key => {
      if (key !== 'savedAt') {
        stateManager.setState(key, savedState[key]);
      }
    });
  }

  // Start auto-save
  storage.startAutoSave();

  // Mount header
  const headerContainer = document.getElementById('header-container');
  const header = new Header(headerContainer);
  header.mount();

  // Mount tab navigation
  const tabNavContainer = document.getElementById('tab-nav-container');
  const tabNav = new TabNav(tabNavContainer);
  tabNav.mount();

  // Set up router
  const mainContent = document.getElementById('main-content');
  router.setContainer(mainContent);

  // Register routes
  router.register('dispatch', DispatchView);
  router.register('cases', CasesView);
  router.register('departments', DepartmentsView);
  router.register('evidence', EvidenceView);
  router.register('analytics', AnalyticsView);

  // Navigate to default view
  router.navigate('dispatch');

  // Show welcome notification
  stateManager.addNotification('Welcome to the Law Enforcement Command Center', 'success');

  console.log('✅ Application initialized successfully');

  // Save storage instance to window for debugging
  window._storage = storage;
  window._stateManager = stateManager;
  window._router = router;
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
