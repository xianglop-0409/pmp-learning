// Service Worker — 离线缓存 v3
const CACHE_NAME = 'pmp-learning-v3';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  './img/icon.svg',
  // Core JS
  './js/app.js',
  './js/router.js',
  './js/db.js',
  './js/utils.js',
  './js/event-bus.js',
  './js/knowledge-graph.js',
  './js/knowledge-content.js',
  // Pages
  './js/dashboard.js',
  './js/learn.js',
  './js/graph-view.js',
  './js/tree-view.js',
  './js/questions.js',
  './js/practice.js',
  './js/exam.js',
  './js/analytics.js',
  './js/glossary.js',
  './js/wrong-book.js',
  './js/settings.js',
  // Components
  './js/formula-cards.js',
  // Vendor (local)
  './js/vendor/dexie.min.js',
  './js/vendor/d3.min.js',
  './js/vendor/chart.umd.min.js',
  // Data
  './data/all-bank.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching', ASSETS.length, 'assets');
      return cache.addAll(ASSETS).catch(err => {
        console.warn('[SW] Some assets failed to cache:', err);
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  // 本地资源：缓存优先，网络兜底
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // 离线且无缓存，返回空响应
        return new Response('Offline', { status: 503 });
      });
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
