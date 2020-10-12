"use strict";

// remove the background image styling, so transparent images won't have
// strange SQIP artefacts shining through
// document
//   .querySelectorAll("img[loading=lazy][class]:not(.thumbnail):not(.loaded)")
//   .forEach((img) => {
//     img.onload = (_event) => (img.className = "loaded");
//   });
// document
//   .querySelectorAll("img[loading=lazy].thumbnail:not(.loaded)")
//   .forEach((img) => {
//     img.onload = (_event) => (img.className = "thumbnail loaded");
//   });
// [...document.querySelectorAll("img[data-src]")].map((img) =>
//   img.addEventListener("click", (_event) => (img.src = img.dataset.src))
// );

document.addEventListener("DOMContentLoaded", (_event) => {
  window.markentier = { tech: "🦄" }; // ;-)
});
