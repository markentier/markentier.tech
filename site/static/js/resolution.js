"use strict";
(() => {
  const [d, s, _w] = [document, screen, window];

  const resHandler = () => {
    const [w, h, dpr, iw, ih] = [
      s.width,
      s.height,
      _w.devicePixelRatio.toFixed(3),
      _w.innerWidth,
      _w.innerHeight,
    ];
    const resScreenE = d.querySelector("#resScreen");
    const resTrueScreenE = d.querySelector("#resTrueScreen");
    const resDprE = d.querySelectorAll(".resDPR");
    const resInnerE = d.querySelector("#resInner");
    const resTrueInnerE = d.querySelector("#resTrueInner");
    const ppiBox = d.querySelector("#ppi");
    const ppi = ppiBox.offsetWidth;
    const cPpiE = d.querySelector("#cPPI");
    const rounder = (v) => v.toFixed(0);

    resScreenE.innerHTML = `${w} x ${h}`;
    resTrueScreenE.innerHTML = `${rounder(w * dpr)} x ${rounder(h * dpr)}`;
    resDprE.forEach((e) => (e.innerHTML = `${dpr}`));
    resInnerE.innerHTML = `${iw} x ${ih}`;
    resTrueInnerE.innerHTML = `${rounder(iw * dpr)} x ${rounder(ih * dpr)}`;
    cPpiE.innerHTML = `${ppi} ppi`;

    d.querySelectorAll(".resValue").forEach((e) => {
      e.style.fontWeight = "bold";
      const parent = e.parentNode;
      if(parent.tagName === "P") {
        const html = parent.innerHTML;
        const newE = d.createElement("pre");
        const newCode = d.createElement("code");
        newCode.innerHTML = html;
        newCode.style.fontSize = "133%";
        newE.appendChild(newCode);
        parent.replaceWith(newE);
      }
    });
  };

  _w.addEventListener("resize", resHandler)
  _w.addEventListener("mousewheel", resHandler)
  setTimeout(resHandler, 0);
})();
