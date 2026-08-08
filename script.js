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

// Generate random Id
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
  
  // Data Object
  data: JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
    {
      id: generateId(),
      name: "Tutorial",
      items: [
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
      ]
    },
    {
      id: generateId(),
      name: "Today's Work",
      items: [
        {
          id: generateId(),
          title: "Start a New Project",
          desc: "Can be anything",
          color: "green",
          date: "",
          completed: true
        },
        {
          id: generateId(),
          title: "Make at least 3 commits",
          desc: "No executes",
          color: "red",
          date: new Date().toISOString().split('T')[0],
          completed: false
        }
      ]
    }
  ],
  
  // Default active container
  activeContainerId: "",
  
  // Methods
  getContainerByName(name) {
    return this.data.find(c => c.name === name);
  },
  getItemsByName(name) {
    const container = this.getContainerByName(name);
    return container ? container.items : [];
  },
  getContainerById(id) {
    return this.data.find(c => c.id === id);
  },
  getItemsById(id) {
    const container = this.getContainerById(id);
    return container ? container.items : [];
  },
  
  // Save Data
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  },
  
  // Add and Delete Container
  addContainer() {
    const newContainer = { id: generateId(), name: "New Container", items: [] };
    this.data.push(newContainer);
    this.save();
    this.activeContainerId = newContainer.id;
  },
  deleteContainer(id) {
    this.data = this.data.filter(c => c.id !== id);
    
    // If selecting the container to be deleted, auto select first container
    if (this.data.length > 0) {
      this.activeContainerId = this.data[0].id;
    }
    
    this.save();
  },
  
  // Add and Delete Item
  addItem(containerId) {
    const newItem = { id: generateId(), title: "", desc: "", color: "none", date: "", completed: false };
    this.getItemsById(containerId).push(newItem);
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
  deleteItem(containerId, index) {
    const container = this.getContainerById(containerId);
    if (container.items[index]) {
      container.items.splice(index, 1);
      this.save();
      if ('vibrate' in navigator) navigator.vibrate([20, 50, 20]);
    }
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
  
  saveEditModal(containerId) {
    
    // Return if not editing
    if (!this.editingItem) return;
    
    // Find the actual item (via id) and save it
    const targetItems = this.getItemsById(containerId);
    const index = targetItems.findIndex(i => i.id === this.editingItem.id);
    
    // Loop through all keys and save
    if (index !== -1) {
      Object.keys(this.editingItem).forEach(key => {
        const value = this.editingItem[key];
        targetItems[index][key] = typeof value === 'string' ? value.trim() : value;
      });
      this.save();
    }
    
    // Close edit modal
    this.closeEditModal();
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
      
      // Get the target container
      const containerId = container.dataset.containerId;
      const targetContainer = state.getContainerById(containerId);
      
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
      
      // If dropped in trash can, delete the item, save, and vibrate
      if (isDroppedInTrash) {
        state.deleteItem(containerId, evt.oldIndex)
        return;
      }
      
      // Return if the position didn't change
      if (evt.oldIndex === evt.newIndex) return;
      
      // Clone the original items and change the item position in it
      const updatedItems = [...targetContainer.items];
      const [movedItem] = updatedItems.splice(evt.oldIndex, 1);
      updatedItems.splice(evt.newIndex, 0, movedItem);
      
      // Update original items and save
      targetContainer.items = updatedItems;
      state.save();
      
    }
    
  });
});
