/**
 * Quick Actions Module
 * Provides a quick command palette (Ctrl+K)
 */

const QuickActions = {
  overlay: null,
  selectedIndex: 0,
  filteredActions: [],
  
  actions: [
    { id: 'new-note', icon: '📝', text: 'Neue Notiz erstellen', shortcut: '', action: () => Notes.createNote() },
    { id: 'new-countdown', icon: '⏲️', text: 'Neuer Countdown', shortcut: '', action: () => Countdown.showAddModal() },
    { id: 'new-todo', icon: '✅', text: 'Neue Aufgabe', shortcut: '', action: () => QuickActions.focusTodoInput() },
    { id: 'new-shortcut', icon: '🔗', text: 'Neuer Schnellzugriff', shortcut: '', action: () => QuickActions.openSettings('shortcuts') },
    { id: 'toggle-edit', icon: '✏️', text: 'Edit-Modus umschalten', shortcut: 'E', action: () => EditMode.toggle() },
    { id: 'change-theme', icon: '🎨', text: 'Theme wechseln', shortcut: 'T', action: () => QuickActions.openSettings('themes') },
    { id: 'settings', icon: '⚙️', text: 'Einstellungen öffnen', shortcut: ',', action: () => window.location.href = 'settings.html' },
    { id: 'export', icon: '📤', text: 'Einstellungen exportieren', shortcut: '', action: () => QuickActions.exportSettings() },
    { id: 'import', icon: '📥', text: 'Einstellungen importieren', shortcut: '', action: () => QuickActions.importSettings() },
    { id: 'gen-password', icon: '🔐', text: 'Passwort generieren', shortcut: 'P', action: () => QuickActions.showPasswordGenerator() },
    { id: 'search-tabs', icon: '🔍', text: 'Tabs durchsuchen', shortcut: '', action: () => QuickActions.showTabSearch() },
    { id: 'search-bookmarks', icon: '⭐', text: 'Lesezeichen durchsuchen', shortcut: '', action: () => QuickActions.showBookmarkSearch() },
    { id: 'new-quote', icon: '💭', text: 'Neues Zitat', shortcut: '', action: () => Quotes.newQuote() },
    { id: 'toggle-grid', icon: '📐', text: 'Raster ein/aus', shortcut: 'G', action: () => EditMode.toggleGrid() }
  ],

  /**
   * Initialize quick actions
   */
  init() {
    this.createOverlay();
    this.attachKeyboardShortcuts();
  },

  /**
   * Create overlay element
   */
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'quick-actions-overlay';
    this.overlay.innerHTML = `
      <div class="quick-actions-modal">
        <input type="text" class="quick-actions-input" placeholder="Aktion suchen...">
        <div class="quick-actions-list"></div>
      </div>
    `;
    document.body.appendChild(this.overlay);

    // Attach event listeners
    const input = this.overlay.querySelector('.quick-actions-input');
    
    input.addEventListener('input', (e) => {
      this.filterActions(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });

    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });
  },

  /**
   * Attach keyboard shortcuts
   */
  attachKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.show();
      }

      // ESC to close
      if (e.key === 'Escape' && this.overlay.classList.contains('visible')) {
        this.hide();
      }
    });
  },

  /**
   * Show quick actions panel
   */
  show() {
    this.overlay.classList.add('visible');
    const input = this.overlay.querySelector('.quick-actions-input');
    input.value = '';
    input.focus();
    this.filterActions('');
  },

  /**
   * Hide quick actions panel
   */
  hide() {
    this.overlay.classList.remove('visible');
  },

  /**
   * Filter actions based on search query
   */
  filterActions(query) {
    const lowerQuery = query.toLowerCase();
    
    this.filteredActions = this.actions.filter(action => 
      action.text.toLowerCase().includes(lowerQuery) ||
      action.id.includes(lowerQuery)
    );

    this.selectedIndex = 0;
    this.renderActions();
  },

  /**
   * Render filtered actions
   */
  renderActions() {
    const list = this.overlay.querySelector('.quick-actions-list');
    
    list.innerHTML = this.filteredActions.map((action, index) => `
      <div class="quick-action-item ${index === this.selectedIndex ? 'selected' : ''}" data-index="${index}">
        <span class="quick-action-icon">${action.icon}</span>
        <span class="quick-action-text">${action.text}</span>
        ${action.shortcut ? `<span class="quick-action-shortcut">${action.shortcut}</span>` : ''}
      </div>
    `).join('');

    // Attach click handlers
    list.querySelectorAll('.quick-action-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.executeAction(index);
      });

      item.addEventListener('mouseenter', () => {
        this.selectedIndex = index;
        this.updateSelection();
      });
    });
  },

  /**
   * Handle keyboard navigation
   */
  handleKeydown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredActions.length - 1);
        this.updateSelection();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.updateSelection();
        break;
        
      case 'Enter':
        e.preventDefault();
        this.executeAction(this.selectedIndex);
        break;
    }
  },

  /**
   * Update selection highlight
   */
  updateSelection() {
    const items = this.overlay.querySelectorAll('.quick-action-item');
    items.forEach((item, index) => {
      item.classList.toggle('selected', index === this.selectedIndex);
    });

    // Scroll selected item into view
    const selectedItem = items[this.selectedIndex];
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest' });
    }
  },

  /**
   * Execute selected action
   */
  executeAction(index) {
    const action = this.filteredActions[index];
    if (action) {
      this.hide();
      action.action();
    }
  },

  /**
   * Focus todo input
   */
  focusTodoInput() {
    const input = document.querySelector('.todo-input');
    if (input) {
      input.focus();
    }
  },

  /**
   * Open settings page with specific section
   */
  openSettings(section) {
    window.location.href = `settings.html#${section}`;
  },

  /**
   * Export settings
   */
  async exportSettings() {
    const json = await Storage.exportSettings();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newtab-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Toast.show('Einstellungen exportiert', 'success');
  },

  /**
   * Import settings
   */
  importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const result = await Storage.importSettings(event.target.result);
          if (result.success) {
            Toast.show('Einstellungen importiert', 'success');
            window.location.reload();
          } else {
            Toast.show('Import fehlgeschlagen: ' + result.error, 'error');
          }
        };
        reader.readAsText(file);
      }
    });

    input.click();
  },

  /**
   * Show password generator modal
   */
  showPasswordGenerator() {
    if (typeof PasswordGenerator !== 'undefined') {
      PasswordGenerator.showModal();
    }
  },

  /**
   * Show tab search
   */
  showTabSearch() {
    if (typeof TabsSearch !== 'undefined') {
      TabsSearch.showModal();
    }
  },

  /**
   * Show bookmark search
   */
  showBookmarkSearch() {
    if (typeof Bookmarks !== 'undefined') {
      Bookmarks.showModal();
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuickActions;
}
