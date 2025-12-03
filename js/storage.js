/**
 * Storage Module - Handles all Chrome storage operations
 */

const Storage = {
  // Default settings
  defaults: {
    theme: 'minimal',
    font: 'roboto',
    blurIntensity: 50,
    animationsEnabled: true,
    backgroundType: 'gradient',
    backgroundValue: 'sunset',
    customBackgrounds: [],
    editMode: false,
    gridSize: 12,
    gridVisible: false,
    currentPage: 'default',
    pages: {
      default: {
        name: 'Home',
        widgets: [
          { id: 'clock', type: 'clock', x: 50, y: 10, size: 'large', visible: true },
          { id: 'weather', type: 'weather', x: 5, y: 5, size: 'medium', visible: true },
          { id: 'search', type: 'search', x: 50, y: 35, size: 'large', visible: true },
          { id: 'shortcuts', type: 'shortcuts', x: 50, y: 50, size: 'large', visible: true },
          { id: 'quote', type: 'quote', x: 50, y: 90, size: 'medium', visible: true }
        ]
      }
    },
    shortcuts: [
      { id: 1, name: 'Google', url: 'https://google.com', icon: '🔍' },
      { id: 2, name: 'YouTube', url: 'https://youtube.com', icon: '📺' },
      { id: 3, name: 'Gmail', url: 'https://mail.google.com', icon: '📧' },
      { id: 4, name: 'GitHub', url: 'https://github.com', icon: '💻' },
      { id: 5, name: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
      { id: 6, name: 'Reddit', url: 'https://reddit.com', icon: '🤖' }
    ],
    todos: [],
    notes: [],
    countdowns: [],
    weatherLocation: 'Munich Haidhausen',
    weatherApiKey: '',
    widgetSettings: {},
    quickActionsHistory: []
  },

  /**
   * Initialize storage with defaults if empty
   */
  async init() {
    try {
      const data = await this.getAll();
      if (!data || Object.keys(data).length === 0) {
        await this.setAll(this.defaults);
        return this.defaults;
      }
      // Merge with defaults to ensure all keys exist
      const merged = { ...this.defaults, ...data };
      return merged;
    } catch (error) {
      console.error('Storage init error:', error);
      return this.defaults;
    }
  },

  /**
   * Get all stored data
   */
  async getAll() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(null, (data) => {
          resolve(data);
        });
      } else {
        // Fallback to localStorage
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          try {
            data[key] = JSON.parse(localStorage.getItem(key));
          } catch {
            data[key] = localStorage.getItem(key);
          }
        }
        resolve(data);
      }
    });
  },

  /**
   * Get specific value from storage
   */
  async get(key) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(key, (data) => {
          resolve(data[key] !== undefined ? data[key] : this.defaults[key]);
        });
      } else {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            resolve(JSON.parse(value));
          } catch {
            resolve(value);
          }
        } else {
          resolve(this.defaults[key]);
        }
      }
    });
  },

  /**
   * Set specific value in storage
   */
  async set(key, value) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ [key]: value }, () => {
          resolve(true);
        });
      } else {
        localStorage.setItem(key, JSON.stringify(value));
        resolve(true);
      }
    });
  },

  /**
   * Set all data at once
   */
  async setAll(data) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set(data, () => {
          resolve(true);
        });
      } else {
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });
        resolve(true);
      }
    });
  },

  /**
   * Remove specific key from storage
   */
  async remove(key) {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.remove(key, () => {
          resolve(true);
        });
      } else {
        localStorage.removeItem(key);
        resolve(true);
      }
    });
  },

  /**
   * Clear all storage
   */
  async clear() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.clear(() => {
          resolve(true);
        });
      } else {
        localStorage.clear();
        resolve(true);
      }
    });
  },

  /**
   * Export all settings as JSON
   */
  async exportSettings() {
    const data = await this.getAll();
    return JSON.stringify(data, null, 2);
  },

  /**
   * Import settings from JSON
   */
  async importSettings(jsonString, merge = false) {
    try {
      const data = JSON.parse(jsonString);
      if (merge) {
        const current = await this.getAll();
        await this.setAll({ ...current, ...data });
      } else {
        await this.clear();
        await this.setAll(data);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Add listener for storage changes
   */
  onChange(callback) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local') {
          callback(changes);
        }
      });
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
