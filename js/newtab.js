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
  // Fix 6: Background customization settings
  bgSize: 'cover',
  bgPosition: 'center',
  bgRepeat: false,
  bgFixed: true,
  // New Fix 6: Background zoom and position
  bgX: 50,
  bgY: 50,
  bgZoom: 100,
  // Fix 2: Grid-Einstellungen
  gridSize: 20,
  gridColor: '#ff00ff',
  gridVisible: true,
  // Fix 11: Wetter-Einstellungen (München coordinates for Open-Meteo)
  weatherLat: 48.1374,
  weatherLon: 11.5755,
  weatherCity: 'München',
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
  { id: 'password', name: 'Passwort Generator', icon: '🔐' },
  { id: 'calendar', name: 'Kalender', icon: '📅' },
  { id: 'distraction-counter', name: 'Ablenkungszähler', icon: '📊' },
  { id: 'decision-coin', name: 'Entscheidungsmünze', icon: '🪙' }
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

// ============ HTML Escape Helper (XSS Prevention) ============
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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
  
  // Fix 6: Apply background customization settings
  applyBackgroundSettings();
  
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

// Fix 6: Apply background customization settings (enhanced with zoom & position)
function applyBackgroundSettings() {
  // Check if page-specific background exists
  const currentPage = settings.pages[settings.currentPage];
  const pageBg = currentPage?.background;
  
  let size = settings.bgSize || 'cover';
  let repeat = settings.bgRepeat ? 'repeat' : 'no-repeat';
  let attachment = settings.bgFixed ? 'fixed' : 'scroll';
  
  // New Fix 6: Use zoom percentage for background-size if custom bg
  const zoom = pageBg?.bgZoom ?? settings.bgZoom ?? 100;
  const bgX = pageBg?.bgX ?? settings.bgX ?? 50;
  const bgY = pageBg?.bgY ?? settings.bgY ?? 50;
  
  // If using zoom slider, override size
  if (zoom !== 100 && settings.backgroundType !== 'theme') {
    size = `${zoom}%`;
  }
  
  const position = `${bgX}% ${bgY}%`;
  
  document.documentElement.style.setProperty('--bg-size', size);
  document.documentElement.style.setProperty('--bg-position', position);
  document.documentElement.style.setProperty('--bg-repeat', repeat);
  document.documentElement.style.setProperty('--bg-attachment', attachment);
  
  // Apply directly to body for custom backgrounds
  if (settings.backgroundType === 'custom' || settings.backgroundType === 'url') {
    document.body.style.backgroundSize = size;
    document.body.style.backgroundPosition = position;
  }
}

// New Fix 6: Background position controls
function moveBgPosition(direction) {
  const step = 5; // Move by 5% each time
  
  switch (direction) {
    case 'up':
      settings.bgY = Math.max(0, (settings.bgY || 50) - step);
      break;
    case 'down':
      settings.bgY = Math.min(100, (settings.bgY || 50) + step);
      break;
    case 'left':
      settings.bgX = Math.max(0, (settings.bgX || 50) - step);
      break;
    case 'right':
      settings.bgX = Math.min(100, (settings.bgX || 50) + step);
      break;
    case 'center':
      settings.bgX = 50;
      settings.bgY = 50;
      break;
  }
  
  // Update display
  const posVal = document.getElementById('bg-pos-val');
  if (posVal) posVal.textContent = `${settings.bgX}% ${settings.bgY}%`;
  
  applyBackgroundSettings();
  saveSettings();
}

function setBgZoom(zoom) {
  settings.bgZoom = zoom;
  applyBackgroundSettings();
  saveSettings();
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
            <div class="shortcut-item-wrapper" data-index="${index}" data-widget-id="${widget.id}">
              <div class="shortcut-item" data-index="${index}" data-widget-id="${widget.id}">
                <img src="${escapeHtml(shortcut.customIcon || getIconFromUrl(shortcut.url))}" class="shortcut-icon" alt="${escapeHtml(shortcut.name)}">
                <span class="shortcut-name">${escapeHtml(shortcut.name)}</span>
              </div>
              <button class="shortcut-settings-btn" data-index="${index}" data-widget-id="${widget.id}" title="Einstellungen">⚙️</button>
            </div>
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
      const quickNotes = widget.data?.quickNotes || [];
      content.innerHTML = `
        <h3>📝 Schnelle Notizen</h3>
        <div class="quick-note-container">
          <textarea class="quick-note-input" data-widget-id="${widget.id}" placeholder="Schnelle Notizen hier eingeben..."></textarea>
          <button class="add-quick-note-btn" data-widget-id="${widget.id}">+ Neue Notiz</button>
        </div>
        <div class="quick-notes-list" data-widget-id="${widget.id}">
          ${quickNotes.map((note, index) => `
            <div class="quick-note-item" data-index="${index}" data-widget-id="${widget.id}">
              <span class="quick-note-text">${note}</span>
              <button class="delete-quick-note-btn" data-index="${index}" data-widget-id="${widget.id}">✕</button>
            </div>
          `).join('')}
        </div>
        <div class="notes-list">
          ${notes.map((note, index) => `
            <div class="note-item" data-index="${index}" data-widget-id="${widget.id}">
              <div class="note-item-title">${note.title || 'Ohne Titel'}</div>
              <div class="note-item-preview">${note.content?.substring(0, 50) || '...'}</div>
            </div>
          `).join('')}
        </div>
        <button class="add-note-btn" data-widget-id="${widget.id}">+ Ausführliche Notiz</button>
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
      
    // Fix 7: Calendar Widget
    case 'calendar':
      div.classList.add('calendar-widget');
      content.innerHTML = `
        <div class="calendar-header">
          <button class="calendar-nav-btn" data-direction="prev" data-widget-id="${widget.id}">◀</button>
          <span class="calendar-month-year" id="calendar-title-${widget.id}"></span>
          <button class="calendar-nav-btn" data-direction="next" data-widget-id="${widget.id}">▶</button>
        </div>
        <div class="calendar-days-header">
          <span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span>
        </div>
        <div class="calendar-grid" id="calendar-grid-${widget.id}"></div>
        <div class="calendar-countdown" id="calendar-countdown-${widget.id}"></div>
        <button class="calendar-add-event-btn" data-widget-id="${widget.id}">+ Event</button>
      `;
      // Initialize calendar after element is appended
      setTimeout(() => {
        initCalendarWidget(widget.id, widget.data);
        renderEventCountdown(widget.id, widget.data);
      }, 0);
      break;
      
    // Distraction Counter Widget
    case 'distraction-counter':
      div.classList.add('distraction-counter-widget');
      content.innerHTML = `
        <h3>📊 Ablenkungszähler</h3>
        <div class="counter-stats">
          <div class="counter-stat">
            <div class="counter-value" id="tab-switches-${widget.id}">0</div>
            <div class="counter-label">Tab-Wechsel</div>
          </div>
          <div class="counter-stat">
            <div class="counter-value" id="new-tabs-${widget.id}">0</div>
            <div class="counter-label">Neue Tabs</div>
          </div>
          <div class="counter-stat">
            <div class="counter-value" id="clicks-${widget.id}">0</div>
            <div class="counter-label">Klicks (global)</div>
          </div>
        </div>
        <div class="counter-date" id="counter-date-${widget.id}">Heute</div>
      `;
      // Load distraction stats
      setTimeout(() => loadDistractionStats(widget.id), 0);
      break;
      
    // Decision Coin Widget
    case 'decision-coin':
      div.classList.add('decision-coin-widget');
      const coinSettings = widget.settings || {};
      const frontText = coinSettings.frontText || 'JA';
      const backText = coinSettings.backText || 'NEIN';
      content.innerHTML = `
        <div class="coin-container">
          <div class="coin" id="coin-${widget.id}" data-widget-id="${widget.id}">
            <div class="coin-face coin-front">${frontText}</div>
            <div class="coin-face coin-back">${backText}</div>
          </div>
        </div>
        <button class="flip-coin-btn" data-widget-id="${widget.id}">🪙 Münze werfen</button>
        <div class="coin-result" id="coin-result-${widget.id}"></div>
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

// ============ Weather Widget (Open-Meteo API) ============
async function loadWeather(widgetEl) {
  const lat = settings.weatherLat || 48.1374;
  const lon = settings.weatherLon || 11.5755;
  const city = settings.weatherCity || 'München';
  
  const iconEl = widgetEl.querySelector('.weather-icon');
  const tempEl = widgetEl.querySelector('.weather-temp');
  const descEl = widgetEl.querySelector('.weather-desc');
  const locEl = widgetEl.querySelector('.weather-location');
  
  try {
    const weather = await fetchWeather(lat, lon);
    
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

// Open-Meteo API - No API key required!
async function fetchWeather(lat, lon) {
  try {
    // Use user's timezone if available, otherwise UTC as universal fallback
    let timezone = 'UTC';
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch (e) {
      console.warn('Could not detect timezone, using UTC');
    }
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=${encodeURIComponent(timezone)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const current = data.current_weather;
    
    return {
      temp: Math.round(current.temperature),
      condition: getWeatherCondition(current.weathercode),
      icon: getWeatherIconFromCode(current.weathercode, current.is_day),
      windSpeed: current.windspeed,
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

// Open-Meteo Weather Codes to conditions
function getWeatherCondition(code) {
  const conditions = {
    0: 'Klar',
    1: 'Überwiegend klar',
    2: 'Teilweise bewölkt',
    3: 'Bewölkt',
    45: 'Neblig',
    48: 'Nebel mit Reifablagerung',
    51: 'Leichter Nieselregen',
    53: 'Mäßiger Nieselregen',
    55: 'Starker Nieselregen',
    61: 'Leichter Regen',
    63: 'Mäßiger Regen',
    65: 'Starker Regen',
    71: 'Leichter Schneefall',
    73: 'Mäßiger Schneefall',
    75: 'Starker Schneefall',
    77: 'Schneekörner',
    80: 'Leichte Regenschauer',
    81: 'Mäßige Regenschauer',
    82: 'Starke Regenschauer',
    85: 'Leichte Schneeschauer',
    86: 'Starke Schneeschauer',
    95: 'Gewitter',
    96: 'Gewitter mit leichtem Hagel',
    99: 'Gewitter mit starkem Hagel'
  };
  return conditions[code] || 'Unbekannt';
}

// Open-Meteo Weather Code to Icon
function getWeatherIconFromCode(code, isDay) {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 3) return isDay ? '⛅' : '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌧️';
  if (code <= 65) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '❄️';
  if (code >= 95) return '⛈️';
  return '🌤️';
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

// Fix 5: Updated copyPassword to show feedback in overlay instead of alert/notification
async function copyPassword(widgetId) {
  const pwInput = document.getElementById(`generated-pw-${widgetId}`);
  if (pwInput && pwInput.value) {
    try {
      await navigator.clipboard.writeText(pwInput.value);
      showPasswordFeedback(widgetId, '✅ Passwort kopiert!', 'success');
    } catch (error) {
      showPasswordFeedback(widgetId, '❌ Kopieren fehlgeschlagen', 'error');
    }
  }
}

// Fix 5: Show feedback message in the password widget
function showPasswordFeedback(widgetId, message, type) {
  const widget = document.getElementById(widgetId);
  if (!widget) return;
  
  // Remove existing feedback
  const existingFeedback = widget.querySelector('.copy-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }
  
  // Create new feedback element
  const feedback = document.createElement('div');
  feedback.className = `copy-feedback copy-feedback-${type}`;
  feedback.textContent = message;
  
  // Insert after password display
  const passwordDisplay = widget.querySelector('.password-display');
  if (passwordDisplay) {
    passwordDisplay.insertAdjacentElement('afterend', feedback);
  }
  
  // Fix 2: Auto-remove after 2 seconds with smooth fade-out
  setTimeout(() => {
    feedback.classList.add('fade-out');
    setTimeout(() => feedback.remove(), 500);
  }, 2000);
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
  
  // Fix 6: Background customization settings initialisieren
  const bgSize = document.getElementById('bg-size');
  const bgRepeat = document.getElementById('bg-repeat');
  const bgFixed = document.getElementById('bg-fixed');
  
  if (bgSize) bgSize.value = settings.bgSize || 'cover';
  if (bgRepeat) bgRepeat.checked = settings.bgRepeat || false;
  if (bgFixed) bgFixed.checked = settings.bgFixed !== false;
  
  // New Fix 6: Background zoom and position
  const bgZoomSlider = document.getElementById('bg-zoom');
  const bgZoomVal = document.getElementById('bg-zoom-val');
  const bgPosVal = document.getElementById('bg-pos-val');
  
  if (bgZoomSlider) bgZoomSlider.value = settings.bgZoom || 100;
  if (bgZoomVal) bgZoomVal.textContent = `${settings.bgZoom || 100}%`;
  if (bgPosVal) bgPosVal.textContent = `${settings.bgX || 50}% ${settings.bgY || 50}%`;
  
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
  const weatherCity = document.getElementById('weather-city');
  const weatherLat = document.getElementById('weather-lat');
  const weatherLon = document.getElementById('weather-lon');
  
  if (weatherCity) weatherCity.value = settings.weatherCity || 'München';
  if (weatherLat) weatherLat.value = settings.weatherLat || 48.1374;
  if (weatherLon) weatherLon.value = settings.weatherLon || 11.5755;
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
    // Resize only allowed in edit mode (as per requirement #2)
    if (!document.body.classList.contains('edit-mode')) return;
    
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

// Helper function to retrieve and handle shortcut click from wrapper
function handleShortcutClickFromWrapper(wrapper) {
  const widgetId = wrapper.dataset.widgetId;
  const index = parseInt(wrapper.dataset.index);
  
  // Get shortcut data from settings
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === widgetId);
  const shortcut = widget?.data?.shortcuts?.[index];
  
  if (shortcut) {
    // Create a fake event object for handleShortcutClick
    const fakeEvent = { preventDefault: () => {}, currentTarget: wrapper };
    handleShortcutClick(fakeEvent, shortcut.url, shortcut);
  }
}

function openShortcutModal(widgetId, index = -1) {
  currentShortcutWidgetId = widgetId;
  currentShortcutIndex = index;
  
  const titleEl = document.getElementById('shortcut-modal-title');
  const nameInput = document.getElementById('shortcut-name');
  const urlInput = document.getElementById('shortcut-url');
  const indexInput = document.getElementById('shortcut-index');
  const deleteBtn = document.getElementById('delete-shortcut-btn');
  const iconPreview = document.getElementById('shortcut-icon-preview');
  const customIconInput = document.getElementById('shortcut-custom-icon');
  const scriptEnabled = document.getElementById('shortcut-custom-script-enabled');
  const scriptSection = document.getElementById('shortcut-custom-script-section');
  const scriptTextarea = document.getElementById('shortcut-custom-script');
  
  if (index >= 0) {
    // Bearbeiten
    const currentPage = settings.pages[settings.currentPage];
    const widget = currentPage?.widgets.find(w => w.id === widgetId);
    const shortcut = widget?.data?.shortcuts?.[index];
    
    if (shortcut) {
      titleEl.textContent = 'Shortcut bearbeiten';
      nameInput.value = shortcut.name;
      urlInput.value = shortcut.url;
      // Fix 4: Load custom icon if exists
      const iconSrc = shortcut.customIcon || getIconFromUrl(shortcut.url);
      if (iconPreview) iconPreview.src = iconSrc;
      if (customIconInput) customIconInput.value = shortcut.customIcon || '';
      
      // Load custom script settings
      if (scriptEnabled) scriptEnabled.checked = !!shortcut.customScript;
      if (scriptTextarea) scriptTextarea.value = shortcut.customScript || '';
      if (scriptSection) scriptSection.classList.toggle('hidden', !shortcut.customScript);
      
      // Load script mode
      if (shortcut.scriptMode) {
        const modeRadio = document.querySelector(`input[name="script-mode"][value="${shortcut.scriptMode}"]`);
        if (modeRadio) modeRadio.checked = true;
      }
      
      deleteBtn.classList.remove('hidden');
    }
  } else {
    // Neu
    titleEl.textContent = 'Shortcut hinzufügen';
    nameInput.value = '';
    urlInput.value = '';
    if (iconPreview) iconPreview.src = '';
    if (customIconInput) customIconInput.value = '';
    if (scriptEnabled) scriptEnabled.checked = false;
    if (scriptTextarea) scriptTextarea.value = '';
    if (scriptSection) scriptSection.classList.add('hidden');
    deleteBtn.classList.add('hidden');
  }
  
  indexInput.value = index;
  openModal('shortcut-modal');
}

function saveShortcut(e) {
  e.preventDefault();
  
  const name = document.getElementById('shortcut-name').value.trim();
  let url = document.getElementById('shortcut-url').value.trim();
  const customIcon = document.getElementById('shortcut-custom-icon')?.value || '';
  const scriptEnabled = document.getElementById('shortcut-custom-script-enabled')?.checked;
  const customScript = scriptEnabled ? document.getElementById('shortcut-custom-script')?.value || '' : '';
  const scriptMode = scriptEnabled ? document.querySelector('input[name="script-mode"]:checked')?.value || 'before' : '';
  
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
    
    // Fix 4: Include custom icon and script in shortcut data
    const shortcutData = { name, url };
    if (customIcon) {
      shortcutData.customIcon = customIcon;
    }
    if (customScript) {
      shortcutData.customScript = customScript;
      shortcutData.scriptMode = scriptMode;
    }
    
    if (currentShortcutIndex >= 0) {
      widget.data.shortcuts[currentShortcutIndex] = shortcutData;
    } else {
      widget.data.shortcuts.push(shortcutData);
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
async function handleShortcutClick(e, url, shortcut) {
  // Im Edit-Modus: Bearbeiten öffnen
  if (settings.editMode) {
    e.preventDefault();
    const item = e.currentTarget;
    const widgetId = item.dataset.widgetId;
    const index = parseInt(item.dataset.index);
    openShortcutModal(widgetId, index);
    return;
  }
  
  // Custom Script ausführen wenn vorhanden
  if (shortcut && shortcut.customScript && shortcut.scriptMode) {
    if (shortcut.scriptMode === 'before') {
      // Script BEFORE navigation
      e.preventDefault();
      const success = await executeCustomScript(shortcut.customScript);
      if (success) {
        window.location.href = url;
      }
      return;
    } else if (shortcut.scriptMode === 'newtab') {
      // Script in new tab before opening link
      e.preventDefault();
      await executeCustomScript(shortcut.customScript);
      window.open(url, '_blank');
      return;
    } else if (shortcut.scriptMode === 'only') {
      // Only execute script, no navigation
      e.preventDefault();
      await executeCustomScript(shortcut.customScript);
      return;
    }
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

// Execute custom script (sandboxed evaluation)
// WARNING: This is still not completely secure. Use at own risk.
// Consider implementing Web Workers or iframe sandboxes for better security.
async function executeCustomScript(scriptCode) {
  try {
    // Validate script is not malicious
    if (!scriptCode || scriptCode.trim().length === 0) {
      return true;
    }
    
    // Show warning to user about executing custom scripts
    console.warn('⚠️ Executing custom user script. This feature has inherent security risks.');
    
    // Create a restricted context with only safe APIs
    const safeContext = {
      console: console,
      alert: alert,
      confirm: confirm,
      prompt: prompt,
      Math: Math,
      Date: Date,
      JSON: JSON,
      // Add more safe APIs as needed
      // Explicitly exclude: window, document, chrome, etc.
    };
    
    // Use Function constructor with restricted scope
    // Note: This provides limited sandboxing. For production, use Web Workers or iframe sandboxes.
    const scriptFunction = new Function(
      'context',
      `
      'use strict';
      const {console, alert, confirm, prompt, Math, Date, JSON} = context;
      ${scriptCode}
      `
    );
    
    await scriptFunction(safeContext);
    return true;
  } catch (error) {
    console.error('Error executing custom script:', error);
    alert(`Fehler beim Ausführen des Skripts:\n${error.message}\n\n⚠️ SICHERHEITSHINWEIS: Benutzerdefinierte Skripte sind potenziell unsicher.\nFühren Sie nur vertrauenswürdige Skripte aus, die Sie selbst geschrieben oder geprüft haben.`);
    return false;
  }
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

// ============ Fix 1: Quick Notes Functions (Always Editable) ============
function addQuickNote(widgetId) {
  const textarea = document.querySelector(`.quick-note-input[data-widget-id="${widgetId}"]`);
  if (!textarea) return;
  
  const text = textarea.value.trim();
  if (!text) return;
  
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === widgetId);
  
  if (widget) {
    widget.data = widget.data || {};
    widget.data.quickNotes = widget.data.quickNotes || [];
    widget.data.quickNotes.unshift(text); // Add to beginning
    
    saveSettings();
    renderWidgets();
  }
}

function deleteQuickNote(widgetId, index) {
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === widgetId);
  
  if (widget && widget.data?.quickNotes && index >= 0) {
    widget.data.quickNotes.splice(index, 1);
    saveSettings();
    renderWidgets();
  }
}

// ============ Fix 7: Calendar Widget ============
let calendarStates = {}; // Track displayed month/year per widget

function initCalendarWidget(widgetId, data) {
  const now = new Date();
  calendarStates[widgetId] = {
    year: now.getFullYear(),
    month: now.getMonth(),
    viewMode: 'month' // Fix 4: 'month', 'year', or 'decade'
  };
  
  renderCalendar(widgetId, data);
}

function renderCalendar(widgetId, data) {
  const state = calendarStates[widgetId];
  if (!state) return;
  
  const { viewMode } = state;
  
  // Fix 4: Render based on view mode
  switch (viewMode) {
    case 'year':
      renderYearView(widgetId, data);
      break;
    case 'decade':
      renderDecadeView(widgetId, data);
      break;
    default:
      renderMonthView(widgetId, data);
  }
}

// Fix 4: Month view (original calendar)
function renderMonthView(widgetId, data) {
  const state = calendarStates[widgetId];
  const { year, month } = state;
  const grid = document.getElementById(`calendar-grid-${widgetId}`);
  const title = document.getElementById(`calendar-title-${widgetId}`);
  
  if (!grid || !title) return;
  
  // Update title - click to go to year view
  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  title.innerHTML = `<span class="calendar-title-clickable" data-widget-id="${widgetId}" data-action="year">${monthNames[month]} ${year}</span>`;
  
  // Get first day of month and total days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();
  
  // Get the day of week for the first day (0 = Sunday, adjust for Monday start)
  let startDayOfWeek = firstDay.getDay();
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Convert to Monday start
  
  // Get events
  const events = data?.events || [];
  const today = new Date();
  
  // Build calendar grid
  let html = '';
  
  // Empty cells before first day
  for (let i = 0; i < startDayOfWeek; i++) {
    html += '<div class="calendar-day empty"></div>';
  }
  
  // Days of the month
  for (let day = 1; day <= totalDays; day++) {
    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Fix 3: Check for events with extended repeat options
    const dayEvents = getEventsForDate(events, dateStr, day, month, year);
    
    const hasEvents = dayEvents.length > 0;
    const eventColors = dayEvents.map(e => e.color || '#667eea').slice(0, 3);
    
    html += `
      <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}" 
           data-date="${dateStr}" data-widget-id="${widgetId}">
        <span class="day-number">${day}</span>
        ${hasEvents ? `<div class="event-indicators">${eventColors.map(c => `<span class="event-dot" style="background: ${c}"></span>`).join('')}</div>` : ''}
      </div>
    `;
  }
  
  grid.innerHTML = html;
}

// Fix 4: Year view - 12 months grid
function renderYearView(widgetId, data) {
  const state = calendarStates[widgetId];
  const { year } = state;
  const grid = document.getElementById(`calendar-grid-${widgetId}`);
  const title = document.getElementById(`calendar-title-${widgetId}`);
  
  if (!grid || !title) return;
  
  // Click to go to decade view
  title.innerHTML = `<span class="calendar-title-clickable" data-widget-id="${widgetId}" data-action="decade">${year}</span>`;
  
  const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  const today = new Date();
  
  let html = '';
  for (let m = 0; m < 12; m++) {
    const isCurrentMonth = m === today.getMonth() && year === today.getFullYear();
    html += `
      <div class="calendar-month-cell ${isCurrentMonth ? 'current' : ''}" 
           data-month="${m}" data-widget-id="${widgetId}">
        ${monthNames[m]}
      </div>
    `;
  }
  
  grid.innerHTML = html;
  grid.classList.add('year-view');
}

// Fix 4: Decade view - 10 years grid
function renderDecadeView(widgetId, data) {
  const state = calendarStates[widgetId];
  const { year } = state;
  const grid = document.getElementById(`calendar-grid-${widgetId}`);
  const title = document.getElementById(`calendar-title-${widgetId}`);
  
  if (!grid || !title) return;
  
  const startYear = Math.floor(year / 10) * 10;
  title.innerHTML = `<span class="calendar-title-text">${startYear} - ${startYear + 9}</span>`;
  
  const today = new Date();
  
  let html = '';
  for (let y = startYear; y < startYear + 10; y++) {
    const isCurrentYear = y === today.getFullYear();
    html += `
      <div class="calendar-year-cell ${isCurrentYear ? 'current' : ''}" 
           data-year="${y}" data-widget-id="${widgetId}">
        ${y}
      </div>
    `;
  }
  
  grid.innerHTML = html;
  grid.classList.add('decade-view');
}

// Fix 3: Extended repeat logic for events
function getEventsForDate(events, dateStr, day, month, year) {
  const checkDate = new Date(year, month, day);
  
  return events.filter(e => {
    if (e.date === dateStr) return true;
    
    const eventDate = new Date(e.date);
    const eventDay = eventDate.getDate();
    const eventMonth = eventDate.getMonth();
    const eventYear = eventDate.getFullYear();
    
    switch (e.repeat) {
      case 'daily':
        return checkDate >= eventDate;
      case 'weekly':
        if (checkDate < eventDate) return false;
        const daysDiff = Math.floor((checkDate - eventDate) / (1000 * 60 * 60 * 24));
        return daysDiff % 7 === 0;
      case 'monthly':
        if (checkDate < eventDate) return false;
        return eventDay === day;
      case 'yearly':
        if (checkDate < eventDate) return false;
        return eventDay === day && eventMonth === month;
      default:
        return false;
    }
  });
}

function navigateCalendar(widgetId, direction) {
  const state = calendarStates[widgetId];
  if (!state) return;
  
  // Fix 4: Navigate based on view mode
  if (state.viewMode === 'decade') {
    if (direction === 'prev') {
      state.year -= 10;
    } else {
      state.year += 10;
    }
  } else if (state.viewMode === 'year') {
    if (direction === 'prev') {
      state.year--;
    } else {
      state.year++;
    }
  } else {
    if (direction === 'prev') {
      state.month--;
      if (state.month < 0) {
        state.month = 11;
        state.year--;
      }
    } else {
      state.month++;
      if (state.month > 11) {
        state.month = 0;
        state.year++;
      }
    }
  }
  
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === widgetId);
  renderCalendar(widgetId, widget?.data);
}

// Fix 4: Calendar view mode switching
function switchCalendarViewMode(widgetId, action) {
  const state = calendarStates[widgetId];
  if (!state) return;
  
  if (action === 'year') {
    state.viewMode = 'year';
  } else if (action === 'decade') {
    state.viewMode = 'decade';
  }
  
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === widgetId);
  renderCalendar(widgetId, widget?.data);
}

function selectCalendarMonth(widgetId, month) {
  const state = calendarStates[widgetId];
  if (!state) return;
  
  state.month = month;
  state.viewMode = 'month';
  
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === widgetId);
  renderCalendar(widgetId, widget?.data);
}

function selectCalendarYear(widgetId, year) {
  const state = calendarStates[widgetId];
  if (!state) return;
  
  state.year = year;
  state.viewMode = 'year';
  
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === widgetId);
  renderCalendar(widgetId, widget?.data);
}

// Calendar Event Modal
let currentCalendarWidgetId = null;
let currentCalendarDate = null;
let currentCalendarEventId = null;

function openCalendarEventModal(widgetId, date, eventId = null) {
  currentCalendarWidgetId = widgetId;
  currentCalendarDate = date;
  currentCalendarEventId = eventId;
  
  const modal = document.getElementById('calendar-event-modal');
  if (!modal) return;
  
  const titleInput = document.getElementById('calendar-event-title');
  const dateInput = document.getElementById('calendar-event-date');
  const timeInput = document.getElementById('calendar-event-time');
  const descInput = document.getElementById('calendar-event-desc');
  const repeatSelect = document.getElementById('calendar-event-repeat');
  const colorInput = document.getElementById('calendar-event-color');
  const deleteBtn = document.getElementById('delete-calendar-event-btn');
  const modalTitle = document.getElementById('calendar-event-modal-title');
  
  // Reset form
  if (titleInput) titleInput.value = '';
  if (dateInput) dateInput.value = date || '';
  if (timeInput) timeInput.value = '';
  if (descInput) descInput.value = '';
  if (repeatSelect) repeatSelect.value = 'none';
  if (colorInput) colorInput.value = '#667eea';
  
  if (eventId) {
    // Edit existing event
    if (modalTitle) modalTitle.textContent = 'Event bearbeiten';
    deleteBtn?.classList.remove('hidden');
    
    const currentPage = settings.pages[settings.currentPage];
    const widget = currentPage?.widgets.find(w => w.id === widgetId);
    const event = widget?.data?.events?.find(e => e.id === eventId);
    
    if (event) {
      if (titleInput) titleInput.value = event.title || '';
      if (dateInput) dateInput.value = event.date || '';
      if (timeInput) timeInput.value = event.time || '';
      if (descInput) descInput.value = event.description || '';
      if (repeatSelect) repeatSelect.value = event.repeat || 'none';
      if (colorInput) colorInput.value = event.color || '#667eea';
    }
  } else {
    // New event
    if (modalTitle) modalTitle.textContent = 'Event hinzufügen';
    deleteBtn?.classList.add('hidden');
  }
  
  openModal('calendar-event-modal');
}

function saveCalendarEvent() {
  const title = document.getElementById('calendar-event-title')?.value.trim();
  const date = document.getElementById('calendar-event-date')?.value;
  const time = document.getElementById('calendar-event-time')?.value || '';
  const description = document.getElementById('calendar-event-desc')?.value || '';
  const repeatValue = document.getElementById('calendar-event-repeat')?.value;
  const repeat = repeatValue !== 'none' ? repeatValue : null;
  const color = document.getElementById('calendar-event-color')?.value || '#667eea';
  
  if (!title || !date) return;
  
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === currentCalendarWidgetId);
  
  if (widget) {
    widget.data = widget.data || {};
    widget.data.events = widget.data.events || [];
    
    const eventData = {
      id: currentCalendarEventId || `event-${Date.now()}`,
      title,
      date,
      time,
      description,
      repeat,
      color
    };
    
    if (currentCalendarEventId) {
      // Update existing event
      const index = widget.data.events.findIndex(e => e.id === currentCalendarEventId);
      if (index >= 0) {
        widget.data.events[index] = eventData;
      }
    } else {
      // Add new event
      widget.data.events.push(eventData);
    }
    
    saveSettings();
    renderCalendar(currentCalendarWidgetId, widget.data);
    renderEventCountdown(currentCalendarWidgetId, widget.data);
  }
  
  closeModal('calendar-event-modal');
}

function deleteCalendarEvent() {
  if (!currentCalendarEventId) return;
  
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === currentCalendarWidgetId);
  
  if (widget && widget.data?.events) {
    widget.data.events = widget.data.events.filter(e => e.id !== currentCalendarEventId);
    saveSettings();
    renderCalendar(currentCalendarWidgetId, widget.data);
    renderEventCountdown(currentCalendarWidgetId, widget.data);
  }
  
  closeModal('calendar-event-modal');
}

function showDayEvents(widgetId, date) {
  const currentPage = settings.pages[settings.currentPage];
  const widget = currentPage?.widgets.find(w => w.id === widgetId);
  const events = widget?.data?.events || [];
  
  // Get events for this date (including yearly recurring)
  const dateObj = new Date(date);
  const dayEvents = events.filter(e => {
    if (e.date === date) return true;
    if (e.repeat === 'yearly') {
      const eventDate = new Date(e.date);
      return eventDate.getDate() === dateObj.getDate() && eventDate.getMonth() === dateObj.getMonth();
    }
    return false;
  });
  
  if (dayEvents.length === 0) {
    // No events, open add event modal
    openCalendarEventModal(widgetId, date);
    return;
  }
  
  // Show events list modal
  const modal = document.getElementById('calendar-day-events-modal');
  const list = document.getElementById('calendar-day-events-list');
  const dateDisplay = document.getElementById('calendar-day-events-date');
  
  if (!modal || !list) return;
  
  currentCalendarWidgetId = widgetId;
  currentCalendarDate = date;
  
  // Format date for display
  const displayDate = new Date(date).toLocaleDateString('de-DE', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  if (dateDisplay) dateDisplay.textContent = displayDate;
  
  list.innerHTML = dayEvents.map(event => `
    <div class="calendar-event-item" data-event-id="${event.id}">
      <div class="event-color-indicator" style="background: ${event.color || '#667eea'}"></div>
      <div class="event-details">
        <div class="event-title">${event.title}${event.repeat === 'yearly' ? ' 🔄' : ''}</div>
        ${event.time ? `<div class="event-time">🕐 ${event.time}</div>` : ''}
        ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
      </div>
      <button class="event-edit-btn" data-event-id="${event.id}" data-widget-id="${widgetId}">✏️</button>
    </div>
  `).join('');
  
  openModal('calendar-day-events-modal');
}

// Render Event Countdown
function renderEventCountdown(widgetId, data) {
  const container = document.getElementById(`calendar-countdown-${widgetId}`);
  if (!container) return;
  
  const events = data?.events || [];
  if (events.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get upcoming events with countdown
  const upcomingEvents = events
    .map(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      const diffTime = eventDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...event, diffDays };
    })
    .filter(event => event.diffDays >= 0 && event.diffDays <= 30) // Next 30 days
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 5); // Max 5 events
  
  if (upcomingEvents.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = `
    <div class="countdown-section">
      <h4>Anstehende Events</h4>
      ${upcomingEvents.map(event => {
        let badge = '';
        let badgeClass = '';
        if (event.diffDays === 0) {
          badge = '🔴 HEUTE';
          badgeClass = 'today';
        } else if (event.diffDays === 1) {
          badge = '🟡 Morgen';
          badgeClass = 'tomorrow';
        } else {
          badge = `🟢 in ${event.diffDays} Tagen`;
          badgeClass = 'upcoming';
        }
        
        return `
          <div class="countdown-item countdown-${badgeClass}">
            <div class="countdown-badge">${badge}</div>
            <div class="countdown-title">${event.title}</div>
            ${event.time ? `<div class="countdown-time">🕐 ${event.time}</div>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ============ Distraction Counter Widget ============
async function loadDistractionStats(widgetId) {
  // Listen for updates from service worker
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'DISTRACTION_STATS_UPDATE') {
        updateDistractionDisplay(widgetId, message.stats);
      }
    });
    
    // Request initial stats
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_DISTRACTION_STATS' });
      if (response && response.stats) {
        updateDistractionDisplay(widgetId, response.stats);
      }
    } catch (error) {
      console.error('Error loading distraction stats:', error);
    }
  }
}

function updateDistractionDisplay(widgetId, stats) {
  const tabSwitchesEl = document.getElementById(`tab-switches-${widgetId}`);
  const newTabsEl = document.getElementById(`new-tabs-${widgetId}`);
  const clicksEl = document.getElementById(`clicks-${widgetId}`);
  const dateEl = document.getElementById(`counter-date-${widgetId}`);
  
  if (tabSwitchesEl) tabSwitchesEl.textContent = stats.tabSwitches || 0;
  if (newTabsEl) newTabsEl.textContent = stats.newTabs || 0;
  if (clicksEl) clicksEl.textContent = stats.clicks || 0;
  
  if (dateEl && stats.date) {
    const today = new Date().toISOString().split('T')[0];
    dateEl.textContent = stats.date === today ? 'Heute' : stats.date;
  }
}

// ============ Decision Coin Widget ============
function flipCoin(widgetId) {
  const coin = document.getElementById(`coin-${widgetId}`);
  const result = document.getElementById(`coin-result-${widgetId}`);
  
  if (!coin) return;
  
  // Random flip
  const isHeads = Math.random() < 0.5;
  const rotations = 3 + Math.floor(Math.random() * 3); // 3-5 full rotations
  
  // Remove previous classes
  coin.classList.remove('flipping', 'show-front', 'show-back');
  
  // Start flip animation
  coin.classList.add('flipping');
  coin.style.setProperty('--rotations', rotations);
  
  setTimeout(() => {
    coin.classList.remove('flipping');
    if (isHeads) {
      coin.classList.add('show-front');
      if (result) {
        const currentPage = settings.pages[settings.currentPage];
        const widget = currentPage?.widgets.find(w => w.id === widgetId);
        const frontText = widget?.settings?.frontText || 'JA';
        result.textContent = `✨ ${frontText}`;
        result.className = 'coin-result result-front';
      }
    } else {
      coin.classList.add('show-back');
      if (result) {
        const currentPage = settings.pages[settings.currentPage];
        const widget = currentPage?.widgets.find(w => w.id === widgetId);
        const backText = widget?.settings?.backText || 'NEIN';
        result.textContent = `✨ ${backText}`;
        result.className = 'coin-result result-back';
      }
    }
  }, 2000); // Match animation duration
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
  // Fix 7: Calendar modal close buttons
  document.getElementById('calendar-event-modal-close')?.addEventListener('click', () => closeModal('calendar-event-modal'));
  document.getElementById('calendar-day-events-modal-close')?.addEventListener('click', () => closeModal('calendar-day-events-modal'));
  
  // Fix 7: Calendar event form
  document.getElementById('calendar-event-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    saveCalendarEvent();
  });
  document.getElementById('delete-calendar-event-btn')?.addEventListener('click', deleteCalendarEvent);
  document.getElementById('calendar-add-new-event-btn')?.addEventListener('click', () => {
    closeModal('calendar-day-events-modal');
    openCalendarEventModal(currentCalendarWidgetId, currentCalendarDate);
  });
  
  // Shortcut Form
  document.getElementById('shortcut-form')?.addEventListener('submit', saveShortcut);
  document.getElementById('delete-shortcut-btn')?.addEventListener('click', deleteShortcut);
  
  // Fix 4: Shortcut icon customization
  document.getElementById('shortcut-use-favicon-btn')?.addEventListener('click', () => {
    const url = document.getElementById('shortcut-url')?.value;
    if (url) {
      const faviconUrl = getIconFromUrl(url);
      document.getElementById('shortcut-icon-preview').src = faviconUrl;
      document.getElementById('shortcut-custom-icon').value = ''; // Clear custom icon to use favicon
    }
  });
  
  document.getElementById('shortcut-upload-icon-btn')?.addEventListener('click', () => {
    document.getElementById('shortcut-icon-upload')?.click();
  });
  
  document.getElementById('shortcut-icon-upload')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        document.getElementById('shortcut-icon-preview').src = event.target.result;
        document.getElementById('shortcut-custom-icon').value = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Update icon preview when URL changes
  document.getElementById('shortcut-url')?.addEventListener('change', (e) => {
    const url = e.target.value;
    const customIcon = document.getElementById('shortcut-custom-icon')?.value;
    if (url && !customIcon) {
      document.getElementById('shortcut-icon-preview').src = getIconFromUrl(url);
    }
  });
  
  // Custom script toggle
  document.getElementById('shortcut-custom-script-enabled')?.addEventListener('change', (e) => {
    const section = document.getElementById('shortcut-custom-script-section');
    if (section) {
      section.classList.toggle('hidden', !e.target.checked);
    }
  });
  
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
  
  // Fix 6: Background customization settings
  document.getElementById('bg-size')?.addEventListener('change', (e) => {
    settings.bgSize = e.target.value;
    saveSettings();
    applyBackgroundSettings();
  });
  
  document.getElementById('bg-repeat')?.addEventListener('change', (e) => {
    settings.bgRepeat = e.target.checked;
    saveSettings();
    applyBackgroundSettings();
  });
  
  document.getElementById('bg-fixed')?.addEventListener('change', (e) => {
    settings.bgFixed = e.target.checked;
    saveSettings();
    applyBackgroundSettings();
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
    const city = document.getElementById('weather-city')?.value || 'München';
    let lat = parseFloat(document.getElementById('weather-lat')?.value);
    let lon = parseFloat(document.getElementById('weather-lon')?.value);
    
    // Validate coordinates
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      alert('Ungültige Koordinaten. Breitengrad muss zwischen -90 und 90 liegen, Längengrad zwischen -180 und 180.');
      return;
    }
    
    settings.weatherCity = city;
    settings.weatherLat = lat;
    settings.weatherLon = lon;
    await saveSettings();
    
    const status = document.getElementById('weather-status');
    if (status) {
      status.textContent = 'Teste...';
      status.style.color = 'inherit';
    }
    
    const weather = await fetchWeather(lat, lon);
    
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
  
  // Fix 7: Export/Import ALL Data
  document.getElementById('export-all-btn')?.addEventListener('click', exportAllData);
  document.getElementById('import-all-btn')?.addEventListener('click', () => {
    document.getElementById('import-all-file')?.click();
  });
  document.getElementById('import-all-file')?.addEventListener('change', importAllData);
  document.getElementById('reset-settings-btn')?.addEventListener('click', resetSettings);
  
  // Fix 6: Background zoom slider
  document.getElementById('bg-zoom')?.addEventListener('input', (e) => {
    const zoom = parseInt(e.target.value);
    document.getElementById('bg-zoom-val').textContent = `${zoom}%`;
    setBgZoom(zoom);
  });
  
  // Fix 6: Background position controls
  document.getElementById('bg-up')?.addEventListener('click', () => moveBgPosition('up'));
  document.getElementById('bg-down')?.addEventListener('click', () => moveBgPosition('down'));
  document.getElementById('bg-left')?.addEventListener('click', () => moveBgPosition('left'));
  document.getElementById('bg-right')?.addEventListener('click', () => moveBgPosition('right'));
  document.getElementById('bg-center')?.addEventListener('click', () => moveBgPosition('center'));
  
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
    
    // Fix 4: Shortcut Settings Button (gear icon)
    const shortcutSettingsBtn = e.target.closest('.shortcut-settings-btn');
    if (shortcutSettingsBtn) {
      e.preventDefault();
      e.stopPropagation();
      const widgetId = shortcutSettingsBtn.dataset.widgetId;
      const index = parseInt(shortcutSettingsBtn.dataset.index);
      openShortcutModal(widgetId, index);
      return;
    }
    
    // Shortcut Click - Handle wrapper click (retrieve shortcut data by index)
    const shortcutWrapper = e.target.closest('.shortcut-item-wrapper');
    if (shortcutWrapper && !e.target.closest('.shortcut-settings-btn')) {
      e.preventDefault();
      handleShortcutClickFromWrapper(shortcutWrapper);
      return;
    }
    
    // Legacy shortcut item click (for backwards compatibility)
    const shortcutItem = e.target.closest('.shortcut-item');
    if (shortcutItem && !shortcutWrapper) {
      const wrapper = shortcutItem.closest('.shortcut-item-wrapper');
      if (wrapper) {
        e.preventDefault();
        handleShortcutClickFromWrapper(wrapper);
      }
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
    
    // Fix 1: Quick note add button
    const addQuickNoteBtn = e.target.closest('.add-quick-note-btn');
    if (addQuickNoteBtn) {
      addQuickNote(addQuickNoteBtn.dataset.widgetId);
      return;
    }
    
    // Fix 1: Delete quick note button
    const deleteQuickNoteBtn = e.target.closest('.delete-quick-note-btn');
    if (deleteQuickNoteBtn) {
      deleteQuickNote(deleteQuickNoteBtn.dataset.widgetId, parseInt(deleteQuickNoteBtn.dataset.index));
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
    
    // Fix 7: Calendar navigation buttons
    const calendarNavBtn = e.target.closest('.calendar-nav-btn');
    if (calendarNavBtn) {
      navigateCalendar(calendarNavBtn.dataset.widgetId, calendarNavBtn.dataset.direction);
      return;
    }
    
    // Fix 4: Calendar title click for view switching
    const calendarTitleClickable = e.target.closest('.calendar-title-clickable');
    if (calendarTitleClickable) {
      switchCalendarViewMode(calendarTitleClickable.dataset.widgetId, calendarTitleClickable.dataset.action);
      return;
    }
    
    // Fix 4: Calendar month cell click (year view)
    const calendarMonthCell = e.target.closest('.calendar-month-cell');
    if (calendarMonthCell) {
      selectCalendarMonth(calendarMonthCell.dataset.widgetId, parseInt(calendarMonthCell.dataset.month));
      return;
    }
    
    // Fix 4: Calendar year cell click (decade view)
    const calendarYearCell = e.target.closest('.calendar-year-cell');
    if (calendarYearCell) {
      selectCalendarYear(calendarYearCell.dataset.widgetId, parseInt(calendarYearCell.dataset.year));
      return;
    }
    
    // Fix 7: Calendar day click
    const calendarDay = e.target.closest('.calendar-day:not(.empty)');
    if (calendarDay) {
      showDayEvents(calendarDay.dataset.widgetId, calendarDay.dataset.date);
      return;
    }
    
    // Fix 7: Calendar add event button
    const calendarAddBtn = e.target.closest('.calendar-add-event-btn');
    if (calendarAddBtn) {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      openCalendarEventModal(calendarAddBtn.dataset.widgetId, dateStr);
      return;
    }
    
    // Flip Coin Button
    const flipCoinBtn = e.target.closest('.flip-coin-btn');
    if (flipCoinBtn) {
      flipCoin(flipCoinBtn.dataset.widgetId);
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
  
  // Fix 1: Quick note input - Enter to add, prevent dragging
  document.getElementById('widget-container')?.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('quick-note-input') && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addQuickNote(e.target.dataset.widgetId);
    }
  });
  
  // Fix 1: Prevent dragging when interacting with quick notes input
  document.getElementById('widget-container')?.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('quick-note-input')) {
      e.stopPropagation();
    }
  });
  
  // Fix 7: Calendar day events modal event delegation
  document.getElementById('calendar-day-events-modal')?.addEventListener('click', (e) => {
    const eventEditBtn = e.target.closest('.event-edit-btn');
    if (eventEditBtn) {
      closeModal('calendar-day-events-modal');
      openCalendarEventModal(eventEditBtn.dataset.widgetId, currentCalendarDate, eventEditBtn.dataset.eventId);
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

// ============ Fix 7: Export/Import ALL Data ============
async function exportAllData() {
  try {
    let allData;
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      allData = await chrome.storage.local.get(null); // Get EVERYTHING
    } else {
      // Fallback for local development
      allData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          allData[key] = JSON.parse(localStorage.getItem(key));
        } catch {
          allData[key] = localStorage.getItem(key);
        }
      }
    }
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        ...allData,
        // Explicitly include common data keys
        [STORAGE_KEY]: settings,
        backgroundData: allData.backgroundData || settings.customBackground,
        bgX: settings.bgX,
        bgY: settings.bgY,
        bgZoom: settings.bgZoom
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chrome-ex-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Alle Daten wurden erfolgreich exportiert!');
  } catch (error) {
    alert('Fehler beim Exportieren: ' + error.message);
  }
}

async function importAllData(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const imported = JSON.parse(text);
    
    if (!imported.data) {
      // Legacy format - just settings
      settings = { ...DEFAULT_SETTINGS, ...imported };
      await saveSettings();
    } else {
      // New format with all data
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set(imported.data);
      } else {
        for (const [key, value] of Object.entries(imported.data)) {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      }
      
      // Update settings from imported data
      if (imported.data[STORAGE_KEY]) {
        settings = { ...DEFAULT_SETTINGS, ...imported.data[STORAGE_KEY] };
      }
    }
    
    // Reload everything
    initTheme();
    initFont();
    initBackground();
    initPageTabs();
    renderWidgets();
    updateEditModeUI();
    
    alert('Alle Daten wurden erfolgreich importiert!');
  } catch (error) {
    alert('Fehler beim Importieren: ' + error.message);
  }
}

// Legacy export/import for backwards compatibility
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
