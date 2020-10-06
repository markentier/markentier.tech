/* global fetch */
'use strict';

((w, n, d, c) => {
  const DEPLOYMENT_SYNC_PERIOD = 60 * 1000;

  const bgWorkerSetup = () => {
    const workerSetup = (script) => {
      if ("SharedWorker" in window) {
        const worker = new SharedWorker(script);
        return worker.port;
      }
      const worker = new Worker(script);
      return worker;
    };

    if ("Worker" in window) {
      const worker = workerSetup("/js/worker.js");
      worker.postMessage({ subscribe: true }); // no-op
      // worker has no access to SW, so we need to handle that again:
      worker.onmessage = (event) => {
        console.log("[main] Received message from worker:", event.data);
        if (event.data.forceUpdate) {
          n.serviceWorker.controller.postMessage(event.data);
        };
      };
    } else {
      console.log(
        "[main] No Worker API available; fallback to check in main thread"
      );
      deploymentCheck();
    }
  };

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
        c.log("[ServiceWorker] Registration failed:", err);
      }
    );

    n.serviceWorker.ready.then((reg) => {
      if ("periodicSync" in reg) {
        reg.periodicSync
          .register("deploymentCheck", {
            minInterval: DEPLOYMENT_SYNC_PERIOD,
          })
          .then((result) => {
            c.log("[periodicSync] deploymentCheck registered;", result);
          })
          .catch((err) => {
            c.log("[periodicSync] deploymentCheck registration failed;", err);
            c.log("No [periodicSync] available; fallback to worker setup");
            bgWorkerSetup();
          });
      } else {
        c.log("No [periodicSync] available; fallback to worker setup");
        bgWorkerSetup();
      }
    });
  };

  // DEPLOYMENT CHECKER
  const deploymentCheck = () => {
    const DEPLOYMENT_PATH = "/deployment.json";
    const DEPLOYMENT_NOT_OK_RESPONSE = { deployment: false };

    const jsonResponse = (response) => {
      if (response.status === 200) return response.json();
      return DEPLOYMENT_NOT_OK_RESPONSE;
    };

    const syncHandler = (payload) => {
      if (payload.deployment === false) return;
      const sha = payload.deployment.sha;
      w.caches.keys().then((cacheKeys) => {
        if (cacheKeys.includes(sha)) return;
        n.serviceWorker.controller.postMessage({ forceUpdate: true });
      });
    };

    const deploymentSync = () => {
      if (n.onLine === false) return;
      fetch(DEPLOYMENT_PATH, { cache: "no-store" })
        .then(jsonResponse)
        .catch((_err) => DEPLOYMENT_NOT_OK_RESPONSE)
        .then(syncHandler);
    };

    setInterval(deploymentSync, DEPLOYMENT_SYNC_PERIOD);
  };

  const reloadResources = () => {
    c.log("[main] Updating stylesheets ...");
    d.querySelectorAll("link[rel=stylesheet]").forEach((link) => {
      link.href = link.href.replace(/\?.*|$/, "?" + Date.now());
    });
  };

  // only set up all related stuff together if SW are available
  if ("serviceWorker" in n) {
    w.onload = (_event) => registerSW();

    n.serviceWorker.addEventListener("message", (event) => {
      if (event.data.reloadStyles) { reloadResources(); };
    });
  };

  // remove the background image styling, so transparent images won't have
  // strange SQIP artefacts shining through
  d.querySelectorAll("img[loading=lazy][class]").forEach((img) => {
    img.onload = (_event) => img.removeAttribute("class");
  });

  w.markentier = { tech: "🦄" }; // ;-)
})(window, navigator, document, console);
