const CACHE_NAME = 'admin-panel-v1';

// Додано '/sw.js' до списку кешування
const URLS_TO_CACHE = [
  '/supabase-admin-dashboard/',
  '/pwa-admin/manifest.json',
  '/pwa-admin/icons/icon-192x192.png',
  '/pwa-admin/icons/icon-512x512.png',
  '/sw.js' 
];

self.addEventListener('install', (event) => {
  // Пропускаємо очікування, щоб новий Service Worker активувався швидше
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching assets');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Змушує активний SW взяти контроль над сторінкою негайно
  return self.clients.claim(); 
});

self.addEventListener('fetch', (event) => {
  // ВИДАЛЕНО НЕПОТРІБНУ І ШКІДЛИВУ ПЕРЕВІРКУ.
  // Тепер SW буде обробляти всі запити в межах свого 'scope'.
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Якщо ресурс є в кеші, віддаємо його. Інакше - робимо запит до мережі.
        return response || fetch(event.request);
      })
  );
});