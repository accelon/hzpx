
(function() {
    // Update 'version' if you need to refresh the cache
    var staticCacheName = 'hzpx';
    var version = 'v1::';
    var CacheName=version + staticCacheName;
    // Store core files in a cache (including a page to display when offline)
    async function updateStaticCache() {
        const cache = await caches.open(CacheName);
        return await cache.addAll([
            'index.html',
            'index.css',
            'index.js',
            'global.css',
            'hzpx.png',
            'hzpx_512.png',
            'hzpx.manifest',
            'offline.html'
        ]);
    };

    self.addEventListener('install', function (event) {
        event.waitUntil(updateStaticCache());
    });

    self.addEventListener('activate', function (event) {
        event.waitUntil(
            caches.keys()
            .then(function (keys) {
                // Remove caches whose name is no longer valid
                return Promise.all(keys
                    .filter(function (key) {
                        return key.indexOf(version) !== 0;
                    })
                    .map(function (key) {
                        return caches.delete(key);
                    })
                );
            })
        );
    });

    self.addEventListener('fetch', function (event) {
        var request = event.request;
        // Always fetch non-GET requests from the network
        if (request.method == 'HEAD' && navigator.onLine) {
            event.respondWith(
                fetch(request)
                    .catch(async function () {
                        const cache = await caches.open(CacheName);
                        return await cache.match('offline.html');
                    })
            );
            return;
        }
        var accept=request.headers.get('Accept')
        // For HTML requests, try the network first, fall back to the cache, finally the offline page
        
        if (~accept.indexOf('text/') || request.url.endsWith('.js')|| request.url.endsWith('.css')) { //html, css , js, try to fetch updates
            // Fix for Chrome bug: https://code.google.com/p/chromium/issues/detail?id=573937
            if (request.mode != 'navigate') {
                request = new Request(request.url, {
                    method: 'GET',
                    headers: request.headers,
                    mode: request.mode,
                    credentials: request.credentials,
                    redirect: request.redirect
                });
            }
            event.respondWith(
                fetch(request) //try online first
                    .then(function (response) {
                        // Stash a copy of this page in the cache
                        var copy = response.clone();
                        if (response.ok) {
                            caches.open(CacheName)
                            .then(function (cache) {
                                cache.put(request, copy);
                            });
                        }
                        return response;
                    })
                    .catch(function () { //use cache when offline
                        caches.open(CacheName).then(
                            cache=>cache.match(request)
                            .then(function (response) {
                                return response || cache.match('/offline.html');
                            })
                        )
                    })
            );
            return;
        }

        if (event.request.headers.get('range')) {
            let pos = Number(/^bytes\=(\d+)\-$/g.exec(event.request.headers.get('range'))[1]);
            // console.log('Range request for', event.request.url, ', starting position:', pos);
            event.respondWith(
              caches.open(CacheName)
              .then(function(cache) {
                return cache.match(event.request.url);
              }).then(async function(res) {
                if (!res) {
                    const res_1 = await fetch(req); //delegate to real fetch
                    return await res_1.arrayBuffer();
                }
                return res.arrayBuffer();
              }).then(function(ab) {
                return new Response(  //create a fake response
                  ab.slice(pos),
                  {
                    status: 206,
                    statusText: 'Partial Content',
                    headers: [
                      ['Content-Type', 'audio/mpeg'],
                      ['Content-Range', 'bytes ' + pos + '-' +
                        (ab.byteLength - 1) + '/' + ab.byteLength]]
                  });
              }));
          } else { //non range request
            // For non js/css/html requests, look in the cache first, fall back to the network
            event.respondWith(
                    caches.match(request)
                    .then(function (response) {
                        return response || fetch(request)
                        .catch(function () {
                            // If the request is for an image, show an offline placeholder
                            if (request.headers.get('Accept').indexOf('image') !== -1) {
                                return new Response('<svg width="400" height="300" role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Offline</title><g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/><text fill="#9B9B9B" font-family="Helvetica Neue,Arial,Helvetica,sans-serif" font-size="72" font-weight="bold"><tspan x="93" y="172">offline</tspan></text></g></svg>', { headers: { 'Content-Type': 'image/svg+xml' }});
                            }
                        });
                    })
            );
        }
    });

})();