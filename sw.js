const CACHE = 'budget-v6'; // bump this whenever you deploy

self.addEventListener('install', e => {
  self.skipWaiting(); // activate immediately, don't wait
});

self.addEventListener('activate', e => {
  // Delete ALL old caches
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always go to network for same-origin HTML — never serve stale app shell
  if (url.origin === self.location.origin && e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Pass Google API calls straight through — never cache
  if (!e.request.url.startsWith(self.location.origin)) return;

  // Cache-first for everything else (fonts, icons, sw.js itself)
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
