// Background Service Worker für Event-Benachrichtigungen

// Installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Chrome Extension installiert');
  checkEventsDaily();
});

// Täglich Events prüfen
function checkEventsDaily() {
  // Alarm für tägliche Prüfung (um Mitternacht)
  chrome.alarms.create('daily-check', {
    when: getNextMidnight(),
    periodInMinutes: 1440 // 24 Stunden
  });
}

// Nächste Mitternacht berechnen
function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0, 0
  );
  return midnight.getTime();
}

// Alarm-Listener
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'daily-check') {
    checkTodayEvents();
  } else if (alarm.name.startsWith('event-')) {
    const eventId = parseInt(alarm.name.replace('event-', ''));
    showEventNotification(eventId);
  }
});

// Heutige Events prüfen
function checkTodayEvents() {
  chrome.storage.local.get(['calendarEvents'], (result) => {
    const events = result.calendarEvents || [];
    const today = new Date().toISOString().split('T')[0];
    
    events.forEach(event => {
      if (event.date === today) {
        showEventNotification(event.id);
      }
    });
  });
}

// Event-Benachrichtigung anzeigen
function showEventNotification(eventId) {
  chrome.storage.local.get(['calendarEvents'], (result) => {
    const events = result.calendarEvents || [];
    const event = events.find(e => e.id === eventId);
    
    if (!event) return;
    
    const notificationId = `event-notification-${eventId}`;
    
    // Prüfen ob Benachrichtigung für heute bereits angezeigt wurde
    chrome.storage.local.get(['shownNotifications'], (result) => {
      const shownNotifications = result.shownNotifications || {};
      const today = new Date().toISOString().split('T')[0];
      
      if (shownNotifications[notificationId] === today) {
        return; // Bereits heute angezeigt
      }
      
      // Benachrichtigung erstellen
      chrome.notifications.create(notificationId, {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: `${event.icon} ${event.title}`,
        message: event.description || `Event am ${new Date(event.date).toLocaleDateString('de-DE')}`,
        priority: 2,
        requireInteraction: true // Bleibt bis User es wegklickt
      });
      
      // Merken dass Benachrichtigung angezeigt wurde
      shownNotifications[notificationId] = today;
      chrome.storage.local.set({ shownNotifications });
    });
  });
}

// Benachrichtigungs-Click-Handler
chrome.notifications.onClicked.addListener((notificationId) => {
  // Optional: Extension öffnen wenn Benachrichtigung geklickt wird
  chrome.action.openPopup();
});

// Benachrichtigungen am Ende des Tages automatisch löschen
chrome.alarms.create('clear-old-notifications', {
  when: getNextMidnight(),
  periodInMinutes: 1440
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'clear-old-notifications') {
    clearOldNotifications();
  }
});

function clearOldNotifications() {
  chrome.storage.local.get(['shownNotifications'], (result) => {
    const shownNotifications = result.shownNotifications || {};
    const today = new Date().toISOString().split('T')[0];
    
    // Alte Benachrichtigungen löschen
    Object.keys(shownNotifications).forEach(notificationId => {
      if (shownNotifications[notificationId] !== today) {
        chrome.notifications.clear(notificationId);
        delete shownNotifications[notificationId];
      }
    });
    
    chrome.storage.local.set({ shownNotifications });
  });
}

// Bei Start direkt heutige Events prüfen
checkTodayEvents();
