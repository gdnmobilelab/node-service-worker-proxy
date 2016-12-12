
self.addEventListener('fetch', function(e) {

    e.respondWith(fetch("/test-response.txt"));

})