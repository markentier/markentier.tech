'use strict';
(() => {
  // const swOnMessageFn = (e) => {
  //   const message = JSON.parse(e.data);
  //   const isRefresh = message.type === 'refresh';
  //   const lastETag = localStorage.currentETag;
  //   const isNew = lastETag !== message.eTag;
  //   if (isRefresh && isNew) {
  //     console.log(`[ServiceWorker] Refresh: ${message.url}`);
  //   };
  // };

  const registerSwOnLoad = () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[ServiceWorker] Registration successful with scope: ', registration.scope);
      }, (err) => {
        console.log('[ServiceWorker] Registration failed: ', err);
      })
      .then(() => {
        // navigator.serviceWorker.onmessage = swOnMessageFn;
        // store prefetchables
        document.querySelectorAll('link[data-fetch]').forEach((link) => fetch(link.href));
        document.querySelectorAll('a[data-fetch]').forEach((a) => fetch(a.href));
        // document.querySelectorAll('img[data-fetch]').forEach((img) => fetch(img.src));
      });

    // sw state changes
    navigator.serviceWorker.addEventListener('controllerchange', (event) => {
      console.log(`[controllerchange] A "controllerchange" event has happened within navigator.serviceWorker: ${event}`);
      navigator.serviceWorker.controller.addEventListener('statechange', () => {
        console.log(`[controllerchange][statechange] A "statechange" has occured: ${this.state}`);
        if (this.state === 'activated') {
          // safe to go offline
          const wrppr= document.getElementById('wrppr');
          wrppr.classList.add('activated')
        } else {
          // something else?
          // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker/state
          // values: installing, installed, activating, activated, or redundant.
        }
      });
    });
  };

  if ('serviceWorker' in navigator) { window.addEventListener('load', registerSwOnLoad); }
})();
