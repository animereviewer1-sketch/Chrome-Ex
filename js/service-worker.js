/**
 * Chrome-Ex Service Worker
 * Feature #19: Offline-Modus
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
