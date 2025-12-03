/**
 * Uhr-Widget
 * Zeigt aktuelle Uhrzeit und Datum an
 */

const ClockWidget = {
    intervals: {},

    async render(widgetId, container) {
        container.innerHTML = `
            <div class="clock-display">
                <div class="time">00:00</div>
                <div class="date">Lädt...</div>
            </div>
        `;

        this.updateClock(container);
        
        // Intervall für Live-Updates
        if (this.intervals[widgetId]) {
            clearInterval(this.intervals[widgetId]);
        }
        this.intervals[widgetId] = setInterval(() => {
            this.updateClock(container);
        }, 1000);
    },

    updateClock(container) {
        const now = new Date();
        const timeElement = container.querySelector('.time');
        const dateElement = container.querySelector('.date');

        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }

        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    },

    destroy(widgetId) {
        if (this.intervals[widgetId]) {
            clearInterval(this.intervals[widgetId]);
            delete this.intervals[widgetId];
        }
    }
};

// Global verfügbar machen
window.ClockWidget = ClockWidget;
