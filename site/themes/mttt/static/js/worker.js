const deploymentCheck = () => {
  const DEPLOYMENT_PATH = "/deployment.json";
  const DEPLOYMENT_NOT_OK_RESPONSE = { deployment: false };
  const DEPLOYMENT_SYNC_PERIOD = 60 * 1000;

  const jsonResponse = (response) => {
    if (response.status === 200) return response.json();
    return DEPLOYMENT_NOT_OK_RESPONSE;
  };

  const syncHandler = (payload) => {
    if (payload.deployment === false) return;
    const sha = payload.deployment.sha;
    self.caches.keys().then((cacheKeys) => {
      if (cacheKeys.includes(sha)) return;
      navigator.serviceWorker.controller.postMessage({ forceUpdate: true });
    });
  };

  const deploymentSync = () => {
    if (navigator.onLine === false) return;
    fetch(DEPLOYMENT_PATH, { cache: "no-store" })
      .then(jsonResponse)
      .catch((_err) => DEPLOYMENT_NOT_OK_RESPONSE)
      .then(syncHandler);
  };

  setInterval(deploymentSync, DEPLOYMENT_SYNC_PERIOD);
};

if (self instanceof SharedWorkerGlobalScope) {
  self.onconnect = (event) => {
    for (port of event.ports) {
      // work per port (can inform all open tabs/windows)
      // port.onmessage = handler;
    };
    deploymentCheck();
  };
} else if (self instanceof DedicatedWorkerGlobalScope) {
  // self.onmessage = handler;
  deploymentCheck();
} else {
  console.log("I don't know what I am.")
}
