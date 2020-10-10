"use strict";

const [d, s, W] = [document, screen, window];

const dqs = (selector) => d.querySelector(selector);
const dqsa = (selector) => d.querySelectorAll(selector);
const dce = (tag) => d.createElement(tag);

const resHandler = () => {
  const [w, h, dpr, iw, ih] = [
    s.width,
    s.height,
    W.devicePixelRatio.toFixed(3),
    W.innerWidth,
    W.innerHeight,
  ];
  const resScreenE = dqs("#resScreen");
  const resTrueScreenE = dqs("#resTrueScreen");
  const resDprE = dqsa(".resDPR");
  const resInnerE = dqs("#resInner");
  const resTrueInnerE = dqs("#resTrueInner");
  const ppiBox = dqs("#ppi");
  const ppi = ppiBox.offsetWidth;
  const cPpiE = dqs("#cPPI");
  const rounder = (v) => v.toFixed(0);

  resScreenE.innerHTML = `${w} x ${h}`;
  resTrueScreenE.innerHTML = `${rounder(w * dpr)} x ${rounder(h * dpr)}`;
  resDprE.forEach((e) => (e.innerHTML = `${dpr}`));
  resInnerE.innerHTML = `${iw} x ${ih}`;
  resTrueInnerE.innerHTML = `${rounder(iw * dpr)} x ${rounder(ih * dpr)}`;
  cPpiE.innerHTML = `${ppi} ppi`;

  dqsa(".resValue").forEach((e) => {
    e.style.fontWeight = "bold";
    const parent = e.parentNode;
    if(parent.tagName === "P") {
      const html = parent.innerHTML;
      const newE = dce("pre");
      const newCode = dce("code");
      newCode.innerHTML = html;
      newCode.style.fontSize = "133%";
      newE.appendChild(newCode);
      parent.replaceWith(newE);
    }
  });
};

W.addEventListener("resize", resHandler)
W.addEventListener("mousewheel", resHandler)
resHandler();
