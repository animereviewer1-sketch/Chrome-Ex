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

// ============ Fix 4: Event Notifications ============

// Create alarm to check events every hour
chrome.alarms.create('checkEvents', {
  periodInMinutes: 60,
  delayInMinutes: 0 // Start immediately
});

// Reset notified events at midnight
chrome.alarms.create('resetNotifications', {
  when: getNextMidnight(),
  periodInMinutes: 24 * 60
});

function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

// Track notified events (reset daily)
let notifiedEventIds = new Set();

// Alarm listener
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkEvents') {
    checkTodayEvents();
  } else if (alarm.name === 'resetNotifications') {
    notifiedEventIds.clear();
  }
});

async function checkTodayEvents() {
  try {
    // Get settings from storage
    const data = await chrome.storage.local.get('settings');
    const settings = data.settings || {};
    
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Check all pages and widgets for calendar events
    if (settings.pages) {
      Object.values(settings.pages).forEach(page => {
        page.widgets?.forEach(widget => {
          if (widget.type === 'calendar' && widget.data?.events) {
            widget.data.events.forEach(event => {
              // Check if event is today and hasn't been notified
              if (event.date === todayStr && !notifiedEventIds.has(event.id)) {
                showEventNotification(event);
                notifiedEventIds.add(event.id);
              }
              
              // Check yearly recurring events
              if (event.repeat === 'yearly' && !notifiedEventIds.has(event.id)) {
                const eventDate = new Date(event.date);
                if (eventDate.getDate() === today.getDate() && eventDate.getMonth() === today.getMonth()) {
                  showEventNotification(event);
                  notifiedEventIds.add(event.id);
                }
              }
            });
          }
        });
      });
    }
  } catch (error) {
    console.error('Error checking events:', error);
  }
}

function showEventNotification(event) {
  const notificationOptions = {
    type: 'basic',
    iconUrl: '/icons/icon128.png',
    title: `📅 ${event.title}`,
    message: event.description || 'Event heute!',
    requireInteraction: true,
    buttons: [
      { title: 'OK' },
      { title: 'In 1h erinnern' }
    ],
    priority: 2
  };
  
  if (event.time) {
    notificationOptions.message = `🕐 ${event.time}\n${notificationOptions.message}`;
  }
  
  chrome.notifications.create(`event-${event.id}`, notificationOptions);
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId.startsWith('event-')) {
    if (buttonIndex === 0) {
      // OK button - clear notification
      chrome.notifications.clear(notificationId);
    } else if (buttonIndex === 1) {
      // Remind in 1 hour
      chrome.notifications.clear(notificationId);
      const eventId = notificationId.replace('event-', '');
      
      // Remove from notified list so it can be shown again
      notifiedEventIds.delete(eventId);
      
      // Set a one-time alarm for 1 hour
      chrome.alarms.create(`remind-${eventId}`, {
        delayInMinutes: 60
      });
    }
  }
});

// Handle one-time reminder alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith('remind-')) {
    const eventId = alarm.name.replace('remind-', '');
    
    // Get event details and show notification again
    try {
      const data = await chrome.storage.local.get('settings');
      const settings = data.settings || {};
      
      if (settings.pages) {
        Object.values(settings.pages).forEach(page => {
          page.widgets?.forEach(widget => {
            if (widget.type === 'calendar' && widget.data?.events) {
              const event = widget.data.events.find(e => e.id === eventId);
              if (event) {
                showEventNotification(event);
              }
            }
          });
        });
      }
    } catch (error) {
      console.error('Error showing reminder:', error);
    }
  }
});
