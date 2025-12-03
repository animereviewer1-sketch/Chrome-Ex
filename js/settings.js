/**
 * Settings management functionality
 */
const Settings = {
  modalElement: null,
  shortcutModalElement: null,
  isOpen: false,

  init() {
    this.modalElement = document.getElementById('settings-modal');
    this.shortcutModalElement = document.getElementById('shortcut-modal');
    this.bindEvents();
    this.loadSettings();
  },

  bindEvents() {
    // Open settings
    document.getElementById('settings-btn').addEventListener('click', () => {
      this.open();
    });

    // Close settings
    document.getElementById('close-settings').addEventListener('click', () => {
      this.close();
    });

    // Close on overlay click
    this.modalElement.querySelector('.modal-overlay').addEventListener('click', () => {
      this.close();
    });

    // Save settings
    document.getElementById('save-settings-btn').addEventListener('click', () => {
      this.save();
    });

    // Background upload
    document.getElementById('bg-upload').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          await Background.uploadBackground(file);
        } catch (error) {
          console.error('Upload error:', error);
          alert('Error uploading background');
        }
      }
    });

    // Reset background
    document.getElementById('reset-bg-btn').addEventListener('click', () => {
      Background.resetToDefault();
    });

    // Detect location
    document.getElementById('detect-location-btn').addEventListener('click', () => {
      Weather.detectLocation();
      document.getElementById('weather-location-input').value = 'Detecting...';
      setTimeout(async () => {
        const location = await Storage.get('weatherLocation', '');
        document.getElementById('weather-location-input').value = location;
      }, 2000);
    });

    // Widget visibility toggles
    document.getElementById('show-weather').addEventListener('change', async (e) => {
      await Storage.set('showWeather', e.target.checked);
      if (e.target.checked) {
        Weather.show();
      } else {
        Weather.hide();
      }
    });

    document.getElementById('show-todo').addEventListener('change', async (e) => {
      await Storage.set('showTodo', e.target.checked);
      if (e.target.checked) {
        Todo.show();
      } else {
        Todo.hide();
      }
    });

    document.getElementById('show-quotes').addEventListener('change', async (e) => {
      await Storage.set('showQuotes', e.target.checked);
      const quoteContainer = document.querySelector('.quote-container');
      if (e.target.checked) {
        quoteContainer.classList.remove('hidden');
      } else {
        quoteContainer.classList.add('hidden');
      }
    });

    // Add shortcut button
    document.getElementById('add-shortcut-btn').addEventListener('click', () => {
      this.openShortcutModal();
    });

    // Shortcut modal events
    document.getElementById('close-shortcut-modal').addEventListener('click', () => {
      this.closeShortcutModal();
    });

    this.shortcutModalElement.querySelector('.modal-overlay').addEventListener('click', () => {
      this.closeShortcutModal();
    });

    document.getElementById('cancel-shortcut-btn').addEventListener('click', () => {
      this.closeShortcutModal();
    });

    document.getElementById('save-shortcut-btn').addEventListener('click', () => {
      this.saveShortcut();
    });
  },

  async loadSettings() {
    // Load all settings
    const timeFormat = await Storage.get('timeFormat', '24');
    const language = await Storage.get('language', 'de');
    const tempUnit = await Storage.get('tempUnit', 'c');
    const showWeather = await Storage.get('showWeather', true);
    const showTodo = await Storage.get('showTodo', true);
    const showQuotes = await Storage.get('showQuotes', true);
    const weatherApiKey = await Storage.get('weatherApiKey', '');
    const weatherLocation = await Storage.get('weatherLocation', '');
    const widgetLayout = await Storage.get('widgetLayout', 'horizontal');

    // Set form values
    document.getElementById('time-format').value = timeFormat;
    document.getElementById('language-select').value = language;
    document.getElementById('temp-unit').value = tempUnit;
    document.getElementById('show-weather').checked = showWeather;
    document.getElementById('show-todo').checked = showTodo;
    document.getElementById('show-quotes').checked = showQuotes;
    document.getElementById('weather-api-key').value = weatherApiKey;
    document.getElementById('weather-location-input').value = weatherLocation;
    document.getElementById('widget-layout').value = widgetLayout;

    // Apply widget layout
    this.applyLayout(widgetLayout);

    // Apply widget visibility
    if (!showWeather) Weather.hide();
    if (!showTodo) Todo.hide();
    if (!showQuotes) {
      document.querySelector('.quote-container').classList.add('hidden');
    }
  },

  open() {
    this.modalElement.classList.remove('hidden');
    this.isOpen = true;
    this.renderShortcutsList();
    Background.renderSavedBackgrounds();
  },

  close() {
    this.modalElement.classList.add('hidden');
    this.isOpen = false;
  },

  applyLayout(layout) {
    document.body.classList.remove('layout-horizontal', 'layout-vertical');
    document.body.classList.add(`layout-${layout}`);
  },

  async save() {
    // Get form values
    const timeFormat = document.getElementById('time-format').value;
    const language = document.getElementById('language-select').value;
    const tempUnit = document.getElementById('temp-unit').value;
    const weatherApiKey = document.getElementById('weather-api-key').value;
    const weatherLocation = document.getElementById('weather-location-input').value;
    const widgetLayout = document.getElementById('widget-layout').value;

    // Save to storage
    await Storage.set('timeFormat', timeFormat);
    await Storage.set('language', language);
    await Storage.set('tempUnit', tempUnit);
    await Storage.set('weatherApiKey', weatherApiKey);
    await Storage.set('weatherLocation', weatherLocation);
    await Storage.set('widgetLayout', widgetLayout);

    // Apply settings
    Clock.setTimeFormat(timeFormat);
    Clock.setLanguage(language);
    Quotes.setLanguage(language);
    Weather.setApiKey(weatherApiKey);
    Weather.setLocation(weatherLocation);
    Weather.setTempUnit(tempUnit);
    this.applyLayout(widgetLayout);

    // Close modal
    this.close();
  },

  renderShortcutsList() {
    const container = document.getElementById('shortcuts-list');
    container.innerHTML = '';

    Shortcuts.shortcuts.forEach((shortcut, index) => {
      const item = document.createElement('div');
      item.className = 'shortcut-list-item';
      
      item.innerHTML = `
        <span style="font-size: 20px;">${shortcut.icon || '🔗'}</span>
        <div class="shortcut-info">
          <div class="name">${shortcut.name}</div>
          <div class="url">${shortcut.url}</div>
        </div>
        <button class="edit" title="Edit">✏️</button>
        <button class="delete" title="Delete">🗑️</button>
      `;

      item.querySelector('.edit').addEventListener('click', () => {
        this.openShortcutModal(index);
      });

      item.querySelector('.delete').addEventListener('click', async () => {
        await Shortcuts.deleteShortcut(index);
        this.renderShortcutsList();
      });

      container.appendChild(item);
    });
  },

  openShortcutModal(editIndex = null) {
    const titleElement = document.getElementById('shortcut-modal-title');
    const indexInput = document.getElementById('shortcut-edit-index');
    const nameInput = document.getElementById('shortcut-name');
    const urlInput = document.getElementById('shortcut-url');
    const iconInput = document.getElementById('shortcut-icon');

    if (editIndex !== null) {
      // Edit mode
      titleElement.textContent = 'Edit Shortcut';
      const shortcut = Shortcuts.shortcuts[editIndex];
      indexInput.value = editIndex;
      nameInput.value = shortcut.name;
      urlInput.value = shortcut.url;
      iconInput.value = shortcut.icon || '';
    } else {
      // Add mode
      titleElement.textContent = 'Add Shortcut';
      indexInput.value = '';
      nameInput.value = '';
      urlInput.value = '';
      iconInput.value = '';
    }

    this.shortcutModalElement.classList.remove('hidden');
  },

  closeShortcutModal() {
    this.shortcutModalElement.classList.add('hidden');
  },

  async saveShortcut() {
    const indexInput = document.getElementById('shortcut-edit-index');
    const nameInput = document.getElementById('shortcut-name');
    const urlInput = document.getElementById('shortcut-url');
    const iconInput = document.getElementById('shortcut-icon');

    const name = nameInput.value.trim();
    let url = urlInput.value.trim();
    const icon = iconInput.value.trim();

    if (!name || !url) {
      alert('Please enter both name and URL');
      return;
    }

    // Add https:// if not present
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const editIndex = indexInput.value;
    if (editIndex !== '') {
      await Shortcuts.updateShortcut(parseInt(editIndex), name, url, icon);
    } else {
      await Shortcuts.addShortcut(name, url, icon);
    }

    this.closeShortcutModal();
    this.renderShortcutsList();
  }
};
