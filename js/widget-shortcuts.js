/**
 * Schnellzugriff-Widget
 * Mit Drag & Drop für Sortierung und Icon-Picker
 * Jede Widget-Instanz hat eigene Shortcuts
 */

const ShortcutsWidget = {
    currentWidgetId: null,
    currentShortcut: null,
    draggedItem: null,

    async render(widgetId, container) {
        this.currentWidgetId = widgetId;
        const shortcuts = await StorageManager.getShortcuts(widgetId);

        container.innerHTML = `
            <div class="shortcuts-list" id="shortcuts-list-${widgetId}">
                ${this.renderShortcutsList(shortcuts, widgetId)}
            </div>
            <button class="add-shortcut-btn" data-widget-id="${widgetId}">
                + Schnellzugriff hinzufügen
            </button>
        `;

        this.initEventListeners(widgetId, container);
    },

    renderShortcutsList(shortcuts, widgetId) {
        if (shortcuts.length === 0) {
            return '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">Keine Schnellzugriffe</div>';
        }

        return shortcuts.map((shortcut, index) => `
            <div class="shortcut-item" data-shortcut-id="${shortcut.id}" data-index="${index}" draggable="true">
                <span class="shortcut-drag-handle" title="Zum Sortieren ziehen">⋮⋮</span>
                <div class="shortcut-icon">
                    ${this.renderIcon(shortcut)}
                </div>
                <div class="shortcut-info">
                    <div class="shortcut-name">${this.escapeHtml(shortcut.name)}</div>
                    <div class="shortcut-url">${this.escapeHtml(shortcut.url)}</div>
                </div>
                <button class="shortcut-edit-btn" data-shortcut-id="${shortcut.id}" title="Bearbeiten">✏️</button>
            </div>
        `).join('');
    },

    renderIcon(shortcut) {
        if (shortcut.iconType === 'emoji' && shortcut.iconEmoji) {
            return shortcut.iconEmoji;
        } else if (shortcut.iconType === 'upload' && shortcut.iconData) {
            return `<img src="${shortcut.iconData}" alt="">`;
        } else if (shortcut.iconType === 'url' && shortcut.iconUrl) {
            return `<img src="${shortcut.iconUrl}" alt="" onerror="this.parentElement.textContent='🌐'">`;
        } else {
            // Auto-Favicon
            const faviconUrl = getFaviconUrl(shortcut.url);
            if (faviconUrl) {
                return `<img src="${faviconUrl}" alt="" onerror="this.parentElement.textContent='🌐'">`;
            }
            return '🌐';
        }
    },

    initEventListeners(widgetId, container) {
        // Add Button
        const addBtn = container.querySelector('.add-shortcut-btn');
        addBtn.addEventListener('click', () => {
            this.openShortcutEditor(widgetId, null);
        });

        // Click Events
        container.addEventListener('click', async (e) => {
            const shortcutItem = e.target.closest('.shortcut-item');
            const editBtn = e.target.closest('.shortcut-edit-btn');
            const dragHandle = e.target.closest('.shortcut-drag-handle');

            if (editBtn) {
                e.stopPropagation();
                const shortcutId = editBtn.dataset.shortcutId;
                await this.openShortcutEditor(widgetId, shortcutId);
                return;
            }

            if (dragHandle) {
                return;
            }

            if (shortcutItem) {
                const shortcuts = await StorageManager.getShortcuts(widgetId);
                const shortcut = shortcuts.find(s => s.id === shortcutItem.dataset.shortcutId);
                if (shortcut && shortcut.url) {
                    window.open(shortcut.url, '_blank');
                }
            }
        });

        // Drag & Drop
        this.initDragAndDrop(widgetId, container);

        // Shortcut Editor Modal initialisieren
        this.initShortcutEditorModal();
    },

    initDragAndDrop(widgetId, container) {
        const list = container.querySelector(`#shortcuts-list-${widgetId}`);

        list.addEventListener('dragstart', (e) => {
            const item = e.target.closest('.shortcut-item');
            if (!item) return;

            this.draggedItem = item;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', item.dataset.shortcutId);
        });

        list.addEventListener('dragend', (e) => {
            const item = e.target.closest('.shortcut-item');
            if (item) {
                item.classList.remove('dragging');
            }
            this.draggedItem = null;

            // Alle drag-over Klassen entfernen
            list.querySelectorAll('.drag-over').forEach(el => {
                el.classList.remove('drag-over');
            });
        });

        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const item = e.target.closest('.shortcut-item');
            if (!item || item === this.draggedItem) return;

            list.querySelectorAll('.drag-over').forEach(el => {
                el.classList.remove('drag-over');
            });
            item.classList.add('drag-over');
        });

        list.addEventListener('drop', async (e) => {
            e.preventDefault();
            const targetItem = e.target.closest('.shortcut-item');
            if (!targetItem || !this.draggedItem || targetItem === this.draggedItem) return;

            const shortcuts = await StorageManager.getShortcuts(widgetId);
            const draggedId = this.draggedItem.dataset.shortcutId;
            const targetId = targetItem.dataset.shortcutId;

            const draggedIndex = shortcuts.findIndex(s => s.id === draggedId);
            const targetIndex = shortcuts.findIndex(s => s.id === targetId);

            if (draggedIndex === -1 || targetIndex === -1) return;

            // Reihenfolge ändern
            const [removed] = shortcuts.splice(draggedIndex, 1);
            shortcuts.splice(targetIndex, 0, removed);

            await StorageManager.saveShortcuts(widgetId, shortcuts);
            await this.refreshShortcutsList(widgetId);
        });
    },

    initShortcutEditorModal() {
        const modal = document.getElementById('shortcut-editor-modal');
        const closeBtn = modal.querySelector('.close-btn');
        const saveBtn = document.getElementById('save-shortcut');
        const deleteBtn = document.getElementById('delete-shortcut');
        const nameInput = document.getElementById('shortcut-name');
        const urlInput = document.getElementById('shortcut-url');
        const iconOptions = modal.querySelectorAll('.icon-option');

        // Icon-Typ Auswahl
        iconOptions.forEach(option => {
            option.addEventListener('click', () => {
                iconOptions.forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                this.updateIconInputVisibility(option.dataset.type);
            });
        });

        // Schließen
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            this.currentShortcut = null;
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                this.currentShortcut = null;
            }
        });

        // Speichern
        saveBtn.addEventListener('click', async () => {
            await this.saveCurrentShortcut();
            modal.classList.remove('active');
            this.currentShortcut = null;
            showNotification('Schnellzugriff gespeichert', 'success');
        });

        // Löschen
        deleteBtn.addEventListener('click', async () => {
            if (!this.currentShortcut || !this.currentShortcut.id) return;
            
            if (confirm('Schnellzugriff wirklich löschen?')) {
                await StorageManager.deleteShortcut(this.currentWidgetId, this.currentShortcut.id);
                await this.refreshShortcutsList(this.currentWidgetId);
                modal.classList.remove('active');
                this.currentShortcut = null;
                showNotification('Schnellzugriff gelöscht', 'success');
            }
        });

        // Icon Upload
        const uploadInput = document.getElementById('shortcut-icon-upload');
        uploadInput.addEventListener('change', async (e) => {
            if (e.target.files && e.target.files[0]) {
                const base64 = await fileToBase64(e.target.files[0]);
                this.currentShortcut.iconData = base64;
            }
        });
    },

    updateIconInputVisibility(type) {
        const emojiInput = document.getElementById('shortcut-icon-emoji');
        const uploadInput = document.getElementById('shortcut-icon-upload');
        const urlInput = document.getElementById('shortcut-icon-url');

        emojiInput.style.display = type === 'emoji' ? 'block' : 'none';
        uploadInput.style.display = type === 'upload' ? 'block' : 'none';
        urlInput.style.display = type === 'url' ? 'block' : 'none';
    },

    async openShortcutEditor(widgetId, shortcutId) {
        const modal = document.getElementById('shortcut-editor-modal');
        const nameInput = document.getElementById('shortcut-name');
        const urlInput = document.getElementById('shortcut-url');
        const deleteBtn = document.getElementById('delete-shortcut');
        const iconOptions = modal.querySelectorAll('.icon-option');

        this.currentWidgetId = widgetId;

        if (shortcutId) {
            const shortcuts = await StorageManager.getShortcuts(widgetId);
            const shortcut = shortcuts.find(s => s.id === shortcutId);
            
            if (shortcut) {
                this.currentShortcut = { ...shortcut };
                nameInput.value = shortcut.name || '';
                urlInput.value = shortcut.url || '';
                deleteBtn.style.display = 'block';

                // Icon-Typ aktivieren
                const iconType = shortcut.iconType || 'auto';
                iconOptions.forEach(o => o.classList.remove('active'));
                const activeOption = [...iconOptions].find(o => o.dataset.type === iconType);
                if (activeOption) activeOption.classList.add('active');
                this.updateIconInputVisibility(iconType);

                // Icon-Werte setzen
                document.getElementById('shortcut-icon-emoji').value = shortcut.iconEmoji || '';
                document.getElementById('shortcut-icon-url').value = shortcut.iconUrl || '';
            }
        } else {
            this.currentShortcut = {
                id: generateUUID(),
                name: '',
                url: '',
                iconType: 'auto'
            };
            nameInput.value = '';
            urlInput.value = '';
            deleteBtn.style.display = 'none';
            
            iconOptions.forEach(o => o.classList.remove('active'));
            iconOptions[0].classList.add('active');
            this.updateIconInputVisibility('auto');
        }

        modal.classList.add('active');
        nameInput.focus();
    },

    async saveCurrentShortcut() {
        if (!this.currentShortcut) return;

        const nameInput = document.getElementById('shortcut-name');
        const urlInput = document.getElementById('shortcut-url');
        const activeIconOption = document.querySelector('.icon-option.active');

        this.currentShortcut.name = nameInput.value.trim() || 'Unbenannt';
        this.currentShortcut.url = urlInput.value.trim();
        this.currentShortcut.iconType = activeIconOption?.dataset.type || 'auto';

        if (this.currentShortcut.iconType === 'emoji') {
            this.currentShortcut.iconEmoji = document.getElementById('shortcut-icon-emoji').value;
        } else if (this.currentShortcut.iconType === 'url') {
            this.currentShortcut.iconUrl = document.getElementById('shortcut-icon-url').value;
        }

        await StorageManager.saveShortcut(this.currentWidgetId, this.currentShortcut);
        await this.refreshShortcutsList(this.currentWidgetId);
    },

    async refreshShortcutsList(widgetId) {
        const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
        if (!widget) return;

        const container = widget.querySelector('.widget-content');
        const shortcuts = await StorageManager.getShortcuts(widgetId);
        const listContainer = container.querySelector(`#shortcuts-list-${widgetId}`);
        
        if (listContainer) {
            listContainer.innerHTML = this.renderShortcutsList(shortcuts, widgetId);
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
window.ShortcutsWidget = ShortcutsWidget;
