/**
 * Notizen-Widget
 * Komplett funktionaler Editor mit CRUD Operations
 * Auto-Save nach 2 Sekunden
 */

const NotesWidget = {
    currentNote: null,
    currentWidgetId: null,
    autoSaveTimeout: null,

    async render(widgetId, container) {
        this.currentWidgetId = widgetId;
        const notes = await StorageManager.getNotes(widgetId);

        container.innerHTML = `
            <div class="notes-search">
                <input type="text" placeholder="Notizen durchsuchen..." id="notes-search-${widgetId}">
            </div>
            <div class="notes-list" id="notes-list-${widgetId}">
                ${this.renderNotesList(notes)}
            </div>
            <button class="add-note-btn" data-widget-id="${widgetId}">
                + Neue Notiz
            </button>
        `;

        // Event-Listener
        this.initEventListeners(widgetId, container);
    },

    renderNotesList(notes) {
        if (notes.length === 0) {
            return '<div class="no-notes" style="text-align: center; color: var(--text-secondary); padding: 20px;">Keine Notizen vorhanden</div>';
        }

        return notes.map(note => `
            <div class="note-item" data-note-id="${note.id}">
                <div class="note-info">
                    <div class="note-title">${this.escapeHtml(note.title) || 'Unbenannte Notiz'}</div>
                    <div class="note-preview">${this.escapeHtml(truncateText(note.content || '', 50))}</div>
                </div>
                <button class="note-delete-btn" data-note-id="${note.id}" title="Löschen">🗑️</button>
            </div>
        `).join('');
    },

    initEventListeners(widgetId, container) {
        // Suchfeld
        const searchInput = container.querySelector(`#notes-search-${widgetId}`);
        searchInput.addEventListener('input', debounce(async (e) => {
            await this.searchNotes(widgetId, e.target.value, container);
        }, 300));

        // Neue Notiz Button
        const addBtn = container.querySelector('.add-note-btn');
        addBtn.addEventListener('click', () => {
            this.openNoteEditor(widgetId, null);
        });

        // Notiz-Items
        container.addEventListener('click', async (e) => {
            const noteItem = e.target.closest('.note-item');
            const deleteBtn = e.target.closest('.note-delete-btn');

            if (deleteBtn) {
                e.stopPropagation();
                const noteId = deleteBtn.dataset.noteId;
                await this.deleteNote(widgetId, noteId, container);
                return;
            }

            if (noteItem) {
                const noteId = noteItem.dataset.noteId;
                await this.openNoteEditor(widgetId, noteId);
            }
        });

        // Note Editor Modal initialisieren (einmalig)
        this.initNoteEditorModal();
    },

    initNoteEditorModal() {
        const modal = document.getElementById('note-editor-modal');
        const closeBtn = modal.querySelector('.close-btn');
        const saveBtn = document.getElementById('save-note');
        const deleteBtn = document.getElementById('delete-note');
        const titleInput = document.getElementById('note-title');
        const contentTextarea = document.getElementById('note-content');

        // Schließen
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            this.currentNote = null;
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                this.currentNote = null;
            }
        });

        // Auto-Save bei Änderungen
        const autoSave = () => {
            if (this.autoSaveTimeout) {
                clearTimeout(this.autoSaveTimeout);
            }
            this.autoSaveTimeout = setTimeout(async () => {
                await this.saveCurrentNote();
            }, 2000);
        };

        titleInput.addEventListener('input', autoSave);
        contentTextarea.addEventListener('input', autoSave);

        // Speichern Button
        saveBtn.addEventListener('click', async () => {
            await this.saveCurrentNote();
            modal.classList.remove('active');
            this.currentNote = null;
            showNotification('Notiz gespeichert', 'success');
        });

        // Löschen Button
        deleteBtn.addEventListener('click', async () => {
            if (!this.currentNote || !this.currentNote.id) return;
            
            if (confirm('Notiz wirklich löschen?')) {
                const widgetId = this.currentWidgetId;
                await StorageManager.deleteNote(widgetId, this.currentNote.id);
                await this.refreshNotesList(widgetId);
                modal.classList.remove('active');
                this.currentNote = null;
                showNotification('Notiz gelöscht', 'success');
            }
        });
    },

    async openNoteEditor(widgetId, noteId) {
        const modal = document.getElementById('note-editor-modal');
        const titleInput = document.getElementById('note-title');
        const contentTextarea = document.getElementById('note-content');
        const deleteBtn = document.getElementById('delete-note');

        this.currentWidgetId = widgetId;

        if (noteId) {
            // Bestehende Notiz laden
            const notes = await StorageManager.getNotes(widgetId);
            const note = notes.find(n => n.id === noteId);
            
            if (note) {
                this.currentNote = { ...note };
                titleInput.value = note.title || '';
                contentTextarea.value = note.content || '';
                deleteBtn.style.display = 'block';
            }
        } else {
            // Neue Notiz erstellen
            this.currentNote = {
                id: generateUUID(),
                title: '',
                content: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            titleInput.value = '';
            contentTextarea.value = '';
            deleteBtn.style.display = 'none';
        }

        modal.classList.add('active');
        titleInput.focus();
    },

    async saveCurrentNote() {
        if (!this.currentNote) return;

        const titleInput = document.getElementById('note-title');
        const contentTextarea = document.getElementById('note-content');

        this.currentNote.title = titleInput.value.trim() || 'Unbenannte Notiz';
        this.currentNote.content = contentTextarea.value;
        this.currentNote.updatedAt = new Date().toISOString();

        await StorageManager.saveNote(this.currentWidgetId, this.currentNote);
        await this.refreshNotesList(this.currentWidgetId);
    },

    async deleteNote(widgetId, noteId, container) {
        if (!confirm('Notiz wirklich löschen?')) return;
        
        await StorageManager.deleteNote(widgetId, noteId);
        await this.refreshNotesList(widgetId);
        showNotification('Notiz gelöscht', 'success');
    },

    async searchNotes(widgetId, query, container) {
        const notes = await StorageManager.getNotes(widgetId);
        const lowerQuery = query.toLowerCase();
        
        const filtered = notes.filter(note => {
            return (note.title && note.title.toLowerCase().includes(lowerQuery)) ||
                   (note.content && note.content.toLowerCase().includes(lowerQuery));
        });

        const listContainer = container.querySelector(`#notes-list-${widgetId}`);
        listContainer.innerHTML = this.renderNotesList(filtered);
    },

    async refreshNotesList(widgetId) {
        const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
        if (!widget) return;

        const container = widget.querySelector('.widget-content');
        const notes = await StorageManager.getNotes(widgetId);
        const listContainer = container.querySelector(`#notes-list-${widgetId}`);
        
        if (listContainer) {
            listContainer.innerHTML = this.renderNotesList(notes);
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
window.NotesWidget = NotesWidget;
