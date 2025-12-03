/**
 * Drag and Drop Module
 * Handles widget dragging and positioning
 */

const DragDrop = {
  draggingElement: null,
  offsetX: 0,
  offsetY: 0,
  startX: 0,
  startY: 0,
  container: null,

  /**
   * Initialize drag and drop
   */
  init(container) {
    this.container = container || document.body;
    this.attachEventListeners();
  },

  /**
   * Make an element draggable
   */
  makeDraggable(element, handle = null) {
    const dragHandle = handle || element;
    
    dragHandle.addEventListener('mousedown', (e) => this.onDragStart(e, element));
    dragHandle.addEventListener('touchstart', (e) => this.onTouchStart(e, element), { passive: false });
  },

  /**
   * Attach global event listeners
   */
  attachEventListeners() {
    document.addEventListener('mousemove', (e) => this.onDragMove(e));
    document.addEventListener('mouseup', (e) => this.onDragEnd(e));
    document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    document.addEventListener('touchend', (e) => this.onTouchEnd(e));
  },

  /**
   * Handle drag start
   */
  onDragStart(e, element) {
    if (!EditMode.isActive) return;
    
    e.preventDefault();
    
    this.draggingElement = element;
    this.draggingElement.classList.add('dragging');
    
    const rect = element.getBoundingClientRect();
    this.offsetX = e.clientX - rect.left;
    this.offsetY = e.clientY - rect.top;
    this.startX = rect.left;
    this.startY = rect.top;
  },

  /**
   * Handle touch start
   */
  onTouchStart(e, element) {
    if (!EditMode.isActive) return;
    
    const touch = e.touches[0];
    this.onDragStart({ 
      preventDefault: () => e.preventDefault(),
      clientX: touch.clientX, 
      clientY: touch.clientY 
    }, element);
  },

  /**
   * Handle drag move
   */
  onDragMove(e) {
    if (!this.draggingElement) return;
    
    e.preventDefault();
    
    const containerRect = this.container.getBoundingClientRect();
    
    let newX = e.clientX - this.offsetX - containerRect.left;
    let newY = e.clientY - this.offsetY - containerRect.top;
    
    // Snap to grid if enabled
    const snapped = EditMode.getSnapPosition(
      newX, 
      newY, 
      containerRect.width, 
      containerRect.height
    );
    
    newX = snapped.x;
    newY = snapped.y;
    
    // Keep within bounds
    const elementRect = this.draggingElement.getBoundingClientRect();
    newX = Math.max(0, Math.min(newX, containerRect.width - elementRect.width));
    newY = Math.max(0, Math.min(newY, containerRect.height - elementRect.height));
    
    this.draggingElement.style.left = newX + 'px';
    this.draggingElement.style.top = newY + 'px';
  },

  /**
   * Handle touch move
   */
  onTouchMove(e) {
    if (!this.draggingElement) return;
    
    const touch = e.touches[0];
    this.onDragMove({ 
      preventDefault: () => e.preventDefault(),
      clientX: touch.clientX, 
      clientY: touch.clientY 
    });
  },

  /**
   * Handle drag end
   */
  async onDragEnd(e) {
    if (!this.draggingElement) return;
    
    this.draggingElement.classList.remove('dragging');
    
    // Calculate percentage position
    const containerRect = this.container.getBoundingClientRect();
    const elementRect = this.draggingElement.getBoundingClientRect();
    
    const percentX = ((elementRect.left - containerRect.left) / containerRect.width) * 100;
    const percentY = ((elementRect.top - containerRect.top) / containerRect.height) * 100;
    
    // Save position
    const widgetId = this.draggingElement.dataset.widgetId;
    if (widgetId) {
      await this.saveWidgetPosition(widgetId, percentX, percentY);
    }
    
    this.draggingElement = null;
  },

  /**
   * Handle touch end
   */
  onTouchEnd(e) {
    this.onDragEnd(e);
  },

  /**
   * Save widget position
   */
  async saveWidgetPosition(widgetId, x, y) {
    const pages = await Storage.get('pages') || {};
    const currentPage = await Storage.get('currentPage') || 'default';
    
    if (pages[currentPage] && pages[currentPage].widgets) {
      const widget = pages[currentPage].widgets.find(w => w.id === widgetId);
      if (widget) {
        widget.x = x;
        widget.y = y;
        await Storage.set('pages', pages);
      }
    }
  },

  /**
   * Position widget by percentage
   */
  positionWidget(element, xPercent, yPercent) {
    element.style.left = xPercent + '%';
    element.style.top = yPercent + '%';
    element.style.transform = 'translate(-50%, 0)';
  },

  /**
   * Reset widget position to center
   */
  centerWidget(element) {
    element.style.left = '50%';
    element.style.top = '50%';
    element.style.transform = 'translate(-50%, -50%)';
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DragDrop;
}
