/**
 * Shortcuts Widget Module
 */

const Shortcuts = {
  container: null,
  shortcuts: [],

  /**
   * Initialize shortcuts widget
   */
  async init(container) {
    this.container = container;
    this.shortcuts = await Storage.get('shortcuts') || [];
    this.render();
  },

  /**
   * Render shortcuts grid
   */
  render() {
    this.container.innerHTML = `
      <div class="shortcuts-widget">
        <div class="shortcuts-grid">
          ${this.shortcuts.map(shortcut => this.renderShortcut(shortcut)).join('')}
        </div>
      </div>
    `;

    // Add click handlers
    this.container.querySelectorAll('.shortcut-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const url = item.dataset.url;
        window.location.href = url;
      });
    });
  },

  /**
   * Render single shortcut
   */
  renderShortcut(shortcut) {
    const iconContent = shortcut.iconUrl 
      ? `<img src="${this.escapeHtml(shortcut.iconUrl)}" alt="${this.escapeHtml(shortcut.name)}">`
      : shortcut.icon || '🔗';

    return `
      <a class="shortcut-item" href="${this.escapeHtml(shortcut.url)}" data-url="${this.escapeHtml(shortcut.url)}" data-id="${shortcut.id}">
        <div class="shortcut-icon">${iconContent}</div>
        <span class="shortcut-name">${this.escapeHtml(shortcut.name)}</span>
      </a>
    `;
  },

  /**
   * Add new shortcut
   */
  async addShortcut(name, url, icon = '🔗', iconUrl = null) {
    const newShortcut = {
      id: Date.now(),
      name: name,
      url: this.normalizeUrl(url),
      icon: icon,
      iconUrl: iconUrl
    };

    this.shortcuts.push(newShortcut);
    await this.save();
    this.render();
    return newShortcut;
  },

  /**
   * Update shortcut
   */
  async updateShortcut(id, updates) {
    const index = this.shortcuts.findIndex(s => s.id === id);
    if (index !== -1) {
      if (updates.url) {
        updates.url = this.normalizeUrl(updates.url);
      }
      this.shortcuts[index] = { ...this.shortcuts[index], ...updates };
      await this.save();
      this.render();
    }
  },

  /**
   * Remove shortcut
   */
  async removeShortcut(id) {
    this.shortcuts = this.shortcuts.filter(s => s.id !== id);
    await this.save();
    this.render();
  },

  /**
   * Reorder shortcuts
   */
  async reorderShortcuts(fromIndex, toIndex) {
    const [removed] = this.shortcuts.splice(fromIndex, 1);
    this.shortcuts.splice(toIndex, 0, removed);
    await this.save();
    this.render();
  },

  /**
   * Save shortcuts to storage
   */
  async save() {
    await Storage.set('shortcuts', this.shortcuts);
  },

  /**
   * Get favicon URL for a domain
   */
  getFaviconUrl(url) {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch {
      return null;
    }
  },

  /**
   * Normalize URL (add protocol if missing)
   */
  normalizeUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
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
   * Get all shortcuts
   */
  getAll() {
    return [...this.shortcuts];
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Shortcuts;
}
