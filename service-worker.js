const CACHE_NAME = 'v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/github-mark-white.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});
let dateBasedCache;
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                if(cachedResponse.url.includes('https://jeapis.netlify.app/.netlify/functions/currency')) {
                    if(dateBasedCache === new Date().toLocaleDateString()) {
                        return cachedResponse;
                    }
                } else {
                    return cachedResponse;
                }
            }
            if (event.request.url.includes('https://jeapis.netlify.app/.netlify/functions/currency')) {
                return fetch(event.request).then(networkResponse => {
                    return caches.open(CACHE_NAME).then(cache => {
                        dateBasedCache = new Date().toLocaleDateString();
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            }
            return fetch(event.request);
        })
    );
});
