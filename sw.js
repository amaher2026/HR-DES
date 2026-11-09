// Offline support for the installed web app. Only files whose names carry a content hash (chunk-AB12CD34.js,
// main-AB12CD34.js, styles-AB12CD34.css) are served from the cache first; pages and every other file come from the
// network first, so a new version shows as soon as it is published, and fall back to the cache when offline.
const CACHE = 'madar-v2';
const HASHED = /-[A-Za-z0-9_]{8}\.(js|css)$/;
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.add('./'))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const save = res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
  e.respondWith(HASHED.test(url.pathname)
    ? caches.match(req).then(r => r || fetch(req).then(save))
    : fetch(req).then(save).catch(() => caches.match(req).then(r => r || caches.match('./'))));
});
