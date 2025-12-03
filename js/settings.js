/**
 * SuperStart - Settings Page JavaScript
 * Logik für die Einstellungsseite
 * 
 * Logic for the settings page
 */

// ==========================================
// Globale Variablen / Global variables
// ==========================================
let settings = {};

// ==========================================
// DOM Elemente / DOM Elements
// ==========================================
const elements = {
    // Theme
    themeBtns: null,
    
    // Background
    gradientGrid: null,
    gradientOptions: null,
    customBgUrl: null,
    applyCustomBg: null,
    clearCustomBg: null,
    
    // Clock
    clockBtns: null,
    
    // Search
    searchEngineSelect: null,
    
    // Widgets
    showClock: null,
    showSearch: null,
    showBookmarks: null,
    showQuotes: null,
    
    // Data
    exportSettings: null,
    importFile: null,
    importSettings: null,
    resetAll: null,
    
    // Toast
    toast: null
};

// ==========================================
// Initialisierung / Initialization
// ==========================================

/**
 * DOM Elemente initialisieren / Initialize DOM elements
 */
function initializeElements() {
    // Theme
    elements.themeBtns = document.querySelectorAll('[data-theme]');
    
    // Background
    elements.gradientGrid = document.getElementById('gradient-grid');
    elements.gradientOptions = document.querySelectorAll('.gradient-option');
    elements.customBgUrl = document.getElementById('custom-bg-url');
    elements.applyCustomBg = document.getElementById('apply-custom-bg');
    elements.clearCustomBg = document.getElementById('clear-custom-bg');
    
    // Clock
    elements.clockBtns = document.querySelectorAll('[data-clock]');
    
    // Search
    elements.searchEngineSelect = document.getElementById('search-engine-select');
    
    // Widgets
    elements.showClock = document.getElementById('show-clock');
    elements.showSearch = document.getElementById('show-search');
    elements.showBookmarks = document.getElementById('show-bookmarks');
    elements.showQuotes = document.getElementById('show-quotes');
    
    // Data
    elements.exportSettings = document.getElementById('export-settings');
    elements.importFile = document.getElementById('import-file');
    elements.importSettings = document.getElementById('import-settings');
    elements.resetAll = document.getElementById('reset-all');
    
    // Toast
    elements.toast = document.getElementById('toast');
}

/**
 * App initialisieren / Initialize app
 */
async function initializeApp() {
    initializeElements();
    
    // Einstellungen laden / Load settings
    settings = await Storage.getSettings();
    
    // UI mit aktuellen Einstellungen aktualisieren / Update UI with current settings
    updateUI();
    
    // Theme anwenden / Apply theme
    applyTheme(settings.theme);
    
    // Event Listener einrichten / Set up event listeners
    setupEventListeners();
}

/**
 * UI mit Einstellungen aktualisieren / Update UI with settings
 */
function updateUI() {
    // Theme
    elements.themeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === settings.theme);
    });
    
    // Gradient
    elements.gradientOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.gradient === settings.background);
    });
    
    // Custom Background URL
    if (elements.customBgUrl) {
        elements.customBgUrl.value = settings.customBackgroundUrl || '';
    }
    
    // Clock Format
    elements.clockBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.clock === settings.clockFormat);
    });
    
    // Search Engine
    if (elements.searchEngineSelect) {
        elements.searchEngineSelect.value = settings.searchEngine || 'google';
    }
    
    // Widgets
    if (elements.showClock) elements.showClock.checked = settings.showClock !== false;
    if (elements.showSearch) elements.showSearch.checked = settings.showSearch !== false;
    if (elements.showBookmarks) elements.showBookmarks.checked = settings.showBookmarks !== false;
    if (elements.showQuotes) elements.showQuotes.checked = settings.showQuotes !== false;
}

/**
 * Theme anwenden / Apply theme
 * @param {string} theme - 'light' oder 'dark'
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

// ==========================================
// Event Listener
// ==========================================

/**
 * Event Listener einrichten / Set up event listeners
 */
function setupEventListeners() {
    // Theme-Wechsel / Theme change
    elements.themeBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const theme = btn.dataset.theme;
            settings.theme = theme;
            await Storage.saveSettings(settings);
            
            // UI aktualisieren / Update UI
            elements.themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyTheme(theme);
            
            showToast('Theme geändert', 'success');
        });
    });
    
    // Gradient-Wechsel / Gradient change
    elements.gradientOptions.forEach(option => {
        option.addEventListener('click', async () => {
            const gradient = option.dataset.gradient;
            settings.background = gradient;
            settings.customBackgroundUrl = ''; // Custom URL zurücksetzen
            await Storage.saveSettings(settings);
            
            // UI aktualisieren / Update UI
            elements.gradientOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            elements.customBgUrl.value = '';
            
            showToast('Hintergrund geändert', 'success');
        });
    });
    
    // Custom Background anwenden / Apply custom background
    if (elements.applyCustomBg) {
        elements.applyCustomBg.addEventListener('click', async () => {
            const url = elements.customBgUrl.value.trim();
            if (!url) {
                showToast('Bitte geben Sie eine URL ein', 'error');
                return;
            }
            
            // URL validieren / Validate URL
            try {
                new URL(url);
            } catch (e) {
                showToast('Ungültige URL', 'error');
                return;
            }
            
            settings.customBackgroundUrl = url;
            await Storage.saveSettings(settings);
            
            // Gradient-Auswahl aufheben / Deselect gradient
            elements.gradientOptions.forEach(o => o.classList.remove('active'));
            
            showToast('Benutzerdefinierter Hintergrund gespeichert', 'success');
        });
    }
    
    // Custom Background löschen / Clear custom background
    if (elements.clearCustomBg) {
        elements.clearCustomBg.addEventListener('click', async () => {
            settings.customBackgroundUrl = '';
            elements.customBgUrl.value = '';
            await Storage.saveSettings(settings);
            
            // Standard-Gradient aktivieren / Activate default gradient
            const defaultGradient = document.querySelector(`[data-gradient="${settings.background}"]`);
            if (defaultGradient) {
                defaultGradient.classList.add('active');
            }
            
            showToast('Benutzerdefinierter Hintergrund gelöscht', 'success');
        });
    }
    
    // Clock Format
    elements.clockBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const format = btn.dataset.clock;
            settings.clockFormat = format;
            await Storage.saveSettings(settings);
            
            // UI aktualisieren / Update UI
            elements.clockBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            showToast('Zeitformat geändert', 'success');
        });
    });
    
    // Search Engine
    if (elements.searchEngineSelect) {
        elements.searchEngineSelect.addEventListener('change', async () => {
            settings.searchEngine = elements.searchEngineSelect.value;
            await Storage.saveSettings(settings);
            showToast('Suchmaschine geändert', 'success');
        });
    }
    
    // Widget Toggles
    const widgetToggles = [
        { element: elements.showClock, key: 'showClock', name: 'Uhr' },
        { element: elements.showSearch, key: 'showSearch', name: 'Suchleiste' },
        { element: elements.showBookmarks, key: 'showBookmarks', name: 'Lesezeichen' },
        { element: elements.showQuotes, key: 'showQuotes', name: 'Zitate' }
    ];
    
    widgetToggles.forEach(({ element, key, name }) => {
        if (element) {
            element.addEventListener('change', async () => {
                settings[key] = element.checked;
                await Storage.saveSettings(settings);
                showToast(`${name} ${element.checked ? 'aktiviert' : 'deaktiviert'}`, 'success');
            });
        }
    });
    
    // Export Settings
    if (elements.exportSettings) {
        elements.exportSettings.addEventListener('click', async () => {
            try {
                const data = await Storage.exportData();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `superstart-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showToast('Einstellungen exportiert', 'success');
            } catch (error) {
                console.error('Export-Fehler:', error);
                showToast('Fehler beim Exportieren', 'error');
            }
        });
    }
    
    // Import Settings Button
    if (elements.importSettings) {
        elements.importSettings.addEventListener('click', () => {
            elements.importFile.click();
        });
    }
    
    // Import File Change
    if (elements.importFile) {
        elements.importFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                // Daten validieren / Validate data
                if (!data.settings && !data.bookmarks) {
                    throw new Error('Ungültiges Dateiformat');
                }
                
                await Storage.importData(data);
                settings = await Storage.getSettings();
                updateUI();
                applyTheme(settings.theme);
                
                showToast('Einstellungen importiert', 'success');
            } catch (error) {
                console.error('Import-Fehler:', error);
                showToast('Fehler beim Importieren: Ungültige Datei', 'error');
            }
            
            // Input zurücksetzen / Reset input
            e.target.value = '';
        });
    }
    
    // Reset All
    if (elements.resetAll) {
        elements.resetAll.addEventListener('click', async () => {
            if (confirm('Möchten Sie wirklich alle Einstellungen zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
                await Storage.resetAll();
                settings = await Storage.getSettings();
                updateUI();
                applyTheme(settings.theme);
                
                showToast('Alle Einstellungen zurückgesetzt', 'success');
            }
        });
    }
}

// ==========================================
// Toast-Benachrichtigung / Toast Notification
// ==========================================

/**
 * Toast-Benachrichtigung anzeigen / Show toast notification
 * @param {string} message - Nachricht
 * @param {string} type - 'success' oder 'error'
 */
function showToast(message, type = 'success') {
    if (!elements.toast) return;
    
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type}`;
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// ==========================================
// App starten / Start app
// ==========================================
document.addEventListener('DOMContentLoaded', initializeApp);
