/**
 * Bookmarks Module
 * Search and browse browser bookmarks
 */

const Bookmarks = {
  modal: null,
  bookmarks: [],
  currentFolder: null,

  /**
   * Initialize bookmarks
   */
  init() {
    // Will be called when needed
  },

  /**
   * Show bookmarks modal
   */
  async showModal() {
    await this.loadBookmarks();
    
    this.modal = document.createElement('div');
    this.modal.className = 'modal-overlay visible';
    this.modal.innerHTML = `
      <div class="modal" style="max-width: 600px;">
        <div class="modal-header">
          <span class="modal-title">⭐ Lesezeichen</span>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <input type="text" class="form-input bookmarks-search-input" placeholder="Lesezeichen suchen...">
          <div class="bookmarks-breadcrumb"></div>
          <div class="bookmarks-list">
            ${this.renderBookmarks()}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.attachEventListeners();
    
    // Focus search input
    this.modal.querySelector('.bookmarks-search-input').focus();
  },

  /**
   * Load all bookmarks
   */
  async loadBookmarks() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.getTree((tree) => {
          this.bookmarks = this.flattenBookmarks(tree);
          this.currentFolder = null;
          resolve(this.bookmarks);
        });
      } else {
        // Mock data for development
        this.bookmarks = [
          { id: '1', title: 'Google', url: 'https://google.com' },
          { id: '2', title: 'GitHub', url: 'https://github.com' },
          { id: '3', title: 'MDN Web Docs', url: 'https://developer.mozilla.org' }
        ];
        resolve(this.bookmarks);
      }
    });
  },

  /**
   * Flatten bookmark tree
   */
  flattenBookmarks(nodes, parent = null) {
    let bookmarks = [];
    
    for (const node of nodes) {
      const item = {
        id: node.id,
        title: node.title,
        url: node.url || null,
        isFolder: !node.url,
        parentId: node.parentId,
        children: node.children ? node.children.length : 0
      };
      
      bookmarks.push(item);
      
      if (node.children) {
        bookmarks = bookmarks.concat(this.flattenBookmarks(node.children, node.id));
      }
    }
    
    return bookmarks;
  },

  /**
   * Render bookmarks list
   */
  renderBookmarks(filteredBookmarks = null) {
    let items = filteredBookmarks || this.bookmarks;
    
    // If in a folder, show only children
    if (this.currentFolder && !filteredBookmarks) {
      items = this.bookmarks.filter(b => b.parentId === this.currentFolder);
    }
    
    // Filter out root nodes if not searching
    if (!filteredBookmarks && !this.currentFolder) {
      items = this.bookmarks.filter(b => b.parentId && b.title);
    }

    if (items.length === 0) {
      return '<div class="bookmarks-empty">Keine Lesezeichen gefunden</div>';
    }

    return items.map(bookmark => {
      if (bookmark.isFolder) {
        return `
          <div class="bookmark-item folder" data-id="${bookmark.id}">
            <span class="bookmark-icon">📁</span>
            <span class="bookmark-title">${this.escapeHtml(bookmark.title)}</span>
            <span class="bookmark-count">${bookmark.children}</span>
          </div>
        `;
      } else {
        return `
          <div class="bookmark-item" data-id="${bookmark.id}" data-url="${this.escapeHtml(bookmark.url || '')}">
            <img class="bookmark-favicon" src="https://www.google.com/s2/favicons?domain=${this.getDomain(bookmark.url)}&sz=16" alt="">
            <span class="bookmark-title">${this.escapeHtml(bookmark.title)}</span>
            <button class="bookmark-add-shortcut btn-icon" title="Als Schnellzugriff hinzufügen">+</button>
          </div>
        `;
      }
    }).join('');
  },

  /**
   * Get domain from URL
   */
  getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  },

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close button
    this.modal.querySelector('.modal-close').addEventListener('click', () => this.hide());

    // Search input
    this.modal.querySelector('.bookmarks-search-input').addEventListener('input', (e) => {
      this.filterBookmarks(e.target.value);
    });

    // Bookmark clicks
    this.attachBookmarkListeners();

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
   * Attach listeners to bookmark items
   */
  attachBookmarkListeners() {
    this.modal.querySelectorAll('.bookmark-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('bookmark-add-shortcut')) {
          return;
        }

        if (item.classList.contains('folder')) {
          this.openFolder(item.dataset.id);
        } else {
          this.openBookmark(item.dataset.url);
        }
      });

      // Add to shortcuts button
      const addBtn = item.querySelector('.bookmark-add-shortcut');
      if (addBtn) {
        addBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const title = item.querySelector('.bookmark-title').textContent;
          const url = item.dataset.url;
          this.addToShortcuts(title, url);
        });
      }
    });
  },

  /**
   * Filter bookmarks by query
   */
  filterBookmarks(query) {
    if (!query.trim()) {
      this.currentFolder = null;
      const list = this.modal.querySelector('.bookmarks-list');
      list.innerHTML = this.renderBookmarks();
      this.attachBookmarkListeners();
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = this.bookmarks.filter(b => 
      !b.isFolder && (
        b.title.toLowerCase().includes(lowerQuery) ||
        (b.url && b.url.toLowerCase().includes(lowerQuery))
      )
    );

    const list = this.modal.querySelector('.bookmarks-list');
    list.innerHTML = this.renderBookmarks(filtered);
    this.attachBookmarkListeners();
  },

  /**
   * Open folder
   */
  openFolder(folderId) {
    this.currentFolder = folderId;
    const list = this.modal.querySelector('.bookmarks-list');
    list.innerHTML = this.renderBookmarks();
    this.attachBookmarkListeners();
    this.updateBreadcrumb();
  },

  /**
   * Update breadcrumb
   */
  updateBreadcrumb() {
    const breadcrumb = this.modal.querySelector('.bookmarks-breadcrumb');
    
    if (!this.currentFolder) {
      breadcrumb.innerHTML = '';
      return;
    }

    breadcrumb.innerHTML = `
      <button class="btn btn-secondary breadcrumb-back">← Zurück</button>
    `;

    breadcrumb.querySelector('.breadcrumb-back').addEventListener('click', () => {
      const currentFolderBookmark = this.bookmarks.find(b => b.id === this.currentFolder);
      this.currentFolder = currentFolderBookmark ? currentFolderBookmark.parentId : null;
      const list = this.modal.querySelector('.bookmarks-list');
      list.innerHTML = this.renderBookmarks();
      this.attachBookmarkListeners();
      this.updateBreadcrumb();
    });
  },

  /**
   * Open bookmark URL
   */
  openBookmark(url) {
    window.open(url, '_blank');
    this.hide();
  },

  /**
   * Add bookmark to shortcuts
   */
  async addToShortcuts(title, url) {
    if (typeof Shortcuts !== 'undefined') {
      await Shortcuts.addShortcut(title, url);
      Toast.show(`"${title}" als Schnellzugriff hinzugefügt`, 'success');
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
  module.exports = Bookmarks;
}
