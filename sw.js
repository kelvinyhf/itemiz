const CACHE_NAME = 'Itemiz_v1';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './output.css',
  './script.js',
  './manifest.json',
  './assets/libraries/petite-vue.js',
  './assets/libraries/radix-colors.css',
  './assets/libraries/sortable.js',
  './assets/images/apple-touch-icon-dark.png',
  './assets/images/apple-touch-icon.png',
  './assets/images/favicon.svg',
  './assets/images/icon-192.png',
  './assets/images/icon-512-maskable.png',
  './assets/images/icon-512.png',
  './assets/images/open-graph-image.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});


self.addEventListener('fetch', e => {
  if (
    e.request.method !== 'GET' || 
    e.request.url.includes('firebaseio.com') || 
    e.request.url.includes('gstatic.com')
  ) return;
  e.respondWith(
    fetch(e.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
