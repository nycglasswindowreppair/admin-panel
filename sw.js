const CACHE_NAME = 'admin-panel-v2';

const URLS_TO_CACHE = [
  '/',
  '/pwa-admin/manifest.json',
  '/pwa-admin/icons/icon-192x192.png',
  '/pwa-admin/icons/icon-512x512.png',
  '/sw.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

// NEW: Обробник Push-сповіщень
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/pwa-admin/icons/icon-192x192.png',
    badge: '/pwa-admin/icons/icon-192x192.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});