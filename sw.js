self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("tint-map-cache").then(cache => {
      return cache.addAll([
        "./index.html",
        "./manifest.json",
        "./style.css",
        "./script.js",
        "https://maps.googleapis.com/maps/api/js?key=你的API_KEY"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
