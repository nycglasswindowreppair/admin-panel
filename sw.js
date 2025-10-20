const CACHE_NAME = 'admin-panel-v4'; 

const URLS_TO_CACHE = [
  '/', // Кешує головну сторінку index.html
  '/sw.js', // Кешуємо сам service worker

  // --- ✅ Правильні шляхи з префіксом /pwa-admin/ ---
  '/pwa-admin/manifest.json',
  '/pwa-admin/icons/icon-512x512.png',
  '/pwa-admin/icons/apple-touch-icon-180x180.png',

  // Додамо також інші іконки з вашого маніфесту для повноти кешу
  '/pwa-admin/icons/maskable_icon_x192.png',
  '/pwa-admin/icons/maskable_icon_x512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache, adding files to cache...');
      return cache.addAll(URLS_TO_CACHE);
    }).catch(err => {
      console.error('Failed to cache files during install:', err);
    })
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
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    // ✅ Виправлено: використовуємо іконку з кешу
    icon: '/pwa-admin/icons/maskable_icon_x192.png',
    badge: '/pwa-admin/icons/maskable_icon_x192.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});