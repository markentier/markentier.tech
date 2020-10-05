/* global self, importScripts, caches, fetch, idb, Response */
'use strict';

// https://github.com/GoogleChromeLabs/airhorn/blob/master/app/sw.js
// https://serviceworke.rs/strategy-cache-update-and-refresh.html

importScripts('/js/sw-idb.js');

const FORCE_UPDATE_PAH_RE = new RegExp('/sw-force-update');
const FORCE_UPDATE_RESPONSE = JSON.stringify({ ok: true });

const DEPLOYMENT_PATH = '/deployment.json';
const DEPLOYMENT_PATH_RE = new RegExp(`${DEPLOYMENT_PATH}`);

const FALLBACK_SHA = 'ffffffffffffffffffffffffffffffffffffffff';
const FALLBACK_PAYLOAD_FN = () => { return { deployment: { sha: FALLBACK_SHA, ts: Date.now() } } };

const VERSION_FALLBACK = 'mtt-20200909.1';
const VERSION_FALLBACK_ITEM = { sha: VERSION_FALLBACK, ts: Date.now() };

const IDB_NAME = 'mtt-sw-data';
const IDB_VERSION = 1;
const IDB_OSTORE = 'deployments';

const openObject = {
  upgrade(db, _oldVersion, _newVersion, _transaction) {
    db.createObjectStore(IDB_OSTORE, { keyPath: "sha" });
  },
};

const openDB = () => idb.openDB(IDB_NAME, IDB_VERSION, openObject);

const tsSort = (a, b) => { if (a.ts < b.ts) { return -1 }; if (a.ts > b.ts) { return 1 }; return 0; }

const getVersion = () => {
  return openDB()
    .then((db) =>
      db.transaction([IDB_OSTORE], "readonly").objectStore(IDB_OSTORE).getAll()
    )
    .then((items) => items.sort(tsSort))
    .then((items) => items[items.length - 1] || VERSION_FALLBACK_ITEM)
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
  return fetch('/cache.json', { cache: 'no-store' })
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
    console.log('[SW] Deleting old cache:', cacheName);
    return caches.delete(cacheName);
  };
};

const cacheableFetch = (event) => {
  if (event.request.url.match(FORCE_UPDATE_PAH_RE)) return forceUpdate(event);
  if (event.request.url.match(DEPLOYMENT_PATH_RE)) return addDeployment(event);
  return serveOrFetch(event);
};

const forceUpdate = (event) => {
  event.waitUntil(
    syncAndUpdate()
      .then(() => caches.keys())
      .then(cacheKeysPurgeFn)
      .then(reloadStylesInClients)
  );
  return new Response(FORCE_UPDATE_RESPONSE);
};

const syncAndUpdate = () => {
  return deploymentSync()
    .finally(() => getVersionedCache().then(cacheFn));
};

const addDeployment = (event) => {
  return fetch(event.request, { cache: 'no-store' })
    .then((response) => {
      event.waitUntil(new Promise((resolve) => resolve(() => {
        return response.clone().json()
          .then((payload) => updateShaWithDb(payload))
          .catch((_err) => updateShaWithDb(FALLBACK_PAYLOAD_FN()))
      })));
      return response;
    });
};

const updateShaWithDb = (payload) => {
  return idb
    .openDB(IDB_NAME, IDB_VERSION)
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

const serveOrFetch = (event) => {
  return getVersionedCache()
    .then((cache) => {
      return cache
        .match(event.request, { ignoreSearch: true })
        .then((response) => response || Promise.reject(new Error("not-found")))
        .catch((_not_found) => {
          return fetch(event.request).then((response) => {
            // cache only valid requests
            if (response.ok && response.url.startsWith('https')) {
              event.waitUntil(cache.put(event.request, response.clone()));
              // await cache.put(event.request, response.clone());
            };
            // otherwise just return whatever it is
            return response;
          });
        });
    });
};

const deploymentSync = () => {
  return fetch(`${DEPLOYMENT_PATH}?_sw_ts=${Date.now()}`, { cache: 'no-store' })
    .then((response) => response.json())
    .catch((_err) => { return FALLBACK_PAYLOAD_FN(); })
    .then((payload) => {
      return openDB().then((db) => updateSha(payload, db));
    });
};

const reloadStylesInClients = async (_result) => {
  const allClients = await self.clients.matchAll({
    includeUncontrolled: true,
  });
  for(const client of allClients) {
    client.postMessage({ reloadStyles: true });
  };
  return true;
}

const installHandler = (event) => {
  event.waitUntil(syncAndUpdate());
};

const activateHandler = (event) => {
  event.waitUntil(
    deploymentSync().finally(() => {
      return caches.keys()
        .then(cacheKeysPurgeFn)
        .finally(() => self.clients.claim());
    })
  );
};

const fetchHandler = (event) => {
  event.respondWith(cacheableFetch(event));
};

const forceUpdateHandler = (event) => {
  if (event.data.forceUpdate) {
    forceUpdate(event);
  };
};

const periodSyncHandler = (event) => {
  if (event.tag === "deploymentCheck") {
    event.waitUntil(
      syncAndUpdate()
        .then(() => caches.keys())
        .then(cacheKeysPurgeFn)
        .then((deletes) => {
          console.log("[SW] periodic update triggered, deletes:", deletes);
        })
    );
  }
};

self.addEventListener('install', installHandler)
self.addEventListener('activate', activateHandler)
self.addEventListener('fetch', fetchHandler)
self.addEventListener('message', forceUpdateHandler);
self.addEventListener('periodicsync', periodSyncHandler);
