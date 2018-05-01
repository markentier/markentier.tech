/* global fetch */
'use strict';
(() => {
  /*
    function loadTimeInfo:
    (Unshamelessly)
    Stolen from Stefan Judis,
          who stole it from Tim Kadlec.
    Kudos to Stefan and Tim. Thank you.
    Ref: https://mnnz.cc/sj-loading-time
  */
  const loadTimeInfo = () => {
    const w = window;
    const p = (w.performance = w.performance || w.mozPerformance || w.msPerformance || w.webkitPerformance || {});
    const t = p.timing;
    if (!t) return;
    const end = t.loadEventEnd;
    const start = t.navigationStart;
    const loadTime = (end - start) / 1000;
    const footer = document.querySelector('footer[class=footer]');
    footer.innerHTML += `<br><small><code>Page loaded in <strong>${loadTime}</strong> seconds<code></small>`;
  };

  const deploymentCheck = () => {
    const FORCE_UPDATE_PAH = '/sw-force-update';
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
        fetch(FORCE_UPDATE_PAH);
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

  const asyncPostPrefetch = () => {
    document.querySelectorAll('a[data-fetch], link[data-fetch]').forEach((e) => fetch(e.href));
    document.querySelectorAll('img[data-fetch]').forEach((img) => fetch(img.src));
    document.querySelectorAll('[data-cover-url]').forEach((e) => fetch(e.dataset.coverUrl));
  };

  window.onload = () => {
    setTimeout(deploymentCheck, 0);
    setTimeout(asyncPostPrefetch, 0);
    setTimeout(loadTimeInfo, 0);
  };
})();
