/* global fetch */
'use strict';

((w, n, d, c) => {
  const DEPLOYMENT_SYNC_PERIOD = 60 * 1000;

  // const sw = () => {
  //   let s = n.serviceWorker.controller;
  //   if (!s) {
  //     n.serviceWorker.ready.then((r) => s = r.active)
  //   }
  //   return s;
  // }

  const bgWorkerSetup = (reg) => {
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
        // console.log("[main] Received message from worker:", event.data);
        if (event.data.forceUpdate) {
          reg.active.postMessage(event.data);
        };
      };
    } else {
      console.log(
        "[main] No Worker API available; fallback to check in main thread"
      );
      deploymentCheck();
    }
  };

  const periodicSyncSetup = (reg) => {
    try {
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
            bgWorkerSetup(reg);
          });
      } else {
        c.log("No [periodicSync] available; fallback to worker setup");
        bgWorkerSetup(reg);
      }
    } catch(err) {
      c.log("Unrecoverable issue:", err);
      bgWorkerSetup(reg);
    }
  }

  // SERVICE WORKER
  const registerSW = () => {
    n.serviceWorker.register("/js/sw.js", { scope: "/" }).then(
      (reg) => {
        c.log("[ServiceWorker] Registration successful; scope: ", reg.scope);
        reg
          .update()
          .then((r) => { periodicSyncSetup(r); })
          .catch((_err) => { periodicSyncSetup(reg); })
      },
      (err) => {
        c.log("[ServiceWorker] Registration failed:", err);
      }
    );
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

    n.serviceWorker.onmessage = (event) => {
      if (event.data.reloadStyles) {
        // reloadResources();
        w.location.reload();
      };
    };
  };

  // remove the background image styling, so transparent images won't have
  // strange SQIP artefacts shining through
  d.querySelectorAll("img[loading=lazy][class]").forEach((img) => {
    img.onload = (_event) => img.removeAttribute("class");
  });

  w.markentier = { tech: "🦄" }; // ;-)
})(window, navigator, document, console);
