self.addEventListener('install', event => {
    console.log('Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Service Worker activated');
});

self.addEventListener('periodicsync', event => {
    if (event.tag === 'check-time') {
        event.waitUntil(alert("test"));
    }
});
