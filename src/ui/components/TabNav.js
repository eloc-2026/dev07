/**
 * TabNav - Tab navigation component
 * Provides navigation between main application views
 */
import router from '../../core/Router.js';
import stateManager from '../../core/StateManager.js';

export class TabNav {
  constructor(container) {
    this.container = container;
    this.element = null;
    this.tabs = [
      { name: 'dispatch', label: 'Dispatch', icon: '📡' },
      { name: 'cases', label: 'Cases', icon: '📋' },
      { name: 'departments', label: 'Departments', icon: '👮' },
      { name: 'evidence', label: 'Evidence', icon: '🔬' },
      { name: 'analytics', label: 'Analytics', icon: '📊' }
    ];
    this.unsubscribers = [];
  }

  render() {
    const nav = document.createElement('nav');
    nav.className = 'tab-nav';

    const tabList = document.createElement('ul');
    tabList.className = 'tab-list';

    this.tabs.forEach(tab => {
      const li = document.createElement('li');
      li.className = 'tab-item';

      const button = document.createElement('button');
      button.className = 'tab-button';
      button.dataset.tab = tab.name;
      button.innerHTML = `
        <span class="tab-icon">${tab.icon}</span>
        <span class="tab-label">${tab.label}</span>
      `;

      button.addEventListener('click', () => this.handleTabClick(tab.name));

      li.appendChild(button);
      tabList.appendChild(li);
    });

    nav.appendChild(tabList);
    return nav;
  }

  mount() {
    this.element = this.render();
    this.container.appendChild(this.element);

    // Subscribe to view changes
    this.unsubscribers.push(
      stateManager.subscribe('currentView', (viewName) => {
        this.updateActiveTab(viewName);
      })
    );

    // Set initial active tab
    const currentView = stateManager.getState('currentView');
    this.updateActiveTab(currentView);
  }

  unmount() {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];

    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  handleTabClick(tabName) {
    router.navigate(tabName);
  }

  updateActiveTab(viewName) {
    if (!this.element) return;

    const buttons = this.element.querySelectorAll('.tab-button');
    buttons.forEach(button => {
      if (button.dataset.tab === viewName) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }
}

export default TabNav;
