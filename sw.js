
const CACHE_NAME = '24h-pie-chart-scheduler-v1';
const urlsToCache = [
  './',
  './index.html',
  './404.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './components/ApiKeyManager.tsx',
  './components/BottomNavBar.tsx',
  './components/icons.tsx',
  './components/PresetManager.tsx',
  './components/ScheduleEditor.tsx',
  './components/SchedulePieChart.tsx',
  './components/SidePanel.tsx',
  './components/TodoList.tsx',
  './icon.svg',
  './manifest.json',
  './metadata.json',
  // External CDN resources
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@18.3.1',
  'https://esm.sh/react@18.3.1/',
  'https://esm.sh/react-dom@18.3.1/client',
  'https://esm.sh/react-dom@18.3.1/',
  'https://esm.sh/recharts@2.12.7',
  'https://esm.sh/recharts@2.12.7/',
  'https://aistudiocdn.com/uuid@^13.0.0',
  'https://aistudiocdn.com/immer@^10.1.3',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];

// Service Workerのインストール
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// リクエストのキャッシュと返却
self.addEventListener('fetch', event => {
  // GETリクエスト以外は無視
  if (event.request.method !== 'GET') {
    return;
  }
  
  // ブラウザ拡張機能からのリクエストは無視
  if (event.request.url.startsWith('chrome-extension://')) {
      return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュヒット - レスポンスを返す
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // 有効なレスポンスかチェック
            if (!response || response.status !== 200) {
              return response;
            }
            
            // CORSが有効でないCDNからのレスポンス(type: 'opaque')はキャッシュしない
            if (response.type !== 'basic' && response.type !== 'cors') {
                return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Service Workerの有効化と古いキャッシュの削除
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
