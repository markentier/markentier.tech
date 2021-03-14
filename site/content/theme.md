+++
title = "theme"
date = 2018-04-11
description = "markentier.tech theme information; color palette"

[extra]
additional_scripts = ["/js/theme.js"]
custom_css = """
.theme {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 1rem 0;
}
.theme > div {
  width: 11.5rem;
  height: 11.5rem;
  line-height: 10rem;
  flex: 0 0 auto;
  padding: .25rem;
  text-align: center;
  border: 1px solid var(--accent-darker-color);
  margin: 0 .25rem .25rem 0;
}
.theme > div span {
  display: inline-block;
  vertical-align: middle;
  line-height: normal;
  font-size: .8rem;
  font-family: var(--code-font);
}
"""
+++

## colors

<div class="theme">
  <div style="background:var(--head-light-color)"><span style="color:var(--bg-color)">--head-light-color</span></div>
  <div style="background:var(--head-color)"><span style="color:var(--bg-color)">--head-color<br/>(--link-color)</span></div>
  <div style="background:var(--head-dark-color)"><span style="color:var(--bg-color)">--head-dark-color</span></div>
  <div style="background:var(--link-hl-color)"><span style="color:var(--bg-color)">--link-hl-color</span></div>
  <div style="background:var(--text-color)"><span style="color:var(--bg-color)">--text-color</span></div>
  <div style="background:var(--bg-color)"><span>--bg-color</span></div>
  <div style="background:var(--accent-color)"><span>--accent-color</span></div>
  <div style="background:var(--accent-dark-color)"><span>--accent-dark-color</span></div>
  <div style="background:var(--accent-darker-color)"><span>--accent-darker-color</span></div>
  <!-- <div style="background:var(--accent-darkest-color)"><span>--accent-darkest-color</span></div> -->
</div>


### specials

<div class="theme">
  <div style="background:var(--rebecca)"><span style="color:var(--bg-color)">--rebecca</span></div>
  <div style="background:var(--green)"><span style="color:var(--bg-color)">--green</span></div>
  <div style="background:var(--transparent)"><span>--transparent</span></div>
</div>
<p></p>

### logo

#### standard

[![m (reference logo file; SVG)](/i/m.svg)](/i/m.svg)

#### favicon

Should be able to adapt to dark mode.

[![SVG favicon](/i/m.favicon.svg)](/i/m.favicon.svg)

### site header

[![SVG siteheader](/i/markentier_tech.svg)](/i/markentier_tech.svg)
