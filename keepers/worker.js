let syncerTarget;

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
    if (syncerTarget) {
      syncerTarget.postMessage({ forceUpdate: true });
    }
  });
};

const deploymentSync = () => {
  if (navigator.onLine === false) return;
  fetch(DEPLOYMENT_PATH, { cache: "no-store" })
    .then(jsonResponse)
    .catch((_err) => DEPLOYMENT_NOT_OK_RESPONSE)
    .then(syncHandler);
};

try {
  if (self instanceof SharedWorkerGlobalScope) {
    self.onconnect = (event) => {
      // only one instance needs to force the update,
      // we pick the first
      const port = event.ports[0];
      syncerTarget = port;
    };
  }
} catch(_err) {
  try {
    if (self instanceof DedicatedWorkerGlobalScope) {
      syncerTarget = self;
    }
  } catch(_err) {
    console.log("I don't know what I am.");
  }
};

// start the checker
setInterval(deploymentSync, DEPLOYMENT_SYNC_PERIOD);
