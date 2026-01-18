/**
 * Chrome-Ex Service Worker
 * Feature #19: Offline-Modus
 * Feature: Distraction Counter - Track tab switches, new tabs, and global clicks
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

// Distraction Counter Storage
const DISTRACTION_KEY = 'distractionStats';

// Get today's date string
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// Get or initialize today's stats
async function getTodayStats() {
  const today = getTodayDate();
  const result = await chrome.storage.local.get(DISTRACTION_KEY);
  const stats = result[DISTRACTION_KEY] || {};
  
  // Reset if new day
  if (stats.date !== today) {
    return {
      date: today,
      tabSwitches: 0,
      newTabs: 0,
      clicks: 0
    };
  }
  
  return stats;
}

// Save stats
async function saveStats(stats) {
  await chrome.storage.local.set({ [DISTRACTION_KEY]: stats });
  
  // Broadcast update to all tabs
  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    chrome.tabs.sendMessage(tab.id, {
      type: 'DISTRACTION_STATS_UPDATE',
      stats: stats
    }).catch(() => {}); // Ignore errors for tabs that don't have content script
  });
}

// Track tab activation (tab switches)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const stats = await getTodayStats();
  stats.tabSwitches++;
  await saveStats(stats);
});

// Track new tabs
chrome.tabs.onCreated.addListener(async (tab) => {
  const stats = await getTodayStats();
  stats.newTabs++;
  await saveStats(stats);
});

// Message handler for content script clicks
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CLICK_TRACKED') {
    // Update click count
    getTodayStats().then(stats => {
      stats.clicks++;
      saveStats(stats);
    }).catch(error => {
      // Log errors for debugging
      console.debug('Error tracking click:', error);
    });
  } else if (message.type === 'GET_DISTRACTION_STATS') {
    // Send current stats
    getTodayStats().then(stats => {
      sendResponse({ stats });
    }).catch(error => {
      console.debug('Error getting stats:', error);
      sendResponse({ stats: { date: getTodayDate(), tabSwitches: 0, newTabs: 0, clicks: 0 } });
    });
    return true; // Keep channel open for async response
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
