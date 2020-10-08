// https://github.com/gokulkrishh/demo-progressive-web-app/blob/master/js/offline.js
"use strict";

(() => {
  const headerElement = document.querySelector("header");
  const metaTagTheme = document.querySelector("meta[name=theme-color]");

  // To update network status
  const updateNetworkStatus = () => {
    if (navigator.onLine) {
      metaTagTheme.setAttribute("content", "#dfdddc");
      headerElement.classList.remove("app__offline");
    } else {
      metaTagTheme.setAttribute("content", "#2f2d2c");
      headerElement.classList.add("app__offline");
    }
  }

  document.addEventListener("DOMContentLoaded", function (_e) {
    if (!navigator.onLine) { updateNetworkStatus(); }
    window.addEventListener("online", updateNetworkStatus, false);
    window.addEventListener("offline", updateNetworkStatus, false);
  });
})()
