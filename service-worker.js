self.addEventListener('install', function(event) {
    console.log('Service Worker: Installed');
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker: Activated');
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                return response || fetch(event.request);
            })
    );
});
