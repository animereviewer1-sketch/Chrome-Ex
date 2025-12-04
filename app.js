/**
 * Custom New Tab - Hauptskript
 * Alle Funktionen modular und kommentiert (Deutsch)
 * Manifest V3 konform
 */

// ===================================
// Globale Variablen und Initialisierung
// ===================================

// Standard-Einstellungen
const DEFAULT_SETTINGS = {
  backgroundUrl: '',
  widgetOpacity: 5,
  weatherCity: 'Munich',
  showGrid: true,
  gridSize: 20,
  shortcuts: [
    { name: 'Google', url: 'https://google.com', icon: '' },
    { name: 'YouTube', url: 'https://youtube.com', icon: '' },
    { name: 'GitHub', url: 'https://github.com', icon: '' }
  ],
  widgetPositions: {
    clock: { top: 40, left: 40 },
    weather: { top: 40, right: 40 }
  }
};

// Aktueller Zustand
let settings = { ...DEFAULT_SETTINGS };
let isEditMode = false;
let draggedWidget = null;
let dragOffset = { x: 0, y: 0 };

// ===================================
// Initialisierung beim Laden
// ===================================

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  initClock();
  initWeather();
  initShortcuts();
  initDragAndDrop();
  initEventListeners();
  applySettings();
});

// ===================================
// Einstellungen laden und speichern
// ===================================

/**
 * Lädt Einstellungen aus Chrome Storage
 */
async function loadSettings() {
  try {
    // Chrome Storage API für Manifest V3
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get('settings');
      if (result.settings) {
        settings = { ...DEFAULT_SETTINGS, ...result.settings };
      }
    } else {
      // Fallback für lokale Entwicklung
      const stored = localStorage.getItem('newtab_settings');
      if (stored) {
        settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    }
  } catch (error) {
    console.error('Fehler beim Laden der Einstellungen:', error);
  }
}

/**
 * Speichert Einstellungen in Chrome Storage
 */
async function saveSettings() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ settings });
    } else {
      localStorage.setItem('newtab_settings', JSON.stringify(settings));
    }
  } catch (error) {
    console.error('Fehler beim Speichern der Einstellungen:', error);
  }
}

/**
 * Wendet alle Einstellungen auf die UI an
 */
function applySettings() {
  // FIX #3: Hintergrund für 4K
  const bgContainer = document.getElementById('background-container');
  if (settings.backgroundUrl) {
    bgContainer.style.backgroundImage = `url(${settings.backgroundUrl})`;
  }
  
  // FIX #2: Widget-Opazität nur Hintergrund (rgba statt opacity)
  document.documentElement.style.setProperty(
    '--widget-bg-opacity',
    settings.widgetOpacity / 100
  );
  
  // FIX #8: Rastergröße
  document.documentElement.style.setProperty(
    '--grid-size',
    `${settings.gridSize}px`
  );
  
  // Widget-Positionen wiederherstellen
  restoreWidgetPositions();
}

// ===================================
// Uhrzeit Widget
// ===================================

/**
 * Initialisiert und aktualisiert die Uhrzeit
 */
function initClock() {
  updateClock();
  // Jede Sekunde aktualisieren
  setInterval(updateClock, 1000);
}

/**
 * Aktualisiert Uhrzeit und Datum
 */
function updateClock() {
  const now = new Date();
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  
  // Uhrzeit formatieren (HH:MM)
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  timeEl.textContent = `${hours}:${minutes}`;
  
  // Datum formatieren (DD. Monat YYYY)
  const options = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  dateEl.textContent = now.toLocaleDateString('de-DE', options);
}

// ===================================
// FIX #4: Wetter Widget mit wttr.in API
// ===================================

/**
 * Initialisiert das Wetter-Widget
 */
function initWeather() {
  loadWeather();
  // Alle 30 Minuten aktualisieren
  setInterval(loadWeather, 30 * 60 * 1000);
}

/**
 * Lädt Wetterdaten von wttr.in API (kein API-Key nötig)
 */
async function loadWeather() {
  const tempEl = document.getElementById('temperature');
  const locationEl = document.getElementById('weather-location');
  const iconEl = document.getElementById('weather-icon');
  const descEl = document.getElementById('weather-description');
  
  try {
    // wttr.in API - kein API-Key erforderlich
    const city = encodeURIComponent(settings.weatherCity || 'Munich');
    const response = await fetch(`https://wttr.in/${city}?format=j1`);
    
    if (!response.ok) {
      throw new Error('Wetter konnte nicht geladen werden');
    }
    
    const data = await response.json();
    const current = data.current_condition[0];
    
    // Temperatur anzeigen
    tempEl.textContent = `${current.temp_C}°C`;
    
    // Stadt anzeigen
    const area = data.nearest_area[0];
    locationEl.textContent = area.areaName[0].value;
    
    // Wetterbeschreibung
    descEl.textContent = current.weatherDesc[0].value;
    
    // Wetter-Icon basierend auf Code
    iconEl.textContent = getWeatherIcon(current.weatherCode);
    
  } catch (error) {
    console.error('Wetter Fehler:', error);
    // Fallback bei Fehler
    tempEl.textContent = '--°C';
    locationEl.textContent = settings.weatherCity || 'Fehler';
    descEl.textContent = 'Nicht verfügbar';
    iconEl.textContent = '❓';
  }
}

// Wetter-Code zu Emoji Mapping
const WEATHER_ICONS = {
  113: '☀️',   // Sonnig
  116: '⛅',   // Teilweise bewölkt
  119: '☁️',   // Bewölkt
  122: '☁️',   // Bewölkt
  143: '🌫️',  // Nebel
  176: '🌧️',  // Leichter Regen
  179: '🌨️',  // Leichter Schnee
  182: '🌧️',  // Regen
  185: '🌧️',  // Eisregen
  200: '⛈️',   // Gewitter
  227: '❄️',   // Schnee
  230: '❄️',   // Schneesturm
  248: '🌫️',  // Nebel
  260: '🌫️',  // Nebel
  263: '🌧️',  // Nieselregen
  266: '🌧️',  // Nieselregen
  281: '🌧️',  // Eisregen
  284: '🌧️',  // Eisregen
  293: '🌧️',  // Leichter Regen
  296: '🌧️',  // Leichter Regen
  299: '🌧️',  // Mäßiger Regen
  302: '🌧️',  // Mäßiger Regen
  305: '🌧️',  // Starker Regen
  308: '🌧️',  // Starker Regen
  311: '🌧️',  // Eisregen
  314: '🌧️',  // Eisregen
  317: '🌨️',  // Schneeregen
  320: '🌨️',  // Schneeregen
  323: '❄️',   // Leichter Schnee
  326: '❄️',   // Leichter Schnee
  329: '❄️',   // Mäßiger Schnee
  332: '❄️',   // Mäßiger Schnee
  335: '❄️',   // Starker Schnee
  338: '❄️',   // Starker Schnee
  350: '🌧️',  // Hagel
  353: '🌧️',  // Schauer
  356: '🌧️',  // Schauer
  359: '🌧️',  // Starke Schauer
  362: '🌨️',  // Schneeregen
  365: '🌨️',  // Schneeregen
  368: '❄️',   // Schneeschauer
  371: '❄️',   // Schneeschauer
  374: '🌧️',  // Hagel
  377: '🌧️',  // Hagel
  386: '⛈️',   // Gewitter
  389: '⛈️',   // Gewitter
  392: '⛈️',   // Gewitter mit Schnee
  395: '❄️'    // Starker Schnee
};

/**
 * Gibt passendes Emoji für Wetter-Code zurück
 * @param {string} code - wttr.in Wetter-Code
 * @returns {string} Wetter-Emoji
 */
function getWeatherIcon(code) {
  const codeNum = parseInt(code);
  return WEATHER_ICONS[codeNum] || '🌤️';
}

// ===================================
// FIX #6 & #7: Shortcuts Grid
// ===================================

/**
 * Initialisiert die Shortcuts
 */
function initShortcuts() {
  renderShortcuts();
}

/**
 * Rendert alle Shortcuts im Grid
 */
function renderShortcuts() {
  const grid = document.getElementById('shortcuts-grid');
  grid.innerHTML = '';
  
  // FIX #7: System-Shortcuts für Tabs und Lesezeichen zuerst
  const systemShortcuts = [
    { name: 'Tabs', url: 'tabs.html', icon: '📑', isSystem: true },
    { name: 'Lesezeichen', url: 'bookmarks.html', icon: '🔖', isSystem: true }
  ];
  
  // System-Shortcuts rendern
  systemShortcuts.forEach(shortcut => {
    grid.appendChild(createShortcutElement(shortcut));
  });
  
  // Benutzerdefinierte Shortcuts rendern
  settings.shortcuts.forEach((shortcut, index) => {
    grid.appendChild(createShortcutElement(shortcut, index));
  });
  
  // Add-Button am Ende des Grids hinzufügen
  const addBtn = document.createElement('button');
  addBtn.id = 'add-shortcut-btn';
  addBtn.className = 'shortcut add-shortcut-btn';
  addBtn.title = 'Shortcut hinzufügen';
  addBtn.innerHTML = '<div class="shortcut-icon">+</div><span class="shortcut-name">Hinzufügen</span>';
  addBtn.addEventListener('click', openShortcutModal);
  grid.appendChild(addBtn);
}

/**
 * Erstellt ein Shortcut-Element
 * @param {Object} shortcut - Shortcut-Daten
 * @param {number} index - Index für Löschen (optional)
 * @returns {HTMLElement} Shortcut-Element
 */
function createShortcutElement(shortcut, index) {
  const el = document.createElement('a');
  el.className = `shortcut${shortcut.isSystem ? ' system-shortcut' : ''}`;
  el.href = shortcut.url;
  
  // System-Shortcuts in neuem Tab öffnen
  if (shortcut.isSystem) {
    el.target = '_blank';
  }
  
  // Icon
  const iconEl = document.createElement('div');
  iconEl.className = 'shortcut-icon';
  
  if (shortcut.icon && shortcut.icon.startsWith('http')) {
    const img = document.createElement('img');
    img.src = shortcut.icon;
    img.alt = shortcut.name;
    img.onerror = () => {
      iconEl.textContent = getShortcutFallbackIcon(shortcut.url);
    };
    iconEl.appendChild(img);
  } else if (shortcut.icon) {
    iconEl.textContent = shortcut.icon;
  } else {
    iconEl.textContent = getShortcutFallbackIcon(shortcut.url);
  }
  
  // Name
  const nameEl = document.createElement('span');
  nameEl.className = 'shortcut-name';
  nameEl.textContent = shortcut.name;
  
  el.appendChild(iconEl);
  el.appendChild(nameEl);
  
  // Delete-Button (nur für benutzerdefinierte Shortcuts)
  if (typeof index === 'number') {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'shortcut-delete';
    deleteBtn.textContent = '×';
    deleteBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteShortcut(index);
    };
    el.appendChild(deleteBtn);
  }
  
  return el;
}

/**
 * Generiert Fallback-Icon aus URL
 * @param {string} url - URL des Shortcuts
 * @returns {string} Erstes Zeichen der Domain
 */
function getShortcutFallbackIcon(url) {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain.charAt(0).toUpperCase();
  } catch {
    return '🔗';
  }
}

/**
 * Löscht einen Shortcut
 * @param {number} index - Index des Shortcuts
 */
function deleteShortcut(index) {
  settings.shortcuts.splice(index, 1);
  saveSettings();
  renderShortcuts();
}

/**
 * Fügt einen neuen Shortcut hinzu
 * @param {string} name - Name des Shortcuts
 * @param {string} url - URL des Shortcuts
 * @param {string} icon - Icon-URL (optional)
 */
function addShortcut(name, url, icon = '') {
  // URL validieren - nur sichere Protokolle erlauben
  const trimmedUrl = url.trim();
  
  // Prüfen auf gefährliche Protokolle
  const lowerUrl = trimmedUrl.toLowerCase();
  if (lowerUrl.startsWith('javascript:') || 
      lowerUrl.startsWith('data:') || 
      lowerUrl.startsWith('vbscript:')) {
    showNotification('Ungültige URL: Dieses Protokoll ist nicht erlaubt', 'error');
    return;
  }
  
  // URL korrigieren wenn kein Protokoll angegeben
  let finalUrl = trimmedUrl;
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    finalUrl = 'https://' + trimmedUrl;
  }
  
  settings.shortcuts.push({ name, url: finalUrl, icon });
  saveSettings();
  renderShortcuts();
}

// ===================================
// FIX #5: Drag & Drop für Widgets
// ===================================

/**
 * Initialisiert Drag & Drop Funktionalität
 */
function initDragAndDrop() {
  const widgets = document.querySelectorAll('.widget');
  
  widgets.forEach(widget => {
    widget.addEventListener('mousedown', startDrag);
    widget.addEventListener('touchstart', startDrag, { passive: false });
  });
  
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('touchmove', onDrag, { passive: false });
  
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);
}

/**
 * Startet den Drag-Vorgang
 * @param {Event} e - Mouse/Touch Event
 */
function startDrag(e) {
  // Nur im Edit-Modus verschiebbar
  if (!isEditMode) return;
  
  const widget = e.target.closest('.widget');
  if (!widget) return;
  
  e.preventDefault();
  draggedWidget = widget;
  widget.classList.add('dragging');
  
  // Position des Klicks relativ zum Widget
  const rect = widget.getBoundingClientRect();
  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;
  
  dragOffset = {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

/**
 * Bewegt das Widget während des Drags
 * @param {Event} e - Mouse/Touch Event
 */
function onDrag(e) {
  if (!draggedWidget) return;
  
  e.preventDefault();
  
  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;
  
  let newX = clientX - dragOffset.x;
  let newY = clientY - dragOffset.y;
  
  // Grid-Snapping wenn aktiviert
  if (settings.showGrid) {
    const gridSize = settings.gridSize;
    newX = Math.round(newX / gridSize) * gridSize;
    newY = Math.round(newY / gridSize) * gridSize;
  }
  
  // Grenzen beachten
  newX = Math.max(0, Math.min(newX, window.innerWidth - draggedWidget.offsetWidth));
  newY = Math.max(0, Math.min(newY, window.innerHeight - draggedWidget.offsetHeight));
  
  // Position setzen
  draggedWidget.style.left = `${newX}px`;
  draggedWidget.style.top = `${newY}px`;
  draggedWidget.style.right = 'auto';
}

/**
 * Beendet den Drag-Vorgang und speichert Position
 */
function endDrag() {
  if (!draggedWidget) return;
  
  draggedWidget.classList.remove('dragging');
  
  // Position speichern
  const widgetId = draggedWidget.dataset.widget;
  if (widgetId) {
    settings.widgetPositions[widgetId] = {
      top: parseInt(draggedWidget.style.top) || 40,
      left: parseInt(draggedWidget.style.left) || 40
    };
    saveSettings();
  }
  
  draggedWidget = null;
}

/**
 * Stellt Widget-Positionen aus Einstellungen wieder her
 */
function restoreWidgetPositions() {
  const widgets = document.querySelectorAll('.widget');
  
  widgets.forEach(widget => {
    const widgetId = widget.dataset.widget;
    const pos = settings.widgetPositions[widgetId];
    
    if (pos) {
      widget.style.top = `${pos.top}px`;
      widget.style.left = `${pos.left}px`;
      widget.style.right = 'auto';
    }
  });
}

// ===================================
// Event Listeners
// ===================================

/**
 * Initialisiert alle Event Listeners
 */
function initEventListeners() {
  // Settings Button
  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('close-settings').addEventListener('click', closeSettings);
  document.getElementById('save-settings').addEventListener('click', saveSettingsFromModal);
  
  // FIX #1 & #8: Edit Mode Button
  document.getElementById('edit-mode-btn').addEventListener('click', toggleEditMode);
  
  // Shortcut Modal (Add Button wird dynamisch in renderShortcuts hinzugefügt)
  document.getElementById('close-shortcut-modal').addEventListener('click', closeShortcutModal);
  document.getElementById('save-shortcut').addEventListener('click', saveShortcutFromModal);
  
  // Slider Live-Updates
  document.getElementById('widget-opacity').addEventListener('input', (e) => {
    document.getElementById('opacity-value').textContent = `${e.target.value}%`;
  });
  
  document.getElementById('grid-size').addEventListener('input', (e) => {
    document.getElementById('grid-size-value').textContent = `${e.target.value}px`;
  });
  
  // Hintergrund-Datei Upload
  document.getElementById('bg-file').addEventListener('change', handleBackgroundUpload);
  
  // Modal schließen bei Klick außerhalb
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
}

// ===================================
// Einstellungen Modal
// ===================================

/**
 * Öffnet das Einstellungen-Modal
 */
function openSettings() {
  const modal = document.getElementById('settings-modal');
  
  // Aktuelle Werte in Felder setzen
  document.getElementById('bg-url').value = settings.backgroundUrl || '';
  document.getElementById('widget-opacity').value = settings.widgetOpacity;
  document.getElementById('opacity-value').textContent = `${settings.widgetOpacity}%`;
  document.getElementById('weather-city').value = settings.weatherCity || 'Munich';
  document.getElementById('show-grid').checked = settings.showGrid;
  document.getElementById('grid-size').value = settings.gridSize;
  document.getElementById('grid-size-value').textContent = `${settings.gridSize}px`;
  
  modal.classList.remove('hidden');
}

/**
 * Schließt das Einstellungen-Modal
 */
function closeSettings() {
  document.getElementById('settings-modal').classList.add('hidden');
}

/**
 * Speichert Einstellungen aus dem Modal
 */
function saveSettingsFromModal() {
  settings.backgroundUrl = document.getElementById('bg-url').value;
  settings.widgetOpacity = parseInt(document.getElementById('widget-opacity').value);
  settings.weatherCity = document.getElementById('weather-city').value;
  settings.showGrid = document.getElementById('show-grid').checked;
  settings.gridSize = parseInt(document.getElementById('grid-size').value);
  
  saveSettings();
  applySettings();
  loadWeather(); // Wetter neu laden bei Stadt-Änderung
  closeSettings();
}

/**
 * Verarbeitet Hintergrund-Upload
 * @param {Event} e - Change Event
 */
function handleBackgroundUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    document.getElementById('bg-url').value = event.target.result;
  };
  reader.readAsDataURL(file);
}

// ===================================
// FIX #1 & #8: Edit Mode
// ===================================

/**
 * Schaltet den Edit-Modus um
 */
function toggleEditMode() {
  isEditMode = !isEditMode;
  document.body.classList.toggle('edit-mode', isEditMode);
  document.getElementById('edit-mode-btn').classList.toggle('active', isEditMode);
  
  // FIX #8: Raster anzeigen/verstecken
  const gridOverlay = document.getElementById('grid-overlay');
  if (isEditMode && settings.showGrid) {
    gridOverlay.classList.add('visible');
  } else {
    gridOverlay.classList.remove('visible');
  }
}

// ===================================
// Shortcut Modal
// ===================================

/**
 * Öffnet das Shortcut-Modal
 */
function openShortcutModal() {
  document.getElementById('shortcut-name').value = '';
  document.getElementById('shortcut-url').value = '';
  document.getElementById('shortcut-icon').value = '';
  document.getElementById('shortcut-modal').classList.remove('hidden');
}

/**
 * Schließt das Shortcut-Modal
 */
function closeShortcutModal() {
  document.getElementById('shortcut-modal').classList.add('hidden');
}

/**
 * Speichert neuen Shortcut aus Modal
 */
function saveShortcutFromModal() {
  const name = document.getElementById('shortcut-name').value.trim();
  const url = document.getElementById('shortcut-url').value.trim();
  const icon = document.getElementById('shortcut-icon').value.trim();
  
  if (!name || !url) {
    showNotification('Bitte Name und URL eingeben', 'error');
    return;
  }
  
  addShortcut(name, url, icon);
  closeShortcutModal();
}

// ===================================
// Benachrichtigungssystem
// ===================================

/**
 * Zeigt eine Benachrichtigung an
 * @param {string} message - Nachricht
 * @param {string} type - Typ ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
  // Bestehende Notification entfernen
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Styling
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 10px;
    color: white;
    font-size: 14px;
    z-index: 3000;
    animation: fadeIn 0.3s ease;
    background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#2ed573' : '#7c3aed'};
  `;
  
  document.body.appendChild(notification);
  
  // Nach 3 Sekunden entfernen
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
