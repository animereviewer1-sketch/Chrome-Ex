/**
 * New Tab Main Module
 * Initializes all widgets and features
 */

const NewTab = {
  settings: null,
  widgets: {},

  /**
   * Initialize new tab page
   */
  async init() {
    // Initialize storage and load settings
    this.settings = await Storage.init();
    
    // Initialize theme system
    await Themes.init();
    
    // Initialize core systems
    await EditMode.init();
    DragDrop.init(document.querySelector('.widgets-container'));
    OfflineMode.init();
    Toast.init();
    QuickActions.init();
    await PasswordGenerator.init();
    
    // Apply background
    this.applyBackground();
    
    // Initialize widgets
    await this.initWidgets();
    
    // Setup settings button
    this.setupSettingsButton();
    
    // Setup edit mode toggle
    this.setupEditModeToggle();
    
    // Setup page tabs
    this.setupPageTabs();
    
    console.log('New Tab initialized successfully');
  },

  /**
   * Apply background settings
   */
  async applyBackground() {
    const bgType = await Storage.get('backgroundType') || 'gradient';
    const bgValue = await Storage.get('backgroundValue') || 'sunset';
    const animationsEnabled = await Storage.get('animationsEnabled');
    
    const bgLayer = document.querySelector('.background-layer');
    
    if (bgType === 'custom') {
      const customBgs = await Storage.get('customBackgrounds') || [];
      const activeBg = customBgs.find(bg => bg.active);
      if (activeBg) {
        bgLayer.style.backgroundImage = `url(${activeBg.data})`;
      }
    } else if (bgType === 'gradient') {
      bgLayer.classList.add('animated-gradient');
      if (!animationsEnabled) {
        bgLayer.style.animation = 'none';
      }
    }
  },

  /**
   * Initialize all widgets
   */
  async initWidgets() {
    const pages = await Storage.get('pages') || {};
    const currentPage = await Storage.get('currentPage') || 'default';
    const pageConfig = pages[currentPage] || pages.default;
    
    if (!pageConfig || !pageConfig.widgets) {
      // Use default configuration
      this.initDefaultWidgets();
      return;
    }

    for (const widgetConfig of pageConfig.widgets) {
      if (widgetConfig.visible !== false) {
        await this.initWidget(widgetConfig);
      }
    }
  },

  /**
   * Initialize default widgets
   */
  async initDefaultWidgets() {
    // Clock widget
    const clockContainer = this.createWidgetContainer('clock', 'clock', 50, 10, 'large');
    Clock.init(clockContainer);
    
    // Weather widget
    const weatherContainer = this.createWidgetContainer('weather', 'weather', 5, 5, 'medium');
    const weatherSettings = {
      location: await Storage.get('weatherLocation') || 'Munich Haidhausen',
      apiKey: await Storage.get('weatherApiKey') || ''
    };
    await Weather.init(weatherContainer, weatherSettings);
    
    // Search widget
    const searchContainer = this.createWidgetContainer('search', 'search', 50, 35, 'large');
    this.initSearchWidget(searchContainer);
    
    // Shortcuts widget
    const shortcutsContainer = this.createWidgetContainer('shortcuts', 'shortcuts', 50, 50, 'large');
    await Shortcuts.init(shortcutsContainer);
    
    // Quote widget
    const quoteContainer = this.createWidgetContainer('quote', 'quote', 50, 90, 'medium');
    Quotes.init(quoteContainer);
  },

  /**
   * Initialize single widget
   */
  async initWidget(config) {
    const container = this.createWidgetContainer(
      config.id,
      config.type,
      config.x,
      config.y,
      config.size || 'medium'
    );

    switch (config.type) {
      case 'clock':
        Clock.init(container);
        break;
      case 'weather':
        const weatherSettings = {
          location: await Storage.get('weatherLocation') || 'Munich Haidhausen',
          apiKey: await Storage.get('weatherApiKey') || ''
        };
        await Weather.init(container, weatherSettings);
        break;
      case 'search':
        this.initSearchWidget(container);
        break;
      case 'shortcuts':
        await Shortcuts.init(container);
        break;
      case 'quote':
        Quotes.init(container);
        break;
      case 'todo':
        await Todos.init(container);
        break;
      case 'notes':
        await Notes.init(container);
        break;
      case 'countdown':
        await Countdown.init(container);
        break;
    }

    this.widgets[config.id] = { config, container };
  },

  /**
   * Create widget container element
   */
  createWidgetContainer(id, type, x, y, size) {
    const container = document.createElement('div');
    container.className = `widget size-${size}`;
    container.dataset.widgetId = id;
    container.dataset.widgetType = type;
    
    // Position
    container.style.left = x + '%';
    container.style.top = y + '%';
    container.style.transform = 'translate(-50%, 0)';
    
    // Add edit controls
    container.innerHTML = `
      <div class="widget-controls">
        <button class="widget-control-btn settings" title="Einstellungen">⚙️</button>
        <button class="widget-control-btn drag" title="Verschieben">⋮⋮</button>
        <button class="widget-control-btn delete" title="Löschen">✕</button>
      </div>
      <div class="widget-body"></div>
      <div class="resize-handle se"></div>
    `;
    
    // Get the body element for widget content
    const body = container.querySelector('.widget-body');
    
    // Attach drag handler
    const dragHandle = container.querySelector('.widget-control-btn.drag');
    DragDrop.makeDraggable(container, dragHandle);
    
    // Attach control handlers
    container.querySelector('.widget-control-btn.delete').addEventListener('click', () => {
      this.removeWidget(id);
    });
    
    container.querySelector('.widget-control-btn.settings').addEventListener('click', () => {
      this.openWidgetSettings(id);
    });
    
    document.querySelector('.widgets-container').appendChild(container);
    
    return body;
  },

  /**
   * Initialize search widget
   */
  initSearchWidget(container) {
    container.innerHTML = `
      <div class="search-widget">
        <div class="search-container">
          <span class="search-icon">🔍</span>
          <input type="text" class="search-input" placeholder="Google durchsuchen...">
        </div>
      </div>
    `;

    const input = container.querySelector('.search-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(input.value)}`;
      }
    });
  },

  /**
   * Remove widget
   */
  async removeWidget(id) {
    if (!confirm('Widget wirklich entfernen?')) return;
    
    const widget = document.querySelector(`[data-widget-id="${id}"]`);
    if (widget) {
      widget.remove();
    }
    
    // Update storage
    const pages = await Storage.get('pages') || {};
    const currentPage = await Storage.get('currentPage') || 'default';
    
    if (pages[currentPage] && pages[currentPage].widgets) {
      pages[currentPage].widgets = pages[currentPage].widgets.filter(w => w.id !== id);
      await Storage.set('pages', pages);
    }
    
    delete this.widgets[id];
    Toast.show('Widget entfernt', 'success');
  },

  /**
   * Open widget settings
   */
  openWidgetSettings(id) {
    const widget = this.widgets[id];
    if (!widget) return;
    
    // Open settings modal for widget
    Toast.show('Widget-Einstellungen öffnen...', 'info');
  },

  /**
   * Setup settings button
   */
  setupSettingsButton() {
    const btn = document.createElement('button');
    btn.className = 'settings-button';
    btn.innerHTML = '⚙️';
    btn.title = 'Einstellungen';
    btn.addEventListener('click', () => {
      window.location.href = 'settings.html';
    });
    document.body.appendChild(btn);
  },

  /**
   * Setup edit mode toggle
   */
  setupEditModeToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'edit-mode-toggle';
    toggle.innerHTML = EditMode.isActive ? '✏️ Edit-Modus beenden' : '✏️ Edit-Modus';
    
    if (EditMode.isActive) {
      toggle.classList.add('active');
    }
    
    toggle.addEventListener('click', async () => {
      await EditMode.toggle();
    });
    
    document.body.appendChild(toggle);
  },

  /**
   * Setup page tabs
   */
  async setupPageTabs() {
    const pages = await Storage.get('pages') || { default: { name: 'Home', widgets: [] } };
    const currentPage = await Storage.get('currentPage') || 'default';
    
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'page-tabs';
    
    tabsContainer.innerHTML = Object.entries(pages).map(([id, page]) => `
      <button class="page-tab ${id === currentPage ? 'active' : ''}" data-page="${id}">
        ${this.escapeHtml(page.name)}
      </button>
    `).join('') + `
      <button class="page-tab add-tab" title="Neue Seite">+</button>
    `;
    
    // Tab click handlers
    tabsContainer.querySelectorAll('.page-tab:not(.add-tab)').forEach(tab => {
      tab.addEventListener('click', async () => {
        await this.switchPage(tab.dataset.page);
      });
    });
    
    // Add page handler
    tabsContainer.querySelector('.add-tab').addEventListener('click', async () => {
      await this.addPage();
    });
    
    document.body.appendChild(tabsContainer);
    
    // Keyboard shortcuts (Ctrl+1, Ctrl+2, etc.)
    document.addEventListener('keydown', async (e) => {
      if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
        const pageKeys = Object.keys(pages);
        const index = parseInt(e.key) - 1;
        if (pageKeys[index]) {
          await this.switchPage(pageKeys[index]);
        }
      }
    });
  },

  /**
   * Switch to different page
   */
  async switchPage(pageId) {
    await Storage.set('currentPage', pageId);
    window.location.reload();
  },

  /**
   * Add new page
   */
  async addPage() {
    const name = prompt('Name der neuen Seite:');
    if (!name) return;
    
    const pages = await Storage.get('pages') || {};
    const id = 'page_' + Date.now();
    
    pages[id] = {
      name: name,
      widgets: []
    };
    
    await Storage.set('pages', pages);
    await this.switchPage(id);
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  NewTab.init();
});
