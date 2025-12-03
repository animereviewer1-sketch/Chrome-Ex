/**
 * Kalender-Widget
 * Zeigt bevorstehende Events an
 * Platzhalter für Google Calendar Integration
 */

const CalendarWidget = {
    async render(widgetId, container) {
        const widget = await StorageManager.getWidget(widgetId);
        const events = widget?.events || [];

        if (events.length === 0) {
            container.innerHTML = `
                <div class="calendar-events">
                    <div class="no-events">
                        <p>📅 Keine Events</p>
                        <p style="font-size: 12px; margin-top: 8px;">
                            Kalender-Integration kommt bald!
                        </p>
                    </div>
                    <button class="connect-calendar-btn" data-widget-id="${widgetId}">
                        📆 Event manuell hinzufügen
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="calendar-events">
                    ${this.renderEvents(events)}
                    <button class="connect-calendar-btn" data-widget-id="${widgetId}">
                        + Neues Event
                    </button>
                </div>
            `;
        }

        this.initEventListeners(widgetId, container);
    },

    renderEvents(events) {
        // Sortiere nach Datum
        const sorted = [...events].sort((a, b) => 
            new Date(a.datetime) - new Date(b.datetime)
        );

        return sorted.map(event => {
            const date = new Date(event.datetime);
            const timeStr = date.toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const dateStr = date.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit'
            });

            return `
                <div class="calendar-event" data-event-id="${event.id}">
                    <div class="event-time">
                        <div>${timeStr}</div>
                        <div style="font-size: 10px; opacity: 0.7;">${dateStr}</div>
                    </div>
                    <div class="event-info">
                        <div class="event-title">${this.escapeHtml(event.title)}</div>
                        ${event.description ? `<div class="event-description">${this.escapeHtml(event.description)}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    },

    initEventListeners(widgetId, container) {
        const connectBtn = container.querySelector('.connect-calendar-btn');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                this.addManualEvent(widgetId);
            });
        }

        // Event klicken zum Bearbeiten
        container.querySelectorAll('.calendar-event').forEach(eventEl => {
            eventEl.addEventListener('click', () => {
                const eventId = eventEl.dataset.eventId;
                this.editEvent(widgetId, eventId);
            });
        });
    },

    async addManualEvent(widgetId) {
        const title = prompt('Event-Titel:');
        if (!title) return;

        const datetimeStr = prompt('Datum und Uhrzeit (YYYY-MM-DD HH:MM):');
        if (!datetimeStr) return;

        const datetime = new Date(datetimeStr.replace(' ', 'T'));
        if (isNaN(datetime.getTime())) {
            showNotification('Ungültiges Datum', 'error');
            return;
        }

        const description = prompt('Beschreibung (optional):') || '';

        const event = {
            id: generateUUID(),
            title,
            datetime: datetime.toISOString(),
            description
        };

        const widget = await StorageManager.getWidget(widgetId);
        if (widget) {
            if (!widget.events) widget.events = [];
            widget.events.push(event);
            await StorageManager.saveWidget(widgetId, widget);

            // Widget neu rendern
            const widgetElement = document.querySelector(`[data-widget-id="${widgetId}"]`);
            if (widgetElement) {
                const container = widgetElement.querySelector('.widget-content');
                await this.render(widgetId, container);
            }

            showNotification('Event hinzugefügt', 'success');
        }
    },

    async editEvent(widgetId, eventId) {
        const widget = await StorageManager.getWidget(widgetId);
        if (!widget || !widget.events) return;

        const event = widget.events.find(e => e.id === eventId);
        if (!event) return;

        const action = confirm(`Event "${event.title}"\n\nOK = Löschen, Abbrechen = Behalten`);
        
        if (action) {
            widget.events = widget.events.filter(e => e.id !== eventId);
            await StorageManager.saveWidget(widgetId, widget);

            // Widget neu rendern
            const widgetElement = document.querySelector(`[data-widget-id="${widgetId}"]`);
            if (widgetElement) {
                const container = widgetElement.querySelector('.widget-content');
                await this.render(widgetId, container);
            }

            showNotification('Event gelöscht', 'success');
        }
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Global verfügbar machen
window.CalendarWidget = CalendarWidget;
