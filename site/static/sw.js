'use strict';
// https://github.com/GoogleChromeLabs/airhorn/blob/master/app/sw.js

importScripts('/sw-idb.js');

const unixTimestamp = () => parseInt(Date.now() / 1000);

const DEPLOYMENT_PATH = '/deployment.json';
const DEPLOYMENT_PATH_RE = new RegExp(`${DEPLOYMENT_PATH}`);

const FALLBACK_SHA = 'ffffffffffffffffffffffffffffffffffffffff';
const FALLBACK_PAYLOAD_FN = () => { return { deployment: { sha: FALLBACK_SHA, ts: unixTimestamp() } } };

const VERSION_FALLBACK = 'mtt-20180406.1';
const VERSION_FALLBACK_ITEM = { sha: VERSION_FALLBACK, ts: unixTimestamp() };

const IDB_NAME = 'mtt-sw-data';
const IDB_VERSION = 1;
const IDB_OSTORE = 'deployments';

const createDB = () => idb.open(IDB_NAME, IDB_VERSION, idbUpgrade);

const idbUpgrade = (upgradeDb) => { upgradeDb.createObjectStore(IDB_OSTORE, { keyPath: 'sha' }); };

const tsSort = (a, b) => { if (a.ts < b.ts) { return -1 }; if (a.ts > b.ts) { return 1 }; return 0; }

const getVersion = () => {
  return idb.open(IDB_NAME, IDB_VERSION, idbUpgrade)
    .then((db) => db.transaction([IDB_OSTORE], 'readonly').objectStore(IDB_OSTORE).getAll())
    .then((items) => items.sort(tsSort))
    .then((items) => (items[items.length - 1] || VERSION_FALLBACK_ITEM))
    .then((item) => item.sha)
    .catch((err) => {
      console.log(`[SW] getVersion ERR: ${err}`);
      return VERSION_FALLBACK;
    });
};

const getVersionedCache = () => {
  return getVersion()
    .then((version) => caches.open(version));
};

const cacheFn = cache => {
  return fetch('/cache.json')
    .then((response) => response.json())
    .then((files) => cache.addAll(files))
    .then(() => self.skipWaiting());
};

const cacheKeysPurgeFn = (cacheNames) => {
  return getVersion().then((version) => {
    return Promise.all(cacheNames.map(
      (cacheName) => purgeFn(cacheName, version)
    ));
  })
};

const purgeFn = (cacheName, version) => {
  if (cacheName !== version) {
    console.log('[ServiceWorker] Deleting old cache:', cacheName);
    return caches.delete(cacheName);
  };
};

const cacheableFetch = (e) => {
  if (e.request.url.match(DEPLOYMENT_PATH_RE)) {
    return addDeployment(e);
  } else {
    return serveOrFetch(e);
  };
};

const addDeployment = (e) => {
  return fetch(e.request, { cache: 'no-store' })
    .then((response) => {
      e.waitUntil(new Promise((resolve) => resolve(() => {
        return response.clone().json()
          .then((payload) => updateShaWithDb(payload))
          .catch((err) => updateShaWithDb(FALLBACK_PAYLOAD))
      })));
      return response;
    });
};

const updateShaWithDb = (paylod) => {
  return idb
    .open(IDB_NAME, IDB_VERSION)
    .then((db) => updateSha(payload, db))
};

const updateSha = (payload, db) => {
  const sha = payload.deployment.sha;
  const ts = payload.deployment.ts;
  console.log(`[SW] Last deployment SHA: ${sha} (ts: ${ts})`);
  return db
    .transaction([IDB_OSTORE], 'readwrite')
    .objectStore(IDB_OSTORE)
    .put(payload.deployment);
};

const serveOrFetch = (e) => {
  return getVersionedCache()
    .then((cache) => {
      return cache.match(e.request)
        .then((response) => response || Promise.reject('not-found'))
        .catch((err) => {
          return fetch(e.request)
            .then((response) => {
              scheduleCacheUpdate(cache, e, response);
              return response;
            });
        });
    });
};

const scheduleCacheUpdate = (cache, e, response) => {
  const updater = new Promise((resolve) => resolve(() => {
    cache.put(e.request, response.clone());
    return response;
  }))
  // e.waitUntil(updater.then(notifyClients));
  e.waitUntil(updater);
};

// const notifyClients = (response) => {
//   const message = {
//     type: 'refresh',
//     url: response.url,
//     eTag: response.headers.get('ETag')
//   };
//   const notifyClient = (client) => client.postMessage(JSON.stringify(message));
//   const notifyAllClients = (clients) => clients.forEach(notifyClient);
//   return self.clients.matchAll().then(notifyAllClients);
// };

const deploymentSync = () => {
  return fetch(`${DEPLOYMENT_PATH}?_sw_ts=${Date.now()}`)
    .then((response) => response.json())
    .catch((_err) => { return FALLBACK_PAYLOAD_FN(); })
    .then((payload) => {
      return createDB().then((db) => updateSha(payload, db));
    });
};

const installHandler = (e) => {
  e.waitUntil(
    deploymentSync().finally(() => getVersionedCache().then(cacheFn))
  );
};

const activateHandler = (e) => {
  e.waitUntil(
    deploymentSync().finally(() => {
      return caches.keys()
        .then(cacheKeysPurgeFn)
        .finally(() => self.clients.claim());
    })
  );
};

const fetchHandler = (e) => {
  e.respondWith(cacheableFetch(e));
  // e.waitUntil();
};

// const notificationHandler = (e) => {
//   console.log(`[sw] On notification click: ${e.notification.tag}`);
//   console.log('--n:', e.notification);
//   e.notification.close();
//   // e.waitUntil()
// };

self.addEventListener('install', installHandler)
self.addEventListener('activate', activateHandler)
self.addEventListener('fetch', fetchHandler)
// self.addEventListener('notificationclick', notificationHandler);
