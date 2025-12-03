/**
 * Search functionality
 */
const Search = {
  inputElement: null,
  buttonElement: null,
  engineBtnElement: null,
  dropdownElement: null,
  iconElement: null,
  currentEngine: 'google',
  engines: {
    google: {
      url: 'https://www.google.com/search?q=',
      icon: 'https://www.google.com/favicon.ico'
    },
    bing: {
      url: 'https://www.bing.com/search?q=',
      icon: 'https://www.bing.com/favicon.ico'
    },
    duckduckgo: {
      url: 'https://duckduckgo.com/?q=',
      icon: 'https://duckduckgo.com/favicon.ico'
    },
    yahoo: {
      url: 'https://search.yahoo.com/search?p=',
      icon: 'https://www.yahoo.com/favicon.ico'
    }
  },

  init() {
    this.inputElement = document.getElementById('search-input');
    this.buttonElement = document.getElementById('search-btn');
    this.engineBtnElement = document.getElementById('search-engine-btn');
    this.dropdownElement = document.getElementById('search-engine-dropdown');
    this.iconElement = document.getElementById('search-engine-icon');

    this.bindEvents();
    this.loadSettings();
  },

  bindEvents() {
    // Search on Enter key
    this.inputElement.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch();
      }
    });

    // Search on button click
    this.buttonElement.addEventListener('click', () => {
      this.performSearch();
    });

    // Toggle dropdown
    this.engineBtnElement.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dropdownElement.classList.toggle('hidden');
    });

    // Select search engine
    this.dropdownElement.querySelectorAll('.engine-option').forEach(option => {
      option.addEventListener('click', () => {
        this.setEngine(option.dataset.engine);
        this.dropdownElement.classList.add('hidden');
      });
    });

    // Close dropdown on outside click
    document.addEventListener('click', () => {
      this.dropdownElement.classList.add('hidden');
    });
  },

  async loadSettings() {
    const engine = await Storage.get('searchEngine', 'google');
    this.setEngine(engine);
  },

  setEngine(engine) {
    this.currentEngine = engine;
    if (this.engines[engine]) {
      this.iconElement.src = this.engines[engine].icon;
    }
    Storage.set('searchEngine', engine);
  },

  performSearch() {
    const query = this.inputElement.value.trim();
    if (query) {
      const url = this.engines[this.currentEngine].url + encodeURIComponent(query);
      window.location.href = url;
    }
  }
};
