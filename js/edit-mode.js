/**
 * Edit Mode functionality
 * Manages the edit mode UI and coordination between widgets and drag/drop
 */
const EditMode = {
  isActive: false,
  editButton: null,
  toolbar: null,
  addWidgetBtn: null,
  groupWidgetsBtn: null,
  resetLayoutBtn: null,
  gridSnapToggle: null,
  exitEditBtn: null,

  init() {
    this.editButton = document.getElementById('edit-mode-btn');
    this.toolbar = document.getElementById('edit-toolbar');
    this.addWidgetBtn = document.getElementById('add-widget-btn');
    this.groupWidgetsBtn = document.getElementById('group-widgets-btn');
    this.resetLayoutBtn = document.getElementById('reset-layout-btn');
    this.gridSnapToggle = document.getElementById('grid-snap-toggle');
    this.exitEditBtn = document.getElementById('exit-edit-btn');

    this.bindEvents();
  },

  bindEvents() {
    // Toggle edit mode
    if (this.editButton) {
      this.editButton.addEventListener('click', () => this.toggle());
    }

    // Exit edit mode
    if (this.exitEditBtn) {
      this.exitEditBtn.addEventListener('click', () => this.deactivate());
    }

    // Add widget button
    if (this.addWidgetBtn) {
      this.addWidgetBtn.addEventListener('click', () => {
        Widgets.openGallery();
      });
    }

    // Group widgets button
    if (this.groupWidgetsBtn) {
      this.groupWidgetsBtn.addEventListener('click', () => {
        Widgets.openGroupModal();
      });
    }

    // Reset layout button
    if (this.resetLayoutBtn) {
      this.resetLayoutBtn.addEventListener('click', () => {
        Widgets.showConfirm(
          'Reset Layout',
          'Are you sure you want to reset all widgets to their default positions?',
          async () => {
            await Widgets.resetLayout();
            await DragDrop.resetPositions();
          }
        );
      });
    }

    // Grid snap toggle
    if (this.gridSnapToggle) {
      this.gridSnapToggle.addEventListener('change', (e) => {
        DragDrop.setGridSnap(e.target.checked);
      });
    }

    // Keyboard shortcut (Escape to exit edit mode)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isActive) {
        this.deactivate();
      }
    });
  },

  toggle() {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  },

  activate() {
    this.isActive = true;
    
    // Update UI
    document.body.classList.add('edit-mode-active');
    this.editButton.classList.add('active');
    this.toolbar.classList.remove('hidden');

    // Enable edit mode on all widgets
    document.querySelectorAll('.widget').forEach(widget => {
      widget.classList.add('edit-mode');
      const controls = widget.querySelector('.widget-edit-controls');
      if (controls) {
        controls.classList.remove('hidden');
      }
    });

    // Enable drag and drop
    DragDrop.enable();

    // Load grid snap setting
    this.loadGridSnapSetting();
  },

  deactivate() {
    this.isActive = false;
    
    // Update UI
    document.body.classList.remove('edit-mode-active');
    this.editButton.classList.remove('active');
    this.toolbar.classList.add('hidden');

    // Disable edit mode on all widgets
    document.querySelectorAll('.widget').forEach(widget => {
      widget.classList.remove('edit-mode', 'selected-for-group');
      const controls = widget.querySelector('.widget-edit-controls');
      if (controls) {
        controls.classList.add('hidden');
      }
      const checkbox = widget.querySelector('.widget-group-checkbox');
      if (checkbox) {
        checkbox.checked = false;
      }
    });

    // Clear group selection
    Widgets.selectedForGroup = [];

    // Disable drag and drop
    DragDrop.disable();
  },

  async loadGridSnapSetting() {
    const gridSnap = await Storage.get('gridSnap', true);
    if (this.gridSnapToggle) {
      this.gridSnapToggle.checked = gridSnap;
    }
    DragDrop.gridSnap = gridSnap;
  }
};
