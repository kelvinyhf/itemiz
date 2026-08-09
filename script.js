// ------------------------------
// Variables and Helpers
// ------------------------------
const DATA_KEY = "Notick_data_v1";
const ACTIVE_CONTAINER_ID_KEY = "Notick_active_container_id_v1";
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

// Color palette for item colors
const PALETTE = {
  none: {
    bgColor: "color-mix(in srgb, var(--white-black), var(--gray-1))",
    tabColor: "var(--white-black)",
    itemColor: "var(--white-black)",
    previewColor: "var(--white-black)",
    textColor: "var(--gray-12)",
    borderColor: "var(--gray-4)",
    placeholderColor: "var(--gray-11)"
  },
  red: {
    bgColor: "color-mix(in srgb, var(--white-black), var(--red-1))",
    tabColor: "var(--red-1)",
    itemColor: "color-mix(in srgb, var(--red-1), var(--red-2))",
    previewColor: "var(--red-3)",
    textColor: "var(--red-12)",
    borderColor: "var(--red-4)",
    placeholderColor: "var(--red-11)"
  },
  orange: {
    bgColor: "color-mix(in srgb, var(--white-black), var(--orange-1))",
    tabColor: "var(--orange-1)",
    itemColor: "color-mix(in srgb, var(--orange-1), var(--orange-2))",
    previewColor: "var(--orange-3)",
    textColor: "var(--orange-12)",
    borderColor: "var(--orange-4)",
    placeholderColor: "var(--orange-11)"
  },
  green: {
    bgColor: "color-mix(in srgb, var(--white-black), var(--green-1))",
    tabColor: "var(--green-1)",
    itemColor: "color-mix(in srgb, var(--green-1), var(--green-2))",
    previewColor: "var(--green-3)",
    textColor: "var(--green-12)",
    borderColor: "var(--green-4)",
    placeholderColor: "var(--green-11)"
  },
  blue: {
    bgColor: "color-mix(in srgb, var(--white-black), var(--blue-1))",
    tabColor: "var(--blue-1)",
    itemColor: "color-mix(in srgb, var(--blue-1), var(--blue-2))",
    previewColor: "var(--blue-3)",
    textColor: "var(--blue-12)",
    borderColor: "var(--blue-4)",
    placeholderColor: "var(--blue-11)"
  },
  iris: {
    bgColor: "color-mix(in srgb, var(--white-black), var(--iris-1))",
    tabColor: "var(--iris-1)",
    itemColor: "color-mix(in srgb, var(--iris-1), var(--iris-2))",
    previewColor: "var(--iris-3)",
    textColor: "var(--iris-12)",
    borderColor: "var(--iris-4)",
    placeholderColor: "var(--iris-11)"
  }
};

// Default data object if localStorage is empty
const DEFAULT_DATA = [
  {
    id: generateId(),
    name: "Tutorial",
    color: "none",
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
    color: "none",
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
]

// Generate random Id
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
}

// ------------------------------
// DOM Elements
// ------------------------------
const itemsContainer = document.querySelectorAll('.items-container');
const topBar = document.getElementById('top-bar');
const bottomBar = document.getElementById('bottom-bar');
const toolbar = document.getElementById('toolbar');
const editModal = document.getElementById('edit-modal');
const settingModal = document.getElementById('setting-modal');
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
  data: JSON.parse(localStorage.getItem(DATA_KEY)) || DEFAULT_DATA,
  
  // Active container Id (from localStorage or first container)
  activeContainerId: (() => {
    const savedId = localStorage.getItem(ACTIVE_CONTAINER_ID_KEY);
    const data = JSON.parse(localStorage.getItem(DATA_KEY)) || DEFAULT_DATA;

    // If savedId exists and is valid, return it
    if (savedId && data && data.some(c => c.id === savedId)) {
      return savedId;
    }
    
    // Return the first container's id or an empty string if no containers exist
    return data.length > 0 ? data[0].id : "";
    
  })(),
  setActiveContainer(id) {
    this.activeContainerId = id;
    localStorage.setItem(ACTIVE_CONTAINER_ID_KEY, id);
  },

  // Get Container and Items by Id
  getContainerById(id) {
    return this.data.find(c => c.id === id);
  },
  getItemsById(id) {
    const container = this.getContainerById(id);
    return container ? container.items : [];
  },
  
  // Save Data
  save() {
    localStorage.setItem(DATA_KEY, JSON.stringify(this.data));
  },
  
  // Add and Delete Container
  addContainer() {
    const newContainer = { id: generateId(), name: "", color: "none", items: [] };
    this.data.push(newContainer);
    this.save();
    
    // Set new active container, open setting modal and auto scroll
    this.setActiveContainer(newContainer.id);
    this.openSettingModal(newContainer.id);
    PetiteVue.nextTick(() => {
      topBar.scrollTo({
        left: topBar.scrollWidth,
        behavior: 'smooth'
      });
    });
    
  },
  deleteContainer(id) {
    this.data = this.data.filter(c => c.id !== id);
    
    // If the deleted container was the active one, set the active container to the first one or empty if none left
    if (this.data.length > 0) {
      if (this.activeContainerId === id) {
        this.setActiveContainer(this.data[0].id);
      }
    } else {
      this.setActiveContainer("");
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
  
  // Edit Modal (about items)
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
    showBottomBarChild(toolbar);
  },
  
  saveEditModal(containerId) {
    
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
  },
  
  // Setting Modal (about containers)
  editingContainer: { id: "", name: "", color: "none", items: [] },
  
  openSettingModal(containerId) {
    
    // Target the container (via editingContainer), show overlay and setting modal
    this.editingContainer = { ...this.getContainerById(containerId) };
    this.showingOverlay = true;
    showBottomBarChild(settingModal);
    
  },
  
  // Reset editingContainer, hide overlay and setting modal
  closeSettingModal() {
    this.editingContainer = { id: "", name: "", color: "none", items: [] };
    this.showingOverlay = false;
    showBottomBarChild(toolbar);
  },
  
  saveSettingModal(containerId) {
    
    // Find the actual container (via id) and save it
    const targetContainer = this.getContainerById(containerId);
    
    // Loop through all keys and save
    Object.keys(this.editingContainer).forEach(key => {
      const value = this.editingContainer[key];
      targetContainer[key] = typeof value === 'string' ? value.trim() : value;
    });
    this.save();
    
    // Close setting modal
    this.closeSettingModal();
  }
  
});

// Create App and save once
PetiteVue.createApp(state).mount('body');
state.save();

// ------------------------------
// SortableJS - Items
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
    delay: isTouchDevice ? 250 : 0, // IMPROVEMENTS when dragging with mouse
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
          showBottomBarChild(toolbar);
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

// ------------------------------
// SortableJS - Containers
// ------------------------------
Sortable.create(topBar, {
  
  // Basic Settings
  animation: 250,
  handle: '.tabs',
  draggable: '.tabs',
  
  // Sortable Classes
  chosenClass: 'sortable-chosen',
  fallbackClass: 'sortable-fallback',
  ghostClass: 'sortable-ghost',
  forceFallback: true,
  fallbackOnBody: true,
  
  // Delay
  delay: isTouchDevice ? 150 : 0, // IMPROVEMENTS when dragging with mouse
  delayOnTouchOnly: false,
  touchStartThreshold: 5,
  
  // Auto Scroll
  scroll: true,
  scrollSensitivity: 100,
  scrollSpeed: 5,
  
  onEnd(evt) {
    
    // Return if the position didn't change
    if (evt.oldIndex === evt.newIndex) return;
    
    // Clone the original data and change the container position in it
    const updatedData = [...state.data];
    const [movedContainer] = updatedData.splice(evt.oldIndex, 1);
    updatedData.splice(evt.newIndex, 0, movedContainer);
    
    // Update original data and save
    state.data = updatedData;
    state.save();
    
  }
  
});
