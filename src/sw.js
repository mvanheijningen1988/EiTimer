self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('egg-timer-cache').then((cache) => {
            return cache.addAll(['/', '/index.html', '/styles.css', '/script.js']);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('sync', (event) => {
    if (event.tag === 'send-message') {
        alert('sw send-message');
    }
});
