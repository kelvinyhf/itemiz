// Variables
const STORAGE_KEY = "TICK_V1";

// State
const state = PetiteVue.reactive({
  
  // Items Object
  items: /* JSON.parse(localStorage.getItem(STORAGE_KEY)) || */[
    { title: 'Item 1', desc: 'My first item!', completed: false },
    { title: 'Item 2', desc: 'My second item!', completed: false },
    { title: 'Item 3', desc: 'My third item!', completed: false }
  ],
  
  // Save
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
  },
  
  // Add Item
  addItem() {
    this.items.push({
      title: '',
      desc: '',
      completed: false
    });
    this.save();
  }
  
});

// Create App
PetiteVue.createApp(state).mount('body');
