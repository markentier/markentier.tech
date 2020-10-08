"use strict";

((w, n, d, c) => {
  // REMOVAL stage 1 - 2020-10-08
  // SERVICE WORKER
  const registerSW = () => {
    n.serviceWorker.register("/js/sw.js", { scope: "/" }).then(
      (reg) => {
        reg.update();
      },
      (_err) => {}
    );
  };

  if ("serviceWorker" in n) {
    d.addEventListener("DOMContentLoaded", (_event) => { registerSW(); });
  }

  // remove the background image styling, so transparent images won't have
  // strange SQIP artefacts shining through
  d.querySelectorAll(
    "img[loading=lazy][class]:not(.thumbnail):not(.loaded)"
  ).forEach((img) => {
    img.onload = (_event) => (img.className = "loaded");
  });
  d.querySelectorAll("img[loading=lazy].thumbnail:not(.loaded)").forEach(
    (img) => {
      img.onload = (_event) => (img.className = "thumbnail loaded");
    }
  );

  w.markentier = { tech: "🦄" }; // ;-)
})(window, navigator, document, console);
