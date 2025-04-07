self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('tintmaps-cache').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './style.css', // 如果有的話
        './script.js', // 如果有的話
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
        'https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.css',
        'https://fonts.googleapis.com/css2?family=Noto+Sans+TC&display=swap'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
