'use strict';
// dynamically inject color information
(() => {
  const themeFn = () => {
    // https://stackoverflow.com/a/41665515/653173
    const rgb2hex = (rgb) => {
      return '#' +
        rgb.substr(4, rgb.indexOf(')') - 4)
          .split(',')
          .map((color) => String('0' + parseInt(color).toString(16)).slice(-2))
          .join('');
    };
    const colorTiles = document.querySelectorAll('.theme>div');
    colorTiles.forEach((child) => {
      const bgColor = window.getComputedStyle(child, null).getPropertyValue('background-color');
      const span = child.querySelector('span');
      span.innerHTML = `${rgb2hex(bgColor)}<br>${bgColor}<br>${span.innerHTML}`;
    });
  };

  setTimeout(themeFn, 0);
})();
