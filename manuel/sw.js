/* Manuel numérique : la coquille en réseau d'abord (repli sur le cache), les sons et les images en cache d'abord. Les vidéos ne sont pas mises en cache. */
var CACHE = 'manuel-v2';
var SHELL = ['./', 'index.html', 'app.css', 'app.js', 'data.js', 'data-en.js', 'manifest.webmanifest', 'icon-192.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('manuel-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || /\.mp4$/.test(u.pathname) || e.request.headers.has('range')) return;
  if (/\.(mp3|png|jpg|jpeg|webp|svg)$/.test(u.pathname)) {
    e.respondWith(caches.match(e.request).then(function (r) {
      return r || fetch(e.request).then(function (n) { if (n.ok) { var cp = n.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); } return n; });
    }));
    return;
  }
  if (u.pathname.indexOf('/manuel/') < 0) return;
  e.respondWith(fetch(e.request).then(function (n) { if (n.ok) { var cp = n.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); } return n; })
    .catch(function () { return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match('index.html'); }); }));
});
