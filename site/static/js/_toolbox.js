// delayed promise:
const wait = (ms) => { return new Promise(resolve => { setTimeout(resolve, ms); }); };
wait(2000).then(() => { console.log(`waited`) })

// promiseAny([p1, p2, p3]) :: Promise
const promiseAny = (promises) => {
  return new Promise((resolve, reject) => {
    promises = promises.map(p => Promise.resolve(p));
    promises.forEach(p => p.then(resolve));
    promises.reduce((a, b) => a.catch(() => b)).catch(() => reject(Error('All failed')));
  });
};
promiseAny([Promise.resolve(42)])
// @see <https://github.com/w3c/ServiceWorker/issues/838#issuecomment-191226678>

// from: https://medium.com/@MateMarschalko/online-and-offline-events-with-javascript-d424bec8f43
function handleConnectionChange (event) {
  if (event.type === 'offline') {
    console.log('You lost connection.');
  }
  if (event.type === 'online') {
    console.log('You are now back online.');
  }

  console.log(new Date(event.timeStamp));
}
window.addEventListener('online', handleConnectionChange);
window.addEventListener('offline', handleConnectionChange);
