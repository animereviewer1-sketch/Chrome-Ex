/**
 * Storage-Modul für Chrome Extension
 * Verwaltet alle localStorage/chrome.storage Operationen
 */

const StorageManager = {
    // Standard-Einstellungen
    defaults: {
        theme: 'dark',
        blurIntensity: 10,
        gridSize: 10,
        showGridLines: false,
        font: 'Inter',
        customBackground: null,
        widgets: {}
    },

    // Initialisiert den Storage mit Standardwerten
    async init() {
        const settings = await this.getSettings();
        if (!settings || Object.keys(settings).length === 0) {
            await this.saveSettings(this.defaults);
        }
        return await this.getSettings();
    },

    // Holt alle Einstellungen
    async getSettings() {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.get(['dashboardSettings'], (result) => {
                    resolve(result.dashboardSettings || this.defaults);
                });
            } else {
                // Fallback auf localStorage für Entwicklung
                const settings = localStorage.getItem('dashboardSettings');
                resolve(settings ? JSON.parse(settings) : this.defaults);
            }
        });
    },

    // Speichert alle Einstellungen
    async saveSettings(settings) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({ dashboardSettings: settings }, resolve);
            } else {
                localStorage.setItem('dashboardSettings', JSON.stringify(settings));
                resolve();
            }
        });
    },

    // Aktualisiert einzelne Einstellung
    async updateSetting(key, value) {
        const settings = await this.getSettings();
        settings[key] = value;
        await this.saveSettings(settings);
        return settings;
    },

    // Widget-spezifische Operationen
    async getWidgets() {
        const settings = await this.getSettings();
        return settings.widgets || {};
    },

    async getWidget(widgetId) {
        const widgets = await this.getWidgets();
        return widgets[widgetId] || null;
    },

    async saveWidget(widgetId, widgetData) {
        const settings = await this.getSettings();
        if (!settings.widgets) settings.widgets = {};
        settings.widgets[widgetId] = widgetData;
        await this.saveSettings(settings);
        return widgetData;
    },

    async deleteWidget(widgetId) {
        const settings = await this.getSettings();
        if (settings.widgets && settings.widgets[widgetId]) {
            delete settings.widgets[widgetId];
            await this.saveSettings(settings);
        }
    },

    async updateWidgetPosition(widgetId, x, y) {
        const widget = await this.getWidget(widgetId);
        if (widget) {
            widget.x = x;
            widget.y = y;
            await this.saveWidget(widgetId, widget);
        }
    },

    async updateWidgetSize(widgetId, width, height) {
        const widget = await this.getWidget(widgetId);
        if (widget) {
            widget.width = width;
            widget.height = height;
            await this.saveWidget(widgetId, widget);
        }
    },

    // Notizen-spezifische Operationen
    async getNotes(widgetId) {
        const widget = await this.getWidget(widgetId);
        return widget?.notes || [];
    },

    async saveNote(widgetId, note) {
        const widget = await this.getWidget(widgetId);
        if (widget) {
            if (!widget.notes) widget.notes = [];
            const existingIndex = widget.notes.findIndex(n => n.id === note.id);
            if (existingIndex >= 0) {
                widget.notes[existingIndex] = note;
            } else {
                widget.notes.push(note);
            }
            await this.saveWidget(widgetId, widget);
        }
        return note;
    },

    async deleteNote(widgetId, noteId) {
        const widget = await this.getWidget(widgetId);
        if (widget && widget.notes) {
            widget.notes = widget.notes.filter(n => n.id !== noteId);
            await this.saveWidget(widgetId, widget);
        }
    },

    // Shortcuts-spezifische Operationen
    async getShortcuts(widgetId) {
        const widget = await this.getWidget(widgetId);
        return widget?.shortcuts || [];
    },

    async saveShortcuts(widgetId, shortcuts) {
        const widget = await this.getWidget(widgetId);
        if (widget) {
            widget.shortcuts = shortcuts;
            await this.saveWidget(widgetId, widget);
        }
    },

    async saveShortcut(widgetId, shortcut) {
        const widget = await this.getWidget(widgetId);
        if (widget) {
            if (!widget.shortcuts) widget.shortcuts = [];
            const existingIndex = widget.shortcuts.findIndex(s => s.id === shortcut.id);
            if (existingIndex >= 0) {
                widget.shortcuts[existingIndex] = shortcut;
            } else {
                widget.shortcuts.push(shortcut);
            }
            await this.saveWidget(widgetId, widget);
        }
        return shortcut;
    },

    async deleteShortcut(widgetId, shortcutId) {
        const widget = await this.getWidget(widgetId);
        if (widget && widget.shortcuts) {
            widget.shortcuts = widget.shortcuts.filter(s => s.id !== shortcutId);
            await this.saveWidget(widgetId, widget);
        }
    },

    // Countdown-spezifische Operationen
    async getCountdowns(widgetId) {
        const widget = await this.getWidget(widgetId);
        return widget?.countdowns || [];
    },

    async saveCountdown(widgetId, countdown) {
        const widget = await this.getWidget(widgetId);
        if (widget) {
            if (!widget.countdowns) widget.countdowns = [];
            const existingIndex = widget.countdowns.findIndex(c => c.id === countdown.id);
            if (existingIndex >= 0) {
                widget.countdowns[existingIndex] = countdown;
            } else {
                widget.countdowns.push(countdown);
            }
            await this.saveWidget(widgetId, widget);
        }
        return countdown;
    },

    async deleteCountdown(widgetId, countdownId) {
        const widget = await this.getWidget(widgetId);
        if (widget && widget.countdowns) {
            widget.countdowns = widget.countdowns.filter(c => c.id !== countdownId);
            await this.saveWidget(widgetId, widget);
        }
    },

    // Export/Import
    async exportSettings() {
        const settings = await this.getSettings();
        return JSON.stringify(settings, null, 2);
    },

    async importSettings(jsonString) {
        try {
            const settings = JSON.parse(jsonString);
            await this.saveSettings(settings);
            return true;
        } catch (e) {
            console.error('Fehler beim Importieren:', e);
            return false;
        }
    },

    // Cache leeren
    async clearAll() {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.clear(resolve);
            } else {
                localStorage.clear();
                resolve();
            }
        });
    }
};

// Global verfügbar machen
window.StorageManager = StorageManager;
