// ------------------------------
// Variables and Helpers
// ------------------------------
const STORAGE_KEY = "Notick_v1";

// Color palette for item colors
const PALETTE = {
  none: {
    itemColor: "var(--white-black)",
    previewColor: "var(--white-black)",
    textColor: "var(--gray-12)",
    borderColor: "var(--gray-4)"
  },
  red: {
    itemColor: "color-mix(in srgb, var(--red-1), var(--red-2))",
    previewColor: "var(--red-3)",
    textColor: "var(--red-12)",
    borderColor: "var(--red-4)"
  },
  orange: {
    itemColor: "color-mix(in srgb, var(--orange-1), var(--orange-2))",
    previewColor: "var(--orange-3)",
    textColor: "var(--orange-12)",
    borderColor: "var(--orange-4)"
  },
  green: {
    itemColor: "color-mix(in srgb, var(--green-1), var(--green-2))",
    previewColor: "var(--green-3)",
    textColor: "var(--green-12)",
    borderColor: "var(--green-4)"
  },
  blue: {
    itemColor: "color-mix(in srgb, var(--blue-1), var(--blue-2))",
    previewColor: "var(--blue-3)",
    textColor: "var(--blue-12)",
    borderColor: "var(--blue-4)"
  },
  iris: {
    itemColor: "color-mix(in srgb, var(--iris-1), var(--iris-2))",
    previewColor: "var(--iris-3)",
    textColor: "var(--iris-12)",
    borderColor: "var(--iris-4)"
  }
};

// Generate random Id for items
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
}

// ------------------------------
// DOM Elements
// ------------------------------
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
const itemsContainer = document.querySelectorAll('.items-container');
const bottomBar = document.getElementById('bottom-bar');
const addItem = document.getElementById('add-item');
const editModal = document.getElementById('edit-modal');
const trashCan = document.getElementById('trash-can');

// ------------------------------
// DOM Helpers
// ------------------------------
function showBottomBarChild(target) {
  Array.from(bottomBar.children).forEach(child => {
    child.classList.add('hidden');
  });
  if (target) {
    target.classList.remove('hidden');
  }
}

// ------------------------------
// PetiteVue State
// ------------------------------
const state = PetiteVue.reactive({
  
  // Items Object
  items: JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
    {
      id: generateId(),
      title: "Click to edit!",
      desc: "Can add description too",
      color: "none",
      date: "",
      completed: false
    },
    {
      id: generateId(),
      title: "That's it!",
      desc: "Hope you like it",
      color: "none",
      date: "",
      completed: true
    }
  ],
  
  // Save
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
  },
  
  // Add and Delete Item
  addItem() {
    const newItem = { id: generateId(), title: "", desc: "", color: "none", date: "", completed: false };
    this.items.push(newItem);
    this.save();
    
    // Open Edit Modal and auto scroll
    this.pressStartTime = Date.now();
    this.openEditModal(newItem);
    PetiteVue.nextTick(() => {
      // IMPROVEMENTS when there's multiple container
      itemsContainer.forEach(container => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      });
    });
    
  },
  deleteItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.save();
  },
  
  // Overlay
  showingOverlay: false,
  onOverlayClick() {
    this.closeEditModal();
  },
  
  // Edit Modal functions
  pressStartTime: null,
  isDragging: false,
  editingItem: { id: "", title: "", desc: "", color: "none", date: "", completed: false },
  
  // When pointer is down, start counting
  onItemPointerDown(evt) {
    this.pressStartTime = Date.now();
  },
  
  openEditModal(item) {
    
    // If dragging, return
    if (this.isDragging) return;

    // If holding (>200ms) in mobile, return
    if (isTouchDevice && (Date.now() - this.pressStartTime > 200)) return;

    // Target the item (via editingItem), show overlay and edit modal
    this.editingItem = { ...item };
    this.showingOverlay = true;
    showBottomBarChild(editModal);
    
  },
  
  // Reset editingItem, hide overlay and edit modal
  closeEditModal() {
    this.editingItem = { id: "", title: "", desc: "", color: "none", date: "", completed: false };
    this.showingOverlay = false;
    showBottomBarChild(addItem);
  },
  
  saveEditModal() {
    
    // Return if not editing
    if (!this.editingItem) return;
    
    // Find the actual item (via id) and save it
    const index = this.items.findIndex(i => i.id === this.editingItem.id);
    
    // Loop through all keys and save
    if (index !== -1) {
      Object.keys(this.editingItem).forEach(key => {
        const value = this.editingItem[key];
        this.items[index][key] = typeof value === 'string' ? value.trim() : value;
      });
      this.save();
    }
    
    // Close edit modal
    this.closeEditModal();
  },
  
  // Auto resize textarea for description input
  autoResize(evt) {
    const el = evt.target;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  },
  
  // Due Date Functions
  currentDate() {
    return new Date().toISOString().split('T')[0];
  },
  formatDate(date) {
    return date.slice(5);
  },
  isOverDue(date) {
    return date < this.currentDate();
  }
  
});

// Create App
PetiteVue.createApp(state).mount('body');

// ------------------------------
// SortableJS
// ------------------------------
itemsContainer.forEach(container => {
  Sortable.create(container, {
    
    // Basic Settings
    animation: 250,
    handle: '.item',
    
    // Sortable Classes
    chosenClass: 'sortable-chosen',
    fallbackClass: 'sortable-fallback',
    ghostClass: 'sortable-ghost',
    forceFallback: true,
    fallbackOnBody: true,
    
    // Delay
    delay: isTouchDevice ? 250 : 0,
    delayOnTouchOnly: false,
    touchStartThreshold: 5,
    
    // Auto Scroll
    scroll: true,
    scrollSensitivity: 150, // IMPROVEMENTS when auto scrolling down (trash can problem)
    scrollSpeed: 10,
    
    // If is touch device, vibrate and show trash can when choosing item
    onChoose() {
      if ('vibrate' in navigator) navigator.vibrate(30);
      if (isTouchDevice) showBottomBarChild(trashCan);
    },

    // If not touch device, show trash can only when starting to drag item
    onStart() {
      state.isDragging = true;
      if (!isTouchDevice) showBottomBarChild(trashCan);
    },

    // If no overlay is showing, show add item button when unchoosing item
    onUnchoose() {
      setTimeout(() => {
        if (!state.showingOverlay) {
          showBottomBarChild(addItem);
        }
      }, 0);
    },
    
    // When finish dragging
    onEnd(evt) {

      // Reset dragging state
      setTimeout(() => {
        state.isDragging = false;
      }, 0);

      // Get the touch/cursor position
      const ogEvt = evt.originalEvent;
      let touchX = 0;
      let touchY = 0;

      if (ogEvt.changedTouches && ogEvt.changedTouches.length > 0) {
        touchX = ogEvt.changedTouches[0].clientX;
        touchY = ogEvt.changedTouches[0].clientY;
      } else {
        touchX = ogEvt.clientX;
        touchY = ogEvt.clientY;
      }
      
      const dropTarget = document.elementFromPoint(touchX, touchY);
      const isDroppedInTrash = trashCan.contains(dropTarget);
      
      // If dropped in trash can, delete the item. Otherwise, move the item to new position
      if (isDroppedInTrash) {
        
        // Delete, save, and vibrate
        state.items.splice(evt.oldIndex, 1);
        state.save();
        if ('vibrate' in navigator) navigator.vibrate([20, 50, 20]);
        
      } else {
        
        // Move and save
        const movedItem = state.items.splice(evt.oldIndex, 1)[0];
        state.items.splice(evt.newIndex, 0, movedItem);
        state.save();
        
      }
      
    }
    
  });
});
