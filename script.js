// State
const state = PetiteVue.reactive({
  items: [
    { title: 'Hello World!', desc: 'My first item!', completed: false },
    { title: 'Hello You!', desc: 'My second item!', completed: false },
    { title: 'Hello Me!', desc: 'My third item!', completed: false },
    { title: 'Hello Gemini!', desc: 'My fourth item!', completed: false },
    { title: 'Hello David!', desc: 'My fifth item!', completed: false },
    { title: 'Hello Guys!', desc: 'My sixth item!', completed: false }
  ]
});

// Create App
PetiteVue.createApp(state).mount('body');
