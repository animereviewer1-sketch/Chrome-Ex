/**
 * Countdown Widget Module
 */

const Countdown = {
  container: null,
  countdowns: [],
  updateInterval: null,
  UPDATE_RATE: 60000, // Update every minute

  categories: {
    birthday: { icon: '🎂', name: 'Geburtstag' },
    vacation: { icon: '✈️', name: 'Urlaub' },
    deadline: { icon: '⏰', name: 'Deadline' },
    event: { icon: '🎉', name: 'Event' },
    holiday: { icon: '🎄', name: 'Feiertag' },
    custom: { icon: '📅', name: 'Sonstiges' }
  },

  /**
   * Initialize countdown widget
   */
  async init(container) {
    this.container = container;
    this.countdowns = await Storage.get('countdowns') || [];
    this.render();
    this.startUpdateInterval();
  },

  /**
   * Render countdown widget
   */
  render() {
    // Sort by date (nearest first)
    const sortedCountdowns = [...this.countdowns]
      .filter(c => new Date(c.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    this.container.innerHTML = `
      <div class="countdown-widget">
        <div class="widget-header">
          <span class="widget-title">⏲️ Countdowns</span>
          <button class="btn btn-secondary add-countdown-btn">+</button>
        </div>
        <div class="widget-content">
          <div class="countdown-list">
            ${sortedCountdowns.length > 0 
              ? sortedCountdowns.map(c => this.renderCountdownItem(c)).join('')
              : '<div class="countdown-empty">Keine Countdowns</div>'
            }
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  },

  /**
   * Render single countdown item
   */
  renderCountdownItem(countdown) {
    const timeLeft = this.calculateTimeLeft(countdown.date);
    const category = this.categories[countdown.category] || this.categories.custom;

    return `
      <div class="countdown-item" data-id="${countdown.id}">
        <span class="countdown-icon">${category.icon}</span>
        <div class="countdown-info">
          <div class="countdown-name">${this.escapeHtml(countdown.name)}</div>
          <div class="countdown-time">${timeLeft}</div>
        </div>
        <button class="countdown-delete btn-icon" title="Löschen">×</button>
      </div>
    `;
  },

  /**
   * Calculate time left until date
   */
  calculateTimeLeft(targetDate) {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;

    if (diff <= 0) {
      return 'Abgelaufen';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} Tag${days !== 1 ? 'e' : ''}, ${hours} Std.`;
    } else if (hours > 0) {
      return `${hours} Std., ${minutes} Min.`;
    } else {
      return `${minutes} Minute${minutes !== 1 ? 'n' : ''}`;
    }
  },

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Add countdown button
    this.container.querySelector('.add-countdown-btn').addEventListener('click', () => {
      this.showAddModal();
    });

    // Delete buttons
    this.container.querySelectorAll('.countdown-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.closest('.countdown-item').dataset.id);
        this.deleteCountdown(id);
      });
    });
  },

  /**
   * Show add countdown modal
   */
  showAddModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay visible';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">Neuer Countdown</span>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Name</label>
            <input type="text" class="form-input countdown-name-input" placeholder="z.B. Geburtstag">
          </div>
          <div class="form-group">
            <label class="form-label">Datum</label>
            <input type="datetime-local" class="form-input countdown-date-input">
          </div>
          <div class="form-group">
            <label class="form-label">Kategorie</label>
            <select class="form-select countdown-category-input">
              ${Object.entries(this.categories).map(([key, cat]) => 
                `<option value="${key}">${cat.icon} ${cat.name}</option>`
              ).join('')}
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary cancel-btn">Abbrechen</button>
          <button class="btn btn-primary save-btn">Speichern</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    modal.querySelector('.countdown-date-input').value = tomorrow.toISOString().slice(0, 16);

    // Close handlers
    const closeModal = () => modal.remove();
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
    
    // Don't close on outside click per requirements
    
    // Save handler
    modal.querySelector('.save-btn').addEventListener('click', async () => {
      const name = modal.querySelector('.countdown-name-input').value.trim();
      const date = modal.querySelector('.countdown-date-input').value;
      const category = modal.querySelector('.countdown-category-input').value;

      if (name && date) {
        await this.addCountdown(name, date, category);
        closeModal();
      }
    });

    // ESC to close
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  },

  /**
   * Add new countdown
   */
  async addCountdown(name, date, category = 'custom') {
    const newCountdown = {
      id: Date.now(),
      name: name,
      date: new Date(date).toISOString(),
      category: category,
      createdAt: new Date().toISOString()
    };

    this.countdowns.push(newCountdown);
    await this.save();
    this.render();
    return newCountdown;
  },

  /**
   * Delete countdown
   */
  async deleteCountdown(id) {
    this.countdowns = this.countdowns.filter(c => c.id !== id);
    await this.save();
    this.render();
  },

  /**
   * Update countdown
   */
  async updateCountdown(id, updates) {
    const countdown = this.countdowns.find(c => c.id === id);
    if (countdown) {
      Object.assign(countdown, updates);
      await this.save();
      this.render();
    }
  },

  /**
   * Start update interval
   */
  startUpdateInterval() {
    this.updateInterval = setInterval(() => {
      this.render();
    }, this.UPDATE_RATE);
  },

  /**
   * Check for expired countdowns and notify
   */
  checkExpired() {
    const now = new Date();
    this.countdowns.forEach(countdown => {
      const target = new Date(countdown.date);
      if (target <= now && !countdown.notified) {
        this.showNotification(countdown);
        countdown.notified = true;
      }
    });
  },

  /**
   * Show notification for expired countdown
   */
  showNotification(countdown) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const category = this.categories[countdown.category] || this.categories.custom;
      new Notification(`${category.icon} ${countdown.name}`, {
        body: 'Der Countdown ist abgelaufen!',
        icon: 'icons/icon128.png'
      });
    }
  },

  /**
   * Save countdowns to storage
   */
  async save() {
    await Storage.set('countdowns', this.countdowns);
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Cleanup
   */
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Countdown;
}
