const CACHE_NAME = '24h-pie-scheduler-v1';
const urlsToCache = [
  './',
  './index.html',
  './404.html',
  './index.tsx',
  './icon.svg',
  './manifest.json',
  './types.ts',
  './App.tsx',
  './components/SchedulePieChart.tsx',
  './components/SidePanel.tsx',
  './components/ScheduleEditor.tsx',
  './components/TodoList.tsx',
  './components/PresetManager.tsx',
  './components/icons.tsx',
  './components/BottomNavBar.tsx',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // External resources are not cached on install anymore.
        // They will be cached on the first fetch.
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // For external assets from CDNs, use a stale-while-revalidate strategy.
  if (url.hostname === 'esm.sh' || url.hostname === 'cdn.tailwindcss.com') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(err => {
            console.error('Fetch failed for:', event.request.url, err);
          });
          // Return cached response immediately if available, otherwise wait for fetch.
          return response || fetchPromise;
        });
      })
    );
  } else {
    // For local app shell assets, use cache-first, falling back to network.
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request);
        })
    );
  }
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
