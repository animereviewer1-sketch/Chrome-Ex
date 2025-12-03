/**
 * Edit Mode Module
 * Handles edit mode toggle and grid system
 */

const EditMode = {
  isActive: false,
  gridSize: 12,
  gridVisible: false,
  gridContainer: null,

  /**
   * Initialize edit mode
   */
  async init() {
    this.isActive = await Storage.get('editMode') || false;
    this.gridSize = await Storage.get('gridSize') || 12;
    this.gridVisible = await Storage.get('gridVisible') || false;
    
    this.createGridOverlay();
    this.updateUI();
  },

  /**
   * Create grid overlay element
   */
  createGridOverlay() {
    this.gridContainer = document.createElement('div');
    this.gridContainer.className = 'grid-container';
    this.gridContainer.innerHTML = `<div class="grid-lines" data-grid-size="${this.gridSize}"></div>`;
    document.body.appendChild(this.gridContainer);
  },

  /**
   * Toggle edit mode
   */
  async toggle() {
    this.isActive = !this.isActive;
    await Storage.set('editMode', this.isActive);
    this.updateUI();
    
    // Dispatch event for other modules
    window.dispatchEvent(new CustomEvent('editModeChanged', { 
      detail: { isActive: this.isActive } 
    }));
  },

  /**
   * Enable edit mode
   */
  async enable() {
    this.isActive = true;
    await Storage.set('editMode', true);
    this.updateUI();
    window.dispatchEvent(new CustomEvent('editModeChanged', { 
      detail: { isActive: true } 
    }));
  },

  /**
   * Disable edit mode
   */
  async disable() {
    this.isActive = false;
    await Storage.set('editMode', false);
    this.updateUI();
    window.dispatchEvent(new CustomEvent('editModeChanged', { 
      detail: { isActive: false } 
    }));
  },

  /**
   * Update UI based on edit mode state
   */
  updateUI() {
    document.body.classList.toggle('edit-mode', this.isActive);
    
    if (this.gridContainer) {
      this.gridContainer.classList.toggle('visible', this.isActive && this.gridVisible);
    }

    // Update toggle button if exists
    const toggleBtn = document.querySelector('.edit-mode-toggle');
    if (toggleBtn) {
      toggleBtn.classList.toggle('active', this.isActive);
      toggleBtn.innerHTML = this.isActive 
        ? '✏️ Edit-Modus beenden'
        : '✏️ Edit-Modus';
    }
  },

  /**
   * Set grid size
   */
  async setGridSize(size) {
    this.gridSize = size;
    await Storage.set('gridSize', size);
    
    const gridLines = this.gridContainer.querySelector('.grid-lines');
    if (gridLines) {
      gridLines.setAttribute('data-grid-size', size);
    }
  },

  /**
   * Toggle grid visibility
   */
  async toggleGrid() {
    this.gridVisible = !this.gridVisible;
    await Storage.set('gridVisible', this.gridVisible);
    this.updateUI();
  },

  /**
   * Set grid visibility
   */
  async setGridVisible(visible) {
    this.gridVisible = visible;
    await Storage.set('gridVisible', visible);
    this.updateUI();
  },

  /**
   * Get snap position based on grid
   */
  getSnapPosition(x, y, containerWidth, containerHeight) {
    if (!this.isActive) {
      return { x, y };
    }

    const cellWidth = containerWidth / this.gridSize;
    const cellHeight = containerHeight / this.gridSize;

    const snappedX = Math.round(x / cellWidth) * cellWidth;
    const snappedY = Math.round(y / cellHeight) * cellHeight;

    return { 
      x: Math.max(0, Math.min(snappedX, containerWidth)), 
      y: Math.max(0, Math.min(snappedY, containerHeight)) 
    };
  },

  /**
   * Convert pixel position to percentage
   */
  toPercentage(x, y, containerWidth, containerHeight) {
    return {
      x: (x / containerWidth) * 100,
      y: (y / containerHeight) * 100
    };
  },

  /**
   * Convert percentage to pixel position
   */
  fromPercentage(xPercent, yPercent, containerWidth, containerHeight) {
    return {
      x: (xPercent / 100) * containerWidth,
      y: (yPercent / 100) * containerHeight
    };
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EditMode;
}
