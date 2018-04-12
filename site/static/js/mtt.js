/* global fetch */
'use strict';
(() => {
  const registerSwOnLoad = () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('[ServiceWorker] Registration successful with scope: ', reg.scope);
        reg.update();
        swPostRegSteps();
      }, (err) => {
        console.log('[ServiceWorker] Registration failed: ', err);
      });
  };

  const swPostRegSteps = () => {
    // navigator.serviceWorker.onmessage = swOnMessageFn;
    prefetchStage2();
    // swEvents();
  };

  // const swOnMessageFn = (e) => {
  //   const message = JSON.parse(e.data);
  //   const isRefresh = message.type === 'refresh';
  //   const lastETag = localStorage.currentETag;
  //   const isNew = lastETag !== message.eTag;
  //   if (isRefresh && isNew) {
  //     console.log(`[ServiceWorker] Refresh: ${message.url}`);
  //   };
  // };

  // store prefetchables
  const prefetchStage2 = () => {
    document.querySelectorAll('a[data-fetch], link[data-fetch]').forEach((e) => fetch(e.href));
    document.querySelectorAll('img[data-fetch]').forEach((img) => fetch(img.src));
  };

  // const swEvents = () => {
  //   navigator.serviceWorker.addEventListener('controllerchange', (event) => {
  //     console.log(`[controllerchange] A "controllerchange" event has happened within navigator.serviceWorker: `, event);
  //     navigator.serviceWorker.controller.addEventListener('statechange', () => {
  //       console.log(`[controllerchange][statechange] A "statechange" has occured: `, this.state);
  //       if (this.state === 'activated') {
  //         // safe to go offline
  //         const wrppr = document.getElementById('wrppr');
  //         wrppr.classList.add('activated');
  //         // prefetchStage2();
  //       } else {
  //         // something else?
  //         // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker/state
  //         // values: installing, installed, activating, activated, or redundant.
  //       }
  //     });
  //   });
  // };

  // start it:
  if ('serviceWorker' in navigator) { window.addEventListener('load', registerSwOnLoad); }

  const navbar = document.querySelector('.navbar');
  let sticky = navbar.offsetTop;
  const navbarScroll = () => {
    if (window.pageYOffset >= sticky) {
      navbar.classList.add('sticky')
    } else {
      navbar.classList.remove('sticky');
    }
  };

  const scrollprogress = document.querySelector('.scrollprogress');
  const scrollMaxHeight = () => { return window.scrollMaxY || (document.documentElement.scrollHeight - document.documentElement.clientHeight); };
  const scrollHeight = () => { return window.pageYOffset; };
  const updateProgressWithScrollHeight = () => {
    scrollprogress.max = scrollMaxHeight();
    scrollprogress.value = scrollHeight();
  };

  window.onscroll = () => {
    navbarScroll();
    updateProgressWithScrollHeight();
  };
})();
