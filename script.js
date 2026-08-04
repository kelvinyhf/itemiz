// ------------------------------
// Variables and Helpers
// ------------------------------
const STORAGE_KEY = "Notick_v1";

// Generate random Id for items
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
}

// ------------------------------
// DOM Elements
// ------------------------------
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
    { id: generateId(), title: "Click to edit!", desc: "Can add description too", completed: false },
    { id: generateId(), title: "That's it!", desc: "Hope you like it", completed: true }
  ],
  
  // Save
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
  },
  
  // Add and Delete Item
  addItem() {
    const newItem = { id: generateId(), title: "", desc: "", completed: false };
    this.items.push(newItem);
    this.save();
    
    // Open Edit Modal and auto scroll
    this.pressStartTime = Date.now();
    this.openEditModal(newItem);
    PetiteVue.nextTick(() => {
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
  isMouse: false,
  editingItem: { id: "", title: "", desc: "", completed: false },
  
  // When pointer is down, start counting and check pointer type
  onItemPointerDown(evt) {
    this.isMouse = evt.pointerType === 'mouse';
    this.pressStartTime = Date.now();
  },
  
  openEditModal(item) {
    
    // If it's hold (>200ms) and it's not mouse, return
    if ((Date.now() - this.pressStartTime > 200) && !this.isMouse) return;
    
    // Target the item (via editingItem), show overlay and edit modal
    this.editingItem = { ...item };
    this.showingOverlay = true;
    showBottomBarChild(editModal);
    
  },
  
  // Reset editingItem, hide overlay and edit modal
  closeEditModal() {
    this.editingItem = { id: "", title: "", desc: "", completed: false };
    this.showingOverlay = false;
    showBottomBarChild(addItem);
  },
  
  saveEditModal() {
    
    // Return if not editing
    if (!this.editingItem) return;
    
    // Find the actual item (via id) and save it
    const index = this.items.findIndex(i => i.id === this.editingItem.id);
    if (index !== -1) {
      this.items[index].title = this.editingItem.title.trim();
      this.items[index].desc = this.editingItem.desc.trim();
      this.save();
    }
    
    this.closeEditModal();
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
    delay: 250,
    delayOnTouchOnly: true,
    touchStartThreshold: 5,
    
    // UI Appearance when dragging
    onChoose() {
      if ('vibrate' in navigator) navigator.vibrate(30);
      showBottomBarChild(trashCan);
    },
    onUnchoose() {
      // [BUG TO BE FIXED]
    },
    
    // Move item or delete item
    onEnd(evt) {
      const ogEvt = evt.originalEvent;
      let touchX = 0;
      let touchY = 0;
      
      // Touch screen and cursor
      if (ogEvt.changedTouches && ogEvt.changedTouches.length > 0) {
        touchX = ogEvt.changedTouches[0].clientX;
        touchY = ogEvt.changedTouches[0].clientY;
      } else {
        touchX = ogEvt.clientX;
        touchY = ogEvt.clientY;
      }
      
      const dropTarget = document.elementFromPoint(touchX, touchY);
      const isDroppedInTrash = trashCan.contains(dropTarget);
      
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
      
      showBottomBarChild(addItem);
      
    }
    
  });
});
