// Service Worker — 离线缓存
const CACHE_NAME = 'pmp-learning-v2';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/router.js',
  './js/db.js',
  './js/utils.js',
  './js/event-bus.js',
  './js/knowledge-graph.js',
  './js/knowledge-content.js',
  './js/learn.js',
  './js/dashboard.js',
  './js/graph-view.js',
  './js/tree-view.js',
  './js/questions.js',
  './js/practice.js',
  './js/exam.js',
  './js/analytics.js',
  './js/glossary.js',
  './js/formula-cards.js',
  './manifest.json',
];

// CDN 资源（需要网络，不缓存或按需缓存）
const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/d3@7',
  'https://cdn.jsdelivr.net/npm/dexie@4',
  'https://cdn.jsdelivr.net/npm/chart.js@4',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // CDN 资源：网络优先
  if (event.request.url.includes('cdn.jsdelivr.net')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        }).catch(() => cached || new Response('CDN不可用'));
      })
    );
    return;
  }

  // 本地资源：缓存优先
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});
