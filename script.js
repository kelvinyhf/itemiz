// Variables
const STORAGE_KEY = "Notick_v1";

// Functions
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

// State
const state = PetiteVue.reactive({
  
  // Items Object
  items: JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
    { id: generateId(), title: 'Item 1', desc: 'My first item!', completed: false },
    { id: generateId(), title: 'Item 2', desc: 'My second item!', completed: false }
  ],
  
  // Save
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
  },
  
  // Add and Delete Item
  addItem() {
    this.items.push({
      id: generateId(),
      title: '',
      desc: '',
      completed: false
    });
    this.save();
  },
  deleteItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.save();
  }
  
});

// Create App
PetiteVue.createApp(state).mount('body');

// SortableJS
const itemContainer = document.querySelectorAll('.items-container');
const addItem = document.getElementById('add-item');
const trashCan = document.getElementById('trash-can');

itemContainer.forEach(container => {
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
      addItem.classList.add('hidden');
      trashCan.classList.remove('hidden');
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
      
      // Adjust UI
      addItem.classList.remove('hidden');
      trashCan.classList.add('hidden');
      
    }
    
  });
});
