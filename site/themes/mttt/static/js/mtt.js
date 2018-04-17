'use strict';
(() => {
  const registerSwOnLoad = () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('[ServiceWorker] Registration successful with scope: ', reg.scope);
        reg.update();
      }, (err) => {
        console.log('[ServiceWorker] Registration failed: ', err);
      });
  };

  // start it:
  if ('serviceWorker' in navigator) { window.addEventListener('load', registerSwOnLoad); }

  const navbar = document.querySelector('.navbar');
  let sticky = navbar.offsetTop;
  const navbarScroll = () => {
    if (window.pageYOffset >= sticky) {
      navbar.classList.add('sticky')
    } else {
      navbar.classList.remove('sticky');
    }
  };

  const scrollprogress = document.querySelector('.scrollprogress');
  const scrollMaxHeight = () => { return window.scrollMaxY || (document.documentElement.scrollHeight - document.documentElement.clientHeight); };
  const scrollHeight = () => { return window.pageYOffset; };
  const updateProgressWithScrollHeight = () => {
    scrollprogress.max = scrollMaxHeight();
    scrollprogress.value = scrollHeight();
  };

  window.onscroll = () => {
    navbarScroll();
    updateProgressWithScrollHeight();
  };
})();
