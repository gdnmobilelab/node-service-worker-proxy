
self.addEventListener('fetch', function(e) {
    return e.respondWith(fetch(e.request))
})