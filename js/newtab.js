/**
 * Chrome-Ex - New Tab JavaScript
 * Vollständig überarbeitet mit allen 19 Features
 * 
 * Features:
 * 1. Icons automatisch von URL laden
 * 2. Edit-Modus über Einstellungen
 * 3. Schnellzugriff Grid-Layout
 * 4. Modal schließt nur bei X oder Speichern
 * 5. Widget-Titel entfernen
 * 6. Custom Hintergrund funktional
 * 7. Tabs & Lesezeichen als Shortcut
 * 8. 8+ Themes
 * 9. Animierte Hintergründe
 * 10. Google Fonts
 * 11. Widget-Effekte kombinierbar
 * 12. Notizen schönes Design
 * 13. Widget-Opazität pro Widget
 * 14. Auto-Hide Widgets
 * 15. Widget-Bereiche fixiert
 * 16. Multi-Page Support
 * 17. Quick Actions (Strg+K)
 * 18. Passwort-Generator Widget
 * 19. Offline-Modus (service-worker.js)
 */

// ============ Konstanten ============
const STORAGE_KEY = 'chromeExSettings';

// Minimale Widget-Dimensionen für Resize-Funktion
const MIN_WIDGET_WIDTH = 200;
const MIN_WIDGET_HEIGHT = 150;

// Throttle-Konstante für Drag-Events (Fix 1)
const DRAG_THROTTLE_MS = 16; // ~60fps

const DEFAULT_SETTINGS = {
  editMode: false,
  currentPage: '1',
  theme: 'dark-mode',
  font: 'Inter',
  backgroundType: 'theme',
  customBackground: null,
  animatedBgType: 'particles',
  pageOpacity: 100, // Neue Feature 5: Seiten-Transparenz
  // Fix 2: Grid-Einstellungen
  gridSize: 20,
  gridColor: '#ff00ff',
  gridVisible: true,
  // Fix 11: Wetter-Einstellungen
  weatherApiKey: '',
  weatherCity: 'Munich',
  pages: {
    '1': {
      name: 'Start',
      widgets: [
        { id: 'clock-1', type: 'clock', position: { x: 0, y: 0 }, settings: {} },
        { 
          id: 'shortcuts-1', 
          type: 'shortcuts', 
          position: { x: 0, y: 0 }, 
          settings: {},
          data: {
            shortcuts: [
              { name: 'Google', url: 'https://google.com' },
              { name: 'YouTube', url: 'https://youtube.com' },
              { name: 'GitHub', url: 'https://github.com' }
            ]
          }
        }
      ]
    }
  }
};

const THEMES = [
  { id: 'dark-mode', name: 'Dark Mode', preview: 'linear-gradient(135deg, #0a0a1a, #1a1a3a)' },
  { id: 'cyberpunk', name: 'Cyberpunk', preview: 'linear-gradient(135deg, #1a0033, #ff00ff)' },
  { id: 'pastel', name: 'Pastel', preview: 'linear-gradient(135deg, #ffb3d9, #b3d9ff)' },
  { id: 'minimal', name: 'Minimal', preview: 'linear-gradient(135deg, #ffffff, #f5f5f5)' },
  { id: 'ocean', name: 'Ocean', preview: 'linear-gradient(135deg, #001f3f, #00a8cc)' },
  { id: 'forest', name: 'Forest', preview: 'linear-gradient(135deg, #0d1f0d, #228b22)' },
  { id: 'sunset', name: 'Sunset', preview: 'linear-gradient(135deg, #2d1b2d, #ff6b35)' },
  { id: 'neon', name: 'Neon', preview: 'linear-gradient(135deg, #0a0a0a, #39ff14)' }
];

const FONTS = [
  'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Open Sans',
  'Lato', 'Raleway', 'Ubuntu', 'Playfair Display', 'Fira Code'
];

const WIDGET_TYPES = [
  { id: 'clock', name: 'Uhr', icon: '🕐' },
  { id: 'shortcuts', name: 'Schnellzugriff', icon: '🔗' },
  { id: 'notes', name: 'Notizen', icon: '📝' },
  { id: 'weather', name: 'Wetter', icon: '☀️' },
  { id: 'password', name: 'Passwort Generator', icon: '🔐' }
];

const QUICK_ACTIONS = [
  { id: 'add-widget', name: 'Widget hinzufügen', icon: '✨' },
  { id: 'add-note', name: 'Notiz erstellen', icon: '📝' },
  { id: 'toggle-edit', name: 'Edit-Modus umschalten', icon: '✏️' },
  { id: 'open-settings', name: 'Einstellungen öffnen', icon: '⚙️' },
  { id: 'change-theme', name: 'Theme wechseln', icon: '🎨' },
  { id: 'new-page', name: 'Neue Seite erstellen', icon: '📄' }
];

// ============ State ============
let settings = { ...DEFAULT_SETTINGS };
let selectedActionIndex = 0;

// ============ Initialisierung ============
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  initTheme();
  initFont();
  initBackground();
  initPageOpacity(); // Neue Feature 5
  initGridSettings(); // Fix 2: Grid-Einstellungen
  initPageTabs();
  renderWidgets();
  initEventListeners();
  initQuickActions();
  updateEditModeUI();
  startClock();
});

// ============ Storage Funktionen ============
async function loadSettings() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      if (result[STORAGE_KEY]) {
        settings = { ...DEFAULT_SETTINGS, ...result[STORAGE_KEY] };
      }
    } else {
      // Fallback für lokale Entwicklung
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    }
  } catch (error) {
    console.error('Fehler beim Laden der Einstellungen:', error);
  }
}

async function saveSettings(newSettings = settings) {
  try {
    settings = { ...settings, ...newSettings };
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ [STORAGE_KEY]: settings });
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  } catch (error) {
    console.error('Fehler beim Speichern der Einstellungen:', error);
  }
}

// ============ Feature #1: Icons automatisch von URL laden ============
function getIconFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return 'icons/default.png';
  }
}

// ============ Feature #2: Edit-Modus ============
function updateEditModeUI() {
  if (settings.editMode) {
    document.body.classList.add('edit-mode');
  } else {
    document.body.classList.remove('edit-mode');
  }
  
  // Update Toggle in Settings
  const toggle = document.getElementById('edit-mode-toggle');
  if (toggle) {
    toggle.checked = settings.editMode;
  }
}

function toggleEditMode() {
  settings.editMode = !settings.editMode;
  saveSettings();
  updateEditModeUI();
}

// ============ Feature #8: Themes ============
function initTheme() {
  document.documentElement.className = settings.theme || 'dark-mode';
  document.body.className = settings.theme || 'dark-mode';
}

function setTheme(themeId) {
  settings.theme = themeId;
  initTheme();
  saveSettings();
  renderThemeGrid();
}

function renderThemeGrid() {
  const grid = document.getElementById('theme-grid');
  if (!grid) return;
  
  grid.innerHTML = THEMES.map(theme => `
    <div class="theme-card ${settings.theme === theme.id ? 'active' : ''}" 
         data-theme="${theme.id}">
      <div class="theme-preview" style="background: ${theme.preview}"></div>
      <div class="theme-name">${theme.name}</div>
    </div>
  `).join('');
  
  // Event Listener
  grid.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => setTheme(card.dataset.theme));
  });
}

// ============ Feature #10: Google Fonts ============
function initFont() {
  document.documentElement.style.setProperty('--font-family', `'${settings.font}', sans-serif`);
  document.body.style.fontFamily = `'${settings.font}', sans-serif`;
}

function setFont(fontName) {
  settings.font = fontName;
  initFont();
  saveSettings();
  renderFontGrid();
}

function renderFontGrid() {
  const grid = document.getElementById('font-grid');
  if (!grid) return;
  
  grid.innerHTML = FONTS.map(font => `
    <div class="font-card ${settings.font === font ? 'active' : ''}" 
         data-font="${font}" style="font-family: '${font}', sans-serif;">
      <div class="font-preview">Aa Bb 123</div>
      <div class="font-name">${font}</div>
    </div>
  `).join('');
  
  grid.querySelectorAll('.font-card').forEach(card => {
    card.addEventListener('click', () => setFont(card.dataset.font));
  });
}

// ============ Feature #6 & #9: Hintergründe (Fix 8-9: Mit Video-Unterstützung) ============
function initBackground() {
  // Erst Video-Element entfernen wenn nicht Video-Modus
  if (settings.backgroundType !== 'video' && settings.backgroundType !== 'video-url') {
    removeVideoBackground();
  }
  
  // Video-Hintergrund (Fix 8-9)
  if ((settings.backgroundType === 'video' || settings.backgroundType === 'video-url') && settings.backgroundData) {
    restoreVideoBackground();
  }
  // URL-basierter Hintergrund (Fix 8-9)
  else if (settings.backgroundType === 'url' && settings.backgroundData) {
    document.documentElement.style.setProperty('--custom-bg-url', `url(${settings.backgroundData})`);
    document.body.classList.add('custom-background');
    document.body.classList.remove('animated-gradient');
    hideParticles();
  }
  // Custom Background (Bild)
  else if (settings.backgroundType === 'custom' && settings.customBackground) {
    document.documentElement.style.setProperty('--custom-bg-url', `url(${settings.customBackground})`);
    document.body.classList.add('custom-background');
    document.body.classList.remove('animated-gradient');
    hideParticles();
  } 
  // Animated Background
  else if (settings.backgroundType === 'animated') {
    document.body.classList.remove('custom-background');
    
    if (settings.animatedBgType === 'particles') {
      initParticles();
      document.body.classList.remove('animated-gradient');
    } else if (settings.animatedBgType === 'gradient') {
      document.body.classList.add('animated-gradient');
      hideParticles();
    } else {
      hideParticles();
      document.body.classList.remove('animated-gradient');
    }
  } 
  // Theme Background (Standard)
  else {
    document.body.classList.remove('custom-background', 'animated-gradient');
    hideParticles();
  }
}

function hideParticles() {
  const particlesEl = document.getElementById('particles-js');
  if (particlesEl) {
    particlesEl.innerHTML = '';
  }
}

function initParticles() {
  if (typeof particlesJS === 'undefined') return;
  
  // Theme-Farbe für Partikel
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#667eea';
  
  particlesJS('particles-js', {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: primaryColor },
      shape: { type: 'circle' },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: primaryColor, opacity: 0.2, width: 1 },
      move: { enable: true, speed: 2, direction: 'none', random: false, straight: false, out_mode: 'out' }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'grab' },
        onclick: { enable: true, mode: 'push' },
        resize: true
      }
    },
    retina_detect: true
  });
}

async function setCustomBackground(imageDataUrl) {
  document.documentElement.style.setProperty('--custom-bg-url', `url(${imageDataUrl})`);
  document.body.classList.add('custom-background');
  document.body.classList.remove('animated-gradient');
  hideParticles();
  removeVideoBackground();
  
  settings.backgroundType = 'custom';
  settings.customBackground = imageDataUrl;
  await saveSettings();
}

// Fix 8-9: Hintergrund-Upload mit Video-Unterstützung
// Hilfsfunktion: Video-Element erstellen oder wiederverwenden
function getOrCreateVideoElement() {
  let videoElement = document.getElementById('bg-video');
  if (!videoElement) {
    videoElement = document.createElement('video');
    videoElement.id = 'bg-video';
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:-1;';
    document.body.prepend(videoElement);
  }
  return videoElement;
}

async function uploadBackground(file) {
  if (file.type.startsWith('video/')) {
    // Video-Hintergrund
    const videoElement = getOrCreateVideoElement();
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      videoElement.src = e.target.result;
      document.body.classList.remove('custom-background', 'animated-gradient');
      hideParticles();
      
      settings.backgroundType = 'video';
      settings.backgroundData = e.target.result;
      await saveSettings();
    };
    reader.readAsDataURL(file);
  } else {
    // Bild/GIF
    const reader = new FileReader();
    reader.onload = async (e) => {
      await setCustomBackground(e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

// Fix 8-9: URL-basierter Hintergrund
async function setBackgroundUrl(url) {
  if (!url) return;
  
  // Prüfen ob Video-URL
  if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
    const videoElement = getOrCreateVideoElement();
    videoElement.src = url;
    document.body.classList.remove('custom-background', 'animated-gradient');
    hideParticles();
    
    settings.backgroundType = 'video-url';
    settings.backgroundData = url;
  } else {
    document.documentElement.style.setProperty('--custom-bg-url', `url(${url})`);
    document.body.classList.add('custom-background');
    document.body.classList.remove('animated-gradient');
    hideParticles();
    removeVideoBackground();
    
    settings.backgroundType = 'url';
    settings.backgroundData = url;
  }
  
  await saveSettings();
}

function removeVideoBackground() {
  const videoElement = document.getElementById('bg-video');
  if (videoElement) {
    videoElement.remove();
  }
}

// Fix 8-9: Hintergrund beim Laden wiederherstellen
function restoreVideoBackground() {
  if ((settings.backgroundType === 'video' || settings.backgroundType === 'video-url') && settings.backgroundData) {
    const videoElement = getOrCreateVideoElement();
    videoElement.src = settings.backgroundData;
    document.body.classList.remove('custom-background', 'animated-gradient');
    hideParticles();
  }
}

// ============ Feature 5: Seiten-Hintergrund-Transparenz ============
function initPageOpacity() {
  const opacity = settings.pageOpacity ?? 100;
  applyPageOpacity(opacity);
}

function applyPageOpacity(opacity) {
  // Entferne alle vorherigen Opacity-Einstellungen
  document.body.removeAttribute('data-page-opacity');
  document.body.classList.remove('custom-page-opacity');
  
  if (opacity < 100) {
    // Berechne den Transparenzwert
    const alpha = opacity / 100;
    document.body.classList.add('custom-page-opacity');
    document.body.style.setProperty('--page-bg-opacity', `rgba(0, 0, 0, ${alpha})`);
  }
}

function setPageOpacity(opacity) {
  settings.pageOpacity = opacity;
  applyPageOpacity(opacity);
  saveSettings();
}

// ============ Fix 2: Grid-Einstellungen ============
function initGridSettings() {
  applyGridSettings();
}

function applyGridSettings() {
  const size = settings.gridSize || 20;
  const color = settings.gridColor || '#ff00ff';
  const visible = settings.gridVisible !== false;
  
  document.documentElement.style.setProperty('--grid-size', `${size}px`);
  document.documentElement.style.setProperty('--grid-color', hexToRgba(color, 0.2));
  
  if (visible) {
    document.body.classList.remove('grid-hidden');
  } else {
    document.body.classList.add('grid-hidden');
  }
}

// Hilfsfunktion: Hex zu RGBA
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function setGridSize(size) {
  settings.gridSize = size;
  applyGridSettings();
  saveSettings();
}

function setGridColor(color) {
  settings.gridColor = color;
  applyGridSettings();
  saveSettings();
}

function setGridVisible(visible) {
  settings.gridVisible = visible;
  applyGridSettings();
  saveSettings();
}

// ============ Fix 1: Widget Drag & Drop ============
function enableWidgetDragging(widget) {
  const dragHandle = widget.querySelector('.drag-handle');
  if (!dragHandle) return;
  
  let lastDragTime = 0;
  
  dragHandle.addEventListener('mousedown', (e) => {
    // Nur im Edit-Modus
    if (!settings.editMode) return;
    e.preventDefault();
    
    const container = document.getElementById('widget-container');
    const containerRect = container.getBoundingClientRect();
    const initialRect = widget.getBoundingClientRect();
    
    // Offset vom Mausklick zum Widget-Ursprung
    const offsetX = e.clientX - initialRect.left;
    const offsetY = e.clientY - initialRect.top;
    
    // Widget für absolute Positionierung vorbereiten
    widget.style.position = 'absolute';
    widget.classList.add('dragging');
    
    function onDrag(moveEvent) {
      // Throttle für Performance
      const now = Date.now();
      if (now - lastDragTime < DRAG_THROTTLE_MS) return;
      lastDragTime = now;
      
      // Aktuelle Widget-Größe für Grenzprüfung
      const currentWidth = widget.offsetWidth;
      const currentHeight = widget.offsetHeight;
      
      let x = moveEvent.clientX - containerRect.left - offsetX;
      let y = moveEvent.clientY - containerRect.top - offsetY;
      
      // Grid Snapping
      const gridSize = settings.gridSize || 20;
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
      
      // Grenzen einhalten (mit aktuellen Dimensionen)
      x = Math.max(0, Math.min(x, containerRect.width - currentWidth));
      y = Math.max(0, Math.min(y, containerRect.height - currentHeight));
      
      widget.style.left = x + 'px';
      widget.style.top = y + 'px';
    }
    
    function stopDrag() {
      document.removeEventListener('mousemove', onDrag);
      widget.classList.remove('dragging');
      // Speichere numerische Werte ohne 'px' Suffix
      const left = parseInt(widget.style.left) || 0;
      const top = parseInt(widget.style.top) || 0;
      saveWidgetPosition(widget.id, left, top);
    }
    
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag, { once: true });
  });
}

function saveWidgetPosition(widgetId, left, top) {
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === widgetId);
  if (!widget) return;
  
  widget.settings = widget.settings || {};
  widget.settings.positionLeft = left;
  widget.settings.positionTop = top;
  saveSettings();
}

// ============ Feature #16: Multi-Page Support ============
function initPageTabs() {
  const tabsContainer = document.getElementById('page-tabs');
  if (!tabsContainer) return;
  
  const pages = settings.pages || DEFAULT_SETTINGS.pages;
  const currentPage = settings.currentPage || '1';
  
  tabsContainer.innerHTML = Object.entries(pages).map(([id, page]) => `
    <button class="page-tab ${id === currentPage ? 'active' : ''}" data-page="${id}">
      ${page.name}
    </button>
  `).join('') + `<button class="add-page edit-mode-only">+</button>`;
  
  // Event Listener
  tabsContainer.querySelectorAll('.page-tab').forEach(tab => {
    tab.addEventListener('click', () => switchToPage(tab.dataset.page));
  });
  
  const addBtn = tabsContainer.querySelector('.add-page');
  if (addBtn) {
    addBtn.addEventListener('click', addNewPage);
  }
  
  updateEditModeUI();
}

function switchToPage(pageId) {
  if (!settings.pages[pageId]) return;
  
  settings.currentPage = pageId;
  saveSettings();
  initPageTabs();
  renderWidgets();
}

function addNewPage() {
  const newId = String(Date.now());
  settings.pages[newId] = {
    name: `Seite ${Object.keys(settings.pages).length + 1}`,
    widgets: []
  };
  settings.currentPage = newId;
  saveSettings();
  initPageTabs();
  renderWidgets();
}

function renamePage(pageId, newName) {
  if (settings.pages[pageId]) {
    settings.pages[pageId].name = newName;
    saveSettings();
    initPageTabs();
  }
}

function deletePage(pageId) {
  if (Object.keys(settings.pages).length <= 1) {
    alert('Mindestens eine Seite muss vorhanden sein.');
    return;
  }
  
  delete settings.pages[pageId];
  settings.currentPage = Object.keys(settings.pages)[0];
  saveSettings();
  initPageTabs();
  renderWidgets();
}

function renderPagesManager() {
  const container = document.getElementById('pages-manager');
  if (!container) return;
  
  container.innerHTML = Object.entries(settings.pages).map(([id, page]) => `
    <div class="page-manager-item" data-page-id="${id}">
      <input type="text" value="${page.name}" data-page-id="${id}">
      <button data-delete-page="${id}" ${Object.keys(settings.pages).length <= 1 ? 'disabled' : ''}>🗑️</button>
    </div>
  `).join('');
  
  // Event Listener für Umbenennung
  container.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', (e) => {
      renamePage(e.target.dataset.pageId, e.target.value);
    });
  });
  
  // Event Listener für Löschen
  container.querySelectorAll('[data-delete-page]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (confirm('Seite wirklich löschen?')) {
        deletePage(e.target.dataset.deletePage);
        renderPagesManager();
      }
    });
  });
}

// ============ Widget Rendering ============
function renderWidgets() {
  const container = document.getElementById('widget-container');
  if (!container) return;
  
  const currentPage = settings.pages[settings.currentPage];
  if (!currentPage) return;
  
  container.innerHTML = '';
  
  currentPage.widgets.forEach(widget => {
    const el = createWidgetElement(widget);
    if (el) {
      container.appendChild(el);
      
      // Feature 1: Resize-Funktionalität initialisieren
      initWidgetResize(el);
      
      // Fix 1: Widget Drag & Drop initialisieren
      enableWidgetDragging(el);
      
      // Feature 2: Shortcut Drag & Drop initialisieren (nur für Shortcuts-Widgets)
      if (widget.type === 'shortcuts') {
        const shortcutsGrid = el.querySelector('.shortcuts-grid');
        if (shortcutsGrid) {
          initShortcutDragDrop(widget.id, shortcutsGrid);
        }
      }
    }
  });
}

function createWidgetElement(widget) {
  const div = document.createElement('div');
  div.className = 'widget';
  div.id = widget.id;
  div.dataset.type = widget.type;
  
  // Widget Settings anwenden (#11, #13, #14, #15)
  const widgetSettings = widget.settings || {};
  
  if (widgetSettings.opacity !== undefined) {
    div.style.opacity = widgetSettings.opacity;
  }
  
  if (widgetSettings.position && widgetSettings.position !== 'free') {
    div.classList.add(`position-${widgetSettings.position}`);
  }
  
  if (widgetSettings.autoHide) {
    div.classList.add('auto-hide');
  }
  
  if (widgetSettings.effects) {
    widgetSettings.effects.forEach(effect => {
      div.classList.add(`effect-${effect}`);
    });
  }
  
  // Neue Feature 3: Blur-Einstellung
  // Wenn Blur explizit deaktiviert ist, kein backdrop-filter
  if (widgetSettings.blurEnabled === false) {
    div.style.backdropFilter = 'none';
  } else if (widgetSettings.blurStrength !== undefined) {
    // Blur ist aktiviert oder nicht explizit deaktiviert, und Stärke ist gesetzt
    div.classList.add('custom-blur');
    div.style.setProperty('--widget-blur', `blur(${widgetSettings.blurStrength}px)`);
  }
  // Standard blur vom CSS wenn nichts gesetzt ist
  
  // Neue Feature 4: Hintergrund-Anpassung
  if (widgetSettings.bgColor || widgetSettings.bgOpacity !== undefined) {
    const bgColor = widgetSettings.bgColor || '#1a1a2e';
    const bgOpacity = (widgetSettings.bgOpacity ?? 100) / 100;
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    div.classList.add('custom-bg');
    div.style.setProperty('--widget-custom-bg', `rgba(${r}, ${g}, ${b}, ${bgOpacity})`);
  }
  
  // Neue Feature 4: Rahmen-Anpassung
  if (widgetSettings.borderEnabled) {
    div.classList.add('custom-border');
    div.style.setProperty('--widget-border-color', widgetSettings.borderColor || '#ff00ff');
    div.style.setProperty('--widget-border-width', `${widgetSettings.borderWidth || 1}px`);
  }
  
  // Neue Feature 4: Schatten-Anpassung
  if (widgetSettings.shadowEnabled) {
    div.classList.add('custom-shadow');
    div.style.setProperty('--widget-shadow-size', `${widgetSettings.shadowSize || 20}px`);
  }
  
  // Neue Feature 6: Randlos-Modus
  if (widgetSettings.borderless) {
    div.classList.add('borderless');
  }
  
  // Neue Feature 7: Titel/Labels ausblenden
  if (widgetSettings.hideTitle) {
    div.classList.add('hide-title');
  }
  
  if (widgetSettings.hideLabels) {
    div.classList.add('hide-labels');
  }
  
  // Neue Feature 1: Größe wiederherstellen
  if (widgetSettings.width) {
    div.style.width = widgetSettings.width;
  }
  if (widgetSettings.height) {
    div.style.height = widgetSettings.height;
  }
  
  // Fix 1: Position wiederherstellen (prüfe auf undefined/null statt falsy)
  if (widgetSettings.positionLeft !== undefined || widgetSettings.positionTop !== undefined) {
    div.style.position = 'absolute';
    if (widgetSettings.positionLeft !== undefined) div.style.left = `${widgetSettings.positionLeft}px`;
    if (widgetSettings.positionTop !== undefined) div.style.top = `${widgetSettings.positionTop}px`;
  }
  
  // Fix 3: Text-Farbe anwenden
  if (widgetSettings.textColor) {
    div.style.setProperty('--text-color', widgetSettings.textColor);
    div.classList.add('custom-text-color');
  }
  
  // Fix 5-7: Icon-, Text- und Uhrzeit-Größe anwenden
  if (widgetSettings.iconSize) {
    div.style.setProperty('--icon-size', `${widgetSettings.iconSize}px`);
  }
  if (widgetSettings.fontSize) {
    div.style.setProperty('--widget-font-size', `${widgetSettings.fontSize}px`);
  }
  if (widgetSettings.clockSize) {
    div.style.setProperty('--clock-size', `${widgetSettings.clockSize}px`);
  }
  
  // Widget Controls (Edit Mode only) + Resize Handle
  div.innerHTML = `
    <div class="drag-handle"></div>
    <div class="widget-controls">
      <button class="widget-control-btn widget-settings-btn" data-widget-id="${widget.id}" title="Einstellungen">⚙️</button>
      <button class="widget-control-btn widget-delete-btn" data-widget-id="${widget.id}" title="Löschen">🗑️</button>
    </div>
    <div class="resize-handle" data-widget-id="${widget.id}">⋰</div>
  `;
  
  // Widget Content basierend auf Typ
  const content = document.createElement('div');
  content.className = 'widget-content';
  
  switch (widget.type) {
    case 'clock':
      div.classList.add('clock-widget');
      content.innerHTML = `
        <div class="clock-time" id="clock-time-${widget.id}">00:00</div>
        <div class="clock-date" id="clock-date-${widget.id}"></div>
      `;
      break;
      
    case 'shortcuts':
      div.classList.add('shortcuts-widget');
      const shortcuts = widget.data?.shortcuts || [];
      content.innerHTML = `
        <div class="shortcuts-grid">
          ${shortcuts.map((shortcut, index) => `
            <a href="${shortcut.url}" class="shortcut-item" data-index="${index}" data-widget-id="${widget.id}">
              <img src="${getIconFromUrl(shortcut.url)}" class="shortcut-icon" alt="${shortcut.name}">
              <span class="shortcut-name">${shortcut.name}</span>
            </a>
          `).join('')}
          <button class="add-shortcut-btn" data-widget-id="${widget.id}">
            <span class="add-shortcut-icon">+</span>
            <span class="shortcut-name">Hinzufügen</span>
          </button>
        </div>
      `;
      break;
      
    case 'notes':
      div.classList.add('notes-widget');
      const notes = widget.data?.notes || [];
      content.innerHTML = `
        <div class="notes-list">
          ${notes.map((note, index) => `
            <div class="note-item" data-index="${index}" data-widget-id="${widget.id}">
              <div class="note-item-title">${note.title || 'Ohne Titel'}</div>
              <div class="note-item-preview">${note.content?.substring(0, 50) || '...'}</div>
            </div>
          `).join('')}
        </div>
        <button class="add-note-btn" data-widget-id="${widget.id}">+ Neue Notiz</button>
      `;
      break;
      
    case 'weather':
      div.classList.add('weather-widget');
      content.innerHTML = `
        <div class="weather-icon">☀️</div>
        <div class="weather-temp">--°C</div>
        <div class="weather-desc">Laden...</div>
        <div class="weather-location">--</div>
      `;
      loadWeather(div);
      break;
      
    case 'password':
      div.classList.add('password-widget');
      content.innerHTML = `
        <div class="password-display">
          <input type="text" readonly id="generated-pw-${widget.id}" value="">
          <button class="copy-btn" data-widget-id="${widget.id}">📋</button>
        </div>
        <div class="password-options">
          <label>Länge: <span id="pw-length-val-${widget.id}">16</span>
            <input type="range" min="8" max="64" value="16" id="pw-length-${widget.id}">
          </label>
          <label><input type="checkbox" checked id="pw-upper-${widget.id}"> A-Z</label>
          <label><input type="checkbox" checked id="pw-lower-${widget.id}"> a-z</label>
          <label><input type="checkbox" checked id="pw-numbers-${widget.id}"> 0-9</label>
          <label><input type="checkbox" checked id="pw-symbols-${widget.id}"> !@#$</label>
        </div>
        <div class="strength-bar">
          <div class="strength-fill" id="strength-fill-${widget.id}" style="width: 0%;"></div>
        </div>
        <div class="strength-text" id="strength-text-${widget.id}">--</div>
        <button class="generate-btn" data-widget-id="${widget.id}">🔄 Generieren</button>
      `;
      break;
  }
  
  div.appendChild(content);
  return div;
}

// ============ Clock Functionality ============
function startClock() {
  function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('de-DE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    document.querySelectorAll('[id^="clock-time-"]').forEach(el => {
      el.textContent = timeStr;
    });
    
    document.querySelectorAll('[id^="clock-date-"]').forEach(el => {
      el.textContent = dateStr;
    });
  }
  
  updateClock();
  setInterval(updateClock, 1000);
}

// ============ Weather Widget (Fix 11: Mit API-Key Unterstützung) ============
async function loadWeather(widgetEl) {
  const apiKey = settings.weatherApiKey;
  const city = settings.weatherCity || 'Munich';
  
  const iconEl = widgetEl.querySelector('.weather-icon');
  const tempEl = widgetEl.querySelector('.weather-temp');
  const descEl = widgetEl.querySelector('.weather-desc');
  const locEl = widgetEl.querySelector('.weather-location');
  
  // Wenn kein API-Key vorhanden, Demo-Daten anzeigen
  if (!apiKey) {
    if (iconEl) iconEl.textContent = '⚙️';
    if (tempEl) tempEl.textContent = '--°C';
    if (descEl) descEl.textContent = 'API-Key fehlt';
    if (locEl) locEl.textContent = 'Einstellungen → Wetter';
    return;
  }
  
  try {
    const weather = await fetchWeather(city, apiKey);
    
    if (weather.error) {
      if (iconEl) iconEl.textContent = '⚠️';
      if (tempEl) tempEl.textContent = '--°C';
      if (descEl) descEl.textContent = weather.condition;
      if (locEl) locEl.textContent = city;
    } else {
      if (iconEl) iconEl.textContent = weather.icon;
      if (tempEl) tempEl.textContent = `${weather.temp}°C`;
      if (descEl) descEl.textContent = weather.condition;
      if (locEl) locEl.textContent = city;
    }
  } catch (error) {
    console.error('Fehler beim Laden des Wetters:', error);
    if (iconEl) iconEl.textContent = '⚠️';
    if (tempEl) tempEl.textContent = '--°C';
    if (descEl) descEl.textContent = 'Fehler';
    if (locEl) locEl.textContent = city;
  }
}

// Fix 11: Wetter-API abrufen
async function fetchWeather(city, apiKey) {
  if (!apiKey) {
    return { 
      temp: '--', 
      condition: 'API-Key fehlt',
      error: true 
    };
  }
  
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=de`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      wind: data.wind.speed,
      icon: getWeatherIcon(data.weather[0].icon),
      error: false
    };
  } catch (error) {
    console.error('Wetter-Fehler:', error);
    return { 
      temp: '--', 
      condition: 'Fehler beim Laden',
      error: true 
    };
  }
}

// Fix 11: Wetter-Icons zuordnen
function getWeatherIcon(code) {
  const icons = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
  };
  return icons[code] || '🌤️';
}

// Fix 11: Alle Wetter-Widgets aktualisieren
function updateAllWeatherWidgets() {
  document.querySelectorAll('.weather-widget').forEach(widget => {
    loadWeather(widget);
  });
}

// ============ Feature #18: Password Generator ============
function generatePassword(widgetId) {
  const length = parseInt(document.getElementById(`pw-length-${widgetId}`)?.value || 16);
  const useUpper = document.getElementById(`pw-upper-${widgetId}`)?.checked ?? true;
  const useLower = document.getElementById(`pw-lower-${widgetId}`)?.checked ?? true;
  const useNumbers = document.getElementById(`pw-numbers-${widgetId}`)?.checked ?? true;
  const useSymbols = document.getElementById(`pw-symbols-${widgetId}`)?.checked ?? true;
  
  let chars = '';
  if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (useNumbers) chars += '0123456789';
  if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (chars.length === 0) chars = 'abcdefghijklmnopqrstuvwxyz';
  
  let password = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }
  
  const pwInput = document.getElementById(`generated-pw-${widgetId}`);
  if (pwInput) pwInput.value = password;
  
  // Stärke berechnen
  updatePasswordStrength(widgetId, password);
}

function updatePasswordStrength(widgetId, password) {
  let strength = 0;
  
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 20;
  if (password.length >= 16) strength += 10;
  if (/[a-z]/.test(password)) strength += 10;
  if (/[A-Z]/.test(password)) strength += 10;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15;
  
  strength = Math.min(100, strength);
  
  const fillEl = document.getElementById(`strength-fill-${widgetId}`);
  const textEl = document.getElementById(`strength-text-${widgetId}`);
  
  if (fillEl) fillEl.style.width = `${strength}%`;
  
  let strengthText = 'Sehr schwach';
  if (strength >= 80) strengthText = 'Sehr stark';
  else if (strength >= 60) strengthText = 'Stark';
  else if (strength >= 40) strengthText = 'Mittel';
  else if (strength >= 20) strengthText = 'Schwach';
  
  if (textEl) textEl.textContent = strengthText;
}

function copyPassword(widgetId) {
  const pwInput = document.getElementById(`generated-pw-${widgetId}`);
  if (pwInput && pwInput.value) {
    navigator.clipboard.writeText(pwInput.value);
    alert('Passwort kopiert!');
  }
}

// ============ Feature #17: Quick Actions (Strg+K) ============
function initQuickActions() {
  renderQuickActions();
}

function renderQuickActions(filter = '') {
  const list = document.getElementById('actions-list');
  if (!list) return;
  
  const filtered = QUICK_ACTIONS.filter(action => 
    action.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  list.innerHTML = filtered.map((action, index) => `
    <div class="action-item ${index === selectedActionIndex ? 'selected' : ''}" 
         data-action="${action.id}">
      <span>${action.icon}</span>
      <span>${action.name}</span>
    </div>
  `).join('');
  
  list.querySelectorAll('.action-item').forEach(item => {
    item.addEventListener('click', () => executeQuickAction(item.dataset.action));
  });
}

function openQuickActions() {
  const modal = document.getElementById('quick-actions-modal');
  const input = document.getElementById('quick-search');
  
  if (modal) {
    modal.classList.remove('hidden');
    selectedActionIndex = 0;
    renderQuickActions();
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

function closeQuickActions() {
  const modal = document.getElementById('quick-actions-modal');
  if (modal) modal.classList.add('hidden');
}

function executeQuickAction(actionId) {
  closeQuickActions();
  
  switch (actionId) {
    case 'add-widget':
      openWidgetModal();
      break;
    case 'add-note':
      openNoteEditor();
      break;
    case 'toggle-edit':
      toggleEditMode();
      break;
    case 'open-settings':
      openSettingsModal();
      break;
    case 'change-theme':
      openSettingsModal();
      break;
    case 'new-page':
      addNewPage();
      break;
  }
}

// ============ Modal Handling (#4: nur X oder Speichern schließt) ============
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('hidden');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

function openWidgetModal() {
  const typesContainer = document.getElementById('widget-types');
  if (typesContainer) {
    typesContainer.innerHTML = WIDGET_TYPES.map(type => `
      <div class="widget-type-card" data-type="${type.id}">
        <div class="widget-type-icon">${type.icon}</div>
        <div class="widget-type-name">${type.name}</div>
      </div>
    `).join('');
    
    typesContainer.querySelectorAll('.widget-type-card').forEach(card => {
      card.addEventListener('click', () => addWidget(card.dataset.type));
    });
  }
  
  openModal('widget-modal');
}

function openSettingsModal() {
  renderThemeGrid();
  renderFontGrid();
  renderPagesManager();
  initBackgroundSettings();
  
  const editToggle = document.getElementById('edit-mode-toggle');
  if (editToggle) editToggle.checked = settings.editMode;
  
  openModal('settings-modal');
}

function initBackgroundSettings() {
  const bgRadios = document.querySelectorAll('input[name="bg-type"]');
  const animatedSelect = document.getElementById('animated-bg-type');
  
  bgRadios.forEach(radio => {
    radio.checked = radio.value === settings.backgroundType;
    radio.addEventListener('change', () => {
      settings.backgroundType = radio.value;
      
      if (radio.value === 'animated' && animatedSelect) {
        animatedSelect.classList.remove('hidden');
      } else if (animatedSelect) {
        animatedSelect.classList.add('hidden');
      }
      
      saveSettings();
      initBackground();
    });
  });
  
  if (animatedSelect) {
    animatedSelect.value = settings.animatedBgType || 'particles';
    animatedSelect.classList.toggle('hidden', settings.backgroundType !== 'animated');
    
    animatedSelect.addEventListener('change', () => {
      settings.animatedBgType = animatedSelect.value;
      saveSettings();
      initBackground();
    });
  }
  
  // Neue Feature 5: Seiten-Transparenz initialisieren
  const pageOpacitySlider = document.getElementById('page-opacity');
  const pageOpacityValue = document.getElementById('page-opacity-value');
  if (pageOpacitySlider) {
    const currentOpacity = settings.pageOpacity ?? 100;
    pageOpacitySlider.value = currentOpacity;
    if (pageOpacityValue) {
      pageOpacityValue.textContent = `${currentOpacity}%`;
    }
  }
  
  // Fix 2: Grid-Einstellungen initialisieren
  const gridSizeSlider = document.getElementById('grid-size');
  const gridSizeVal = document.getElementById('grid-size-val');
  const gridColorInput = document.getElementById('grid-color');
  const gridVisibleCheckbox = document.getElementById('grid-visible');
  
  if (gridSizeSlider) gridSizeSlider.value = settings.gridSize || 20;
  if (gridSizeVal) gridSizeVal.textContent = `${settings.gridSize || 20}px`;
  if (gridColorInput) gridColorInput.value = settings.gridColor || '#ff00ff';
  if (gridVisibleCheckbox) gridVisibleCheckbox.checked = settings.gridVisible !== false;
  
  // Fix 11: Wetter-Einstellungen initialisieren
  const weatherApiKey = document.getElementById('weather-api-key');
  const weatherCity = document.getElementById('weather-city');
  
  if (weatherApiKey) weatherApiKey.value = settings.weatherApiKey || '';
  if (weatherCity) weatherCity.value = settings.weatherCity || 'Munich';
}

// ============ Widget Management ============
function addWidget(type) {
  const currentPage = settings.pages[settings.currentPage];
  if (!currentPage) return;
  
  const newWidget = {
    id: `${type}-${Date.now()}`,
    type: type,
    position: { x: 0, y: 0 },
    settings: {},
    data: type === 'shortcuts' ? { shortcuts: [] } : 
          type === 'notes' ? { notes: [] } : {}
  };
  
  currentPage.widgets.push(newWidget);
  saveSettings();
  renderWidgets();
  closeModal('widget-modal');
}

function deleteWidget(widgetId) {
  const currentPage = settings.pages[settings.currentPage];
  if (!currentPage) return;
  
  currentPage.widgets = currentPage.widgets.filter(w => w.id !== widgetId);
  saveSettings();
  renderWidgets();
}

function openWidgetSettingsModal(widgetId) {
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === widgetId);
  if (!widget) return;
  
  const widgetSettings = widget.settings || {};
  
  // Basis-Felder füllen
  document.getElementById('widget-settings-id').value = widgetId;
  document.getElementById('widget-opacity').value = (widgetSettings.opacity ?? 1) * 100;
  document.getElementById('widget-opacity-value').textContent = `${Math.round((widgetSettings.opacity ?? 1) * 100)}%`;
  document.getElementById('widget-position').value = widgetSettings.position || 'free';
  document.getElementById('widget-auto-hide').checked = widgetSettings.autoHide || false;
  
  // Effekte
  const effects = widgetSettings.effects || [];
  document.querySelectorAll('.effects-checkboxes input[type="checkbox"]').forEach(cb => {
    cb.checked = effects.includes(cb.dataset.effect);
  });
  
  // Neue Feature 3: Blur-Einstellungen
  const blurEnabled = document.getElementById('widget-blur-enabled');
  const blurStrength = document.getElementById('widget-blur-strength');
  const blurValue = document.getElementById('widget-blur-value');
  if (blurEnabled) blurEnabled.checked = widgetSettings.blurEnabled !== false;
  if (blurStrength) blurStrength.value = widgetSettings.blurStrength ?? 10;
  if (blurValue) blurValue.textContent = `${widgetSettings.blurStrength ?? 10}px`;
  
  // Neue Feature 4: Hintergrund-Anpassung
  const bgOpacity = document.getElementById('widget-bg-opacity');
  const bgOpacityValue = document.getElementById('widget-bg-opacity-value');
  const bgColor = document.getElementById('widget-bg-color');
  if (bgOpacity) bgOpacity.value = widgetSettings.bgOpacity ?? 100;
  if (bgOpacityValue) bgOpacityValue.textContent = `${widgetSettings.bgOpacity ?? 100}%`;
  if (bgColor) bgColor.value = widgetSettings.bgColor || '#1a1a2e';
  
  // Rahmen-Einstellungen
  const borderEnabled = document.getElementById('widget-border-enabled');
  const borderColor = document.getElementById('widget-border-color');
  const borderWidth = document.getElementById('widget-border-width');
  const borderWidthValue = document.getElementById('widget-border-width-value');
  if (borderEnabled) borderEnabled.checked = widgetSettings.borderEnabled || false;
  if (borderColor) borderColor.value = widgetSettings.borderColor || '#ff00ff';
  if (borderWidth) borderWidth.value = widgetSettings.borderWidth || 1;
  if (borderWidthValue) borderWidthValue.textContent = `${widgetSettings.borderWidth || 1}px`;
  
  // Schatten-Einstellungen
  const shadowEnabled = document.getElementById('widget-shadow-enabled');
  const shadowSize = document.getElementById('widget-shadow-size');
  const shadowSizeValue = document.getElementById('widget-shadow-size-value');
  if (shadowEnabled) shadowEnabled.checked = widgetSettings.shadowEnabled || false;
  if (shadowSize) shadowSize.value = widgetSettings.shadowSize || 20;
  if (shadowSizeValue) shadowSizeValue.textContent = `${widgetSettings.shadowSize || 20}px`;
  
  // Neue Feature 6: Randlos-Modus
  const borderless = document.getElementById('widget-borderless');
  if (borderless) borderless.checked = widgetSettings.borderless || false;
  
  // Neue Feature 7: Titel/Labels ausblenden
  const hideTitle = document.getElementById('widget-hide-title');
  const hideLabels = document.getElementById('widget-hide-labels');
  if (hideTitle) hideTitle.checked = widgetSettings.hideTitle || false;
  if (hideLabels) hideLabels.checked = widgetSettings.hideLabels || false;
  
  // Fix 3: Text-Farbe
  const textColor = document.getElementById('widget-text-color');
  if (textColor) textColor.value = widgetSettings.textColor || '#ffffff';
  
  // Fix 5-7: Icon-, Text- und Uhrzeit-Größe
  const iconSize = document.getElementById('widget-icon-size');
  const iconSizeVal = document.getElementById('icon-size-val');
  if (iconSize) iconSize.value = widgetSettings.iconSize || 48;
  if (iconSizeVal) iconSizeVal.textContent = `${widgetSettings.iconSize || 48}px`;
  
  const fontSize = document.getElementById('widget-font-size');
  const fontSizeVal = document.getElementById('font-size-val');
  if (fontSize) fontSize.value = widgetSettings.fontSize || 16;
  if (fontSizeVal) fontSizeVal.textContent = `${widgetSettings.fontSize || 16}px`;
  
  const clockSize = document.getElementById('widget-clock-size');
  const clockSizeVal = document.getElementById('clock-size-val');
  if (clockSize) clockSize.value = widgetSettings.clockSize || 72;
  if (clockSizeVal) clockSizeVal.textContent = `${widgetSettings.clockSize || 72}px`;
  
  openModal('widget-settings-modal');
}

function saveWidgetSettings() {
  const widgetId = document.getElementById('widget-settings-id').value;
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === widgetId);
  if (!widget) return;
  
  widget.settings = widget.settings || {};
  widget.settings.opacity = parseInt(document.getElementById('widget-opacity').value) / 100;
  widget.settings.position = document.getElementById('widget-position').value;
  widget.settings.autoHide = document.getElementById('widget-auto-hide').checked;
  
  // Effekte sammeln
  widget.settings.effects = [];
  document.querySelectorAll('.effects-checkboxes input[type="checkbox"]:checked').forEach(cb => {
    widget.settings.effects.push(cb.dataset.effect);
  });
  
  // Neue Feature 3: Blur-Einstellungen
  const blurEnabled = document.getElementById('widget-blur-enabled');
  const blurStrength = document.getElementById('widget-blur-strength');
  if (blurEnabled) widget.settings.blurEnabled = blurEnabled.checked;
  if (blurStrength) widget.settings.blurStrength = parseInt(blurStrength.value);
  
  // Neue Feature 4: Hintergrund-Anpassung
  const bgOpacity = document.getElementById('widget-bg-opacity');
  const bgColor = document.getElementById('widget-bg-color');
  if (bgOpacity) widget.settings.bgOpacity = parseInt(bgOpacity.value);
  if (bgColor) widget.settings.bgColor = bgColor.value;
  
  // Rahmen-Einstellungen
  const borderEnabled = document.getElementById('widget-border-enabled');
  const borderColor = document.getElementById('widget-border-color');
  const borderWidth = document.getElementById('widget-border-width');
  if (borderEnabled) widget.settings.borderEnabled = borderEnabled.checked;
  if (borderColor) widget.settings.borderColor = borderColor.value;
  if (borderWidth) widget.settings.borderWidth = parseInt(borderWidth.value);
  
  // Schatten-Einstellungen
  const shadowEnabled = document.getElementById('widget-shadow-enabled');
  const shadowSize = document.getElementById('widget-shadow-size');
  if (shadowEnabled) widget.settings.shadowEnabled = shadowEnabled.checked;
  if (shadowSize) widget.settings.shadowSize = parseInt(shadowSize.value);
  
  // Neue Feature 6: Randlos-Modus
  const borderless = document.getElementById('widget-borderless');
  if (borderless) widget.settings.borderless = borderless.checked;
  
  // Neue Feature 7: Titel/Labels ausblenden
  const hideTitle = document.getElementById('widget-hide-title');
  const hideLabels = document.getElementById('widget-hide-labels');
  if (hideTitle) widget.settings.hideTitle = hideTitle.checked;
  if (hideLabels) widget.settings.hideLabels = hideLabels.checked;
  
  // Fix 3: Text-Farbe
  const textColor = document.getElementById('widget-text-color');
  if (textColor) widget.settings.textColor = textColor.value;
  
  // Fix 5-7: Icon-, Text- und Uhrzeit-Größe
  const iconSize = document.getElementById('widget-icon-size');
  const fontSize = document.getElementById('widget-font-size');
  const clockSize = document.getElementById('widget-clock-size');
  if (iconSize) widget.settings.iconSize = parseInt(iconSize.value);
  if (fontSize) widget.settings.fontSize = parseInt(fontSize.value);
  if (clockSize) widget.settings.clockSize = parseInt(clockSize.value);
  
  saveSettings();
  renderWidgets();
  closeModal('widget-settings-modal');
}

// ============ Feature 1: Widgets resizable ============
function initWidgetResize(widget) {
  const handle = widget.querySelector('.resize-handle');
  if (!handle) return;
  
  handle.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const widgetId = handle.dataset.widgetId;
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = widget.offsetWidth;
    const startH = widget.offsetHeight;
    
    const onResize = (moveEvent) => {
      const newWidth = Math.max(MIN_WIDGET_WIDTH, startW + moveEvent.clientX - startX);
      const newHeight = Math.max(MIN_WIDGET_HEIGHT, startH + moveEvent.clientY - startY);
      widget.style.width = newWidth + 'px';
      widget.style.height = newHeight + 'px';
    };
    
    const stopResize = () => {
      document.removeEventListener('mousemove', onResize);
      saveWidgetSize(widgetId, widget.style.width, widget.style.height);
    };
    
    document.addEventListener('mousemove', onResize);
    document.addEventListener('mouseup', stopResize, { once: true });
  });
}

function saveWidgetSize(widgetId, width, height) {
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === widgetId);
  if (!widget) return;
  
  widget.settings = widget.settings || {};
  widget.settings.width = width;
  widget.settings.height = height;
  saveSettings();
}

// ============ Feature 2: Shortcuts verschiebbar (Drag & Drop) ============
function initShortcutDragDrop(widgetId, container) {
  if (!container) return;
  
  const shortcuts = container.querySelectorAll('.shortcut-item');
  
  shortcuts.forEach(item => {
    // Nur im Edit-Modus verschiebbar
    item.draggable = true;
    
    item.addEventListener('dragstart', (e) => {
      if (!settings.editMode) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.dataset.index);
      item.classList.add('dragging');
    });
    
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      // Speichere neue Reihenfolge
      saveShortcutOrder(widgetId, container);
    });
  });
  
  // Throttle-Variable für dragover Performance
  let lastDragoverTime = 0;
  const DRAGOVER_THROTTLE_MS = 50;
  
  container.addEventListener('dragover', (e) => {
    if (!settings.editMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Throttle: Nur alle 50ms die DOM-Manipulation durchführen
    const now = Date.now();
    if (now - lastDragoverTime < DRAGOVER_THROTTLE_MS) return;
    lastDragoverTime = now;
    
    const dragging = container.querySelector('.dragging');
    if (!dragging) return;
    
    const siblings = [...container.querySelectorAll('.shortcut-item:not(.dragging):not(.add-shortcut-btn)')];
    const afterElement = siblings.find(el => {
      const rect = el.getBoundingClientRect();
      return e.clientX < rect.left + rect.width / 2;
    });
    
    if (afterElement) {
      container.insertBefore(dragging, afterElement);
    } else {
      // Vor den Add-Button einfügen, falls vorhanden
      const addBtn = container.querySelector('.add-shortcut-btn');
      if (addBtn) {
        container.insertBefore(dragging, addBtn);
      } else {
        container.appendChild(dragging);
      }
    }
  });
}

function saveShortcutOrder(widgetId, container) {
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === widgetId);
  if (!widget || !widget.data?.shortcuts) return;
  
  const items = container.querySelectorAll('.shortcut-item');
  const newOrder = [];
  
  items.forEach(item => {
    const index = parseInt(item.dataset.index);
    if (!isNaN(index) && widget.data.shortcuts[index]) {
      newOrder.push(widget.data.shortcuts[index]);
    }
  });
  
  widget.data.shortcuts = newOrder;
  saveSettings();
  renderWidgets(); // Neu rendern um die Indizes zu aktualisieren
}

// ============ Feature #3 & #7: Shortcuts ============
let currentShortcutWidgetId = null;
let currentShortcutIndex = -1;

function openShortcutModal(widgetId, index = -1) {
  currentShortcutWidgetId = widgetId;
  currentShortcutIndex = index;
  
  const titleEl = document.getElementById('shortcut-modal-title');
  const nameInput = document.getElementById('shortcut-name');
  const urlInput = document.getElementById('shortcut-url');
  const indexInput = document.getElementById('shortcut-index');
  const deleteBtn = document.getElementById('delete-shortcut-btn');
  
  if (index >= 0) {
    // Bearbeiten
    const currentPage = settings.pages[settings.currentPage];
    const widget = currentPage?.widgets.find(w => w.id === widgetId);
    const shortcut = widget?.data?.shortcuts?.[index];
    
    if (shortcut) {
      titleEl.textContent = 'Shortcut bearbeiten';
      nameInput.value = shortcut.name;
      urlInput.value = shortcut.url;
      deleteBtn.classList.remove('hidden');
    }
  } else {
    // Neu
    titleEl.textContent = 'Shortcut hinzufügen';
    nameInput.value = '';
    urlInput.value = '';
    deleteBtn.classList.add('hidden');
  }
  
  indexInput.value = index;
  openModal('shortcut-modal');
}

function saveShortcut(e) {
  e.preventDefault();
  
  const name = document.getElementById('shortcut-name').value.trim();
  let url = document.getElementById('shortcut-url').value.trim();
  
  if (!name || !url) return;
  
  // URL normalisieren
  if (!url.startsWith('http') && !url.startsWith('chrome://')) {
    url = 'https://' + url;
  }
  
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === currentShortcutWidgetId);
  
  if (widget) {
    widget.data = widget.data || {};
    widget.data.shortcuts = widget.data.shortcuts || [];
    
    if (currentShortcutIndex >= 0) {
      widget.data.shortcuts[currentShortcutIndex] = { name, url };
    } else {
      widget.data.shortcuts.push({ name, url });
    }
    
    saveSettings();
    renderWidgets();
  }
  
  closeModal('shortcut-modal');
}

function deleteShortcut() {
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === currentShortcutWidgetId);
  
  if (widget && currentShortcutIndex >= 0) {
    widget.data.shortcuts.splice(currentShortcutIndex, 1);
    saveSettings();
    renderWidgets();
  }
  
  closeModal('shortcut-modal');
}

// Shortcut Klick Handler
function handleShortcutClick(e, url) {
  // Im Edit-Modus: Bearbeiten öffnen
  if (settings.editMode) {
    e.preventDefault();
    const item = e.currentTarget;
    const widgetId = item.dataset.widgetId;
    const index = parseInt(item.dataset.index);
    openShortcutModal(widgetId, index);
    return;
  }
  
  // Spezielle URLs (#7)
  if (url.includes('tabs.html')) {
    e.preventDefault();
    openTabsModal();
    return;
  }
  
  if (url.includes('bookmarks.html')) {
    e.preventDefault();
    openBookmarksModal();
    return;
  }
  
  // Normale URL - Link folgen
}

// ============ Feature #7: Tabs & Lesezeichen Modals (Fix 10: Tab wechseln statt öffnen) ============
async function openTabsModal() {
  const list = document.getElementById('tabs-list');
  if (!list) return;
  
  try {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const tabs = await chrome.tabs.query({});
      list.innerHTML = tabs.map(tab => `
        <div class="tab-item" data-tab-id="${tab.id}" data-window-id="${tab.windowId}" data-url="${tab.url}">
          <img src="${tab.favIconUrl || getIconFromUrl(tab.url)}" class="tab-icon" alt="">
          <span class="tab-title">${tab.title}</span>
        </div>
      `).join('');
      
      list.querySelectorAll('.tab-item').forEach(item => {
        item.addEventListener('click', async () => {
          const tabId = parseInt(item.dataset.tabId);
          const windowId = parseInt(item.dataset.windowId);
          const url = item.dataset.url;
          
          try {
            // Fix 10: Zum Tab wechseln statt neuen Tab zu öffnen
            await chrome.tabs.update(tabId, { active: true });
            // Auch das Fenster fokussieren
            await chrome.windows.update(windowId, { focused: true });
          } catch (error) {
            // Fallback: Tab existiert nicht mehr → neu öffnen
            console.warn('Tab nicht mehr vorhanden, öffne neu:', error);
            await chrome.tabs.create({ url: url });
          }
          closeModal('tabs-modal');
        });
      });
    } else {
      list.innerHTML = '<p>Tab-Zugriff nur in Chrome Extension verfügbar.</p>';
    }
  } catch (error) {
    list.innerHTML = '<p>Fehler beim Laden der Tabs.</p>';
  }
  
  openModal('tabs-modal');
}

async function openBookmarksModal() {
  const list = document.getElementById('bookmarks-list');
  if (!list) return;
  
  try {
    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      const tree = await chrome.bookmarks.getTree();
      list.innerHTML = renderBookmarkTree(tree);
      
      list.querySelectorAll('.bookmark-item').forEach(item => {
        item.addEventListener('click', () => {
          window.open(item.dataset.url, '_blank');
          closeModal('bookmarks-modal');
        });
      });
    } else {
      list.innerHTML = '<p>Lesezeichen-Zugriff nur in Chrome Extension verfügbar.</p>';
    }
  } catch (error) {
    list.innerHTML = '<p>Fehler beim Laden der Lesezeichen.</p>';
  }
  
  openModal('bookmarks-modal');
}

function renderBookmarkTree(nodes, level = 0) {
  let html = '';
  
  for (const node of nodes) {
    if (node.children) {
      if (node.title) {
        html += `<div class="bookmark-folder">
          <div class="bookmark-folder-title">📁 ${node.title}</div>
          ${renderBookmarkTree(node.children, level + 1)}
        </div>`;
      } else {
        html += renderBookmarkTree(node.children, level);
      }
    } else if (node.url) {
      html += `<div class="bookmark-item" data-url="${node.url}">
        <img src="${getIconFromUrl(node.url)}" class="bookmark-icon" alt="">
        <span class="bookmark-title">${node.title || node.url}</span>
      </div>`;
    }
  }
  
  return html;
}

// ============ Feature #12: Notes ============
let currentNoteWidgetId = null;
let currentNoteIndex = -1;

function openNoteEditor(widgetId = null, index = -1) {
  // Wenn kein Widget angegeben, erstes Notes-Widget suchen oder neues erstellen
  if (!widgetId) {
    const currentPage = settings.pages[settings.currentPage];
    const notesWidget = currentPage?.widgets.find(w => w.type === 'notes');
    
    if (notesWidget) {
      widgetId = notesWidget.id;
    } else {
      // Neues Notes-Widget erstellen
      addWidget('notes');
      const newPage = settings.pages[settings.currentPage];
      widgetId = newPage.widgets[newPage.widgets.length - 1].id;
    }
  }
  
  currentNoteWidgetId = widgetId;
  currentNoteIndex = index;
  
  const titleInput = document.getElementById('note-title');
  const contentInput = document.getElementById('note-content');
  const deleteBtn = document.getElementById('delete-note-btn');
  
  if (index >= 0) {
    const currentPage = settings.pages[settings.currentPage];
    const widget = currentPage?.widgets.find(w => w.id === widgetId);
    const note = widget?.data?.notes?.[index];
    
    if (note) {
      titleInput.value = note.title || '';
      contentInput.value = note.content || '';
      deleteBtn.classList.remove('hidden');
    }
  } else {
    titleInput.value = '';
    contentInput.value = '';
    deleteBtn.classList.add('hidden');
  }
  
  openModal('note-modal');
}

function saveNote() {
  const title = document.getElementById('note-title').value.trim() || 'Ohne Titel';
  const content = document.getElementById('note-content').value.trim();
  
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === currentNoteWidgetId);
  
  if (widget) {
    widget.data = widget.data || {};
    widget.data.notes = widget.data.notes || [];
    
    const noteData = { title, content, updatedAt: Date.now() };
    
    if (currentNoteIndex >= 0) {
      widget.data.notes[currentNoteIndex] = noteData;
    } else {
      widget.data.notes.push(noteData);
    }
    
    saveSettings();
    renderWidgets();
  }
  
  closeModal('note-modal');
}

function deleteNote() {
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === currentNoteWidgetId);
  
  if (widget && currentNoteIndex >= 0) {
    widget.data.notes.splice(currentNoteIndex, 1);
    saveSettings();
    renderWidgets();
  }
  
  closeModal('note-modal');
}

// ============ Event Listeners ============
function initEventListeners() {
  // Settings Button
  document.getElementById('settings-btn')?.addEventListener('click', openSettingsModal);
  
  // Add Widget Button
  document.getElementById('add-widget-btn')?.addEventListener('click', openWidgetModal);
  
  // Modal Close Buttons (#4: nur X schließt)
  document.getElementById('widget-modal-close')?.addEventListener('click', () => closeModal('widget-modal'));
  document.getElementById('shortcut-modal-close')?.addEventListener('click', () => closeModal('shortcut-modal'));
  document.getElementById('note-modal-close')?.addEventListener('click', () => closeModal('note-modal'));
  document.getElementById('widget-settings-modal-close')?.addEventListener('click', () => closeModal('widget-settings-modal'));
  document.getElementById('settings-modal-close')?.addEventListener('click', () => closeModal('settings-modal'));
  document.getElementById('tabs-modal-close')?.addEventListener('click', () => closeModal('tabs-modal'));
  document.getElementById('bookmarks-modal-close')?.addEventListener('click', () => closeModal('bookmarks-modal'));
  
  // Shortcut Form
  document.getElementById('shortcut-form')?.addEventListener('submit', saveShortcut);
  document.getElementById('delete-shortcut-btn')?.addEventListener('click', deleteShortcut);
  
  // Special Shortcuts (#7)
  document.querySelectorAll('.special-shortcut-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('shortcut-name').value = btn.dataset.name;
      document.getElementById('shortcut-url').value = btn.dataset.url;
    });
  });
  
  // Note Editor
  document.getElementById('save-note-btn')?.addEventListener('click', saveNote);
  document.getElementById('delete-note-btn')?.addEventListener('click', deleteNote);
  
  // Widget Settings Form
  document.getElementById('widget-settings-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    saveWidgetSettings();
  });
  
  document.getElementById('delete-widget-btn')?.addEventListener('click', () => {
    const widgetId = document.getElementById('widget-settings-id').value;
    if (confirm('Widget wirklich löschen?')) {
      deleteWidget(widgetId);
      closeModal('widget-settings-modal');
    }
  });
  
  // Opacity Slider
  document.getElementById('widget-opacity')?.addEventListener('input', (e) => {
    document.getElementById('widget-opacity-value').textContent = `${e.target.value}%`;
  });
  
  // Neue Feature 3: Blur-Stärke Slider
  document.getElementById('widget-blur-strength')?.addEventListener('input', (e) => {
    document.getElementById('widget-blur-value').textContent = `${e.target.value}px`;
  });
  
  // Neue Feature 4: Hintergrund-Transparenz Slider
  document.getElementById('widget-bg-opacity')?.addEventListener('input', (e) => {
    document.getElementById('widget-bg-opacity-value').textContent = `${e.target.value}%`;
  });
  
  // Rahmen-Breite Slider
  document.getElementById('widget-border-width')?.addEventListener('input', (e) => {
    document.getElementById('widget-border-width-value').textContent = `${e.target.value}px`;
  });
  
  // Schatten-Größe Slider
  document.getElementById('widget-shadow-size')?.addEventListener('input', (e) => {
    document.getElementById('widget-shadow-size-value').textContent = `${e.target.value}px`;
  });
  
  // Neue Feature 5: Seiten-Transparenz Slider
  document.getElementById('page-opacity')?.addEventListener('input', (e) => {
    document.getElementById('page-opacity-value').textContent = `${e.target.value}%`;
    setPageOpacity(parseInt(e.target.value));
  });
  
  // Edit Mode Toggle
  document.getElementById('edit-mode-toggle')?.addEventListener('change', (e) => {
    settings.editMode = e.target.checked;
    saveSettings();
    updateEditModeUI();
  });
  
  // Custom Background Upload (Fix 8-9: Mit Video-Unterstützung)
  document.getElementById('upload-bg-btn')?.addEventListener('click', () => {
    document.getElementById('custom-bg-upload')?.click();
  });
  
  document.getElementById('custom-bg-upload')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadBackground(file);
      document.querySelector('input[name="bg-type"][value="custom"]').checked = true;
    }
  });
  
  // Fix 8-9: URL-basierter Hintergrund
  document.getElementById('bg-url')?.addEventListener('change', async (e) => {
    const url = e.target.value.trim();
    if (url) {
      await setBackgroundUrl(url);
    }
  });
  
  // Fix 2: Grid-Einstellungen
  document.getElementById('grid-size')?.addEventListener('input', (e) => {
    const size = parseInt(e.target.value);
    document.getElementById('grid-size-val').textContent = `${size}px`;
    setGridSize(size);
  });
  
  document.getElementById('grid-color')?.addEventListener('change', (e) => {
    setGridColor(e.target.value);
  });
  
  document.getElementById('grid-visible')?.addEventListener('change', (e) => {
    setGridVisible(e.target.checked);
  });
  
  // Fix 5-7: Größen-Slider
  document.getElementById('widget-icon-size')?.addEventListener('input', (e) => {
    document.getElementById('icon-size-val').textContent = `${e.target.value}px`;
  });
  
  document.getElementById('widget-font-size')?.addEventListener('input', (e) => {
    document.getElementById('font-size-val').textContent = `${e.target.value}px`;
  });
  
  document.getElementById('widget-clock-size')?.addEventListener('input', (e) => {
    document.getElementById('clock-size-val').textContent = `${e.target.value}px`;
  });
  
  // Fix 11: Wetter-Einstellungen
  document.getElementById('save-weather')?.addEventListener('click', async () => {
    const apiKey = document.getElementById('weather-api-key')?.value;
    const city = document.getElementById('weather-city')?.value || 'Munich';
    
    settings.weatherApiKey = apiKey;
    settings.weatherCity = city;
    await saveSettings();
    
    const status = document.getElementById('weather-status');
    if (status) {
      status.textContent = 'Teste...';
      status.style.color = 'inherit';
    }
    
    const weather = await fetchWeather(city, apiKey);
    
    if (weather.error) {
      if (status) {
        status.textContent = '❌ ' + weather.condition;
        status.style.color = 'red';
      }
    } else {
      if (status) {
        status.textContent = `✅ ${weather.temp}°C, ${weather.condition}`;
        status.style.color = 'green';
      }
      updateAllWeatherWidgets();
    }
  });
  
  // Add Page Button
  document.getElementById('add-page-btn')?.addEventListener('click', () => {
    addNewPage();
    renderPagesManager();
  });
  
  // Export/Import Settings
  document.getElementById('export-settings-btn')?.addEventListener('click', exportSettings);
  document.getElementById('import-settings-btn')?.addEventListener('click', () => {
    document.getElementById('import-settings-file')?.click();
  });
  document.getElementById('import-settings-file')?.addEventListener('change', importSettings);
  document.getElementById('reset-settings-btn')?.addEventListener('click', resetSettings);
  
  // Keyboard Shortcuts
  document.addEventListener('keydown', handleKeydown);
  
  // Quick Actions Search
  document.getElementById('quick-search')?.addEventListener('input', (e) => {
    selectedActionIndex = 0;
    renderQuickActions(e.target.value);
  });
  
  document.getElementById('quick-search')?.addEventListener('keydown', (e) => {
    const items = document.querySelectorAll('.action-item');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedActionIndex = Math.min(selectedActionIndex + 1, items.length - 1);
      renderQuickActions(document.getElementById('quick-search').value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedActionIndex = Math.max(selectedActionIndex - 1, 0);
      renderQuickActions(document.getElementById('quick-search').value);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = items[selectedActionIndex];
      if (selected) {
        executeQuickAction(selected.dataset.action);
      }
    }
  });
  
  // Widget Container Event Delegation
  document.getElementById('widget-container')?.addEventListener('click', (e) => {
    // Widget Settings Button
    const settingsBtn = e.target.closest('.widget-settings-btn');
    if (settingsBtn) {
      openWidgetSettingsModal(settingsBtn.dataset.widgetId);
      return;
    }
    
    // Widget Delete Button
    const deleteBtn = e.target.closest('.widget-delete-btn');
    if (deleteBtn) {
      if (confirm('Widget wirklich löschen?')) {
        deleteWidget(deleteBtn.dataset.widgetId);
      }
      return;
    }
    
    // Shortcut Click
    const shortcutItem = e.target.closest('.shortcut-item');
    if (shortcutItem) {
      handleShortcutClick(e, shortcutItem.href);
      return;
    }
    
    // Add Shortcut Button
    const addShortcutBtn = e.target.closest('.add-shortcut-btn');
    if (addShortcutBtn) {
      openShortcutModal(addShortcutBtn.dataset.widgetId);
      return;
    }
    
    // Note Item Click
    const noteItem = e.target.closest('.note-item');
    if (noteItem) {
      openNoteEditor(noteItem.dataset.widgetId, parseInt(noteItem.dataset.index));
      return;
    }
    
    // Add Note Button
    const addNoteBtn = e.target.closest('.add-note-btn');
    if (addNoteBtn) {
      openNoteEditor(addNoteBtn.dataset.widgetId);
      return;
    }
    
    // Password Generator
    const generateBtn = e.target.closest('.generate-btn');
    if (generateBtn) {
      generatePassword(generateBtn.dataset.widgetId);
      return;
    }
    
    const copyBtn = e.target.closest('.copy-btn');
    if (copyBtn) {
      copyPassword(copyBtn.dataset.widgetId);
      return;
    }
  });
  
  // Password length slider
  document.getElementById('widget-container')?.addEventListener('input', (e) => {
    if (e.target.id?.startsWith('pw-length-')) {
      const widgetId = e.target.id.replace('pw-length-', '');
      document.getElementById(`pw-length-val-${widgetId}`).textContent = e.target.value;
    }
  });
}

// Keyboard Shortcuts Handler
function handleKeydown(e) {
  // Strg+K: Quick Actions (#17)
  if (e.ctrlKey && e.key === 'k') {
    e.preventDefault();
    openQuickActions();
    return;
  }
  
  // Escape: Modal schließen
  if (e.key === 'Escape') {
    closeQuickActions();
    // Andere Modals nur bei Escape schließen (optional)
    return;
  }
  
  // Strg+1-9: Seiten wechseln (#16)
  if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
    e.preventDefault();
    const pageKeys = Object.keys(settings.pages);
    const pageIndex = parseInt(e.key) - 1;
    if (pageKeys[pageIndex]) {
      switchToPage(pageKeys[pageIndex]);
    }
    return;
  }
}

// ============ Settings Export/Import ============
function exportSettings() {
  const dataStr = JSON.stringify(settings, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chrome-ex-settings.json';
  a.click();
  
  URL.revokeObjectURL(url);
}

async function importSettings(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const imported = JSON.parse(text);
    
    settings = { ...DEFAULT_SETTINGS, ...imported };
    await saveSettings();
    
    // Alles neu initialisieren
    initTheme();
    initFont();
    initBackground();
    initPageTabs();
    renderWidgets();
    updateEditModeUI();
    
    alert('Einstellungen erfolgreich importiert!');
  } catch (error) {
    alert('Fehler beim Importieren: ' + error.message);
  }
}

async function resetSettings() {
  if (confirm('Alle Einstellungen zurücksetzen? Dies kann nicht rückgängig gemacht werden.')) {
    settings = { ...DEFAULT_SETTINGS };
    await saveSettings();
    
    initTheme();
    initFont();
    initBackground();
    initPageTabs();
    renderWidgets();
    updateEditModeUI();
    
    closeModal('settings-modal');
    alert('Einstellungen zurückgesetzt.');
  }
}
