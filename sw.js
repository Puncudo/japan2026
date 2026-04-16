const CACHE_NAME = 'japan-trip-v13';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/city.js',
  '/manifest.json',
  '/icon.svg',
  '/data/trip.json',
  '/data/tokyo-1.json',
  '/data/fujikawaguchiko.json',
  '/data/kyoto.json',
  '/data/osaka.json',
  '/data/hiroshima.json',
  '/data/tokyo-2.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Never intercept POST requests or API calls — let them go straight to network
  if (e.request.method !== 'GET' || e.request.url.includes('/api/')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
