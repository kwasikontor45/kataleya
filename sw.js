// sw.js — Kataleya app-shell cache.
// Everything the app needs already lives on-device (no backend); this just
// makes the shell itself (this page, its assets) load with no connection
// too, so "installed app" actually means "works offline," not just "has an
// icon." Network-first for the page itself (so a real update is picked up
// the moment it's reachable), cache-first for the static bits that never
// change mid-session.

const CACHE_NAME = 'kataleya-shell-v4'; // bumped: send-a-light auto-relay added
const SHELL_ASSETS = [
  '/kataleya-demo/',
  '/kataleya-demo/index.html',
  '/kataleya-demo/manifest.json',
  '/kataleya-demo/assets/icon-192.png',
  '/kataleya-demo/assets/icon-512.png',
  '/kataleya-demo/assets/favicon-butterfly-32.png',
  '/kataleya-demo/assets/favicon-butterfly-180.png',
  '/kataleya-demo/vendor/kataleya-crypto.bundle.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // let cross-origin (fonts) hit the network directly

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/kataleya-demo/index.html')))
  );
});
