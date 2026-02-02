// Service Worker for Kilamate PWA
const CACHE_NAME = 'kilamate-v1';
const RUNTIME_CACHE = 'kilamate-runtime-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/logo.webp',
    '/logo2.webp',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        // For API requests, use network first with cache fallback
        if (url.hostname.includes('openweathermap.org')) {
            event.respondWith(
                fetch(request)
                    .then((response) => {
                        // Clone the response
                        const responseClone = response.clone();

                        // Cache the API response
                        caches.open(RUNTIME_CACHE).then((cache) => {
                            cache.put(request, responseClone);
                        });

                        return response;
                    })
                    .catch(() => {
                        // If network fails, try cache
                        return caches.match(request);
                    })
            );
            return;
        }

        // For other cross-origin requests, just fetch
        event.respondWith(fetch(request));
        return;
    }

    // For same-origin requests, use cache first
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((response) => {
                // Don't cache if not a success response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                const responseClone = response.clone();
                caches.open(RUNTIME_CACHE).then((cache) => {
                    cache.put(request, responseClone);
                });

                return response;
            });
        })
    );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
