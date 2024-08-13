const CACHE_NAME = 'v1';
const urlsToCache = [
    '/',
    '/currency',
    '/currency/index.html',
    '/currency/styles.css',
    '/currency/app.js',
    '/currency/manifest.json',
    '/currency/github-mark-white.png',
    '/currency/exchange-512.png',
    '/currency/exchange-192.png',
    '/currency/exchange-180.png',
    '/currency/exchange-120.png',
    '/currency/exchange-96.png',
    '/currency/exchange-60.png',
    '/currency/exchange-48.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});
