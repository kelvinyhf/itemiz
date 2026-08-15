# Itemiz
A minimalist, lightweight todo list web app with a simple and clean design.
> This project was created as the final project for [CS50x](https://cs50.harvard.edu/x/). Click [here](https://example.com/) to watch the demo video.

## Background
I built this app because I found tools like Trello and Notion too complicated for my personal use.
They require you to sign up and log in, and they hide many features behind a paywall.
It was hard to find a clean todo list app optimized for individual use, so I decided to build my own.

## Features
- **Flexible List & Item**: Items in Itemiz are categorized under customizable list tabs. Each item have a title, an expanded multiline description, a specific due date, a completion checkbox, and custom color tags for visual hierarchy.
- **Interactive Drag-and-Drop Elements**: Powered by SortableJS, users can smoothly drag items to change their priority within a list, or drag list tabs horizontally across the top bar to reorder entire projects.
- **Trash Can & Quick Deletion**: Removing finished or unwanted items is easy. Users can either drag an item straight into the bottom trash can or delete it directly through the item modal.
- **Mobile-First & Touch-Optimized Design**: Built primarily for quick mobile usage, the layout supports custom touch delay handling and swipe gestures for modals.
- **Local & Privacy-First**: There are no remote backend databases. Every item, list, and all the data is saved on the user's device via `localStorage`.

## Data Schema & State Management
All application state is managed reactively through PetiteVue's `reactive()` store in `script.js`. The state hierarchy follows a simple JSON structure:
- **Lists (`data`)**: An array of list objects. Each object contains a unique ID generated via timestamps, a display name, a color key, and an inner array of items.
- **Items (`items`)**: Individual item objects containing an ID, title, description, due date, completion status, and color key.
- **Active State (`activeListId`)**: Tracks which list is currently active. When changed, PetiteVue's `reactive()` immediately updates the screen and persists the selected ID to `localStorage`.

## Libraries Used
- **PetiteVue**: Easily updates the interface when items change, saving me from writing hundreds of manual JavaScript event listeners.
- **SortableJS**: Handles smooth dragging and reordering of tasks.
- **Other libraries**: **TailwindCSS**, **Radix Colors**, and **Lucide Icons** for styling and UI elements.

## Future of Itemiz
- **Cross-Device Syncing via Google Drive**: I plan to add an optional "Sign in with Google" integration. All user data will sync directly to a JSON file stored in the user's Google Drive using simple Last-Write-Wins (LWW) conflict resolution logic.
- **Offline Flexibility**: Logging in will remain completely optional. Users who prefer not to sign in can continue using the app completely offline with local browser storage.
- **Data Export & Import**: A simple JSON file export and import feature so users can manually back up or transfer their lists between different devices.
