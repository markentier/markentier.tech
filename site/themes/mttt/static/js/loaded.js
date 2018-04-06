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

  const DEPLOYMENT_PATH = '/deployment.json';

  const loadTimeInfo = () => {
    const w = window;
    const p = (w.performance = w.performance || w.mozPerformance || w.msPerformance || w.webkitPerformance || {});
    const t = p.timing;
    if (!t) { return; };
    const end = t.loadEventEnd;
    const start = t.navigationStart;
    const loadTime = (end - start) / 1000;
    const footer = document.querySelector('footer[class=footer]');
    footer.innerHTML += `<br /><small><code>Page loaded in <strong>${loadTime}</strong> seconds<code></small>`;
  };

  const deploymentCheck = () => {
    const deploymentSyncPeriod = 60 * 1000;
    const deploymentSync = () => {
      fetch(DEPLOYMENT_PATH)
      .then((r) => r.json())
      .catch((_err) => { return { deployment: { sha: 'unknown', ts: Date.now() } }; })
      .then((payload) => {
        const sha = payload.deployment.sha;
        const keys =
        window.caches.keys().then((cacheKeys) => {
          const wrppr = document.querySelector('#wrppr')
          if(!cacheKeys.includes(sha)) {
            wrppr.classList.add('outdated'); // or no connection, we need to check better
          } else {
            wrppr.classList.remove('outdated');
          }
        })
      })
    };
    setInterval(deploymentSync, deploymentSyncPeriod);
    deploymentSync();
  };

  window.onload = () => {
    setTimeout(loadTimeInfo, 0);
    setTimeout(deploymentCheck, 0);
  };
})();
