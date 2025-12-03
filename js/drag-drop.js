/**
 * Drag and Drop functionality for widgets
 */
const DragDrop = {
  draggedElement: null,
  offsetX: 0,
  offsetY: 0,
  gridSnap: true,
  gridSize: 20,
  isEnabled: false,
  // Bound event handlers for proper removal
  boundHandlers: {},

  init() {
    this.loadSettings();
    // Pre-bind handlers for consistent references
    this.boundHandlers = {
      dragStart: this.handleDragStart.bind(this),
      touchStart: this.handleTouchStart.bind(this),
      dragMove: this.handleDragMove.bind(this),
      dragEnd: this.handleDragEnd.bind(this),
      touchMove: this.handleTouchMove.bind(this),
      touchEnd: this.handleTouchEnd.bind(this)
    };
  },

  async loadSettings() {
    this.gridSnap = await Storage.get('gridSnap', true);
    this.gridSize = await Storage.get('gridSize', 20);
  },

  enable() {
    this.isEnabled = true;
    this.setupDragListeners();
  },

  disable() {
    this.isEnabled = false;
    this.removeDragListeners();
  },

  setupDragListeners() {
    document.querySelectorAll('.widget').forEach(widget => {
      const dragHandle = widget.querySelector('.drag-handle');
      if (dragHandle) {
        dragHandle.addEventListener('mousedown', this.boundHandlers.dragStart);
        dragHandle.addEventListener('touchstart', this.boundHandlers.touchStart, { passive: false });
      }
    });

    // Global listeners
    document.addEventListener('mousemove', this.boundHandlers.dragMove);
    document.addEventListener('mouseup', this.boundHandlers.dragEnd);
    document.addEventListener('touchmove', this.boundHandlers.touchMove, { passive: false });
    document.addEventListener('touchend', this.boundHandlers.touchEnd);
  },

  removeDragListeners() {
    document.querySelectorAll('.widget').forEach(widget => {
      const dragHandle = widget.querySelector('.drag-handle');
      if (dragHandle) {
        dragHandle.removeEventListener('mousedown', this.boundHandlers.dragStart);
        dragHandle.removeEventListener('touchstart', this.boundHandlers.touchStart);
      }
    });

    // Remove global listeners
    document.removeEventListener('mousemove', this.boundHandlers.dragMove);
    document.removeEventListener('mouseup', this.boundHandlers.dragEnd);
    document.removeEventListener('touchmove', this.boundHandlers.touchMove);
    document.removeEventListener('touchend', this.boundHandlers.touchEnd);
  },

  handleDragStart(e) {
    if (!this.isEnabled) return;
    
    e.preventDefault();
    const widget = e.target.closest('.widget');
    if (!widget) return;

    this.startDrag(widget, e.clientX, e.clientY);
  },

  handleTouchStart(e) {
    if (!this.isEnabled) return;
    
    e.preventDefault();
    const widget = e.target.closest('.widget');
    if (!widget) return;

    const touch = e.touches[0];
    this.startDrag(widget, touch.clientX, touch.clientY);
  },

  startDrag(widget, clientX, clientY) {
    this.draggedElement = widget;
    
    const rect = widget.getBoundingClientRect();
    this.offsetX = clientX - rect.left;
    this.offsetY = clientY - rect.top;

    // Enable absolute positioning
    widget.style.position = 'fixed';
    widget.style.zIndex = '1000';
    widget.classList.add('dragging');

    // Set initial position
    widget.style.left = `${rect.left}px`;
    widget.style.top = `${rect.top}px`;
    widget.style.width = `${rect.width}px`;
  },

  handleDragMove(e) {
    if (!this.draggedElement) return;
    this.moveTo(e.clientX, e.clientY);
  },

  handleTouchMove(e) {
    if (!this.draggedElement) return;
    e.preventDefault();
    const touch = e.touches[0];
    this.moveTo(touch.clientX, touch.clientY);
  },

  moveTo(clientX, clientY) {
    let x = clientX - this.offsetX;
    let y = clientY - this.offsetY;

    // Grid snapping
    if (this.gridSnap) {
      x = Math.round(x / this.gridSize) * this.gridSize;
      y = Math.round(y / this.gridSize) * this.gridSize;
    }

    // Boundary constraints
    const maxX = window.innerWidth - this.draggedElement.offsetWidth;
    const maxY = window.innerHeight - this.draggedElement.offsetHeight;
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    this.draggedElement.style.left = `${x}px`;
    this.draggedElement.style.top = `${y}px`;
  },

  handleDragEnd(e) {
    this.endDrag();
  },

  handleTouchEnd(e) {
    this.endDrag();
  },

  async endDrag() {
    if (!this.draggedElement) return;

    this.draggedElement.classList.remove('dragging');
    this.draggedElement.classList.add('positioned');

    // Save position
    const widgetId = this.draggedElement.dataset.widgetId;
    const left = parseFloat(this.draggedElement.style.left);
    const top = parseFloat(this.draggedElement.style.top);

    // Convert to percentage for responsive layout
    const leftPercent = (left / window.innerWidth) * 100;
    const topPercent = (top / window.innerHeight) * 100;

    const positions = await Storage.get('widgetPositions', {});
    positions[widgetId] = {
      ...positions[widgetId],
      x: leftPercent,
      y: topPercent,
      isPositioned: true
    };
    await Storage.set('widgetPositions', positions);

    // Reset
    this.draggedElement.style.zIndex = '';
    this.draggedElement = null;
  },

  async loadPositions() {
    const positions = await Storage.get('widgetPositions', {});
    
    Object.entries(positions).forEach(([widgetId, pos]) => {
      if (!pos.isPositioned) return;
      
      const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
      if (!widget) return;

      widget.classList.add('positioned');
      widget.style.position = 'fixed';
      widget.style.left = `${pos.x}%`;
      widget.style.top = `${pos.y}%`;
    });
  },

  setGridSnap(enabled) {
    this.gridSnap = enabled;
    Storage.set('gridSnap', enabled);
  },

  async resetPositions() {
    const positions = await Storage.get('widgetPositions', {});
    
    Object.keys(positions).forEach(widgetId => {
      const widget = document.querySelector(`[data-widget-id="${widgetId}"]`);
      if (widget) {
        widget.classList.remove('positioned');
        widget.style.position = '';
        widget.style.left = '';
        widget.style.top = '';
      }
      
      if (positions[widgetId]) {
        positions[widgetId].isPositioned = false;
        positions[widgetId].x = undefined;
        positions[widgetId].y = undefined;
      }
    });

    await Storage.set('widgetPositions', positions);
  }
};
