/**
 * Background Service Worker
 * Für Alarme und Benachrichtigungen
 */

// Alarm-Listener für Countdown-Benachrichtigungen
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith('countdown-')) {
        const eventName = alarm.name.replace('countdown-', '');
        
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Countdown erreicht!',
            message: `"${eventName}" ist jetzt!`,
            priority: 2
        });
    }
});

// Installationslistener
chrome.runtime.onInstalled.addListener(() => {
    console.log('Chrome Dashboard Extension installiert');
});
