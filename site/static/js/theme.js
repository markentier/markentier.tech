"use strict";

// dynamically inject color information

const num2hex = (num) => {
  const n = Number(num);
  // is number an int or a float?
  if (n % 1 == 0) {
    return String("0" + n.toString(16)).slice(-2);
  } else {
    const scaled = Math.round(n * 100 * 255);
    return String("0" + scaled.toString(16)).slice(-2);
  }
}

const color2hex = (color) => {
  const idx = color.startsWith("rgba") ? 5 : 4;
  return (
    "#" +
    color
      .substr(idx, color.indexOf(")") - idx)
      .split(",")
      .map(num2hex)
      .join("")
  );
}

const colorTiles = document.querySelectorAll(".theme>div");

colorTiles.forEach((child) => {
  const bgColor = window
    .getComputedStyle(child, null)
    .getPropertyValue("background-color");
  const span = child.querySelector("span");
  if (span) {
    span.innerHTML = `${color2hex(bgColor)}<br>${bgColor}<br>${span.innerHTML}`;
  }
});
