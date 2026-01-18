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

// ============ Calendar Event Notifications ============

// Set up alarm on install/update
chrome.runtime.onInstalled.addListener(() => {
  console.log('Chrome-Ex: Service Worker installiert');
  
  // Create alarm to check calendar events every hour
  chrome.alarms.create('checkCalendarEvents', {
    periodInMinutes: 60
  });
  
  // Check immediately on install
  checkCalendarEvents();
});

// Listen to alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkCalendarEvents') {
    checkCalendarEvents();
  }
});

// Check for today's calendar events and send notifications
async function checkCalendarEvents() {
  try {
    const STORAGE_KEY = 'chromeExSettings';
    const result = await chrome.storage.local.get(STORAGE_KEY);
    
    if (!result[STORAGE_KEY]) return;
    
    const settings = result[STORAGE_KEY];
    const today = new Date().toISOString().split('T')[0];
    
    // Collect all events from all pages and widgets
    const allEvents = [];
    
    for (const pageId in settings.pages) {
      const page = settings.pages[pageId];
      if (page.widgets) {
        for (const widget of page.widgets) {
          if (widget.type === 'calendar' && widget.data?.events) {
            allEvents.push(...widget.data.events);
          }
        }
      }
    }
    
    // Find events for today
    const todaysEvents = allEvents.filter(event => {
      if (event.date === today) return true;
      
      // Check for recurring yearly events
      if (event.repeat === 'yearly') {
        const eventDate = new Date(event.date);
        const todayDate = new Date(today);
        return eventDate.getDate() === todayDate.getDate() && 
               eventDate.getMonth() === todayDate.getMonth();
      }
      
      return false;
    });
    
    // Create notifications for today's events
    for (const event of todaysEvents) {
      const notificationId = `calendar-event-${event.id}`;
      
      // Check if we already notified about this event today
      const notificationKey = `notified-${notificationId}-${today}`;
      const notifiedResult = await chrome.storage.local.get(notificationKey);
      
      if (!notifiedResult[notificationKey]) {
        // Create notification
        await chrome.notifications.create(notificationId, {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: `📅 Event heute: ${event.title}`,
          message: event.description || `Heute ist ${event.title}`,
          priority: 2,
          requireInteraction: true
        });
        
        // Mark as notified for today
        await chrome.storage.local.set({ [notificationKey]: true });
        
        console.log(`Chrome-Ex: Benachrichtigung erstellt für Event: ${event.title}`);
      }
    }
  } catch (error) {
    console.error('Chrome-Ex: Fehler beim Prüfen von Calendar Events:', error);
  }
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  console.log(`Chrome-Ex: Notification clicked: ${notificationId}`);
  chrome.notifications.clear(notificationId);
});

// Handle notification close
chrome.notifications.onClosed.addListener((notificationId) => {
  console.log(`Chrome-Ex: Notification closed: ${notificationId}`);
});
