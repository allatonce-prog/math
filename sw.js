/* sw.js
 * Service Worker for offline capability.
 * Caches core assets.
 */

const APP_VERSION = 'v2'; // Update this to trigger client refresh
const CACHE_NAME = `math-tutor-${APP_VERSION}`;
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/styles.css',
    './js/main.js',
    './js/mathLogic.js',
    './js/ui.js',
    './js/speech.js',
    './manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

// Activate Event - Cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch Event - Serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});

// Listen for SKIP_WAITING message to force update
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
