'use strict';
// https://github.com/GoogleChromeLabs/airhorn/blob/master/app/sw.js

self.addEventListener('install', e => {
  const timeStamp = Date.now()
  const files = [
    `/`,
    `/index.html?timestamp=${timeStamp}`,

    `/mtt.css?timestamp=${timeStamp}`,
    `/js/mtt.js?timestamp=${timeStamp}`,
    `/js/loaded.js?timestamp=${timeStamp}`,

    `/assets/fonts/lusitana-regular.woff2?timestamp=${timeStamp}`,
    `/assets/fonts/lusitana-regular.woff?timestamp=${timeStamp}`,
    `/assets/fonts/varela-round-regular.woff2?timestamp=${timeStamp}`,
    `/assets/fonts/varela-round-regular.woff?timestamp=${timeStamp}`,

    `/assets/fonts/lusitana-bold.woff2?timestamp=${timeStamp}`,
    `/assets/fonts/lusitana-bold.woff?timestamp=${timeStamp}`,
    `/assets/fonts/hack-regular.woff2?timestamp=${timeStamp}`,
    `/assets/fonts/hack-regular.woff2?timestamp=${timeStamp}`,
    `/assets/fonts/hack-bold.woff?timestamp=${timeStamp}`,
    `/assets/fonts/hack-bold.woff?timestamp=${timeStamp}`,
    `/assets/fonts/hack-italic.woff?timestamp=${timeStamp}`,
    `/assets/fonts/hack-italic.woff?timestamp=${timeStamp}`,
    `/assets/fonts/hack-bolditalic.woff?timestamp=${timeStamp}`,
    `/assets/fonts/hack-bolditalic.woff?timestamp=${timeStamp}`,

    `/m.128.png?timestamp=${timeStamp}`
  ]
  const cacheFn = cache => {
    return cache.addAll(files).then(() => self.skipWaiting());
  }
  e.waitUntil(caches.open('mtt').then(cacheFn))
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(response => {
      return response || fetch(event.request)
    })
  )
})
