// ------------------------------
// Variables and Helpers
// ------------------------------
const STORAGE_KEY = "Notick_v1";

// Color palette for item colors
const PALETTE = {
  none: "bg-white-black",
  red: "bg-[color-mix(in_srgb,var(--color-red-1),var(--color-red-2))]",
  orange: "bg-[color-mix(in_srgb,var(--color-orange-1),var(--color-orange-2))]",
  green: "bg-[color-mix(in_srgb,var(--color-green-1),var(--color-green-2))]",
  blue: "bg-[color-mix(in_srgb,var(--color-blue-1),var(--color-blue-2))]",
  iris: "bg-[color-mix(in_srgb,var(--color-iris-1),var(--color-iris-2))]"
};

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
    {
      id: generateId(),
      title: "Click to edit!",
      desc: "Can add description too",
      color: "none",
      completed: false
    },
    {
      id: generateId(),
      title: "That's it!",
      desc: "Hope you like it",
      color: "none",
      completed: true
    }
  ],
  
  // Save
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
  },
  
  // Add and Delete Item
  addItem() {
    const newItem = { id: generateId(), title: "", desc: "", color: "none", completed: false };
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
  isMouse: false,
  editingItem: { id: "", title: "", desc: "", color: "none", completed: false },
  
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
    this.editingItem = { id: "", title: "", desc: "", color: "none", completed: false };
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
      this.items[index].color = this.editingItem.color;
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
    
    // Auto Scroll
    scroll: true,
    scrollSensitivity: 150, // IMPROVEMENTS when auto scrolling down (trash can problem)
    scrollSpeed: 10,
    
    // UI Appearance when dragging
    onChoose() {
      if ('vibrate' in navigator) navigator.vibrate(30);
      showBottomBarChild(trashCan);
    },
    onUnchoose() {
      setTimeout(() => {
        showBottomBarChild(addItem);
      }, 0);
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
      
    }
    
  });
});
