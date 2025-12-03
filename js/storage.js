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
  },

  async exportConfig() {
    const config = await this.getAll();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supertab-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  async importConfig(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const config = JSON.parse(e.target.result);
          for (const [key, value] of Object.entries(config)) {
            await this.set(key, value);
          }
          resolve(true);
        } catch (error) {
          reject(new Error('Invalid configuration file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
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
  weatherLocation: 'München, Haidhausen',
  searchEngine: 'google',
  widgetLayout: 'horizontal'
};

// Default shortcuts
const DEFAULT_SHORTCUTS = [
  { name: 'Google', url: 'https://google.com', icon: '🔍', bgColor: null, transparentBg: false },
  { name: 'YouTube', url: 'https://youtube.com', icon: '▶️', bgColor: null, transparentBg: false },
  { name: 'Gmail', url: 'https://mail.google.com', icon: '📧', bgColor: null, transparentBg: false },
  { name: 'GitHub', url: 'https://github.com', icon: '💻', bgColor: null, transparentBg: false },
  { name: 'Twitter', url: 'https://twitter.com', icon: '🐦', bgColor: null, transparentBg: false },
  { name: 'LinkedIn', url: 'https://linkedin.com', icon: '💼', bgColor: null, transparentBg: false }
];

// Default widget positions
const DEFAULT_WIDGET_POSITIONS = {
  'weather-1': { zone: 'top-bar', order: 0 },
  'clock-1': { zone: 'center-content', order: 0 },
  'search-1': { zone: 'center-content', order: 1 },
  'shortcuts-1': { zone: 'center-content', order: 2 },
  'quote-1': { zone: 'bottom-section', order: 0 },
  'todo-1': { zone: 'bottom-section', order: 1 }
};

// Default widget settings
const DEFAULT_WIDGET_SETTINGS = {
  'weather-1': { visible: true, showBackground: true, size: 'medium', opacity: 100 },
  'clock-1': { visible: true, showBackground: true, size: 'medium', opacity: 100 },
  'search-1': { visible: true, showBackground: true, size: 'medium', opacity: 100 },
  'shortcuts-1': { visible: true, showBackground: false, size: 'medium', opacity: 100 },
  'quote-1': { visible: true, showBackground: true, size: 'medium', opacity: 100 },
  'todo-1': { visible: true, showBackground: true, size: 'medium', opacity: 100 }
};

// Default widget groups
const DEFAULT_WIDGET_GROUPS = [];
