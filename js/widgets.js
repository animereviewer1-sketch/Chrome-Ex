/**
 * Widget-Manager
 * Verwaltet das Erstellen, Verschieben, Skalieren und Löschen von Widgets
 * Implementiert korrektes Drag & Drop mit getBoundingClientRect()
 */

const WidgetManager = {
    container: null,
    activeWidget: null,
    currentSettingsWidgetId: null,
    gridSize: 10,
    
    // Widget-Typen und deren Renderer
    widgetTypes: {
        clock: { name: 'Uhr', icon: '🕐', renderer: 'ClockWidget' },
        weather: { name: 'Wetter', icon: '🌤️', renderer: 'WeatherWidget' },
        notes: { name: 'Notizen', icon: '📝', renderer: 'NotesWidget' },
        shortcuts: { name: 'Schnellzugriff', icon: '⚡', renderer: 'ShortcutsWidget' },
        countdown: { name: 'Countdown', icon: '⏱️', renderer: 'CountdownWidget' },
        password: { name: 'Passwort-Generator', icon: '🔐', renderer: 'PasswordWidget' },
        calendar: { name: 'Kalender', icon: '📅', renderer: 'CalendarWidget' }
    },

    // Initialisierung
    async init() {
        this.container = document.getElementById('widget-container');
        const settings = await StorageManager.getSettings();
        this.gridSize = settings.gridSize || 10;
        
        // Bestehende Widgets laden
        await this.loadWidgets();
        
        // Event-Listener für Widget-Picker
        this.initWidgetPicker();
        
        // Event-Listener für Widget-Einstellungen
        this.initWidgetSettings();
    },

    // Lädt alle gespeicherten Widgets
    async loadWidgets() {
        const widgets = await StorageManager.getWidgets();
        
        for (const [widgetId, widgetData] of Object.entries(widgets)) {
            await this.renderWidget(widgetId, widgetData);
        }
    },

    // Erstellt ein neues Widget
    async createWidget(type, customData = {}) {
        const widgetId = generateUniqueId();
        const widgetData = {
            type,
            x: 100 + Math.random() * 200,
            y: 100 + Math.random() * 200,
            width: 280,
            height: 200,
            bgColor: '#1e1e2e',
            opacity: 80,
            effect: 'none',
            autoHide: false,
            ...customData
        };

        await StorageManager.saveWidget(widgetId, widgetData);
        await this.renderWidget(widgetId, widgetData);
        
        return widgetId;
    },

    // Rendert ein Widget
    async renderWidget(widgetId, widgetData) {
        const widget = createElement('div', {
            className: `widget widget-${widgetData.type}`,
            dataset: { widgetId, widgetType: widgetData.type }
        });

        // Position und Größe setzen
        widget.style.left = `${widgetData.x}px`;
        widget.style.top = `${widgetData.y}px`;
        widget.style.width = `${widgetData.width}px`;
        widget.style.height = `${widgetData.height}px`;

        // Effekte anwenden
        if (widgetData.effect && widgetData.effect !== 'none') {
            widget.classList.add(`effect-${widgetData.effect}`);
        }

        // Auto-Hide anwenden
        if (widgetData.autoHide) {
            widget.classList.add('auto-hide');
        }

        // Benutzerdefinierte Hintergrundfarbe und Opazität
        if (widgetData.bgColor) {
            const opacity = (widgetData.opacity || 80) / 100;
            const rgb = this.hexToRgb(widgetData.bgColor);
            widget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
        }

        // Widget-Header (Drag Handle)
        const header = this.createWidgetHeader(widgetId, widgetData.type);
        widget.appendChild(header);

        // Widget-Content
        const content = createElement('div', { className: 'widget-content' });
        widget.appendChild(content);

        // Resize-Handle
        const resizeHandle = createElement('div', { className: 'resize-handle' });
        widget.appendChild(resizeHandle);

        // Drag & Drop initialisieren
        this.initDragAndDrop(widget, header);

        // Resize initialisieren
        this.initResize(widget, resizeHandle);

        // Widget zum Container hinzufügen
        this.container.appendChild(widget);

        // Widget-spezifischen Content rendern
        await this.renderWidgetContent(widgetId, widgetData.type, content);
    },

    // Erstellt den Widget-Header
    createWidgetHeader(widgetId, type) {
        const typeInfo = this.widgetTypes[type] || { name: 'Widget', icon: '📦' };
        
        const header = createElement('div', { className: 'widget-header' });
        
        const title = createElement('span', { className: 'widget-title' }, [
            `${typeInfo.icon} ${typeInfo.name}`
        ]);
        
        const controls = createElement('div', { className: 'widget-controls' });
        
        // Einstellungen-Button
        const settingsBtn = createElement('button', {
            className: 'widget-control-btn settings-btn',
            title: 'Einstellungen',
            onClick: (e) => {
                e.stopPropagation();
                this.openWidgetSettings(widgetId);
            }
        }, ['⚙️']);
        
        controls.appendChild(settingsBtn);
        
        header.appendChild(title);
        header.appendChild(controls);
        
        return header;
    },

    // Drag & Drop mit korrekter Offset-Berechnung
    initDragAndDrop(widget, dragHandle) {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        dragHandle.addEventListener('mousedown', (e) => {
            if (e.target.closest('.widget-control-btn')) return;
            
            isDragging = true;
            widget.style.zIndex = '100';
            
            // Korrekte Offset-Berechnung mit getBoundingClientRect()
            const rect = widget.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        const onMouseMove = throttle((e) => {
            if (!isDragging) return;
            
            // Neue Position berechnen
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;
            
            // Zum Raster snappen
            newX = snapToGrid(newX, this.gridSize);
            newY = snapToGrid(newY, this.gridSize);
            
            // Grenzen einhalten
            const containerRect = this.container.getBoundingClientRect();
            const widgetRect = widget.getBoundingClientRect();
            
            newX = Math.max(0, Math.min(newX, containerRect.width - widgetRect.width));
            newY = Math.max(0, Math.min(newY, containerRect.height - widgetRect.height));
            
            widget.style.left = `${newX}px`;
            widget.style.top = `${newY}px`;
        }, 16);

        const onMouseUp = async () => {
            if (!isDragging) return;
            
            isDragging = false;
            widget.style.zIndex = '1';
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            // Position speichern
            const widgetId = widget.dataset.widgetId;
            const x = parseInt(widget.style.left);
            const y = parseInt(widget.style.top);
            await StorageManager.updateWidgetPosition(widgetId, x, y);
        };
    },

    // Resize-Funktionalität
    initResize(widget, resizeHandle) {
        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = widget.offsetWidth;
            startHeight = widget.offsetHeight;
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        const onMouseMove = throttle((e) => {
            if (!isResizing) return;
            
            let newWidth = startWidth + (e.clientX - startX);
            let newHeight = startHeight + (e.clientY - startY);
            
            // Zum Raster snappen
            newWidth = snapToGrid(newWidth, this.gridSize);
            newHeight = snapToGrid(newHeight, this.gridSize);
            
            // Min/Max Limits
            newWidth = Math.max(200, Math.min(800, newWidth));
            newHeight = Math.max(150, Math.min(600, newHeight));
            
            widget.style.width = `${newWidth}px`;
            widget.style.height = `${newHeight}px`;
        }, 16);

        const onMouseUp = async () => {
            if (!isResizing) return;
            
            isResizing = false;
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            // Größe speichern
            const widgetId = widget.dataset.widgetId;
            const width = parseInt(widget.style.width);
            const height = parseInt(widget.style.height);
            await StorageManager.updateWidgetSize(widgetId, width, height);
        };
    },

    // Rendert den Widget-spezifischen Content
    async renderWidgetContent(widgetId, type, contentElement) {
        const rendererName = this.widgetTypes[type]?.renderer;
        
        if (rendererName && window[rendererName]) {
            await window[rendererName].render(widgetId, contentElement);
        } else {
            contentElement.innerHTML = '<p>Widget nicht verfügbar</p>';
        }
    },

    // Widget-Picker initialisieren
    initWidgetPicker() {
        const modal = document.getElementById('widget-picker-modal');
        const addBtn = document.getElementById('add-widget-btn');
        const closeBtn = modal.querySelector('.close-btn');
        const widgetOptions = modal.querySelectorAll('.widget-option');

        addBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        widgetOptions.forEach(option => {
            option.addEventListener('click', async () => {
                const type = option.dataset.type;
                await this.createWidget(type);
                modal.classList.remove('active');
            });
        });
    },

    // Widget-Einstellungen initialisieren
    initWidgetSettings() {
        const modal = document.getElementById('widget-settings-modal');
        const closeBtn = modal.querySelector('.close-btn');
        const saveBtn = document.getElementById('save-widget-settings');
        const deleteBtn = document.getElementById('delete-widget');
        
        const bgColorInput = document.getElementById('widget-bg-color');
        const opacityInput = document.getElementById('widget-opacity');
        const opacityValue = document.getElementById('widget-opacity-value');
        const effectSelect = document.getElementById('widget-effect');
        const autoHideCheckbox = document.getElementById('widget-auto-hide');

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            this.currentSettingsWidgetId = null;
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                this.currentSettingsWidgetId = null;
            }
        });

        opacityInput.addEventListener('input', () => {
            opacityValue.textContent = `${opacityInput.value}%`;
        });

        saveBtn.addEventListener('click', async () => {
            if (!this.currentSettingsWidgetId) return;
            
            const widgetData = await StorageManager.getWidget(this.currentSettingsWidgetId);
            if (widgetData) {
                widgetData.bgColor = bgColorInput.value;
                widgetData.opacity = parseInt(opacityInput.value);
                widgetData.effect = effectSelect.value;
                widgetData.autoHide = autoHideCheckbox.checked;
                
                await StorageManager.saveWidget(this.currentSettingsWidgetId, widgetData);
                
                // Widget aktualisieren
                await this.updateWidgetAppearance(this.currentSettingsWidgetId, widgetData);
                
                modal.classList.remove('active');
                this.currentSettingsWidgetId = null;
                
                showNotification('Einstellungen gespeichert', 'success');
            }
        });

        deleteBtn.addEventListener('click', async () => {
            if (!this.currentSettingsWidgetId) return;
            
            if (confirm('Widget wirklich löschen?')) {
                await this.deleteWidget(this.currentSettingsWidgetId);
                modal.classList.remove('active');
                this.currentSettingsWidgetId = null;
            }
        });
    },

    // Öffnet die Widget-Einstellungen
    async openWidgetSettings(widgetId) {
        this.currentSettingsWidgetId = widgetId;
        const widgetData = await StorageManager.getWidget(widgetId);
        
        if (!widgetData) return;
        
        const modal = document.getElementById('widget-settings-modal');
        const bgColorInput = document.getElementById('widget-bg-color');
        const opacityInput = document.getElementById('widget-opacity');
        const opacityValue = document.getElementById('widget-opacity-value');
        const effectSelect = document.getElementById('widget-effect');
        const autoHideCheckbox = document.getElementById('widget-auto-hide');
        
        bgColorInput.value = widgetData.bgColor || '#1e1e2e';
        opacityInput.value = widgetData.opacity || 80;
        opacityValue.textContent = `${widgetData.opacity || 80}%`;
        effectSelect.value = widgetData.effect || 'none';
        autoHideCheckbox.checked = widgetData.autoHide || false;
        
        modal.classList.add('active');
    },

    // Aktualisiert das Aussehen eines Widgets
    async updateWidgetAppearance(widgetId, widgetData) {
        const widget = this.container.querySelector(`[data-widget-id="${widgetId}"]`);
        if (!widget) return;
        
        // Hintergrundfarbe und Opazität
        if (widgetData.bgColor) {
            const opacity = (widgetData.opacity || 80) / 100;
            const rgb = this.hexToRgb(widgetData.bgColor);
            widget.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
        }
        
        // Effekte entfernen und neu anwenden
        widget.classList.remove('effect-glow', 'effect-neon', 'effect-3d');
        if (widgetData.effect && widgetData.effect !== 'none') {
            widget.classList.add(`effect-${widgetData.effect}`);
        }
        
        // Auto-Hide
        widget.classList.toggle('auto-hide', widgetData.autoHide);
    },

    // Löscht ein Widget
    async deleteWidget(widgetId) {
        const widget = this.container.querySelector(`[data-widget-id="${widgetId}"]`);
        if (widget) {
            widget.remove();
        }
        await StorageManager.deleteWidget(widgetId);
        showNotification('Widget gelöscht', 'success');
    },

    // Aktualisiert die Rastergröße
    updateGridSize(size) {
        this.gridSize = size;
        document.documentElement.style.setProperty('--grid-size', `${size}px`);
    },

    // Hilfsfunktion: Hex zu RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 30, g: 30, b: 46 };
    }
};

// Global verfügbar machen
window.WidgetManager = WidgetManager;
