/**
 * Countdown-Widget
 * Live-Updates, Event-Management, Benachrichtigungen
 */

const CountdownWidget = {
    intervals: {},
    currentWidgetId: null,
    currentCountdown: null,

    async render(widgetId, container) {
        this.currentWidgetId = widgetId;
        const widget = await StorageManager.getWidget(widgetId);
        const countdowns = widget?.countdowns || [];

        if (countdowns.length === 0) {
            container.innerHTML = `
                <div class="countdown-display">
                    <div class="no-countdown" style="text-align: center; color: var(--text-secondary); padding: 20px;">
                        Kein Countdown eingestellt
                    </div>
                    <button class="add-countdown-btn" data-widget-id="${widgetId}">
                        + Countdown hinzufügen
                    </button>
                </div>
            `;
        } else {
            // Zeige ersten Countdown
            const countdown = countdowns[0];
            container.innerHTML = `
                <div class="countdown-display">
                    <div class="event-name">${this.escapeHtml(countdown.name)}</div>
                    <div class="countdown-timer" id="countdown-timer-${widgetId}">
                        ${this.renderTimer(countdown)}
                    </div>
                    <button class="add-countdown-btn" data-widget-id="${widgetId}" style="margin-top: 16px;">
                        Bearbeiten
                    </button>
                </div>
            `;

            // Live-Update starten
            this.startLiveUpdate(widgetId, countdown);
        }

        this.initEventListeners(widgetId, container);
    },

    renderTimer(countdown) {
        const remaining = this.calculateRemaining(countdown.datetime);

        if (remaining.total <= 0) {
            return `
                <div class="countdown-unit">
                    <div class="countdown-value" style="font-size: 16px;">🎉</div>
                    <div class="countdown-label">Erreicht!</div>
                </div>
            `;
        }

        return `
            <div class="countdown-unit">
                <div class="countdown-value">${remaining.days}</div>
                <div class="countdown-label">Tage</div>
            </div>
            <div class="countdown-unit">
                <div class="countdown-value">${String(remaining.hours).padStart(2, '0')}</div>
                <div class="countdown-label">Std</div>
            </div>
            <div class="countdown-unit">
                <div class="countdown-value">${String(remaining.minutes).padStart(2, '0')}</div>
                <div class="countdown-label">Min</div>
            </div>
            <div class="countdown-unit">
                <div class="countdown-value">${String(remaining.seconds).padStart(2, '0')}</div>
                <div class="countdown-label">Sek</div>
            </div>
        `;
    },

    calculateRemaining(datetime) {
        const target = new Date(datetime).getTime();
        const now = Date.now();
        const total = target - now;

        if (total <= 0) {
            return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return {
            total,
            days: Math.floor(total / (1000 * 60 * 60 * 24)),
            hours: Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((total % (1000 * 60)) / 1000)
        };
    },

    startLiveUpdate(widgetId, countdown) {
        // Vorheriges Intervall stoppen
        if (this.intervals[widgetId]) {
            clearInterval(this.intervals[widgetId]);
        }

        this.intervals[widgetId] = setInterval(() => {
            const timerElement = document.getElementById(`countdown-timer-${widgetId}`);
            if (timerElement) {
                timerElement.innerHTML = this.renderTimer(countdown);

                // Prüfe ob Countdown erreicht
                const remaining = this.calculateRemaining(countdown.datetime);
                if (remaining.total <= 0) {
                    clearInterval(this.intervals[widgetId]);
                    
                    // Benachrichtigung senden wenn aktiviert
                    if (countdown.notification) {
                        this.sendNotification(countdown);
                    }
                }
            } else {
                clearInterval(this.intervals[widgetId]);
            }
        }, 1000);
    },

    sendNotification(countdown) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Countdown erreicht!', {
                body: `"${countdown.name}" ist jetzt!`,
                icon: '⏱️'
            });
        }
    },

    initEventListeners(widgetId, container) {
        container.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.add-countdown-btn');
            if (addBtn) {
                this.openCountdownEditor(widgetId);
            }
        });

        this.initCountdownEditorModal();
    },

    initCountdownEditorModal() {
        const modal = document.getElementById('countdown-editor-modal');
        if (!modal) return;

        const closeBtn = modal.querySelector('.close-btn');
        const saveBtn = document.getElementById('save-countdown');

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            this.currentCountdown = null;
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                this.currentCountdown = null;
            }
        });

        saveBtn.addEventListener('click', async () => {
            await this.saveCurrentCountdown();
            modal.classList.remove('active');
            showNotification('Countdown gespeichert', 'success');
        });
    },

    async openCountdownEditor(widgetId) {
        const modal = document.getElementById('countdown-editor-modal');
        const nameInput = document.getElementById('countdown-name');
        const datetimeInput = document.getElementById('countdown-datetime');
        const notificationCheckbox = document.getElementById('countdown-notification');

        this.currentWidgetId = widgetId;

        const widget = await StorageManager.getWidget(widgetId);
        const countdowns = widget?.countdowns || [];

        if (countdowns.length > 0) {
            const countdown = countdowns[0];
            this.currentCountdown = { ...countdown };
            nameInput.value = countdown.name || '';
            datetimeInput.value = countdown.datetime || '';
            notificationCheckbox.checked = countdown.notification || false;
        } else {
            this.currentCountdown = {
                id: generateUUID(),
                name: '',
                datetime: '',
                notification: false
            };
            nameInput.value = '';
            datetimeInput.value = '';
            notificationCheckbox.checked = false;

            // Standard-Datum: Morgen um 12:00
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(12, 0, 0, 0);
            datetimeInput.value = tomorrow.toISOString().slice(0, 16);
        }

        // Benachrichtigung anfordern wenn noch nicht erlaubt
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        modal.classList.add('active');
        nameInput.focus();
    },

    async saveCurrentCountdown() {
        if (!this.currentCountdown) return;

        const nameInput = document.getElementById('countdown-name');
        const datetimeInput = document.getElementById('countdown-datetime');
        const notificationCheckbox = document.getElementById('countdown-notification');

        this.currentCountdown.name = nameInput.value.trim() || 'Countdown';
        this.currentCountdown.datetime = datetimeInput.value;
        this.currentCountdown.notification = notificationCheckbox.checked;

        // Speichern als einziger Countdown (vereinfacht)
        const widget = await StorageManager.getWidget(this.currentWidgetId);
        if (widget) {
            widget.countdowns = [this.currentCountdown];
            await StorageManager.saveWidget(this.currentWidgetId, widget);
        }

        // Widget neu rendern
        const widgetElement = document.querySelector(`[data-widget-id="${this.currentWidgetId}"]`);
        if (widgetElement) {
            const container = widgetElement.querySelector('.widget-content');
            await this.render(this.currentWidgetId, container);
        }
    },

    destroy(widgetId) {
        if (this.intervals[widgetId]) {
            clearInterval(this.intervals[widgetId]);
            delete this.intervals[widgetId];
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
window.CountdownWidget = CountdownWidget;
