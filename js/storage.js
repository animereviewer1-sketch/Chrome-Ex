/**
 * Storage utility for Chrome Extension
 * Uses chrome.storage.local when available, falls back to localStorage
 */
const Storage = {
  isExtension: typeof chrome !== 'undefined' && chrome.storage,

  async get(key, defaultValue = null) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          resolve(result[key] !== undefined ? result[key] : defaultValue);
        });
      });
    } else {
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
  },

  async set(key, value) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, resolve);
      });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  async remove(key) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.remove([key], resolve);
      });
    } else {
      localStorage.removeItem(key);
    }
  },

  async getAll() {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.get(null, resolve);
      });
    } else {
      const all = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          all[key] = JSON.parse(localStorage.getItem(key));
        } catch (e) {
          all[key] = localStorage.getItem(key);
        }
      }
      return all;
    }
  }
};

// Default settings
const DEFAULT_SETTINGS = {
  timeFormat: '24',
  language: 'de',
  tempUnit: 'c',
  showWeather: true,
  showTodo: true,
  showQuotes: true,
  weatherApiKey: '',
  weatherLocation: '',
  searchEngine: 'google'
};

// Default shortcuts
const DEFAULT_SHORTCUTS = [
  { name: 'Google', url: 'https://google.com', icon: '🔍' },
  { name: 'YouTube', url: 'https://youtube.com', icon: '▶️' },
  { name: 'Gmail', url: 'https://mail.google.com', icon: '📧' },
  { name: 'GitHub', url: 'https://github.com', icon: '💻' },
  { name: 'Twitter', url: 'https://twitter.com', icon: '🐦' },
  { name: 'LinkedIn', url: 'https://linkedin.com', icon: '💼' }
];
