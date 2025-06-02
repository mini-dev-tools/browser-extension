interface String {
  /**
   * Gets a substring beginning at the specified location and having the specified length.
   * (deprecation removed)
   * @param from The starting position of the desired substring. The index of the first character in the string is zero.
   * @param length The number of characters to include in the returned substring.
   */
  substr(from: number, length?: number): string;
}

export function getColorShades(hex: string, NumberOfShades: number) {
  let shades = [];
  let delta = 1.8 / NumberOfShades;
  let lum = -0.9;
  for (let i = 0; i < NumberOfShades; i++) {
    if (lum < 0.1) shades.push(increase_darkness(hex, lum));
    else shades.push(increase_brightness(hex, lum));
    lum += delta;
  }
  return shades;
}

export function getLuma(hex: string) {
  hex = hexFilter(hex);
  let rgb = parseInt(hex, 16); // convert rrggbb to decimal
  let r = (rgb >> 16) & 0xff; // extract red
  let g = (rgb >> 8) & 0xff; // extract green
  let b = (rgb >> 0) & 0xff; // extract blue

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function increase_darkness(hex: any, lum: any) {
  hex = hexFilter(hex);

  lum = lum || 0;

  // convert to decimal and change luminosity
  let rgb = '#',
    c,
    i;
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
    rgb += ('00' + c).substr(c.length);
  }
  return rgb;
}

function increase_brightness(hex: any, lum: any) {
  // strip the leading # if it's there
  hex = hex.replace(/^\s*#|\s*$/g, '');

  // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
  if (hex.length == 3) {
    hex = hex.replace(/(.)/g, '$1$1');
  }

  let r = parseInt(hex.substr(0, 2), 16),
    g = parseInt(hex.substr(2, 2), 16),
    b = parseInt(hex.substr(4, 2), 16);
  return (
    '#' +
    pad((0 | ((1 << 8) + r + (256 - r) * lum)).toString(16).substr(1)) +
    pad((0 | ((1 << 8) + g + (256 - g) * lum)).toString(16).substr(1)) +
    pad((0 | ((1 << 8) + b + (256 - b) * lum)).toString(16).substr(1))
  );
}

function pad(n: any) {
  return n < 10 ? '0' + n : n;
}

function hexFilter(hex: string) {
  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '');
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  return hex;
}
