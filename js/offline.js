/**
 * Offline Mode Module
 * Handles offline functionality and caching
 */

const OfflineMode = {
  isOnline: navigator.onLine,
  indicator: null,

  /**
   * Initialize offline mode
   */
  init() {
    this.createIndicator();
    this.attachEventListeners();
    this.updateStatus();
  },

  /**
   * Create offline indicator element
   */
  createIndicator() {
    this.indicator = document.createElement('div');
    this.indicator.className = 'offline-indicator';
    this.indicator.innerHTML = '📴 Offline-Modus';
    document.body.appendChild(this.indicator);
  },

  /**
   * Attach event listeners for online/offline events
   */
  attachEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateStatus();
      this.syncData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateStatus();
    });
  },

  /**
   * Update offline indicator visibility
   */
  updateStatus() {
    if (this.indicator) {
      this.indicator.classList.toggle('visible', !this.isOnline);
    }

    // Dispatch event for other modules
    window.dispatchEvent(new CustomEvent('onlineStatusChanged', {
      detail: { isOnline: this.isOnline }
    }));
  },

  /**
   * Sync data when coming back online
   */
  async syncData() {
    Toast.show('Wieder online - Daten werden synchronisiert...', 'info');
    
    // Trigger weather refresh
    if (typeof Weather !== 'undefined') {
      await Weather.fetchWeather();
    }

    Toast.show('Synchronisierung abgeschlossen', 'success');
  },

  /**
   * Check if online
   */
  checkOnline() {
    return navigator.onLine;
  },

  /**
   * Get cached data or fallback
   */
  async getCachedOrFetch(key, fetchFn) {
    // Try cache first if offline
    if (!this.isOnline) {
      const cached = await Storage.get(key);
      if (cached) {
        return cached;
      }
    }

    // Try to fetch
    try {
      const data = await fetchFn();
      await Storage.set(key, data);
      return data;
    } catch (error) {
      // Return cached on error
      const cached = await Storage.get(key);
      return cached || null;
    }
  }
};

// Toast Notification System
const Toast = {
  container: null,

  /**
   * Initialize toast container
   */
  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },

  /**
   * Show toast notification
   */
  show(message, type = 'info', duration = 3000) {
    if (!this.container) {
      this.init();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${this.escapeHtml(message)}</span>
    `;

    this.container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OfflineMode, Toast };
}
