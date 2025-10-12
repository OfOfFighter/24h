const CACHE_NAME = '24h-pie-scheduler-v1';
const urlsToCache = [
  './',
  './index.html',
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
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@18.3.1',
  'https://esm.sh/react-dom@18.3.1/client',
  'https://esm.sh/recharts@2.12.7'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
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