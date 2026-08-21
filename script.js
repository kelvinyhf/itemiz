// ------------------------------
// Variables and Helpers
// ------------------------------
const USER_KEY = 'Itemiz_user_v1';
const DATA_KEY = 'Itemiz_data_v1';
const ACTIVE_LIST_ID_KEY = 'Itemiz_active_list_id_v1';
const HAS_VISITED_KEY =  'Itemiz_has_visited_v1';

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
const isMobile = () => window.matchMedia('(width < 768px)').matches;
const getOutDuration = () => (isMobile() ? 225 : 75);
const getFastOutDuration = () => (isMobile() ? 125 : 50);

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
    updatedAt: Date.now(),
    items: [
    {
      id: generateId(),
      title: "Click to edit!",
      desc: "Can add description too",
      color: "none",
      date: "",
      completed: false,
      updatedAt: Date.now()
    },
    {
      id: generateId(),
      title: "Drag to sort",
      desc: "",
      color: "none",
      date: "",
      completed: false,
      updatedAt: Date.now()
    },
    {
      id: generateId(),
      title: "That's it!",
      desc: "Hope you like :)",
      color: "none",
      date: "",
      completed: true,
      updatedAt: Date.now()
    }]
  }
]

// Get data function (for version migrations)
function getData(data) {
  if (!Array.isArray(data)) return data;
  
  // v1 to v2 - Add "updatedAt" property
  const currentTime = Date.now();
  const updatedData = data.map(list => {
    const listUpdatedAt = list.updatedAt ? list.updatedAt : currentTime;
    
    // Ensure all items have updatedAt
    const updatedItems = list.items.map(item => {
      const itemUpdatedAt = item.updatedAt ? item.updatedAt : currentTime;
      return {
        ...item,
        updatedAt: itemUpdatedAt
      };
    });
    
    // Ensure all lists have updatedAt
    return {
      ...list,
      updatedAt: listUpdatedAt,
      items: updatedItems
    };
  });

  return updatedData;
}

// Generate random Id
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
}

// Parse Google JWT Token
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(window.atob(base64));
}

// ------------------------------
// DOM Elements
// ------------------------------
const topBar = document.getElementById('top-bar');
const itemsContainer = document.getElementById('items-container');

const modals = document.getElementById('modals');
const aboutModal = document.getElementById('about-modal');
const itemModal = document.getElementById('item-modal');
const listModal = document.getElementById('list-modal');
const settingsModal = document.getElementById('settings-modal');

const bottomBar = document.getElementById('bottom-bar');
const toolbar = document.getElementById('toolbar');
const trashCan = document.getElementById('trash-can');

// ------------------------------
// DOM Helpers
// ------------------------------
function showChild(target, container, options = {}) {
  const { inAnim = '', outAnim = '', duration = 0 } = options;
  const allAnim = [
    'fade-in-animation',
    'fade-out-animation',
    'slide-in-animation',
    'slide-in-animation-fast',
    'slide-out-animation',
    'slide-out-animation-fast'
  ];
  Array.from(container.children).forEach(child => {
    child.classList.remove(...allAnim);
    if (child === target) {
      child.classList.remove('hidden');
      if (inAnim) child.classList.add(inAnim);
    } else if (!child.classList.contains('hidden')) {
      
      // If the child is visible, hide it with optional animation
      if (outAnim) {
        child.classList.add(outAnim);
        setTimeout(() => {
          child.classList.add('hidden');
          child.classList.remove(outAnim);
        }, duration);
      } else {
        child.classList.add('hidden'); // Hide immediately if no animation
      }
      
    }
  });
}

function slideBottomBar(dir) {
  if (!isMobile()) return;
  if (dir === 'in') {
    bottomBar.classList.remove('slide-out-animation');
    bottomBar.classList.add('slide-in-animation');
  } else if (dir === 'out') {
    bottomBar.classList.add('slide-out-animation');
    bottomBar.classList.remove('slide-in-animation');
  }
}

// ------------------------------
// Firebase
// ------------------------------
const FIREBASE_URL = 'https://itemiz-db-default-rtdb.firebaseio.com/';

function getUserPath(email) {
  const key = email.replace(/\./g, '_');
  return `${FIREBASE_URL}/${key}.json`;
}

async function saveToCloud(userEmail) {
  try {
    
    // Save data on cloud
    const res = await fetch(getUserPath(userEmail), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(state.data)
    });
    
  } catch (err) {
    console.error(err);
  }
}

function importAsNew(existingData = [], incomingData = []) {
  const currentTime = Date.now();
  const newData = incomingData.map(list => {
    return {
      ...list,
      id: generateId(),
      updatedAt: currentTime,
      items: (list.items || []).map(item => ({
        ...item,
        id: generateId(),
        updatedAt: currentTime
      }))
    };
  });
  return [...existingData, ...newData];
}

async function loadFromCloud(userEmail, isLogin = false) {
  try {
    
    // Get cloud data and merge/load it
    const res = await fetch(getUserPath(userEmail));
    const cloudData = await res.json();
    if (cloudData && Array.isArray(cloudData)) {
      const updatedData = isLogin ? importAsNew(state.data, cloudData) : cloudData;
      state.data = updatedData;
      localStorage.setItem(DATA_KEY, JSON.stringify(state.data));
    }
    
  } catch (err) {
    console.error(err);
  }
}

function getLatestTimestamp(dataArray) {
  if (!Array.isArray(dataArray) || dataArray.length === 0) return 0;
  return Math.max(...dataArray.map(list => {
    const itemMax = (list.items || []).reduce((max, item) => Math.max(max, item.updatedAt || 0), 0);
    return Math.max(list.updatedAt || 0, itemMax);
  }));
}

async function syncOnStart(userEmail) {
  try {
    const res = await fetch(getUserPath(userEmail));
    const cloudData = await res.json();
    
    if (cloudData && Array.isArray(cloudData)) {
      const localTime = getLatestTimestamp(state.data);
      const cloudTime = getLatestTimestamp(cloudData);
      
      // Save to cloud if local data is newer, else fetch from cloud
      if (localTime > cloudTime) {
        await saveToCloud(userEmail);
      } else {
        state.data = cloudData;
        localStorage.setItem(DATA_KEY, JSON.stringify(cloudData));
      }
      
    }
  } catch (err) {
    console.error('Cannot sync data:', err);
  }
}

// ------------------------------
// PetiteVue State
// ------------------------------
const state = PetiteVue.reactive({
  
  // User and Cloud Data
  user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
  async login(response) {
    try {
      
      // Login and get user info
      const payload = parseJwt(response.credential);
      this.user = {
        name: payload.name,
        email: payload.email
      };
      
      // Save user and load cloud data
      localStorage.setItem(USER_KEY, JSON.stringify(this.user));
      await loadFromCloud(this.user.email, true);
      if (window.listenToCloudChanges) window.listenToCloudChanges(this.user.email);
      
    } catch (err) {
      console.error("Login Error:", err);
    }
  },
  async logout() {
    this.user = null;
    localStorage.removeItem(USER_KEY);
    location.reload();
  },
  
  // Data Object
  data: getData(JSON.parse(localStorage.getItem(DATA_KEY))) || DEFAULT_DATA,
  
  // Active list
  activeListId: "",
  checkActiveList(id) {
    return this.activeListId === id;
  },
  setActiveList(id) {
    if (this.checkActiveList(id)) return;
    
    // Set new active list
    this.activeListId = id;
    localStorage.setItem(ACTIVE_LIST_ID_KEY, id);
    
    // Hide toolbar when no active list, show when a list is selected
    if (id === "") {
      showChild(null, bottomBar, { outAnim: 'slide-out-animation-fast', duration: getFastOutDuration() });
    } else {
      showChild(toolbar, bottomBar, { inAnim: 'slide-in-animation-fast' });
    }
    
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
    this.isLocalChange = true;
    setTimeout(() => { this.isLocalChange = false; }, 1000);
    localStorage.setItem(DATA_KEY, JSON.stringify(this.data));
    
    // Save data to cloud (1 second debounce)
    if (this.user) {
      clearTimeout(this.save.timer);
      this.save.timer = setTimeout(() => {
        saveToCloud(this.user.email);
      }, 1000);
    }
    
  },
  isLocalChange: false,
  
  // Add and Delete List
  addList() {
    const newList = {
      id: generateId(),
      name: "",
      color: "none",
      updatedAt: Date.now(),
      items: [
        {
          id: generateId(),
          title: "Click to edit",
          desc: "",
          color: "none",
          date: "",
          completed: false,
          updatedAt: Date.now()
        }
      ]
    };
    
    this.data.push(newList);
    this.save();
    
    // Open Item Modal
    this.listPressStartTime = Date.now();
    PetiteVue.nextTick(() => {
      
      // Set new active list and open list modal
      this.setActiveList(newList.id);
      this.openListModal(newList.id);
      
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
      
      // Delete the list and change updatedAt of the first list (if available)
      this.data = this.data.filter(c => c.id !== id);
      if (this.data.length > 0) this.data[0].updatedAt = Date.now();
      
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
  confirmDelete: false,
  
  // Add and Delete Item
  addItem(listId) {
    const newItem = {
      id: generateId(),
      title: "",
      desc: "",
      color: "none",
      date: "",
      completed: false,
      updatedAt: Date.now()
    };
    
    this.getItemsById(listId).push(newItem);
    this.save();
    
    // Open Item Modal
    this.itemPressStartTime = Date.now();
    this.isNewItem = true;
    this.openItemModal(newItem);
    PetiteVue.nextTick(() => {
      
      // Fade in animation
      const newItemEl = document.getElementById(newItem.id);
      newItemEl.classList.add('fade-in-animation');
      setTimeout(() => {
        newItemEl.classList.remove('fade-in-animation');
      }, 250);
      
      // Auto scroll
      itemsContainer.scrollTo({
        top: itemsContainer.scrollHeight,
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
        
        // Delete, save, vibrate, and update timestamp
        list.items.splice(index, 1);
        this.save();
        if ('vibrate' in navigator) navigator.vibrate([20, 50, 20]);
        list.updatedAt = Date.now();
        
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
    if (!itemModal.classList.contains('hidden')) {
      this.closeItemModal();
    } else if (!listModal.classList.contains('hidden')) {
      this.closeListModal();
    } else if (!aboutModal.classList.contains('hidden')) {
      this.closeAboutModal();
    } else if (!settingsModal.classList.contains('hidden')) {
      this.closeSettingsModal();
    }
  },
  
  // About Modal
  openAboutModal() {
    this.showingOverlay = true;
    showChild(aboutModal, modals, { inAnim: 'slide-in-animation' });
    slideBottomBar('out');
  },
  closeAboutModal() {
    showChild(null, modals, { outAnim: 'slide-out-animation', duration: getOutDuration() });
    slideBottomBar('in');
    
    setTimeout(() => {
      this.showingOverlay = false;
    }, getOutDuration());
    
  },
  checkWhetherVisited() {
    if (localStorage.getItem(HAS_VISITED_KEY) === null) {
      localStorage.setItem(HAS_VISITED_KEY, "joined");
      this.openAboutModal();
    }
  },
  
  // Item Modal
  itemPressStartTime: null,
  itemIsDragging: false,
  isNewItem: false,
  editingItem: { id: "", title: "", desc: "", color: "none", date: "", completed: false, updatedAt: 0 },
  
  // When pointer is down, start counting
  onItemPointerDown(evt) {
    this.itemPressStartTime = Date.now();
  },
  
  openItemModal(item) {
    
    // If dragging, return
    if (this.itemIsDragging) return;
    
    // If holding (>200ms) in mobile, return
    if (isTouchDevice && (Date.now() - this.itemPressStartTime > 200)) return;
    
    // Target the item (via editingItem), show overlay and item modal
    this.editingItem = { ...item };
    this.showingOverlay = true;
    showChild(itemModal, modals, { inAnim: 'slide-in-animation' });
    slideBottomBar('out');
    
    // Autofocus
    PetiteVue.nextTick(() => {
      const titleInput = document.getElementById('item-modal-title-input');
      if (!isTouchDevice) titleInput.focus();
    });
    
  },
  
  // Reset editingItem and hide overlay after animations
  closeItemModal(isCancelling = false) {
    
    // Delete the item if it's new
    if (this.isNewItem && isCancelling) this.deleteItemById(this.activeListId, this.editingItem.id);
    this.isNewItem = false;
    
    showChild(null, modals, { outAnim: 'slide-out-animation', duration: getOutDuration() });
    slideBottomBar('in');
    
    setTimeout(() => {
      this.editingItem = { id: "", title: "", desc: "", color: "none", date: "", completed: false, updatedAt: 0 };
      this.showingOverlay = false;
    }, getOutDuration());
    
  },
  
  saveItemModal(listId) {
    
    // Find the actual item (via id) and save it
    const targetItems = this.getItemsById(listId);
    const index = targetItems.findIndex(i => i.id === this.editingItem.id);
    
    // Loop through all keys and save
    if (index !== -1) {
      Object.keys(this.editingItem).forEach(key => {
        const value = this.editingItem[key];
        targetItems[index][key] = typeof value === 'string' ? value.trim() : value;
      });
      targetItems[index].updatedAt = Date.now();
      this.save();
    }
    
    // Close item modal
    this.isNewItem = false;
    this.closeItemModal();
  },
  
  // List Modal
  listPressStartTime: null,
  listIsDragging: false,
  editingList: { id: "", name: "", color: "none", updatedAt: 0, items: [] },
  
  // When pointer is down, start counting
  onListPointerDown(evt) {
    this.listPressStartTime = Date.now();
  },
  
  openListModal(listId) {
    
    // If dragging, return
    if (this.listIsDragging) return;
    
    // If holding (>200ms) in mobile, return
    if (isTouchDevice && (Date.now() - this.listPressStartTime > 200)) return;
    
    // Target the list (via editingList), show overlay and list modal
    this.editingList = { ...this.getListById(listId) };
    this.showingOverlay = true;
    showChild(listModal, modals, { inAnim: 'slide-in-animation' });
    slideBottomBar('out');
    
    // Autofocus
    PetiteVue.nextTick(() => {
      const nameInput = document.getElementById('list-modal-name-input');
      if (!isTouchDevice) nameInput.focus();
    });
    
  },

  // Reset editingList and hide overlay after animations
  closeListModal() {
    showChild(null, modals, { outAnim: 'slide-out-animation', duration: getOutDuration() });
    slideBottomBar('in');
    
    setTimeout(() => {
      this.editingList = { id: "", name: "", color: "none", updatedAt: 0, items: [] };
      this.showingOverlay = false;
      this.confirmDelete = false;
    }, getOutDuration());
    
  },
  
  saveListModal(listId) {
    
    // Find the actual list (via id) and save it
    const targetList = this.getListById(listId);
    
    // Loop through all keys and save
    Object.keys(this.editingList).forEach(key => {
      const value = this.editingList[key];
      targetList[key] = typeof value === 'string' ? value.trim() : value;
    });
    targetList.updatedAt = Date.now();
    this.save();
    
    // Close list modal
    this.closeListModal();
  },
  
  // Settings Modal
  openSettingsModal() {
    this.showingOverlay = true;
    showChild(settingsModal, modals, { inAnim: 'slide-in-animation' });
    slideBottomBar('out');
  },
  closeSettingsModal() {
    showChild(null, modals, { outAnim: 'slide-out-animation', duration: getOutDuration() });
    slideBottomBar('in');
    
    setTimeout(() => {
      this.showingOverlay = false;
    }, getOutDuration());
    
  },
  
  // Swipe down var for modals
  startY: 0,
  startTime: 0,
  
  // Export Data
  exportData() {
    const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Itemiz_backup_${this.currentDate()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  },
  
  // Import Data
  importData(evt) {
    
    // Get the file, return if no
    const file = evt.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Merge and save data if in correct format
        if (Array.isArray(importedData)) {
          this.data = importAsNew(this.data, importedData);
          this.save();
          alert('Data merged successfully.');
        } else {
          alert('Invalid file format.');
        }
        
      } catch (err) {
        alert('Failed to read JSON file.');
      }
      evt.target.value = '';
    };
    reader.readAsText(file);
  }
  
});

// ------------------------------
// Initialization
// ------------------------------
PetiteVue.createApp(state).mount('body');
window.handleCredentialResponse = (res) => state.login(res);
state.checkWhetherVisited();

// If logged in, load data
if (state.user) {
  syncOnStart(state.user.email);
  if (window.listenToCloudChanges) window.listenToCloudChanges(state.user.email);
}

// Active list id init (from localStorage or first list)
state.activeListId = (() => {
  const savedId = localStorage.getItem(ACTIVE_LIST_ID_KEY);
  
  // If savedId exists and is valid, return it
  if (savedId && state.data && state.data.some(c => c.id === savedId)) {
    return savedId;
  }
  
  // Get the first list's id or an empty string if no lists exist
  const newId = state.data.length > 0 ? state.data[0].id : "";
  if (newId === "") {
    showChild(null, bottomBar);
  } else {
    showChild(toolbar, bottomBar, { inAnim: 'slide-in-animation-fast' });
  }
  
  return newId;
})();

// Initial Save
localStorage.setItem(DATA_KEY, JSON.stringify(state.data));

// ------------------------------
// SortableJS - Items
// ------------------------------
Sortable.create(itemsContainer, {
  
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
        showChild(trashCan, bottomBar, { inAnim: 'slide-in-animation-fast' });
      }, 150);
    };
  },
  
  // If not touch device, show trash can only when starting to drag item
  onStart() {
    state.itemIsDragging = true;
    if (!isTouchDevice) {
      setTimeout(() => {
        showChild(trashCan, bottomBar, { inAnim: 'slide-in-animation-fast' });
      }, 150);
    };
  },
  
  // If no overlay is showing, show toolbar when unchoosing item (only if a list is selected)
  onUnchoose() {
    setTimeout(() => {
      if (!state.showingOverlay && state.activeListId) {
        showChild(toolbar, bottomBar, { inAnim: 'slide-in-animation-fast' });
      }
    }, 150);
  },
  
  // When finish dragging
  onEnd(evt) {
    
    // Reset dragging state
    setTimeout(() => {
      state.itemIsDragging = false;
    }, 0);
    
    // Get the target list
    const listId = state.activeListId;
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
    targetList.updatedAt = Date.now();
    state.save();
    
  }
  
});

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
    movedList.updatedAt = Date.now();
    state.save();
    
  }
  
});

// ------------------------------
// Service Worker
// ------------------------------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(error => {
      console.error('Service Worker register failed:', error);
    });
  });
}
