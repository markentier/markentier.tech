+++
title = "What are my resolutions?"
date = 2020-09-28
description = "Tools page to gather information about the current resolution of the browser"

[extra]
additional_scripts = ["/js/resolution.js"]
custom_css = """
#ppi { height: 1px; width: 1in; }
.article-body > p:first-of-type::after, hr::after { content: '· · 🖥 · ·'; opacity: .5; }
"""
+++

Every once in a while I need to check what the resolutions of my devices are, especially when I'm working on my theme.

**Important:** There is a difference between the observed resolution via the JavaScript methods like `screen.width`
and the physical resolution of your device. That's where [`window.devicePixelRatio` (DPR)][dpr] comes in.

_Why should I care?_ The media query breakpoints depend on the observed resolution,
so you cannot just look into the tech data of your device and take the display resolution without checking for the DPR.

_Fun fact:_ The DPR **also** changes on zooming!
<small>The [window.VisualViewport.scale][scale] property is still experimental, and thus we cannot reliable determine
the difference between zooming vs pixel ratio settings by your device. <small>[2020-09]</small></small>

## Screen/Device resolution

Values of the absolute screen estate, not what's usable for the page.

**Observed/JavaScript**

screen.width x screen.height = <span id="resScreen" class="resValue">??? x ???</span>

window.devicePixelRatio = <span class="resDPR resValue">?</span> device pixels per CSS pixel

**True/Physical**

screen.width x screen.height = <span id="resTrueScreen" class="resValue">??? x ???</span>

Note: if you zoomed these values will **not** reflect the real physical dimensions anymore!

-----

## Visible resolution

Values of the screen estate available for the page, so minus application chrome like tool bars and interface controls.

**Observed/JavaScript**

window.innerWidth x window.innerHeight = <span id="resInner" class="resValue">`??? x ???`</span>

window.devicePixelRatio = <span class="resDPR resValue">?</span> device pixels per CSS pixel

**True/Physical**

window.innerWidth x window.innerHeight = <span id="resTrueInner" class="resValue">??? x ???</span>

## Bonus: PPI (pixel per inch)

Nice [trick to check PPI][ppi]: create a `<div>` with `1in` height/width and measure the pixel value.

Calculated PPI: <span id="cPPI" class="resValue">??? ppi</span>

<div id=ppi></div>

Note: **DPI** (dots per inch) should **not** be used as a term for displays,
because **dots** are a unit used in print (the physical ink dots on the paper).
You can [read more about it][ppi-vs-dpi] on 99designs. Sadly both units are used interchangeably sometimes,
which makes the situation more confusing. Maybe it's because we talk about **d**isplays and **d**ensities,
so we keep using **d**pi when **ppi** would be the right one.

[dpr]: https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
[scale]: https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport/scale
[ppi]: https://stackoverflow.com/a/838755/653173
[ppi-vs-dpi]: https://en.99designs.de/blog/tips/ppi-vs-dpi-whats-the-difference/
