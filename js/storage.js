/**
 * SuperStart - Storage Module
 * Speicher-Modul für Chrome Extension
 * 
 * Verwaltet alle Lese- und Schreiboperationen mit chrome.storage
 * Manages all read and write operations with chrome.storage
 */

// Standard-Einstellungen / Default settings
const DEFAULT_SETTINGS = {
    theme: 'light',                    // Theme: 'light' oder 'dark'
    background: 'ocean',               // Hintergrund-Gradient
    customBackgroundUrl: '',           // Benutzerdefinierte URL
    searchEngine: 'google',            // Suchmaschine
    clockFormat: '24h',                // Uhr-Format: '12h' oder '24h'
    showQuotes: true,                  // Zitate anzeigen
    showBookmarks: true,               // Lesezeichen anzeigen
    showClock: true,                   // Uhr anzeigen
    showSearch: true,                  // Suche anzeigen
    language: 'de'                     // Sprache
};

// Standard-Lesezeichen / Default bookmarks
const DEFAULT_BOOKMARKS = [
    { id: '1', name: 'Google', url: 'https://www.google.com' },
    { id: '2', name: 'YouTube', url: 'https://www.youtube.com' },
    { id: '3', name: 'GitHub', url: 'https://github.com' },
    { id: '4', name: 'Gmail', url: 'https://gmail.com' },
    { id: '5', name: 'Twitter', url: 'https://twitter.com' }
];

// Motivationszitate / Motivational quotes
const QUOTES = [
    { text: "Der beste Weg, die Zukunft vorherzusagen, ist, sie zu gestalten.", author: "Peter Drucker" },
    { text: "Es ist nicht wenig Zeit, die wir haben, sondern viel Zeit, die wir nicht nutzen.", author: "Seneca" },
    { text: "Erfolg ist nicht der Schlüssel zum Glück. Glück ist der Schlüssel zum Erfolg.", author: "Albert Schweitzer" },
    { text: "Der einzige Weg, großartige Arbeit zu leisten, ist zu lieben, was man tut.", author: "Steve Jobs" },
    { text: "Wer immer tut, was er schon kann, bleibt immer das, was er schon ist.", author: "Henry Ford" },
    { text: "In der Mitte von Schwierigkeiten liegen die Möglichkeiten.", author: "Albert Einstein" },
    { text: "Anfangen ist leicht, Beharren eine Kunst.", author: "Deutsches Sprichwort" },
    { text: "Gib jedem Tag die Chance, der schönste deines Lebens zu werden.", author: "Mark Twain" },
    { text: "Der Weg ist das Ziel.", author: "Konfuzius" },
    { text: "Wer aufhört, besser zu werden, hat aufgehört, gut zu sein.", author: "Philip Rosenthal" }
];

// Verfügbare Gradienten / Available gradients
const GRADIENTS = {
    sunset: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #dc2626 100%)',
    ocean: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
    forest: 'linear-gradient(135deg, #22c55e 0%, #14b8a6 50%, #10b981 100%)',
    'purple-dream': 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #8b5cf6 100%)',
    fire: 'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #eab308 100%)',
    midnight: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #0f172a 100%)',
    aurora: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 25%, #ec4899 50%, #f97316 75%, #eab308 100%)'
};

/**
 * Storage API Wrapper
 * Wrapper für die Chrome Storage API
 */
const Storage = {
    /**
     * Einstellungen laden / Load settings
     * @returns {Promise<Object>} Einstellungen / Settings
     */
    async getSettings() {
        try {
            // Versuche, von chrome.storage.sync zu laden
            // Try to load from chrome.storage.sync
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await chrome.storage.sync.get('settings');
                return { ...DEFAULT_SETTINGS, ...(result.settings || {}) };
            }
        } catch (error) {
            console.warn('Chrome storage nicht verfügbar, nutze localStorage:', error);
        }
        
        // Fallback zu localStorage
        // Fallback to localStorage
        try {
            const stored = localStorage.getItem('superstart_settings');
            if (stored) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.warn('localStorage Fehler:', error);
        }
        
        return { ...DEFAULT_SETTINGS };
    },
    
    /**
     * Einstellungen speichern / Save settings
     * @param {Object} settings - Einstellungen zum Speichern
     * @returns {Promise<void>}
     */
    async saveSettings(settings) {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                await chrome.storage.sync.set({ settings });
                return;
            }
        } catch (error) {
            console.warn('Chrome storage nicht verfügbar:', error);
        }
        
        // Fallback zu localStorage
        try {
            localStorage.setItem('superstart_settings', JSON.stringify(settings));
        } catch (error) {
            console.error('Fehler beim Speichern der Einstellungen:', error);
        }
    },
    
    /**
     * Lesezeichen laden / Load bookmarks
     * @returns {Promise<Array>} Lesezeichen-Array / Bookmarks array
     */
    async getBookmarks() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await chrome.storage.local.get('bookmarks');
                return result.bookmarks || [...DEFAULT_BOOKMARKS];
            }
        } catch (error) {
            console.warn('Chrome storage nicht verfügbar:', error);
        }
        
        // Fallback zu localStorage
        try {
            const stored = localStorage.getItem('superstart_bookmarks');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn('localStorage Fehler:', error);
        }
        
        return [...DEFAULT_BOOKMARKS];
    },
    
    /**
     * Lesezeichen speichern / Save bookmarks
     * @param {Array} bookmarks - Lesezeichen zum Speichern
     * @returns {Promise<void>}
     */
    async saveBookmarks(bookmarks) {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                await chrome.storage.local.set({ bookmarks });
                return;
            }
        } catch (error) {
            console.warn('Chrome storage nicht verfügbar:', error);
        }
        
        // Fallback zu localStorage
        try {
            localStorage.setItem('superstart_bookmarks', JSON.stringify(bookmarks));
        } catch (error) {
            console.error('Fehler beim Speichern der Lesezeichen:', error);
        }
    },
    
    /**
     * Lesezeichen hinzufügen / Add bookmark
     * @param {Object} bookmark - Neues Lesezeichen
     * @returns {Promise<Array>} Aktualisierte Lesezeichen
     */
    async addBookmark(bookmark) {
        const bookmarks = await this.getBookmarks();
        const newBookmark = {
            ...bookmark,
            id: Date.now().toString()
        };
        bookmarks.push(newBookmark);
        await this.saveBookmarks(bookmarks);
        return bookmarks;
    },
    
    /**
     * Lesezeichen aktualisieren / Update bookmark
     * @param {string} id - Lesezeichen-ID
     * @param {Object} updates - Zu aktualisierende Felder
     * @returns {Promise<Array>} Aktualisierte Lesezeichen
     */
    async updateBookmark(id, updates) {
        const bookmarks = await this.getBookmarks();
        const index = bookmarks.findIndex(b => b.id === id);
        if (index !== -1) {
            bookmarks[index] = { ...bookmarks[index], ...updates };
            await this.saveBookmarks(bookmarks);
        }
        return bookmarks;
    },
    
    /**
     * Lesezeichen löschen / Delete bookmark
     * @param {string} id - Lesezeichen-ID
     * @returns {Promise<Array>} Aktualisierte Lesezeichen
     */
    async deleteBookmark(id) {
        const bookmarks = await this.getBookmarks();
        const filtered = bookmarks.filter(b => b.id !== id);
        await this.saveBookmarks(filtered);
        return filtered;
    },
    
    /**
     * Zufälliges Zitat holen / Get random quote
     * @returns {Object} Zitat-Objekt mit text und author
     */
    getRandomQuote() {
        const index = Math.floor(Math.random() * QUOTES.length);
        return QUOTES[index];
    },
    
    /**
     * Gradient-CSS holen / Get gradient CSS
     * @param {string} name - Gradient-Name
     * @returns {string} CSS Gradient-String
     */
    getGradient(name) {
        return GRADIENTS[name] || GRADIENTS.ocean;
    },
    
    /**
     * Alle Gradienten holen / Get all gradients
     * @returns {Object} Alle verfügbaren Gradienten
     */
    getAllGradients() {
        return { ...GRADIENTS };
    },
    
    /**
     * Einstellungen exportieren / Export settings
     * @returns {Promise<Object>} Alle Daten zum Export
     */
    async exportData() {
        const settings = await this.getSettings();
        const bookmarks = await this.getBookmarks();
        return {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            settings,
            bookmarks
        };
    },
    
    /**
     * Einstellungen importieren / Import settings
     * @param {Object} data - Importierte Daten
     * @returns {Promise<void>}
     */
    async importData(data) {
        if (data.settings) {
            await this.saveSettings(data.settings);
        }
        if (data.bookmarks) {
            await this.saveBookmarks(data.bookmarks);
        }
    },
    
    /**
     * Alle Daten zurücksetzen / Reset all data
     * @returns {Promise<void>}
     */
    async resetAll() {
        await this.saveSettings(DEFAULT_SETTINGS);
        await this.saveBookmarks(DEFAULT_BOOKMARKS);
    }
};

// Für Browser ohne Modul-Support
// For browsers without module support
if (typeof window !== 'undefined') {
    window.Storage = Storage;
    window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
    window.DEFAULT_BOOKMARKS = DEFAULT_BOOKMARKS;
    window.QUOTES = QUOTES;
    window.GRADIENTS = GRADIENTS;
}
