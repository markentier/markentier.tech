/* global fetch */
'use strict';

((w, n, d, c) => {
  // SERVICE WORKER
  const registerSW = () => {
    n.serviceWorker.register("/js/sw.js", { scope: "/" }).then(
      (reg) => {
        c.log(
          "[ServiceWorker] Registration successful with scope: ",
          reg.scope
        );
        reg.update();
      },
      (err) => {
        c.log("[ServiceWorker] Registration failed: ", err);
      }
    );
  };

  // DEPLOYMENT CHECKER
  const deploymentCheck = () => {
    const FORCE_UPDATE_PATH = "/sw-force-update";
    const DEPLOYMENT_PATH = "/deployment.json";
    const DEPLOYMENT_NOT_OK_RESPONSE = { deployment: false };
    const DEPLOYMENT_SYNC_PERIOD = 60 * 1000;

    const responseTransformer = (response) => {
      if (response.status === 200) return response.json();
      return DEPLOYMENT_NOT_OK_RESPONSE;
    };

    const syncHandler = (payload) => {
      if (payload.deployment === false) return;
      const sha = payload.deployment.sha;
      w.caches.keys().then((cacheKeys) => {
        if (cacheKeys.includes(sha)) return;
        fetch(FORCE_UPDATE_PATH);
        n.serviceWorker.controller.postMessage({ forceUpdate: true });
      });
    };

    const deploymentSync = () => {
      if (n.onLine === false) return;
      fetch(DEPLOYMENT_PATH, { cache: "no-store" })
        .then(responseTransformer)
        .catch((_err) => DEPLOYMENT_NOT_OK_RESPONSE)
        .then(syncHandler);
    };

    setInterval(deploymentSync, DEPLOYMENT_SYNC_PERIOD);
    deploymentSync();
  };

  const reloadStyles = () => {
    d.querySelectorAll("link[rel=stylesheet]").forEach((link) => {
      link.href = link.href.replace(/\?.*|$/, "?" + Date.now());
    });
  };

  const startDeploymentCheck = () => {
    setTimeout(deploymentCheck, 0);
  };

  // only set up all related stuff together if SW are available
  if ("serviceWorker" in n) {
    w.onload = () => {
      registerSW();
      startDeploymentCheck();
    };
    n.serviceWorker.addEventListener("message", (event) => {
      if (event.data.reloadStyles) {
        c.log("[main] Got informed to reload the stylesheets.");
        reloadStyles();
      };
    });
  };

  // remove the background image styling, so transparent images won't have
  // strange SQIP artefacts shining through
  d.querySelectorAll("img[loading=lazy]").forEach((img) => {
    img.onload = (_event) => img.attributes.removeNamedItem("class");
  });

  w.markentier = { tech: "🦄" }; // ;-)
})(window, navigator, document, console);
