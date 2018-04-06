// delayed promise:
const wait = (ms) => { return new Promise(resolve => { setTimeout(resolve, ms); }); };
// wait(2000).then(() => { ... })

// promiseAny([p1, p2, p3]) :: Promise
const promiseAny = (promises) => {
  return new Promise((resolve, reject) => {
    promises = promises.map(p => Promise.resolve(p));
    promises.forEach(p => p.then(resolve));
    promises.reduce((a, b) => a.catch(() => b)).catch(() => reject(Error("All failed")));
  });
};
// @see <https://github.com/w3c/ServiceWorker/issues/838#issuecomment-191226678>
