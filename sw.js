// VERSION is injected by the app — changing it forces a new SW install
const VERSION = '0.64';
const CACHE = 'budget-' + VERSION;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  // Wipe ALL old caches on every new version
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // HTML — always network-first, never serve stale
  if (e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request, {cache: 'no-store'})
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Google APIs — never intercept
  if (url.hostname.includes('googleapis.com') ||
      url.hostname.includes('google.com')) return;

  // Same-origin assets (icons, manifest) — cache-first
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request)
        .then(hit => hit || fetch(e.request)
          .then(res => {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
            return res;
          })
        )
    );
  }
});
