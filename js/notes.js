/**
 * Notes Widget Module
 */

const Notes = {
  container: null,
  notes: [],
  activeNoteId: null,
  saveTimeout: null,
  AUTOSAVE_DELAY: 2000,

  /**
   * Initialize notes widget
   */
  async init(container) {
    this.container = container;
    this.notes = await Storage.get('notes') || [];
    this.render();
  },

  /**
   * Render notes widget
   */
  render() {
    const pinnedNotes = this.notes.filter(n => n.pinned);
    const regularNotes = this.notes.filter(n => !n.pinned);
    const sortedNotes = [...pinnedNotes, ...regularNotes];

    this.container.innerHTML = `
      <div class="notes-widget">
        <div class="widget-header">
          <span class="widget-title">📝 Notizen</span>
          <button class="btn btn-secondary add-note-btn">+</button>
        </div>
        <div class="widget-content">
          <div class="notes-search">
            <input type="text" class="form-input notes-search-input" placeholder="Suchen...">
          </div>
          <div class="notes-list">
            ${sortedNotes.length > 0 
              ? sortedNotes.map(note => this.renderNoteItem(note)).join('')
              : '<div class="notes-empty">Keine Notizen vorhanden</div>'
            }
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  },

  /**
   * Render single note item
   */
  renderNoteItem(note) {
    const preview = note.content.substring(0, 50) + (note.content.length > 50 ? '...' : '');
    return `
      <div class="note-item ${note.pinned ? 'pinned' : ''}" data-id="${note.id}">
        ${note.pinned ? '<span class="note-pin">📌</span>' : ''}
        <div class="note-title">${this.escapeHtml(note.title || 'Unbenannt')}</div>
        <div class="note-preview">${this.escapeHtml(preview)}</div>
      </div>
    `;
  },

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Add note button
    this.container.querySelector('.add-note-btn').addEventListener('click', () => {
      this.createNote();
    });

    // Search input
    this.container.querySelector('.notes-search-input').addEventListener('input', (e) => {
      this.filterNotes(e.target.value);
    });

    // Note item clicks
    this.container.querySelectorAll('.note-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.id);
        this.openNote(id);
      });
    });
  },

  /**
   * Create new note
   */
  async createNote() {
    const newNote = {
      id: Date.now(),
      title: 'Neue Notiz',
      content: '',
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.notes.unshift(newNote);
    await this.save();
    this.render();
    this.openNote(newNote.id);
    return newNote;
  },

  /**
   * Open note in editor modal
   */
  openNote(id) {
    const note = this.notes.find(n => n.id === id);
    if (!note) return;

    this.activeNoteId = id;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay visible';
    modal.innerHTML = `
      <div class="modal" style="max-width: 600px;">
        <div class="modal-header">
          <input type="text" class="form-input note-title-input" value="${this.escapeHtml(note.title)}" placeholder="Titel">
          <div class="note-actions">
            <button class="btn btn-secondary pin-note-btn" title="${note.pinned ? 'Lösen' : 'Anpinnen'}">
              ${note.pinned ? '📌' : '📍'}
            </button>
            <button class="btn btn-danger delete-note-btn" title="Löschen">🗑️</button>
            <button class="modal-close">×</button>
          </div>
        </div>
        <div class="modal-body">
          <textarea class="note-editor" placeholder="Schreibe hier...">${this.escapeHtml(note.content)}</textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary export-note-btn">📥 Exportieren</button>
          <button class="btn btn-primary save-note-btn">💾 Speichern</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    const titleInput = modal.querySelector('.note-title-input');
    const editor = modal.querySelector('.note-editor');
    
    // Auto-save on input
    titleInput.addEventListener('input', () => this.autoSave(id, titleInput.value, editor.value));
    editor.addEventListener('input', () => this.autoSave(id, titleInput.value, editor.value));

    // Pin button
    modal.querySelector('.pin-note-btn').addEventListener('click', async () => {
      await this.togglePin(id);
      modal.querySelector('.pin-note-btn').textContent = note.pinned ? '📌' : '📍';
    });

    // Delete button
    modal.querySelector('.delete-note-btn').addEventListener('click', async () => {
      if (confirm('Notiz wirklich löschen?')) {
        await this.deleteNote(id);
        modal.remove();
      }
    });

    // Export button
    modal.querySelector('.export-note-btn').addEventListener('click', () => {
      this.exportNote(id);
    });

    // Save button
    modal.querySelector('.save-note-btn').addEventListener('click', async () => {
      await this.updateNote(id, titleInput.value, editor.value);
      modal.remove();
      this.render();
    });

    // Close button
    modal.querySelector('.modal-close').addEventListener('click', async () => {
      await this.updateNote(id, titleInput.value, editor.value);
      modal.remove();
      this.render();
    });

    // Close on ESC
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        this.updateNote(id, titleInput.value, editor.value);
        modal.remove();
        this.render();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  },

  /**
   * Auto-save note
   */
  autoSave(id, title, content) {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(async () => {
      await this.updateNote(id, title, content);
    }, this.AUTOSAVE_DELAY);
  },

  /**
   * Update note
   */
  async updateNote(id, title, content) {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      note.title = title;
      note.content = content;
      note.updatedAt = new Date().toISOString();
      await this.save();
    }
  },

  /**
   * Delete note
   */
  async deleteNote(id) {
    this.notes = this.notes.filter(n => n.id !== id);
    await this.save();
    this.render();
  },

  /**
   * Toggle pin status
   */
  async togglePin(id) {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      note.pinned = !note.pinned;
      await this.save();
    }
  },

  /**
   * Filter notes by search query
   */
  filterNotes(query) {
    const items = this.container.querySelectorAll('.note-item');
    const lowerQuery = query.toLowerCase();

    items.forEach(item => {
      const title = item.querySelector('.note-title').textContent.toLowerCase();
      const preview = item.querySelector('.note-preview').textContent.toLowerCase();
      const matches = title.includes(lowerQuery) || preview.includes(lowerQuery);
      item.style.display = matches ? '' : 'none';
    });
  },

  /**
   * Export note as file
   */
  exportNote(id, format = 'md') {
    const note = this.notes.find(n => n.id === id);
    if (!note) return;

    let content, filename, type;

    if (format === 'md') {
      content = `# ${note.title}\n\n${note.content}`;
      filename = `${note.title.replace(/[^a-z0-9]/gi, '_')}.md`;
      type = 'text/markdown';
    } else {
      content = `${note.title}\n\n${note.content}`;
      filename = `${note.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
      type = 'text/plain';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Save notes to storage
   */
  async save() {
    await Storage.set('notes', this.notes);
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Get all notes
   */
  getAll() {
    return [...this.notes];
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Notes;
}
