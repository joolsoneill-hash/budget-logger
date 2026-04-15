const CACHE = 'budget-v22';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Never cache — always go to network for HTML
  if (e.request.destination === 'document') {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Pass Google API and other cross-origin requests through
  if (!e.request.url.startsWith(self.location.origin)) return;
  // Cache-first for same-origin non-HTML assets
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request))
  );
});
