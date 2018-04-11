+++
title = "theme"
date = 2018-04-11
# html mode
+++

### colors

<!-- </div> -->
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
</div>
<script>
// dynamically inject color information
((w, d) => {
  // https://stackoverflow.com/a/41665515/653173
  const rgb2hex = (rgb) => {
    return '#' +
            rgb.substr(4, rgb.indexOf(')') - 4)
               .split(',')
               .map((color) => String('0' + parseInt(color).toString(16)).slice(-2))
               .join('');
  }
  const theme = d.querySelector('.theme')
  for(child of theme.children) {
    const bgColor = window.getComputedStyle(child,null).getPropertyValue('background-color')
    const span = child.querySelector('span')
    span.innerHTML = `${rgb2hex(bgColor)}<br>${bgColor}<br>${span.innerHTML}`
  }
})(window, document)
</script>
