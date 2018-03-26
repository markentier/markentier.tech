/*
  (Unshamelessly)
  Stolen from Stefan Judis,
         who stole it from Tim Kadlec.
  Kudos to Stefan and Tim. Thank you.
  Ref: https://mnnz.cc/sj-loading-time
*/
window.onload = () => {
  setTimeout(() => {
    const w = window
    const p = (w.performance = w.performance || w.mozPerformance || w.msPerformance || w.webkitPerformance || {})
    const t = p.timing
    if (!t) { return }
    const end = t.loadEventEnd
    const start = t.navigationStart
    const loadTime = (end - start) / 1000
    const footer = document.querySelector('footer')
    footer.innerHTML += `<br /><small><code>Page loaded in <strong>${loadTime}</strong> seconds<code></small>`
  }, 0)
}
