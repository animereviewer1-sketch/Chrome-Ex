/**
 * Tabs Search Module
 * Search and manage open browser tabs
 */

const TabsSearch = {
  modal: null,
  tabs: [],

  /**
   * Initialize tabs search
   */
  init() {
    // Will be called when needed
  },

  /**
   * Show tabs search modal
   */
  async showModal() {
    await this.loadTabs();
    
    this.modal = document.createElement('div');
    this.modal.className = 'modal-overlay visible';
    this.modal.innerHTML = `
      <div class="modal" style="max-width: 600px;">
        <div class="modal-header">
          <span class="modal-title">🔍 Offene Tabs</span>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <input type="text" class="form-input tabs-search-input" placeholder="Tab suchen...">
          <div class="tabs-list">
            ${this.renderTabs()}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.attachEventListeners();
    
    // Focus search input
    this.modal.querySelector('.tabs-search-input').focus();
  },

  /**
   * Load all open tabs
   */
  async loadTabs() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({}, (tabs) => {
          this.tabs = tabs;
          resolve(tabs);
        });
      } else {
        // Mock data for development
        this.tabs = [
          { id: 1, title: 'Google', url: 'https://google.com', favIconUrl: '' },
          { id: 2, title: 'GitHub', url: 'https://github.com', favIconUrl: '' },
          { id: 3, title: 'YouTube', url: 'https://youtube.com', favIconUrl: '' }
        ];
        resolve(this.tabs);
      }
    });
  },

  /**
   * Render tabs list
   */
  renderTabs(filteredTabs = null) {
    const tabs = filteredTabs || this.tabs;
    
    if (tabs.length === 0) {
      return '<div class="tabs-empty">Keine Tabs gefunden</div>';
    }

    return tabs.map(tab => `
      <div class="tab-item" data-id="${tab.id}">
        <img class="tab-favicon" src="${tab.favIconUrl || 'icons/icon16.png'}" alt="" onerror="this.src='icons/icon16.png'">
        <span class="tab-title" title="${this.escapeHtml(tab.url)}">${this.escapeHtml(tab.title)}</span>
        <button class="tab-close" title="Tab schließen">×</button>
      </div>
    `).join('');
  },

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close button
    this.modal.querySelector('.modal-close').addEventListener('click', () => this.hide());

    // Search input
    this.modal.querySelector('.tabs-search-input').addEventListener('input', (e) => {
      this.filterTabs(e.target.value);
    });

    // Tab clicks
    this.attachTabListeners();

    // ESC to close
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        this.hide();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  },

  /**
   * Attach listeners to tab items
   */
  attachTabListeners() {
    this.modal.querySelectorAll('.tab-item').forEach(item => {
      // Click to switch to tab
      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('tab-close')) {
          this.switchToTab(parseInt(item.dataset.id));
        }
      });

      // Close button
      item.querySelector('.tab-close').addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeTab(parseInt(item.dataset.id));
      });
    });
  },

  /**
   * Filter tabs by query
   */
  filterTabs(query) {
    const lowerQuery = query.toLowerCase();
    const filtered = this.tabs.filter(tab => 
      tab.title.toLowerCase().includes(lowerQuery) ||
      tab.url.toLowerCase().includes(lowerQuery)
    );

    const list = this.modal.querySelector('.tabs-list');
    list.innerHTML = this.renderTabs(filtered);
    this.attachTabListeners();
  },

  /**
   * Switch to tab
   */
  switchToTab(tabId) {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.update(tabId, { active: true }, () => {
        chrome.tabs.get(tabId, (tab) => {
          if (tab.windowId) {
            chrome.windows.update(tab.windowId, { focused: true });
          }
        });
      });
    }
    this.hide();
  },

  /**
   * Close a tab
   */
  async closeTab(tabId) {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.remove(tabId, async () => {
        await this.loadTabs();
        const list = this.modal.querySelector('.tabs-list');
        list.innerHTML = this.renderTabs();
        this.attachTabListeners();
      });
    }
  },

  /**
   * Hide modal
   */
  hide() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TabsSearch;
}
