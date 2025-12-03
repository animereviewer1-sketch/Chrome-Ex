/**
 * Widget Management functionality
 */
const Widgets = {
  widgets: [],
  widgetSettings: {},
  widgetPositions: {},
  widgetGroups: [],
  galleryModal: null,
  settingsModal: null,
  groupModal: null,
  confirmDialog: null,
  currentWidgetId: null,
  selectedForGroup: [],

  widgetTypes: {
    clock: {
      name: 'Clock',
      icon: '⏰',
      allowMultiple: false,
      createHTML: () => `
        <div class="widget-edit-controls hidden">
          <span class="drag-handle" title="Drag to move">⋮⋮</span>
          <button class="widget-settings-btn" title="Widget Settings">⚙️</button>
          <button class="widget-remove-btn" title="Remove Widget">✖️</button>
          <input type="checkbox" class="widget-group-checkbox" title="Select for grouping">
        </div>
        <div id="clock" class="clock">00:00</div>
        <div id="date" class="date">Loading...</div>
      `
    },
    weather: {
      name: 'Weather',
      icon: '🌤️',
      allowMultiple: false,
      createHTML: () => `
        <div class="widget-edit-controls hidden">
          <span class="drag-handle" title="Drag to move">⋮⋮</span>
          <button class="widget-settings-btn" title="Widget Settings">⚙️</button>
          <button class="widget-remove-btn" title="Remove Widget">✖️</button>
          <input type="checkbox" class="widget-group-checkbox" title="Select for grouping">
        </div>
        <div class="weather-icon">
          <span id="weather-icon-display">☀️</span>
        </div>
        <div class="weather-info">
          <div class="weather-temp"><span id="temperature">--</span>°C</div>
          <div class="weather-location" id="weather-location">Loading...</div>
        </div>
        <div class="weather-details">
          <div class="weather-detail">
            <span class="detail-label">Wind</span>
            <span class="detail-value" id="wind-speed">-- km/h</span>
          </div>
          <div class="weather-detail">
            <span class="detail-label">Humidity</span>
            <span class="detail-value" id="humidity">--%</span>
          </div>
          <div class="weather-detail">
            <span class="detail-label">UV</span>
            <span class="detail-value" id="uv-index">--</span>
          </div>
        </div>
      `
    },
    search: {
      name: 'Search',
      icon: '🔍',
      allowMultiple: false,
      createHTML: () => `
        <div class="widget-edit-controls hidden">
          <span class="drag-handle" title="Drag to move">⋮⋮</span>
          <button class="widget-settings-btn" title="Widget Settings">⚙️</button>
          <button class="widget-remove-btn" title="Remove Widget">✖️</button>
          <input type="checkbox" class="widget-group-checkbox" title="Select for grouping">
        </div>
        <input type="text" placeholder="Search the web..." autocomplete="off">
        <button class="search-button">🔍</button>
      `
    },
    shortcuts: {
      name: 'Shortcuts',
      icon: '🔗',
      allowMultiple: true,
      createHTML: () => `
        <div class="widget-edit-controls hidden">
          <span class="drag-handle" title="Drag to move">⋮⋮</span>
          <button class="widget-settings-btn" title="Widget Settings">⚙️</button>
          <button class="widget-remove-btn" title="Remove Widget">✖️</button>
          <input type="checkbox" class="widget-group-checkbox" title="Select for grouping">
        </div>
      `
    },
    todo: {
      name: 'To-Do',
      icon: '✅',
      allowMultiple: false,
      createHTML: () => `
        <div class="widget-edit-controls hidden">
          <span class="drag-handle" title="Drag to move">⋮⋮</span>
          <button class="widget-settings-btn" title="Widget Settings">⚙️</button>
          <button class="widget-remove-btn" title="Remove Widget">✖️</button>
          <input type="checkbox" class="widget-group-checkbox" title="Select for grouping">
        </div>
        <div class="todo-header">
          <h3>To-Do List</h3>
          <button class="glass-button-small" title="Add task">+</button>
        </div>
        <ul class="todo-list"></ul>
      `
    },
    quote: {
      name: 'Quote',
      icon: '💭',
      allowMultiple: false,
      createHTML: () => `
        <div class="widget-edit-controls hidden">
          <span class="drag-handle" title="Drag to move">⋮⋮</span>
          <button class="widget-settings-btn" title="Widget Settings">⚙️</button>
          <button class="widget-remove-btn" title="Remove Widget">✖️</button>
          <input type="checkbox" class="widget-group-checkbox" title="Select for grouping">
        </div>
        <div class="quote-text">"Loading quote..."</div>
        <div class="quote-author">— Loading</div>
      `
    }
  },

  init() {
    this.galleryModal = document.getElementById('widget-gallery-modal');
    this.settingsModal = document.getElementById('widget-settings-modal');
    this.groupModal = document.getElementById('group-settings-modal');
    this.confirmDialog = document.getElementById('confirm-dialog');
    
    this.bindEvents();
    this.loadWidgetData();
  },

  bindEvents() {
    // Widget Gallery Modal
    const closeGalleryBtn = document.getElementById('close-widget-gallery');
    if (closeGalleryBtn) {
      closeGalleryBtn.addEventListener('click', () => this.closeGallery());
    }

    if (this.galleryModal) {
      this.galleryModal.querySelector('.modal-overlay').addEventListener('click', () => this.closeGallery());

      // Widget gallery items
      this.galleryModal.querySelectorAll('.widget-gallery-item').forEach(item => {
        item.addEventListener('click', () => {
          const type = item.dataset.widgetType;
          this.addWidget(type);
          this.closeGallery();
        });
      });
    }

    // Widget Settings Modal
    const closeSettingsBtn = document.getElementById('close-widget-settings');
    if (closeSettingsBtn) {
      closeSettingsBtn.addEventListener('click', () => this.closeSettings());
    }

    if (this.settingsModal) {
      this.settingsModal.querySelector('.modal-overlay').addEventListener('click', () => this.closeSettings());

      const cancelBtn = document.getElementById('cancel-widget-settings');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => this.closeSettings());
      }

      const saveBtn = document.getElementById('save-widget-settings');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveWidgetSettings());
      }

      // Opacity slider
      const opacitySlider = document.getElementById('widget-opacity');
      const opacityValue = document.getElementById('widget-opacity-value');
      if (opacitySlider && opacityValue) {
        opacitySlider.addEventListener('input', () => {
          opacityValue.textContent = `${opacitySlider.value}%`;
        });
      }
    }

    // Group Settings Modal
    const closeGroupBtn = document.getElementById('close-group-settings');
    if (closeGroupBtn) {
      closeGroupBtn.addEventListener('click', () => this.closeGroupModal());
    }

    if (this.groupModal) {
      this.groupModal.querySelector('.modal-overlay').addEventListener('click', () => this.closeGroupModal());

      const cancelBtn = document.getElementById('cancel-group-settings');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => this.closeGroupModal());
      }

      const createBtn = document.getElementById('create-group-btn');
      if (createBtn) {
        createBtn.addEventListener('click', () => this.createGroup());
      }
    }

    // Confirm Dialog
    if (this.confirmDialog) {
      this.confirmDialog.querySelector('.modal-overlay').addEventListener('click', () => this.closeConfirm());
      document.getElementById('confirm-cancel').addEventListener('click', () => this.closeConfirm());
    }

    // Widget controls delegation
    document.addEventListener('click', (e) => {
      // Settings button
      if (e.target.classList.contains('widget-settings-btn')) {
        const widget = e.target.closest('.widget');
        if (widget) {
          this.openSettings(widget.dataset.widgetId);
        }
      }

      // Remove button
      if (e.target.classList.contains('widget-remove-btn')) {
        const widget = e.target.closest('.widget');
        if (widget) {
          this.confirmRemoveWidget(widget.dataset.widgetId);
        }
      }
    });

    // Group checkbox change
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('widget-group-checkbox')) {
        const widget = e.target.closest('.widget');
        if (widget) {
          this.toggleGroupSelection(widget.dataset.widgetId, e.target.checked);
        }
      }
    });
  },

  async loadWidgetData() {
    this.widgetSettings = await Storage.get('widgetSettings', DEFAULT_WIDGET_SETTINGS);
    this.widgetPositions = await Storage.get('widgetPositions', DEFAULT_WIDGET_POSITIONS);
    this.widgetGroups = await Storage.get('widgetGroups', DEFAULT_WIDGET_GROUPS);
    
    this.applyWidgetSettings();
  },

  applyWidgetSettings() {
    Object.entries(this.widgetSettings).forEach(([widgetId, settings]) => {
      const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
      if (!widget) return;

      // Visibility
      if (!settings.visible) {
        widget.classList.add('hidden');
      }

      // Background
      if (!settings.showBackground) {
        widget.classList.add('no-background');
      }

      // Size
      widget.classList.remove('size-small', 'size-medium', 'size-large');
      if (settings.size !== 'medium') {
        widget.classList.add(`size-${settings.size}`);
      }

      // Opacity
      if (settings.opacity < 100) {
        widget.style.opacity = settings.opacity / 100;
      }
    });
  },

  openGallery() {
    this.galleryModal.classList.remove('hidden');
    
    // Update gallery to show which widgets can be added
    this.galleryModal.querySelectorAll('.widget-gallery-item').forEach(item => {
      const type = item.dataset.widgetType;
      const typeConfig = this.widgetTypes[type];
      
      if (!typeConfig.allowMultiple) {
        const existing = document.querySelector(`[data-widget-type="${type}"]`);
        if (existing && !existing.classList.contains('hidden')) {
          item.style.opacity = '0.5';
          item.style.pointerEvents = 'none';
        } else {
          item.style.opacity = '1';
          item.style.pointerEvents = 'auto';
        }
      }
    });
  },

  closeGallery() {
    this.galleryModal.classList.add('hidden');
  },

  openSettings(widgetId) {
    this.currentWidgetId = widgetId;
    const settings = this.widgetSettings[widgetId] || { showBackground: true, size: 'medium', opacity: 100 };
    
    document.getElementById('widget-settings-id').value = widgetId;
    document.getElementById('widget-show-background').checked = settings.showBackground;
    document.getElementById('widget-size').value = settings.size;
    document.getElementById('widget-opacity').value = settings.opacity;
    document.getElementById('widget-opacity-value').textContent = `${settings.opacity}%`;
    
    this.settingsModal.classList.remove('hidden');
  },

  closeSettings() {
    this.settingsModal.classList.add('hidden');
    this.currentWidgetId = null;
  },

  async saveWidgetSettings() {
    const widgetId = document.getElementById('widget-settings-id').value;
    const showBackground = document.getElementById('widget-show-background').checked;
    const size = document.getElementById('widget-size').value;
    const opacity = parseInt(document.getElementById('widget-opacity').value);

    this.widgetSettings[widgetId] = {
      ...this.widgetSettings[widgetId],
      showBackground,
      size,
      opacity
    };

    await Storage.set('widgetSettings', this.widgetSettings);
    this.applyWidgetSettings();
    this.closeSettings();
  },

  addWidget(type) {
    const typeConfig = this.widgetTypes[type];
    if (!typeConfig) return;

    // Check if widget already exists and doesn't allow multiple
    if (!typeConfig.allowMultiple) {
      const existing = document.querySelector(`[data-widget-type="${type}"]`);
      if (existing) {
        existing.classList.remove('hidden');
        this.widgetSettings[existing.dataset.widgetId] = {
          ...this.widgetSettings[existing.dataset.widgetId],
          visible: true
        };
        Storage.set('widgetSettings', this.widgetSettings);
        return;
      }
    }

    // For now, just show the existing widget
    const existingWidget = document.querySelector(`[data-widget-type="${type}"]`);
    if (existingWidget) {
      existingWidget.classList.remove('hidden');
    }
  },

  confirmRemoveWidget(widgetId) {
    this.showConfirm(
      'Remove Widget',
      'Are you sure you want to remove this widget? You can add it back later.',
      () => this.removeWidget(widgetId)
    );
  },

  async removeWidget(widgetId) {
    const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
    if (!widget) return;

    widget.classList.add('hidden');
    
    this.widgetSettings[widgetId] = {
      ...this.widgetSettings[widgetId],
      visible: false
    };

    await Storage.set('widgetSettings', this.widgetSettings);
  },

  toggleGroupSelection(widgetId, selected) {
    const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
    
    if (selected) {
      this.selectedForGroup.push(widgetId);
      widget.classList.add('selected-for-group');
    } else {
      this.selectedForGroup = this.selectedForGroup.filter(id => id !== widgetId);
      widget.classList.remove('selected-for-group');
    }

    // Update group button state
    const groupBtn = document.getElementById('group-widgets-btn');
    if (groupBtn) {
      groupBtn.disabled = this.selectedForGroup.length < 2;
    }
  },

  openGroupModal() {
    if (this.selectedForGroup.length < 2) return;
    this.groupModal.classList.remove('hidden');
  },

  closeGroupModal() {
    this.groupModal.classList.add('hidden');
  },

  async createGroup() {
    const name = document.getElementById('group-name').value.trim();
    const layout = document.querySelector('input[name="group-layout"]:checked').value;

    const group = {
      id: `group-${Date.now()}`,
      name: name || 'Widget Group',
      layout,
      widgets: [...this.selectedForGroup]
    };

    this.widgetGroups.push(group);
    await Storage.set('widgetGroups', this.widgetGroups);

    // Clear selection
    this.selectedForGroup.forEach(widgetId => {
      const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
      if (widget) {
        widget.classList.remove('selected-for-group');
        const checkbox = widget.querySelector('.widget-group-checkbox');
        if (checkbox) checkbox.checked = false;
      }
    });
    this.selectedForGroup = [];

    this.closeGroupModal();
    // In a full implementation, we would restructure the DOM here
  },

  showConfirm(title, message, onConfirm) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    
    const okBtn = document.getElementById('confirm-ok');
    const newOkBtn = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);
    newOkBtn.addEventListener('click', () => {
      onConfirm();
      this.closeConfirm();
    });

    this.confirmDialog.classList.remove('hidden');
  },

  closeConfirm() {
    this.confirmDialog.classList.add('hidden');
  },

  async resetLayout() {
    this.widgetSettings = { ...DEFAULT_WIDGET_SETTINGS };
    this.widgetPositions = { ...DEFAULT_WIDGET_POSITIONS };
    this.widgetGroups = [];

    await Storage.set('widgetSettings', this.widgetSettings);
    await Storage.set('widgetPositions', this.widgetPositions);
    await Storage.set('widgetGroups', this.widgetGroups);

    // Reset all widgets to visible and default styles
    document.querySelectorAll('.widget').forEach(widget => {
      widget.classList.remove('hidden', 'no-background', 'size-small', 'size-large', 'positioned');
      widget.style.opacity = '';
      widget.style.left = '';
      widget.style.top = '';
    });

    this.applyWidgetSettings();
  }
};
