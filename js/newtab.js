/**
 * SuperStart - New Tab JavaScript
 * Hauptlogik für die Neue Tab Seite
 * 
 * Main logic for the New Tab page
 */

// ==========================================
// Globale Variablen / Global variables
// ==========================================
let settings = {};
let bookmarks = [];
let clockInterval = null;
let editingBookmarkId = null;

// ==========================================
// DOM Elemente / DOM Elements
// ==========================================
const elements = {
    time: null,
    date: null,
    searchForm: null,
    searchInput: null,
    searchEngine: null,
    bookmarksGrid: null,
    quoteText: null,
    quoteAuthor: null,
    settingsBtn: null,
    addBookmarkBtn: null,
    modal: null,
    modalClose: null,
    modalTitle: null,
    bookmarkForm: null,
    bookmarkName: null,
    bookmarkUrl: null,
    bookmarkId: null,
    deleteBookmark: null,
    clockWidget: null,
    searchWidget: null,
    bookmarksWidget: null,
    quoteWidget: null
};

// ==========================================
// Initialisierung / Initialization
// ==========================================

/**
 * DOM Elemente initialisieren / Initialize DOM elements
 */
function initializeElements() {
    elements.time = document.getElementById('time');
    elements.date = document.getElementById('date');
    elements.searchForm = document.getElementById('search-form');
    elements.searchInput = document.getElementById('search-input');
    elements.searchEngine = document.getElementById('search-engine');
    elements.bookmarksGrid = document.getElementById('bookmarks-grid');
    elements.quoteText = document.getElementById('quote-text');
    elements.quoteAuthor = document.getElementById('quote-author');
    elements.settingsBtn = document.getElementById('settings-btn');
    elements.addBookmarkBtn = document.getElementById('add-bookmark-btn');
    elements.modal = document.getElementById('bookmark-modal');
    elements.modalClose = document.getElementById('modal-close');
    elements.modalTitle = document.getElementById('modal-title');
    elements.bookmarkForm = document.getElementById('bookmark-form');
    elements.bookmarkName = document.getElementById('bookmark-name');
    elements.bookmarkUrl = document.getElementById('bookmark-url');
    elements.bookmarkId = document.getElementById('bookmark-id');
    elements.deleteBookmark = document.getElementById('delete-bookmark');
    elements.clockWidget = document.getElementById('clock-widget');
    elements.searchWidget = document.getElementById('search-widget');
    elements.bookmarksWidget = document.getElementById('bookmarks-widget');
    elements.quoteWidget = document.getElementById('quote-widget');
}

/**
 * App initialisieren / Initialize app
 */
async function initializeApp() {
    initializeElements();
    
    // Einstellungen und Lesezeichen laden / Load settings and bookmarks
    settings = await Storage.getSettings();
    bookmarks = await Storage.getBookmarks();
    
    // Theme und Hintergrund anwenden / Apply theme and background
    applyTheme(settings.theme);
    applyBackground(settings.background, settings.customBackgroundUrl);
    
    // Widgets initialisieren / Initialize widgets
    if (settings.showClock) {
        initializeClock();
    } else {
        elements.clockWidget.style.display = 'none';
    }
    
    if (settings.showSearch) {
        initializeSearch();
    } else {
        elements.searchWidget.style.display = 'none';
    }
    
    if (settings.showBookmarks) {
        renderBookmarks();
    } else {
        elements.bookmarksWidget.style.display = 'none';
    }
    
    if (settings.showQuotes) {
        displayRandomQuote();
    } else {
        elements.quoteWidget.style.display = 'none';
    }
    
    // Event Listener einrichten / Set up event listeners
    setupEventListeners();
    
    // Auto-Focus auf Suchfeld / Auto-focus on search field
    if (settings.showSearch && elements.searchInput) {
        setTimeout(() => elements.searchInput.focus(), 100);
    }
}

// ==========================================
// Theme & Hintergrund / Theme & Background
// ==========================================

/**
 * Theme anwenden / Apply theme
 * @param {string} theme - 'light' oder 'dark'
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Hintergrund anwenden / Apply background
 * @param {string} gradientName - Name des Gradienten
 * @param {string} customUrl - Benutzerdefinierte Bild-URL (optional)
 */
function applyBackground(gradientName, customUrl = '') {
    if (customUrl && customUrl.trim()) {
        // Benutzerdefiniertes Bild / Custom image
        document.body.style.background = `url('${customUrl}') no-repeat center center fixed`;
        document.body.style.backgroundSize = 'cover';
    } else {
        // CSS Gradient verwenden / Use CSS gradient
        const gradient = Storage.getGradient(gradientName);
        document.body.style.background = gradient;
        document.body.style.backgroundSize = 'cover';
    }
}

// ==========================================
// Uhr / Clock
// ==========================================

/**
 * Uhr initialisieren / Initialize clock
 */
function initializeClock() {
    updateClock();
    // Jede Sekunde aktualisieren / Update every second
    clockInterval = setInterval(updateClock, 1000);
}

/**
 * Uhr aktualisieren / Update clock
 */
function updateClock() {
    const now = new Date();
    
    // Zeit formatieren / Format time
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let timeString = '';
    
    if (settings.clockFormat === '12h') {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Stunde 0 wird zu 12 / Hour 0 becomes 12
        timeString = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } else {
        timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    elements.time.textContent = timeString;
    
    // Datum formatieren (Deutsch) / Format date (German)
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    elements.date.textContent = `${dayName}, ${day}. ${month} ${year}`;
}

// ==========================================
// Suche / Search
// ==========================================

/**
 * Suche initialisieren / Initialize search
 */
function initializeSearch() {
    // Suchmaschine aus Einstellungen laden / Load search engine from settings
    if (elements.searchEngine && settings.searchEngine) {
        elements.searchEngine.value = settings.searchEngine;
    }
}

/**
 * Suchanfrage ausführen / Execute search query
 * @param {string} query - Suchbegriff
 * @param {string} engine - Suchmaschine
 */
function performSearch(query, engine) {
    if (!query.trim()) return;
    
    const searchUrls = {
        google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`
    };
    
    const url = searchUrls[engine] || searchUrls.google;
    window.location.href = url;
}

// ==========================================
// Lesezeichen / Bookmarks
// ==========================================

/**
 * Lesezeichen rendern / Render bookmarks
 */
function renderBookmarks() {
    if (!elements.bookmarksGrid) return;
    
    elements.bookmarksGrid.innerHTML = '';
    
    bookmarks.forEach(bookmark => {
        const item = createBookmarkElement(bookmark);
        elements.bookmarksGrid.appendChild(item);
    });
}

/**
 * Lesezeichen-Element erstellen / Create bookmark element
 * @param {Object} bookmark - Lesezeichen-Objekt
 * @returns {HTMLElement} Lesezeichen-Element
 */
function createBookmarkElement(bookmark) {
    const item = document.createElement('a');
    item.className = 'bookmark-item';
    item.href = bookmark.url;
    item.setAttribute('data-id', bookmark.id);
    
    // Domain für Favicon extrahieren / Extract domain for favicon
    let domain = '';
    try {
        domain = new URL(bookmark.url).hostname;
    } catch (e) {
        domain = 'example.com';
    }
    
    // HTML-Zeichen escapen / Escape HTML characters
    const escapeHtml = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };
    
    const safeName = escapeHtml(bookmark.name);
    const safeId = escapeHtml(bookmark.id);
    const firstChar = bookmark.name.charAt(0).toUpperCase();
    const safeFirstChar = encodeURIComponent(firstChar);
    
    // Favicon mit Google API laden / Load favicon with Google API
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
    
    // SVG Fallback mit sicherem Zeichen / SVG fallback with safe character
    const fallbackSvg = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22 viewBox=%220 0 24 24%22 fill=%22%236366f1%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22/><text x=%2212%22 y=%2216%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2210%22>${safeFirstChar}</text></svg>`;
    
    // DOM-Elemente erstellen statt innerHTML / Create DOM elements instead of innerHTML
    const iconDiv = document.createElement('div');
    iconDiv.className = 'bookmark-icon';
    
    const img = document.createElement('img');
    img.src = faviconUrl;
    img.alt = bookmark.name;
    img.onerror = function() { this.src = fallbackSvg; };
    iconDiv.appendChild(img);
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'bookmark-name';
    nameSpan.textContent = bookmark.name;
    
    const editBtn = document.createElement('button');
    editBtn.className = 'bookmark-edit-btn';
    editBtn.setAttribute('aria-label', 'Bearbeiten');
    editBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
    `;
    editBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openEditBookmark(bookmark.id);
    });
    
    item.appendChild(iconDiv);
    item.appendChild(nameSpan);
    item.appendChild(editBtn);
    
    return item;
}

/**
 * Modal für neues Lesezeichen öffnen / Open modal for new bookmark
 */
function openAddBookmark() {
    editingBookmarkId = null;
    elements.modalTitle.textContent = 'Lesezeichen hinzufügen';
    elements.bookmarkName.value = '';
    elements.bookmarkUrl.value = '';
    elements.bookmarkId.value = '';
    elements.deleteBookmark.style.display = 'none';
    elements.modal.classList.add('active');
    elements.bookmarkName.focus();
}

/**
 * Modal zum Bearbeiten eines Lesezeichens öffnen / Open modal to edit bookmark
 * @param {string} id - Lesezeichen-ID
 */
function openEditBookmark(id) {
    const bookmark = bookmarks.find(b => b.id === id);
    if (!bookmark) return;
    
    editingBookmarkId = id;
    elements.modalTitle.textContent = 'Lesezeichen bearbeiten';
    elements.bookmarkName.value = bookmark.name;
    elements.bookmarkUrl.value = bookmark.url;
    elements.bookmarkId.value = id;
    elements.deleteBookmark.style.display = 'block';
    elements.modal.classList.add('active');
    elements.bookmarkName.focus();
}

/**
 * Modal schließen / Close modal
 */
function closeModal() {
    elements.modal.classList.remove('active');
    editingBookmarkId = null;
}

/**
 * Lesezeichen speichern / Save bookmark
 * @param {Event} e - Submit-Event
 */
async function handleBookmarkSubmit(e) {
    e.preventDefault();
    
    const name = elements.bookmarkName.value.trim();
    let url = elements.bookmarkUrl.value.trim();
    
    if (!name || !url) return;
    
    // URL validieren und ggf. http:// hinzufügen
    // Validate URL and add http:// if necessary
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    if (editingBookmarkId) {
        // Bestehendes Lesezeichen aktualisieren / Update existing bookmark
        bookmarks = await Storage.updateBookmark(editingBookmarkId, { name, url });
    } else {
        // Neues Lesezeichen hinzufügen / Add new bookmark
        bookmarks = await Storage.addBookmark({ name, url });
    }
    
    renderBookmarks();
    closeModal();
}

/**
 * Lesezeichen löschen / Delete bookmark
 */
async function handleDeleteBookmark() {
    if (!editingBookmarkId) return;
    
    if (confirm('Möchten Sie dieses Lesezeichen wirklich löschen?')) {
        bookmarks = await Storage.deleteBookmark(editingBookmarkId);
        renderBookmarks();
        closeModal();
    }
}

// ==========================================
// Zitate / Quotes
// ==========================================

/**
 * Zufälliges Zitat anzeigen / Display random quote
 */
function displayRandomQuote() {
    const quote = Storage.getRandomQuote();
    if (elements.quoteText && elements.quoteAuthor) {
        elements.quoteText.textContent = `"${quote.text}"`;
        elements.quoteAuthor.textContent = `- ${quote.author}`;
    }
}

// ==========================================
// Event Listener
// ==========================================

/**
 * Event Listener einrichten / Set up event listeners
 */
function setupEventListeners() {
    // Suche / Search
    if (elements.searchForm) {
        elements.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = elements.searchInput.value;
            const engine = elements.searchEngine.value;
            performSearch(query, engine);
        });
    }
    
    // Suchmaschine ändern / Change search engine
    if (elements.searchEngine) {
        elements.searchEngine.addEventListener('change', async () => {
            settings.searchEngine = elements.searchEngine.value;
            await Storage.saveSettings(settings);
        });
    }
    
    // Einstellungen öffnen / Open settings
    if (elements.settingsBtn) {
        elements.settingsBtn.addEventListener('click', () => {
            // Einstellungsseite öffnen / Open settings page
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open('settings.html', '_blank');
            }
        });
    }
    
    // Lesezeichen hinzufügen / Add bookmark
    if (elements.addBookmarkBtn) {
        elements.addBookmarkBtn.addEventListener('click', openAddBookmark);
    }
    
    // Modal schließen / Close modal
    if (elements.modalClose) {
        elements.modalClose.addEventListener('click', closeModal);
    }
    
    // Modal durch Klick außerhalb schließen / Close modal by clicking outside
    if (elements.modal) {
        elements.modal.addEventListener('click', (e) => {
            if (e.target === elements.modal) {
                closeModal();
            }
        });
    }
    
    // Lesezeichen-Formular absenden / Submit bookmark form
    if (elements.bookmarkForm) {
        elements.bookmarkForm.addEventListener('submit', handleBookmarkSubmit);
    }
    
    // Lesezeichen löschen / Delete bookmark
    if (elements.deleteBookmark) {
        elements.deleteBookmark.addEventListener('click', handleDeleteBookmark);
    }
    
    // Escape-Taste zum Schließen des Modals / Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Tastenkürzel für Suche (/) / Keyboard shortcut for search (/)
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== elements.searchInput) {
            e.preventDefault();
            elements.searchInput?.focus();
        }
    });
}

// ==========================================
// Global verfügbare Funktionen / Globally available functions
// ==========================================
window.openEditBookmark = openEditBookmark;

// ==========================================
// App starten / Start app
// ==========================================
document.addEventListener('DOMContentLoaded', initializeApp);
