// ------------------------------
// Variables and Helpers
// ------------------------------
const DATA_KEY = "Notick_data_v1";
const ACTIVE_LIST_ID_KEY = "Notick_active_list_id_v1";
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
  }]
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
  }]
}]

// Generate random Id
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
}

// ------------------------------
// DOM Elements
// ------------------------------
const topBar = document.getElementById('top-bar');
const lists = document.getElementById('lists');
const modals = document.getElementById('modals');
const editModal = document.getElementById('edit-modal');
const settingModal = document.getElementById('setting-modal');
const bottomBar = document.getElementById('bottom-bar');
const toolbar = document.getElementById('toolbar');
const trashCan = document.getElementById('trash-can');

// ------------------------------
// DOM Helpers
// ------------------------------
function showChild(target, container) {
  Array.from(container.children).forEach(child => {
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
  
  // Active list Id (from localStorage or first list)
  activeListId: (() => {
    const savedId = localStorage.getItem(ACTIVE_LIST_ID_KEY);
    const data = JSON.parse(localStorage.getItem(DATA_KEY)) || DEFAULT_DATA;
    
    // If savedId exists and is valid, return it
    if (savedId && data && data.some(c => c.id === savedId)) {
      return savedId;
    }
    
    // Return the first list's id or an empty string if no lists exist
    return data.length > 0 ? data[0].id : "";
    
  })(),
  checkActiveList(id) {
    if (this.activeListId === id) return true;
  },
  setActiveList(id) {
    
    if (this.checkActiveList(id)) return;
    
    // Remove old list's active style (if available) and add to new one
    if (id !== "") {
      const activeStyle = 'font-semibold scale-105';
      if (this.activeListId !== "") document.getElementById(this.activeListId).classList.remove(...activeStyle.split(' '));
      document.getElementById(id).classList.add(...activeStyle.split(' '));
    }
    
    // Set new active list
    this.activeListId = id;
    localStorage.setItem(ACTIVE_LIST_ID_KEY, id);
    
  },
  initActiveListStyle() {
    const activeStyle = 'font-semibold scale-105';
    const activeListEl = document.getElementById(this.activeListId);
    if (activeListEl) activeListEl.classList.add(...activeStyle.split(' '));
  },
  
  // Get List and Items by Id
  getListById(id) {
    return this.data.find(c => c.id === id);
  },
  getItemsById(id) {
    const list = this.getListById(id);
    return list ? list.items : [];
  },
  
  // Save Data
  save() {
    localStorage.setItem(DATA_KEY, JSON.stringify(this.data));
  },
  
  // Add and Delete List
  addList() {
    const newList = { id: generateId(), name: "", color: "none", items: [{ id: generateId(), title: "Click to edit", desc: "", color: "none", date: "", completed: false }] };
    this.data.push(newList);
    this.save();
    
    // Open Edit Modal
    this.listPressStartTime = Date.now();
    PetiteVue.nextTick(() => {
      
      // Set new active list and open setting modal
      this.setActiveList(newList.id);
      this.openSettingModal(newList.id);
      
      // Fade in animation
      const newListEl = document.getElementById(newList.id);
      newListEl.classList.add('fade-in-animation');
      setTimeout(() => {
        newListEl.classList.remove('fade-in-animation');
      }, 250);
      
      // Auto scroll
      topBar.scrollTo({
        left: topBar.scrollWidth,
        behavior: 'smooth'
      });
      
    });
    
  },
  deleteList(id) {
    
    // Get deleted list's index before deleting it
    const deletedIndex = this.data.findIndex(c => c.id === id);
    
    // Fade out animation
    const deleteListEl = document.getElementById(id);
    deleteListEl.classList.add('fade-out-animation');
    setTimeout(() => {
      deleteListEl.classList.remove('fade-out-animation');
      
      // Delete the list
      this.data = this.data.filter(c => c.id !== id);
      
      // If the deleted list was the active one
      if (this.activeListId === id) {
        if (this.data.length > 0) {
          const nextIndex = Math.max(0, deletedIndex - 1);
          this.setActiveList(this.data[nextIndex].id); // Set the active list to the left one, else right
        } else {
          this.setActiveList(""); // Set to empty if no list available
        }
      }
      
      this.save();
    }, 175);
    
  },
  
  // Add and Delete Item
  addItem(listId) {
    const newItem = { id: generateId(), title: "", desc: "", color: "none", date: "", completed: false };
    this.getItemsById(listId).push(newItem);
    this.save();
    
    // Open Edit Modal
    this.pressStartTime = Date.now();
    this.openEditModal(newItem);
    PetiteVue.nextTick(() => {
      
      // Fade in animation
      const newItemEl = document.getElementById(newItem.id);
      newItemEl.classList.add('fade-in-animation');
      setTimeout(() => {
        newItemEl.classList.remove('fade-in-animation');
      }, 250);
      
      // Auto scroll
      lists.scrollTo({
        top: lists.scrollHeight,
        behavior: 'smooth'
      });
      
    });
    
  },
  deleteItem(listId, index) {
    const list = this.getListById(listId);
    if (list.items[index]) {
      
      // Fade out animation
      const deleteItemEl = document.getElementById(list.items[index].id);
      deleteItemEl.classList.add('fade-out-animation');
      setTimeout(() => {
        deleteItemEl.classList.remove('fade-out-animation');
        
        // Delete, save, and vibrate
        list.items.splice(index, 1);
        this.save();
        if ('vibrate' in navigator) navigator.vibrate([20, 50, 20]);
        
      }, 175);
      
    }
  },
  deleteItemById(listId, itemId) {
    const list = this.getListById(listId);
    const index = list.items.findIndex(item => item.id === itemId);
    if (index !== -1) this.deleteItem(listId, index);
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
  
  // Overlay
  showingOverlay: false,
  onOverlayClick() {
    if (!editModal.classList.contains('hidden')) {
      this.closeEditModal();
    } else if (!settingModal.classList.contains('hidden')) {
      this.closeSettingModal();
    }
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
    editModal.classList.remove('slide-out-animation');
    editModal.classList.add('slide-in-animation');
    showChild(editModal, modals);
    
    // Slide out bottom bar
    bottomBar.classList.add('slide-out-animation');
    bottomBar.classList.remove('slide-in-animation');
    
    // Autofocus
    PetiteVue.nextTick(() => {
      const titleInput = document.getElementById('edit-modal-title-input');
      if (!isTouchDevice) titleInput.focus();
    });
    
  },
  
  // Reset editingItem, hide overlay and edit modal
  closeEditModal() {
    this.editingItem = { id: "", title: "", desc: "", color: "none", date: "", completed: false };
    this.showingOverlay = false;
    
    editModal.classList.remove('slide-in-animation');
    editModal.classList.add('slide-out-animation');
    setTimeout(() => {
      showChild(null, modals);
    }, 225);
    
    // Slide out bottom bar
    bottomBar.classList.remove('slide-out-animation');
    bottomBar.classList.add('slide-in-animation');
    
  },
  
  saveEditModal(listId) {
    
    // Find the actual item (via id) and save it
    const targetItems = this.getItemsById(listId);
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
  
  // Setting Modal (about lists)
  listPressStartTime: null,
  listIsDragging: false,
  editingList: { id: "", name: "", color: "none", items: [] },
  
  // When pointer is down, start counting
  onListPointerDown(evt) {
    this.listPressStartTime = Date.now();
  },
  
  openSettingModal(listId) {
    
    // If dragging, return
    if (this.listIsDragging) return;
    
    // If holding (>200ms) in mobile, return
    if (isTouchDevice && (Date.now() - this.listPressStartTime > 200)) return;
    
    // Target the list (via editingList), show overlay and setting modal
    this.editingList = { ...this.getListById(listId) };
    this.showingOverlay = true;
    settingModal.classList.remove('slide-out-animation');
    settingModal.classList.add('slide-in-animation');
    showChild(settingModal, modals);
    
    // Slide out bottom bar
    bottomBar.classList.add('slide-out-animation');
    bottomBar.classList.remove('slide-in-animation');
    
    // Autofocus
    PetiteVue.nextTick(() => {
      const nameInput = document.getElementById('setting-modal-name-input');
      if (!isTouchDevice) nameInput.focus();
    });
    
  },
  
  // Reset editingList, hide overlay and setting modal
  closeSettingModal() {
    this.editingList = { id: "", name: "", color: "none", items: [] };
    this.showingOverlay = false;
    
    settingModal.classList.remove('slide-in-animation');
    settingModal.classList.add('slide-out-animation');
    setTimeout(() => {
      showChild(null, modals);
    }, 225);
    
    // Slide out bottom bar
    bottomBar.classList.remove('slide-out-animation');
    bottomBar.classList.add('slide-in-animation');
    
  },
  
  saveSettingModal(listId) {
    
    // Find the actual list (via id) and save it
    const targetList = this.getListById(listId);
    
    // Loop through all keys and save
    Object.keys(this.editingList).forEach(key => {
      const value = this.editingList[key];
      targetList[key] = typeof value === 'string' ? value.trim() : value;
    });
    this.save();
    
    // Close setting modal
    this.closeSettingModal();
  },
  
  // Swipe down var for modals
  startY: 0,
  startTime: 0
  
});

// ------------------------------
// Initialization
// ------------------------------
PetiteVue.createApp(state).mount('body');
state.initActiveListStyle();
state.save();

// ------------------------------
// SortableJS - Items
// ------------------------------
// lists.forEach(list => {
Sortable.create(lists, { // RWD Change
  
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
    if (isTouchDevice) {
      setTimeout(() => {
        showChild(trashCan, bottomBar);
        trashCan.classList.remove('slide-out-animation-fast');
        trashCan.classList.add('slide-in-animation-fast');
      }, 150);
    };
  },
  
  // If not touch device, show trash can only when starting to drag item
  onStart() {
    state.isDragging = true;
    if (!isTouchDevice) {
      setTimeout(() => {
        showChild(trashCan, bottomBar);
        trashCan.classList.remove('slide-out-animation-fast');
        trashCan.classList.add('slide-in-animation-fast');
      }, 150);
    };
  },
  
  // If no overlay is showing, show toolbar when unchoosing item
  onUnchoose() {
    setTimeout(() => {
      if (!state.showingOverlay) {
        showChild(toolbar, bottomBar);
        toolbar.classList.remove('slide-out-animation-fast');
        toolbar.classList.add('slide-in-animation-fast');
      }
    }, 150);
  },
  
  // When finish dragging
  onEnd(evt) {
    
    // Reset dragging state
    setTimeout(() => {
      state.isDragging = false;
    }, 0);
    
    // Get the target list
    const listId = lists.dataset.listId;
    const targetList = state.getListById(listId);
    
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
      state.deleteItem(listId, evt.oldIndex)
      return;
    }
    
    // Return if the position didn't change
    if (evt.oldIndex === evt.newIndex) return;
    
    // Clone the original items and change the item position in it
    const updatedItems = [...targetList.items];
    const [movedItem] = updatedItems.splice(evt.oldIndex, 1);
    updatedItems.splice(evt.newIndex, 0, movedItem);
    
    // Update original items and save
    targetList.items = updatedItems;
    state.save();
    
  }
  
});
// });

// ------------------------------
// SortableJS - Lists
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
  scroll: true, // IMPROVEMENTS auto scroll sometimes not working
  scrollSensitivity: 100,
  scrollSpeed: 5,
  
  // If is touch device, vibrate when choosing list
  onChoose() {
    if ('vibrate' in navigator) navigator.vibrate(30);
  },
  onStart() {
    state.listIsDragging = true;
  },
  
  // When finish dragging
  onEnd(evt) {
    
    // Reset dragging state
    setTimeout(() => {
      state.listIsDragging = false;
    }, 0);
    
    // Return if the position didn't change
    if (evt.oldIndex === evt.newIndex) return;
    
    // Clone the original data and change the list position in it
    const updatedData = [...state.data];
    const [movedList] = updatedData.splice(evt.oldIndex, 1);
    updatedData.splice(evt.newIndex, 0, movedList);
    
    // Update original data and save
    state.data = updatedData;
    state.save();
    
  }
  
});
