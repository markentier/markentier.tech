/* global fetch */
'use strict';

(() => {
  // SERVICE WORKER

  const registerSwOnLoad = () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('[ServiceWorker] Registration successful with scope: ', reg.scope);
        reg.update();
      }, (err) => {
        console.log('[ServiceWorker] Registration failed: ', err);
      });
  };

  // start it:
  if ('serviceWorker' in navigator) { window.addEventListener('load', registerSwOnLoad); }

  // DEPLOYMENT CHECKER

  const deploymentCheck = () => {
    const FORCE_UPDATE_PATH = '/sw-force-update';
    const DEPLOYMENT_PATH = '/deployment.json';
    const DEPLOYMENT_NOT_OK_RESPONSE = { deployment: false };
    const DEPLOYMENT_SYNC_PERIOD = 60 * 1000;

    const responseTransformer = (response) => {
      if (response.status === 200) return response.json();
      return DEPLOYMENT_NOT_OK_RESPONSE;
    };
    const syncHandler = (payload) => {
      if (payload.deployment === false) return;
      const sha = payload.deployment.sha;
      window.caches.keys().then((cacheKeys) => {
        if (cacheKeys.includes(sha)) return;
        fetch(FORCE_UPDATE_PATH);
      })
    };
    const deploymentSync = () => {
      if (navigator.onLine === false) return;
      fetch(DEPLOYMENT_PATH, { cache: 'no-store' })
        .then(responseTransformer)
        .catch((_err) => DEPLOYMENT_NOT_OK_RESPONSE)
        .then(syncHandler);
    };
    setInterval(deploymentSync, DEPLOYMENT_SYNC_PERIOD);
    deploymentSync();
  };

  // ASYNC POST FETCHING

  const MAX_ITEMS = 3;
  const sliced = (arrayLike) => Array.from(arrayLike).slice(0, MAX_ITEMS);
  const slicedSelection = (selector) => sliced(document.querySelectorAll(selector));

  const asyncPostPrefetchContent = () => {
    slicedSelection('a[data-fetch], link[data-fetch]').forEach((e) => fetch(e.href));
  };

  const asyncPostPrefetchImages = () => {
    // will be webp (only Safari will suffer :shrug:)
    slicedSelection('source[data-cover-url]').forEach((e) => fetch(e.dataset.coverUrl));
    // and this png - let's disable it for now
    //slicedSelection('img[data-cover-url]').forEach((e) => fetch(e.dataset.coverUrl));
  };

  // TRIGGER ON LOAD
  window.onload = () => {
    setTimeout(deploymentCheck, 0);
    // setTimeout(asyncPostPrefetchContent, 5000);
    // setTimeout(asyncPostPrefetchImages, 9000);
  };

  window.markentier = { tech: '🦄' }; // ;-)
})();
