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

  // TRIGGER ON LOAD
  window.onload = () => {
    setTimeout(deploymentCheck, 0);
  };

  window.markentier = { tech: '🦄' }; // ;-)
})();
