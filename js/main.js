/**
 * Haupt-Initialisierung
 * Startet alle Module beim Laden der Seite
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Dashboard wird initialisiert...');

    try {
        // Storage initialisieren
        await StorageManager.init();
        console.log('Storage initialisiert');

        // Einstellungen anwenden
        await SettingsManager.init();
        console.log('Einstellungen angewendet');

        // Widget-Manager initialisieren
        await WidgetManager.init();
        console.log('Widget-Manager initialisiert');

        // Animation für Slide-In Notification hinzufügen
        addNotificationStyles();

        console.log('Dashboard erfolgreich geladen!');
    } catch (error) {
        console.error('Fehler beim Laden des Dashboards:', error);
    }
});

// Fügt Notification-Animationen hinzu
function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        @keyframes slideDown {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
        }
    `;
    document.head.appendChild(style);
}
