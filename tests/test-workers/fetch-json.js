
self.addEventListener('fetch', function(e) {

    let responseJSON = {
        ok: true,
        url: e.request.url
    }

    let response = new Response(JSON.stringify(responseJSON));
    response.headers.append('content-type', 'application/json');

    e.respondWith(response);
})