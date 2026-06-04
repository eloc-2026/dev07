/**
 * Header - Top navigation bar component
 * Displays badge number, current time, active cases count, and notifications
 */
import stateManager from '../../core/StateManager.js';

export class Header {
  constructor(container) {
    this.container = container;
    this.element = null;
    this.badgeNumber = 'LEO-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.unsubscribers = [];
  }

  render() {
    const header = document.createElement('header');
    header.className = 'command-header';
    header.innerHTML = `
      <div class="header-left">
        <div class="header-title">
          <span class="badge-icon">⭐</span>
          <span class="header-main-title">LAW ENFORCEMENT COMMAND CENTER</span>
        </div>
        <div class="badge-number">Badge: ${this.badgeNumber}</div>
      </div>
      <div class="header-center">
        <div class="current-time" id="current-time">
          ${this.formatTime(Date.now())}
        </div>
      </div>
      <div class="header-right">
        <div class="active-cases-count">
          <span class="count-label">Active Cases:</span>
          <span class="count-value" id="active-cases-count">0</span>
        </div>
        <div class="notifications-container" id="notifications-container"></div>
      </div>
    `;

    return header;
  }

  mount() {
    this.element = this.render();
    this.container.appendChild(this.element);

    // Subscribe to state changes
    this.unsubscribers.push(
      stateManager.subscribe('activeCases', (cases) => {
        this.updateActiveCasesCount(cases);
      })
    );

    this.unsubscribers.push(
      stateManager.subscribe('notifications', (notifications) => {
        this.updateNotifications(notifications);
      })
    );

    // Start clock
    this.startClock();
  }

  unmount() {
    // Stop clock
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }

    // Unsubscribe from state changes
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];

    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  startClock() {
    this.clockInterval = setInterval(() => {
      const timeEl = document.getElementById('current-time');
      if (timeEl) {
        timeEl.textContent = this.formatTime(Date.now());
      }
    }, 1000);
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  updateActiveCasesCount(cases) {
    const countEl = document.getElementById('active-cases-count');
    if (countEl) {
      const activeCases = cases.filter(c => c.status !== 'solved' && c.status !== 'closed');
      countEl.textContent = activeCases.length;

      // Add visual indicator if many cases
      if (activeCases.length > 5) {
        countEl.classList.add('high-count');
      } else {
        countEl.classList.remove('high-count');
      }
    }
  }

  updateNotifications(notifications) {
    const container = document.getElementById('notifications-container');
    if (!container) return;

    container.innerHTML = '';

    notifications.forEach(notification => {
      const notifEl = document.createElement('div');
      notifEl.className = `notification notification-${notification.type}`;
      notifEl.innerHTML = `
        <span class="notification-message">${notification.message}</span>
        <button class="notification-close" data-id="${notification.id}">&times;</button>
      `;

      notifEl.querySelector('.notification-close').addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        stateManager.removeNotification(id);
      });

      container.appendChild(notifEl);
    });
  }
}

export default Header;
