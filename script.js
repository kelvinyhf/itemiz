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
document.querySelectorAll('.items-container').forEach(container => {
  Sortable.create(container, {
    animation: 200,
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
    
    // Haptic Feedback
    onChoose() {
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    },
    
    // Change Position
    onEnd(evt) {
      const movedItem = state.items.splice(evt.oldIndex, 1)[0];
      state.items.splice(evt.newIndex, 0, movedItem);
      state.save();
    }
    
  });
});
