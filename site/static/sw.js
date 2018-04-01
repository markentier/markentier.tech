'use strict';
// https://github.com/GoogleChromeLabs/airhorn/blob/master/app/sw.js

const version = 'mtt-20180401.1';

const cacheFn = cache => {
  return fetch('cache.json')
    .then((response) => response.json())
    .then((files) => cache.addAll(files))
    .then(() => self.skipWaiting());
}

const purgeFn = (cacheName) => {
  if (cacheName !== version) {
    // console.log('[ServiceWorker] Deleting old cache:', cacheName);
    return caches.delete(cacheName);
  }
};
const cacheKeysPurgeFn = (cacheNames) =>
  Promise.all(cacheNames.map(purgeFn));

const cacheableFetch = (e) => {
  return caches.open(version).then((cache) => {
    return cache.match(e.request)
      .then((response) => response || Promise.reject('not-found'))
      .catch((err) => {
        return fetch(e.request)
          .then((response) => {
            scheduleCacheUpdate(cache, e, response);
            return response;
          });
      });
  });
};

const scheduleCacheUpdate = (cache, e, response) => {
  const updateCacheFn = () => {
    cache.put(e.request, response.clone());
    return response;
  };
  const updateCacheP = new Promise((resolve) => resolve(updateCacheFn()));
  // e.waitUntil(updateCacheP.then(notifyClients));
  e.waitUntil(updateCacheP);
};

// const notifyClients = (response) => {
//   const message = {
//     type: 'refresh',
//     url: response.url,
//     eTag: response.headers.get('ETag')
//   };
//   const notifyClient = (client) => client.postMessage(JSON.stringify(message));
//   const notifyAllClients = (clients) => clients.forEach(notifyClient);
//   return self.clients.matchAll().then(notifyAllClients);
// };

const installHandler = (e) => {
  e.waitUntil(caches.open(version).then(cacheFn));
};

const activateHandler = (e) => {
  e.waitUntil(
    caches.keys()
          .then(cacheKeysPurgeFn)
          .then(() => self.clients.claim())
  )
};

const fetchHandler = (e) => {
  e.respondWith(cacheableFetch(e))
};

self.addEventListener('install', installHandler)
self.addEventListener('activate', activateHandler)
self.addEventListener('fetch', fetchHandler)
