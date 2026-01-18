/**
 * Chrome-Ex Service Worker
 * Feature #19: Offline-Modus
 * Fix 5: Ablenkungszähler - Tab-Tracking
 * Fix 6: History - Meistbesuchte Webseiten
 * 
 * Cached alle wichtigen Ressourcen für Offline-Nutzung
 */

const CACHE_NAME = 'chrome-ex-v1';
const CACHE_URLS = [
  '/newtab.html',
  '/css/newtab.css',
  '/js/newtab.js',
  '/lib/particles.min.js',
  '/icons/icon16.png',
  '/icons/icon48.png',
  '/icons/icon128.png',
  '/icons/default.png'
];

// Fix 5: Daily Stats - Tab Tracking
let dailyStats = {
  date: new Date().toDateString(),
  tabSwitches: 0,
  newTabs: 0
};

// Fix 6: Domain History Tracking
let domainHistory = {};

// Load stats on service worker start
chrome.storage.local.get(['dailyStats', 'domainHistory'], (result) => {
  const today = new Date().toDateString();
  
  if (result.dailyStats && result.dailyStats.date === today) {
    dailyStats = result.dailyStats;
  } else {
    dailyStats = { date: today, tabSwitches: 0, newTabs: 0 };
    chrome.storage.local.set({ dailyStats });
  }
  
  if (result.domainHistory) {
    domainHistory = result.domainHistory;
  }
  
  console.log('Chrome-Ex: Daily stats loaded:', dailyStats);
  console.log('Chrome-Ex: Domain history loaded:', Object.keys(domainHistory).length, 'domains');
});

// Fix 5: Track tab switches
chrome.tabs.onActivated.addListener(() => {
  dailyStats.tabSwitches++;
  chrome.storage.local.set({ dailyStats });
  console.log('Chrome-Ex: Tab switch:', dailyStats.tabSwitches);
});

// Fix 5: Track new tabs
chrome.tabs.onCreated.addListener(() => {
  dailyStats.newTabs++;
  chrome.storage.local.set({ dailyStats });
  console.log('Chrome-Ex: New tab:', dailyStats.newTabs);
});

// Fix 6: Track visited domains
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const domain = extractDomain(changeInfo.url);
    if (domain) {
      domainHistory[domain] = (domainHistory[domain] || 0) + 1;
      chrome.storage.local.set({ domainHistory });
      console.log('Chrome-Ex: Domain visit:', domain, domainHistory[domain]);
    }
  }
});

// Fix 6: Extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    // Skip chrome:// and extension URLs
    if (urlObj.protocol === 'chrome:' || urlObj.protocol === 'chrome-extension:') {
      return null;
    }
    
    const hostname = urlObj.hostname;
    const parts = hostname.split('.');
    
    // Return domain with TLD (e.g., "google.com")
    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }
    return hostname;
  } catch (e) {
    return null;
  }
}

// Fix 5: Midnight reset alarm
chrome.alarms.create('dailyReset', {
  when: getNextMidnight(),
  periodInMinutes: 24 * 60
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyReset') {
    console.log('Chrome-Ex: Daily reset triggered');
    dailyStats = {
      date: new Date().toDateString(),
      tabSwitches: 0,
      newTabs: 0
    };
    chrome.storage.local.set({ dailyStats });
    
    // Schedule next reset
    chrome.alarms.create('dailyReset', {
      when: getNextMidnight(),
      periodInMinutes: 24 * 60
    });
  }
});

function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

// Fix 6: API for retrieving history
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getHistory') {
    chrome.storage.local.get(['domainHistory'], (result) => {
      const history = result.domainHistory || {};
      
      // Sort by frequency
      const sorted = Object.entries(history)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20); // Top 20
      
      sendResponse({ history: sorted });
    });
    return true; // Async response
  }
  
  if (message.type === 'clearHistory') {
    domainHistory = {};
    chrome.storage.local.set({ domainHistory: {} });
    sendResponse({ success: true });
    return true;
  }
  
  if (message.type === 'resetStats') {
    dailyStats = {
      date: new Date().toDateString(),
      tabSwitches: 0,
      newTabs: 0
    };
    chrome.storage.local.set({ dailyStats });
    sendResponse({ success: true });
    return true;
  }
  
  if (message.type === 'getStats') {
    chrome.storage.local.get(['dailyStats'], (result) => {
      sendResponse({ stats: result.dailyStats || dailyStats });
    });
    return true;
  }
});

// Installation: Cache alle wichtigen Dateien
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Chrome-Ex: Cache geöffnet');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('Chrome-Ex: Cache-Fehler beim Installieren:', error);
      })
  );
});

// Aktivierung: Alte Caches löschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('Chrome-Ex: Lösche alten Cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Cache-First Strategy
self.addEventListener('fetch', (event) => {
  // Ignoriere chrome-extension interne Anfragen
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache Hit - return response
        if (response) {
          return response;
        }
        
        // Nicht im Cache - Netzwerk-Anfrage
        return fetch(event.request).then(networkResponse => {
          // Nur erfolgreiche Antworten cachen
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          
          // Antwort klonen und cachen
          const responseToCache = networkResponse.clone();
          
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return networkResponse;
        }).catch(() => {
          // Offline-Fallback für HTML
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/newtab.html');
          }
          return null;
        });
      })
  );
});

// Message Handler für manuelle Cache-Updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('Chrome-Ex: Cache gelöscht');
    });
  }
});
