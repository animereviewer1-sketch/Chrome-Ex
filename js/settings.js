/**
 * Settings Page Module
 */

const Settings = {
  currentSection: 'general',
  
  sections: {
    general: 'Allgemein',
    themes: 'Themes & Design',
    widgets: 'Widgets',
    shortcuts: 'Schnellzugriffe',
    background: 'Hintergrund',
    advanced: 'Erweitert'
  },

  /**
   * Initialize settings page
   */
  async init() {
    // Initialize storage
    await Storage.init();
    
    // Initialize theme system
    await Themes.init();
    
    // Initialize toast
    Toast.init();
    
    // Render navigation
    this.renderNavigation();
    
    // Render all sections
    this.renderSections();
    
    // Check URL hash for section
    const hash = window.location.hash.slice(1);
    if (hash && this.sections[hash]) {
      this.showSection(hash);
    } else {
      this.showSection('general');
    }
    
    console.log('Settings initialized');
  },

  /**
   * Render navigation tabs
   */
  renderNavigation() {
    const nav = document.querySelector('.settings-nav');
    
    nav.innerHTML = Object.entries(this.sections).map(([id, name]) => `
      <button class="nav-item ${id === this.currentSection ? 'active' : ''}" data-section="${id}">
        ${name}
      </button>
    `).join('');
    
    nav.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showSection(btn.dataset.section);
      });
    });
  },

  /**
   * Show specific section
   */
  showSection(sectionId) {
    this.currentSection = sectionId;
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === sectionId);
    });
    
    // Update sections
    document.querySelectorAll('.settings-section').forEach(section => {
      section.classList.toggle('active', section.dataset.section === sectionId);
    });
    
    // Update URL hash
    window.location.hash = sectionId;
  },

  /**
   * Render all sections
   */
  renderSections() {
    const container = document.querySelector('.settings-content');
    
    container.innerHTML = `
      ${this.renderGeneralSection()}
      ${this.renderThemesSection()}
      ${this.renderWidgetsSection()}
      ${this.renderShortcutsSection()}
      ${this.renderBackgroundSection()}
      ${this.renderAdvancedSection()}
    `;
    
    this.attachEventListeners();
  },

  /**
   * Render General section
   */
  renderGeneralSection() {
    return `
      <div class="settings-section" data-section="general">
        <h2 class="section-title">Allgemeine Einstellungen</h2>
        
        <div class="form-group">
          <label class="form-label">Edit-Modus</label>
          <label class="form-checkbox">
            <input type="checkbox" id="edit-mode-toggle">
            Edit-Modus aktivieren
          </label>
          <p class="form-hint">Ermöglicht das Verschieben und Bearbeiten von Widgets</p>
        </div>
        
        <div class="form-group">
          <label class="form-label">Raster anzeigen</label>
          <label class="form-checkbox">
            <input type="checkbox" id="grid-visible-toggle">
            Raster im Edit-Modus anzeigen
          </label>
        </div>
        
        <div class="form-group">
          <label class="form-label">Rastergröße</label>
          <select class="form-select" id="grid-size-select">
            <option value="8">8x8</option>
            <option value="12">12x12 (Standard)</option>
            <option value="16">16x16</option>
            <option value="24">24x24</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Animationen</label>
          <label class="form-checkbox">
            <input type="checkbox" id="animations-toggle" checked>
            Animationen aktivieren
          </label>
          <p class="form-hint">Deaktivieren für bessere Performance</p>
        </div>
      </div>
    `;
  },

  /**
   * Render Themes section
   */
  renderThemesSection() {
    const themes = Themes.getAllThemes();
    const fonts = Themes.getAllFonts();
    
    return `
      <div class="settings-section" data-section="themes">
        <h2 class="section-title">Themes & Design</h2>
        
        <div class="form-group">
          <label class="form-label">Farbschema</label>
          <div class="theme-grid">
            ${themes.map(theme => `
              <div class="theme-card" data-theme="${theme.id}">
                <div class="theme-preview ${theme.id}"></div>
                <div class="theme-name">${theme.name}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Schriftart</label>
          <div class="font-grid">
            ${fonts.map(font => `
              <div class="font-card" data-font="${font.id}">
                <div class="font-preview-text ${font.class}">Aa Bb Cc</div>
                <div class="font-name">${font.name}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Blur-Intensität</label>
          <div class="slider-group">
            <input type="range" class="form-range" id="blur-slider" min="0" max="100" value="50">
            <span class="slider-value" id="blur-value">50%</span>
          </div>
          <p class="form-hint">Beeinflusst den Glasmorphism-Effekt aller Widgets</p>
        </div>
      </div>
    `;
  },

  /**
   * Render Widgets section
   */
  renderWidgetsSection() {
    return `
      <div class="settings-section" data-section="widgets">
        <h2 class="section-title">Widgets</h2>
        
        <div class="form-group">
          <label class="form-label">Verfügbare Widgets</label>
          <div class="widget-list" id="available-widgets">
            <div class="widget-list-item">
              <span class="widget-icon">⏰</span>
              <span class="widget-name">Uhr</span>
              <div class="widget-actions">
                <button class="btn btn-secondary btn-sm" data-add-widget="clock">Hinzufügen</button>
              </div>
            </div>
            <div class="widget-list-item">
              <span class="widget-icon">🌤️</span>
              <span class="widget-name">Wetter</span>
              <div class="widget-actions">
                <button class="btn btn-secondary btn-sm" data-add-widget="weather">Hinzufügen</button>
              </div>
            </div>
            <div class="widget-list-item">
              <span class="widget-icon">🔍</span>
              <span class="widget-name">Suche</span>
              <div class="widget-actions">
                <button class="btn btn-secondary btn-sm" data-add-widget="search">Hinzufügen</button>
              </div>
            </div>
            <div class="widget-list-item">
              <span class="widget-icon">🔗</span>
              <span class="widget-name">Schnellzugriffe</span>
              <div class="widget-actions">
                <button class="btn btn-secondary btn-sm" data-add-widget="shortcuts">Hinzufügen</button>
              </div>
            </div>
            <div class="widget-list-item">
              <span class="widget-icon">💭</span>
              <span class="widget-name">Zitat</span>
              <div class="widget-actions">
                <button class="btn btn-secondary btn-sm" data-add-widget="quote">Hinzufügen</button>
              </div>
            </div>
            <div class="widget-list-item">
              <span class="widget-icon">✅</span>
              <span class="widget-name">Aufgaben</span>
              <div class="widget-actions">
                <button class="btn btn-secondary btn-sm" data-add-widget="todo">Hinzufügen</button>
              </div>
            </div>
            <div class="widget-list-item">
              <span class="widget-icon">📝</span>
              <span class="widget-name">Notizen</span>
              <div class="widget-actions">
                <button class="btn btn-secondary btn-sm" data-add-widget="notes">Hinzufügen</button>
              </div>
            </div>
            <div class="widget-list-item">
              <span class="widget-icon">⏲️</span>
              <span class="widget-name">Countdown</span>
              <div class="widget-actions">
                <button class="btn btn-secondary btn-sm" data-add-widget="countdown">Hinzufügen</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Wetter-Einstellungen</label>
          <input type="text" class="form-input" id="weather-location" placeholder="Stadt eingeben (z.B. Munich Haidhausen)">
          <input type="text" class="form-input" id="weather-api-key" placeholder="WeatherAPI.com API Key (optional)" style="margin-top: 8px;">
          <p class="form-hint">Standard: München Haidhausen. API Key für Live-Daten: <a href="https://www.weatherapi.com" target="_blank">weatherapi.com</a></p>
        </div>
      </div>
    `;
  },

  /**
   * Render Shortcuts section
   */
  renderShortcutsSection() {
    return `
      <div class="settings-section" data-section="shortcuts">
        <h2 class="section-title">Schnellzugriffe</h2>
        
        <div class="form-group">
          <button class="btn btn-primary" id="edit-shortcuts-btn">Schnellzugriffe bearbeiten</button>
        </div>
        
        <div class="shortcuts-editor" id="shortcuts-editor" style="display: none;">
          <!-- Populated dynamically -->
        </div>
      </div>
    `;
  },

  /**
   * Render Background section
   */
  renderBackgroundSection() {
    return `
      <div class="settings-section" data-section="background">
        <h2 class="section-title">Hintergrund</h2>
        
        <div class="form-group">
          <label class="form-label">Hintergrund-Typ</label>
          <select class="form-select" id="background-type">
            <option value="gradient">Animierter Gradient</option>
            <option value="solid">Einfarbig</option>
            <option value="custom">Eigenes Bild</option>
          </select>
        </div>
        
        <div class="form-group" id="custom-bg-section" style="display: none;">
          <label class="form-label">Eigene Hintergründe</label>
          <div class="background-gallery" id="background-gallery">
            <div class="background-upload" id="upload-bg">
              <span class="background-upload-icon">📤</span>
              <span class="background-upload-text">Bild hochladen</span>
            </div>
          </div>
          <input type="file" id="bg-file-input" accept="image/*" style="display: none;">
          <p class="form-hint">Unterstützte Formate: JPG, PNG, GIF, WebP. Max. 5MB</p>
        </div>
      </div>
    `;
  },

  /**
   * Render Advanced section
   */
  renderAdvancedSection() {
    return `
      <div class="settings-section" data-section="advanced">
        <h2 class="section-title">Erweiterte Einstellungen</h2>
        
        <div class="form-group">
          <label class="form-label">Daten exportieren / importieren</label>
          <div class="export-import-buttons">
            <button class="btn btn-secondary" id="export-btn">📤 Einstellungen exportieren</button>
            <button class="btn btn-secondary" id="import-btn">📥 Einstellungen importieren</button>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Daten zurücksetzen</label>
          <button class="btn btn-danger" id="reset-btn">🗑️ Alle Daten löschen</button>
          <p class="form-hint">Dies löscht alle Einstellungen und kann nicht rückgängig gemacht werden</p>
        </div>
        
        <div class="form-group">
          <label class="form-label">Tastenkombinationen</label>
          <div class="shortcuts-list">
            <div class="shortcut-info"><kbd>Strg</kbd> + <kbd>K</kbd> - Quick Actions öffnen</div>
            <div class="shortcut-info"><kbd>Strg</kbd> + <kbd>1-9</kbd> - Seite wechseln</div>
            <div class="shortcut-info"><kbd>Esc</kbd> - Modal schließen</div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Attach all event listeners
   */
  async attachEventListeners() {
    // Load current values
    const settings = await Storage.getAll();
    
    // Edit mode toggle
    const editModeToggle = document.getElementById('edit-mode-toggle');
    editModeToggle.checked = settings.editMode || false;
    editModeToggle.addEventListener('change', async (e) => {
      await Storage.set('editMode', e.target.checked);
      Toast.show('Edit-Modus ' + (e.target.checked ? 'aktiviert' : 'deaktiviert'), 'success');
    });
    
    // Grid visible toggle
    const gridVisibleToggle = document.getElementById('grid-visible-toggle');
    gridVisibleToggle.checked = settings.gridVisible || false;
    gridVisibleToggle.addEventListener('change', async (e) => {
      await Storage.set('gridVisible', e.target.checked);
    });
    
    // Grid size select
    const gridSizeSelect = document.getElementById('grid-size-select');
    gridSizeSelect.value = settings.gridSize || 12;
    gridSizeSelect.addEventListener('change', async (e) => {
      await Storage.set('gridSize', parseInt(e.target.value));
    });
    
    // Animations toggle
    const animationsToggle = document.getElementById('animations-toggle');
    animationsToggle.checked = settings.animationsEnabled !== false;
    animationsToggle.addEventListener('change', async (e) => {
      await Storage.set('animationsEnabled', e.target.checked);
    });
    
    // Theme cards
    document.querySelectorAll('.theme-card').forEach(card => {
      if (card.dataset.theme === (settings.theme || 'minimal')) {
        card.classList.add('active');
      }
      card.addEventListener('click', async () => {
        document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        await Themes.setTheme(card.dataset.theme);
        Toast.show('Theme geändert', 'success');
      });
    });
    
    // Font cards
    document.querySelectorAll('.font-card').forEach(card => {
      if (card.dataset.font === (settings.font || 'roboto')) {
        card.classList.add('active');
      }
      card.addEventListener('click', async () => {
        document.querySelectorAll('.font-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        await Themes.setFont(card.dataset.font);
        Toast.show('Schriftart geändert', 'success');
      });
    });
    
    // Blur slider
    const blurSlider = document.getElementById('blur-slider');
    const blurValue = document.getElementById('blur-value');
    blurSlider.value = settings.blurIntensity || 50;
    blurValue.textContent = blurSlider.value + '%';
    blurSlider.addEventListener('input', async (e) => {
      blurValue.textContent = e.target.value + '%';
      await Themes.setBlur(parseInt(e.target.value));
    });
    
    // Weather settings
    const weatherLocation = document.getElementById('weather-location');
    const weatherApiKey = document.getElementById('weather-api-key');
    weatherLocation.value = settings.weatherLocation || 'Munich Haidhausen';
    weatherApiKey.value = settings.weatherApiKey || '';
    
    weatherLocation.addEventListener('change', async (e) => {
      await Storage.set('weatherLocation', e.target.value);
      Toast.show('Wetter-Standort aktualisiert', 'success');
    });
    
    weatherApiKey.addEventListener('change', async (e) => {
      await Storage.set('weatherApiKey', e.target.value);
      Toast.show('API Key gespeichert', 'success');
    });
    
    // Add widget buttons
    document.querySelectorAll('[data-add-widget]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await this.addWidget(btn.dataset.addWidget);
      });
    });
    
    // Edit shortcuts button
    document.getElementById('edit-shortcuts-btn').addEventListener('click', () => {
      this.showShortcutsModal();
    });
    
    // Background type
    const bgType = document.getElementById('background-type');
    bgType.value = settings.backgroundType || 'gradient';
    this.toggleBgSection(bgType.value);
    bgType.addEventListener('change', async (e) => {
      await Storage.set('backgroundType', e.target.value);
      this.toggleBgSection(e.target.value);
    });
    
    // Background upload
    document.getElementById('upload-bg').addEventListener('click', () => {
      document.getElementById('bg-file-input').click();
    });
    
    document.getElementById('bg-file-input').addEventListener('change', (e) => {
      this.handleBackgroundUpload(e);
    });
    
    // Load custom backgrounds
    this.loadCustomBackgrounds();
    
    // Export button
    document.getElementById('export-btn').addEventListener('click', async () => {
      const json = await Storage.exportSettings();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newtab-settings-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      Toast.show('Einstellungen exportiert', 'success');
    });
    
    // Import button
    document.getElementById('import-btn').addEventListener('click', () => {
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
    });
    
    // Reset button
    document.getElementById('reset-btn').addEventListener('click', async () => {
      if (confirm('Wirklich alle Daten löschen? Dies kann nicht rückgängig gemacht werden!')) {
        await Storage.clear();
        Toast.show('Alle Daten gelöscht', 'success');
        window.location.reload();
      }
    });
  },

  /**
   * Toggle background section visibility
   */
  toggleBgSection(type) {
    const section = document.getElementById('custom-bg-section');
    section.style.display = type === 'custom' ? 'block' : 'none';
  },

  /**
   * Load custom backgrounds
   */
  async loadCustomBackgrounds() {
    const customBgs = await Storage.get('customBackgrounds') || [];
    const gallery = document.getElementById('background-gallery');
    
    // Remove existing items except upload button
    gallery.querySelectorAll('.background-item').forEach(item => item.remove());
    
    customBgs.forEach((bg, index) => {
      const item = document.createElement('div');
      item.className = 'background-item' + (bg.active ? ' active' : '');
      item.innerHTML = `
        <img src="${bg.data}" alt="Background ${index + 1}">
        <button class="delete-bg" data-index="${index}">×</button>
      `;
      
      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('delete-bg')) {
          this.selectBackground(index);
        }
      });
      
      item.querySelector('.delete-bg').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteBackground(index);
      });
      
      gallery.insertBefore(item, gallery.querySelector('.background-upload'));
    });
  },

  /**
   * Handle background upload
   */
  async handleBackgroundUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      Toast.show('Datei zu groß (max. 5MB)', 'error');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      Toast.show('Nur Bilddateien erlaubt', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const customBgs = await Storage.get('customBackgrounds') || [];
      customBgs.push({
        data: event.target.result,
        active: false,
        name: file.name,
        uploadedAt: new Date().toISOString()
      });
      await Storage.set('customBackgrounds', customBgs);
      this.loadCustomBackgrounds();
      Toast.show('Hintergrund hochgeladen', 'success');
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
  },

  /**
   * Select background
   */
  async selectBackground(index) {
    const customBgs = await Storage.get('customBackgrounds') || [];
    customBgs.forEach((bg, i) => {
      bg.active = i === index;
    });
    await Storage.set('customBackgrounds', customBgs);
    this.loadCustomBackgrounds();
    Toast.show('Hintergrund ausgewählt', 'success');
  },

  /**
   * Delete background
   */
  async deleteBackground(index) {
    if (!confirm('Hintergrund löschen?')) return;
    
    const customBgs = await Storage.get('customBackgrounds') || [];
    customBgs.splice(index, 1);
    await Storage.set('customBackgrounds', customBgs);
    this.loadCustomBackgrounds();
    Toast.show('Hintergrund gelöscht', 'success');
  },

  /**
   * Add widget to current page
   */
  async addWidget(type) {
    const pages = await Storage.get('pages') || { default: { name: 'Home', widgets: [] } };
    const currentPage = await Storage.get('currentPage') || 'default';
    
    if (!pages[currentPage]) {
      pages[currentPage] = { name: 'Home', widgets: [] };
    }
    
    const newWidget = {
      id: type + '_' + Date.now(),
      type: type,
      x: 50,
      y: 50,
      size: 'medium',
      visible: true
    };
    
    pages[currentPage].widgets.push(newWidget);
    await Storage.set('pages', pages);
    
    Toast.show('Widget hinzugefügt', 'success');
  },

  /**
   * Show shortcuts modal
   */
  async showShortcutsModal() {
    const shortcuts = await Storage.get('shortcuts') || [];
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay visible';
    modal.innerHTML = `
      <div class="modal" style="max-width: 600px;">
        <div class="modal-header">
          <span class="modal-title">Schnellzugriffe bearbeiten</span>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="shortcuts-editor">
            ${shortcuts.map((shortcut, index) => `
              <div class="shortcut-edit-item" data-index="${index}">
                <span class="shortcut-drag-handle">⋮⋮</span>
                <div class="shortcut-edit-icon" data-id="${shortcut.id}">
                  ${shortcut.iconUrl ? `<img src="${shortcut.iconUrl}" alt="">` : shortcut.icon}
                </div>
                <div class="shortcut-edit-fields">
                  <input type="text" class="form-input shortcut-name" value="${this.escapeHtml(shortcut.name)}" placeholder="Name">
                  <input type="text" class="form-input shortcut-url" value="${this.escapeHtml(shortcut.url)}" placeholder="URL">
                </div>
                <button class="btn btn-danger btn-sm delete-shortcut">×</button>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-secondary add-shortcut-btn" style="margin-top: 16px;">+ Neuer Schnellzugriff</button>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary cancel-btn">Abbrechen</button>
          <button class="btn btn-primary save-shortcuts-btn">Speichern</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close handlers - only X button, Save, Cancel, ESC
    const closeModal = () => modal.remove();
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
    
    // ESC to close
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);

    // Add shortcut button
    modal.querySelector('.add-shortcut-btn').addEventListener('click', () => {
      const editor = modal.querySelector('.shortcuts-editor');
      const newIndex = editor.children.length;
      const newItem = document.createElement('div');
      newItem.className = 'shortcut-edit-item';
      newItem.dataset.index = newIndex;
      newItem.innerHTML = `
        <span class="shortcut-drag-handle">⋮⋮</span>
        <div class="shortcut-edit-icon" data-id="new_${Date.now()}">🔗</div>
        <div class="shortcut-edit-fields">
          <input type="text" class="form-input shortcut-name" value="" placeholder="Name">
          <input type="text" class="form-input shortcut-url" value="" placeholder="URL">
        </div>
        <button class="btn btn-danger btn-sm delete-shortcut">×</button>
      `;
      
      newItem.querySelector('.delete-shortcut').addEventListener('click', () => {
        newItem.remove();
      });
      
      editor.appendChild(newItem);
    });

    // Delete shortcut buttons
    modal.querySelectorAll('.delete-shortcut').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.shortcut-edit-item').remove();
      });
    });

    // Save shortcuts
    modal.querySelector('.save-shortcuts-btn').addEventListener('click', async () => {
      const items = modal.querySelectorAll('.shortcut-edit-item');
      const newShortcuts = [];
      
      items.forEach(item => {
        const name = item.querySelector('.shortcut-name').value.trim();
        const url = item.querySelector('.shortcut-url').value.trim();
        const icon = item.querySelector('.shortcut-edit-icon');
        
        if (name && url) {
          newShortcuts.push({
            id: parseInt(icon.dataset.id) || Date.now(),
            name: name,
            url: url.startsWith('http') ? url : 'https://' + url,
            icon: icon.textContent.trim() || '🔗',
            iconUrl: icon.querySelector('img')?.src || null
          });
        }
      });
      
      await Storage.set('shortcuts', newShortcuts);
      Toast.show('Schnellzugriffe gespeichert', 'success');
      closeModal();
    });
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Settings.init();
});
