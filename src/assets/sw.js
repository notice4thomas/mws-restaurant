const staticCacheName = 'restaurant-reviews-static-v1';
const imagesCacheName = 'restaurant-reviews-images';
const urlsToCache = [
  '/',
  '/restaurant.html',
  '/styles.css',
  '/style/logo.svg',
  '/main.js',
  '/data/restaurants.json'
];

// Installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activation (runs only once the service worker is taking controll over)
self.addEventListener('activate', event => {
  // Remove outdated caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return ![staticCacheName, imagesCacheName].includes(cacheName);
        }).map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

// Caches and returns images by request
function serveImage(request) {
  return caches.open(imagesCacheName).then(cache => {
    return cache.match(request.url).then(response => {
      if(response) return response;

      return fetch(request).then(networkResponse => {
        cache.put(request.url, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}

/**
 * Cache and serve requests.
 * My startegy here is to first serve from cache, and then update the cache.
 * This might need some more thinking, but it seems like a nice solution for now.
 */
self.addEventListener('fetch', event => {
  let requestUrl = new URL(event.request.url);

  // Run only when the origin is ours(not for google maps etc).
  if(requestUrl.origin === location.origin) {
    if(requestUrl.pathname.startsWith('/img/')) {
      event.respondWith(serveImage(event.request));
      return;
    }

    // Return the restaurant.html page for any restaurant request.
    if(requestUrl.pathname.startsWith('/restaurant.html')) {
      event.respondWith(caches.match('/restaurant.html').then(response => response));
      return;
    }
  
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    ); 
  }
});