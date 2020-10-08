/* global self, fetch */
"use strict";
// REMOVAL stage 1 - 2020-10-08
// simple pass-through
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
