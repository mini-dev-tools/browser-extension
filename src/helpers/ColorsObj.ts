interface rgbOBJ {
  red: number;
  green: number;
  blue: number;
}

export class Color {
  private _hex: string = '#ffffff';
  private _opacity: string = '';
  private _r: number = 0;
  private _g: number = 0;
  private _b: number = 0;

  setFormRGB(r: any, g: any, b: any) {
    let color = validateRGB(r, g, b);
    if (color) {
      this._r = color.red;
      this._g = color.green;
      this._b = color.blue;
      this._hex = rgbObjToHex(color);
    }
  }
}

// hsl number between 0 & 100
function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0'); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function validateRGB(r: any, g: any, b: any): rgbOBJ | null {
  if (typeof r === 'string' || r instanceof String) {
    r = r.replace(/\D/g, '');
  }
  if (typeof g === 'string' || g instanceof String) {
    g = g.replace(/\D/g, '');
  }
  if (typeof b === 'string' || b instanceof String) {
    b = b.replace(/\D/g, '');
  }

  let nr = Math.floor(r);
  let ng = Math.floor(g);
  let nb = Math.floor(b);
  let prob = 0;
  if (nr < 0 || nr > 255) {
    prob++;
  }
  if (ng < 0 || ng > 255) {
    prob++;
  }
  if (nb < 0 || nb > 255) {
    prob++;
  }
  return prob == 0
    ? {
        red: nr,
        green: ng,
        blue: nb
      }
    : null;
}

function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function rgbObjToHex(color: rgbOBJ) {
  return (
    '#' +
    componentToHex(color.red) +
    componentToHex(color.green) +
    componentToHex(color.blue)
  );
}

function rgbToHex2(r: number, g: number, b: number) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToRgb(hex: string) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

const htmlColors = [
  {
    name: 'AliceBlue',
    hex: '#F0F8FF',
    lowerName: 'aliceblue',
    upperName: 'ALICEBLUE'
  },
  {
    name: 'AntiqueWhite',
    hex: '#FAEBD7',
    lowerName: 'antiquewhite',
    upperName: 'ANTIQUEWHITE'
  },
  {
    name: 'Aqua',
    hex: '#00FFFF',
    lowerName: 'aqua',
    upperName: 'AQUA'
  },
  {
    name: 'Aquamarine',
    hex: '#7FFFD4',
    lowerName: 'aquamarine',
    upperName: 'AQUAMARINE'
  },
  {
    name: 'Azure',
    hex: '#F0FFFF',
    lowerName: 'azure',
    upperName: 'AZURE'
  },
  {
    name: 'Beige',
    hex: '#F5F5DC',
    lowerName: 'beige',
    upperName: 'BEIGE'
  },
  {
    name: 'Bisque',
    hex: '#FFE4C4',
    lowerName: 'bisque',
    upperName: 'BISQUE'
  },
  {
    name: 'Black',
    hex: '#000000',
    lowerName: 'black',
    upperName: 'BLACK'
  },
  {
    name: 'BlanchedAlmond',
    hex: '#FFEBCD',
    lowerName: 'blanchedalmond',
    upperName: 'BLANCHEDALMOND'
  },
  {
    name: 'Blue',
    hex: '#0000FF',
    lowerName: 'blue',
    upperName: 'BLUE'
  },
  {
    name: 'BlueViolet',
    hex: '#8A2BE2',
    lowerName: 'blueviolet',
    upperName: 'BLUEVIOLET'
  },
  {
    name: 'Brown',
    hex: '#A52A2A',
    lowerName: 'brown',
    upperName: 'BROWN'
  },
  {
    name: 'BurlyWood',
    hex: '#DEB887',
    lowerName: 'burlywood',
    upperName: 'BURLYWOOD'
  },
  {
    name: 'CadetBlue',
    hex: '#5F9EA0',
    lowerName: 'cadetblue',
    upperName: 'CADETBLUE'
  },
  {
    name: 'Chartreuse',
    hex: '#7FFF00',
    lowerName: 'chartreuse',
    upperName: 'CHARTREUSE'
  },
  {
    name: 'Chocolate',
    hex: '#D2691E',
    lowerName: 'chocolate',
    upperName: 'CHOCOLATE'
  },
  {
    name: 'Coral',
    hex: '#FF7F50',
    lowerName: 'coral',
    upperName: 'CORAL'
  },
  {
    name: 'CornflowerBlue',
    hex: '#6495ED',
    lowerName: 'cornflowerblue',
    upperName: 'CORNFLOWERBLUE'
  },
  {
    name: 'Cornsilk',
    hex: '#FFF8DC',
    lowerName: 'cornsilk',
    upperName: 'CORNSILK'
  },
  {
    name: 'Crimson',
    hex: '#DC143C',
    lowerName: 'crimson',
    upperName: 'CRIMSON'
  },
  {
    name: 'Cyan',
    hex: '#00FFFF',
    lowerName: 'cyan',
    upperName: 'CYAN'
  },
  {
    name: 'DarkBlue',
    hex: '#00008B',
    lowerName: 'darkblue',
    upperName: 'DARKBLUE'
  },
  {
    name: 'DarkCyan',
    hex: '#008B8B',
    lowerName: 'darkcyan',
    upperName: 'DARKCYAN'
  },
  {
    name: 'DarkGoldenRod',
    hex: '#B8860B',
    lowerName: 'darkgoldenrod',
    upperName: 'DARKGOLDENROD'
  },
  {
    name: 'DarkGrey',
    hex: '#A9A9A9',
    lowerName: 'darkgrey',
    upperName: 'DARKGREY'
  },
  {
    name: 'DarkGreen',
    hex: '#006400',
    lowerName: 'darkgreen',
    upperName: 'DARKGREEN'
  },
  {
    name: 'DarkKhaki',
    hex: '#BDB76B',
    lowerName: 'darkkhaki',
    upperName: 'DARKKHAKI'
  },
  {
    name: 'DarkMagenta',
    hex: '#8B008B',
    lowerName: 'darkmagenta',
    upperName: 'DARKMAGENTA'
  },
  {
    name: 'DarkOliveGreen',
    hex: '#556B2F',
    lowerName: 'darkolivegreen',
    upperName: 'DARKOLIVEGREEN'
  },
  {
    name: 'Darkorange',
    hex: '#FF8C00',
    lowerName: 'darkorange',
    upperName: 'DARKORANGE'
  },
  {
    name: 'DarkOrchid',
    hex: '#9932CC',
    lowerName: 'darkorchid',
    upperName: 'DARKORCHID'
  },
  {
    name: 'DarkRed',
    hex: '#8B0000',
    lowerName: 'darkred',
    upperName: 'DARKRED'
  },
  {
    name: 'DarkSalmon',
    hex: '#E9967A',
    lowerName: 'darksalmon',
    upperName: 'DARKSALMON'
  },
  {
    name: 'DarkSeaGreen',
    hex: '#8FBC8F',
    lowerName: 'darkseagreen',
    upperName: 'DARKSEAGREEN'
  },
  {
    name: 'DarkSlateBlue',
    hex: '#483D8B',
    lowerName: 'darkslateblue',
    upperName: 'DARKSLATEBLUE'
  },
  {
    name: 'DarkSlateGrey',
    hex: '#2F4F4F',
    lowerName: 'darkslategrey',
    upperName: 'DARKSLATEGREY'
  },
  {
    name: 'DarkTurquoise',
    hex: '#00CED1',
    lowerName: 'darkturquoise',
    upperName: 'DARKTURQUOISE'
  },
  {
    name: 'DarkViolet',
    hex: '#9400D3',
    lowerName: 'darkviolet',
    upperName: 'DARKVIOLET'
  },
  {
    name: 'DeepPink',
    hex: '#FF1493',
    lowerName: 'deeppink',
    upperName: 'DEEPPINK'
  },
  {
    name: 'DeepSkyBlue',
    hex: '#00BFFF',
    lowerName: 'deepskyblue',
    upperName: 'DEEPSKYBLUE'
  },
  {
    name: 'DimGray',
    hex: '#696969',
    lowerName: 'dimgray',
    upperName: 'DIMGRAY'
  },
  {
    name: 'DodgerBlue',
    hex: '#1E90FF',
    lowerName: 'dodgerblue',
    upperName: 'DODGERBLUE'
  },
  {
    name: 'FireBrick',
    hex: '#B22222',
    lowerName: 'firebrick',
    upperName: 'FIREBRICK'
  },
  {
    name: 'FloralWhite',
    hex: '#FFFAF0',
    lowerName: 'floralwhite',
    upperName: 'FLORALWHITE'
  },
  {
    name: 'ForestGreen',
    hex: '#228B22',
    lowerName: 'forestgreen',
    upperName: 'FORESTGREEN'
  },
  {
    name: 'Fuchsia',
    hex: '#FF00FF',
    lowerName: 'fuchsia',
    upperName: 'FUCHSIA'
  },
  {
    name: 'Gainsboro',
    hex: '#DCDCDC',
    lowerName: 'gainsboro',
    upperName: 'GAINSBORO'
  },
  {
    name: 'GhostWhite',
    hex: '#F8F8FF',
    lowerName: 'ghostwhite',
    upperName: 'GHOSTWHITE'
  },
  {
    name: 'Gold',
    hex: '#FFD700',
    lowerName: 'gold',
    upperName: 'GOLD'
  },
  {
    name: 'GoldenRod',
    hex: '#DAA520',
    lowerName: 'goldenrod',
    upperName: 'GOLDENROD'
  },
  {
    name: 'Grey',
    hex: '#808080',
    lowerName: 'grey',
    upperName: 'GREY'
  },
  {
    name: 'Green',
    hex: '#008000',
    lowerName: 'green',
    upperName: 'GREEN'
  },
  {
    name: 'GreenYellow',
    hex: '#ADFF2F',
    lowerName: 'greenyellow',
    upperName: 'GREENYELLOW'
  },
  {
    name: 'HoneyDew',
    hex: '#F0FFF0',
    lowerName: 'honeydew',
    upperName: 'HONEYDEW'
  },
  {
    name: 'HotPink',
    hex: '#FF69B4',
    lowerName: 'hotpink',
    upperName: 'HOTPINK'
  },
  {
    name: 'IndianRed',
    hex: '#CD5C5C',
    lowerName: 'indianred',
    upperName: 'INDIANRED'
  },
  {
    name: 'Indigo',
    hex: '#4B0082',
    lowerName: 'indigo',
    upperName: 'INDIGO'
  },
  {
    name: 'Ivory',
    hex: '#FFFFF0',
    lowerName: 'ivory',
    upperName: 'IVORY'
  },
  {
    name: 'Khaki',
    hex: '#F0E68C',
    lowerName: 'khaki',
    upperName: 'KHAKI'
  },
  {
    name: 'Lavender',
    hex: '#E6E6FA',
    lowerName: 'lavender',
    upperName: 'LAVENDER'
  },
  {
    name: 'LavenderBlush',
    hex: '#FFF0F5',
    lowerName: 'lavenderblush',
    upperName: 'LAVENDERBLUSH'
  },
  {
    name: 'LawnGreen',
    hex: '#7CFC00',
    lowerName: 'lawngreen',
    upperName: 'LAWNGREEN'
  },
  {
    name: 'LemonChiffon',
    hex: '#FFFACD',
    lowerName: 'lemonchiffon',
    upperName: 'LEMONCHIFFON'
  },
  {
    name: 'LightBlue',
    hex: '#ADD8E6',
    lowerName: 'lightblue',
    upperName: 'LIGHTBLUE'
  },
  {
    name: 'LightCoral',
    hex: '#F08080',
    lowerName: 'lightcoral',
    upperName: 'LIGHTCORAL'
  },
  {
    name: 'LightCyan',
    hex: '#E0FFFF',
    lowerName: 'lightcyan',
    upperName: 'LIGHTCYAN'
  },
  {
    name: 'LightGoldenRodYellow',
    hex: '#FAFAD2',
    lowerName: 'lightgoldenrodyellow',
    upperName: 'LIGHTGOLDENRODYELLOW'
  },
  {
    name: 'LightGrey',
    hex: '#D3D3D3',
    lowerName: 'lightgrey',
    upperName: 'LIGHTGREY'
  },
  {
    name: 'LightGreen',
    hex: '#90EE90',
    lowerName: 'lightgreen',
    upperName: 'LIGHTGREEN'
  },
  {
    name: 'LightPink',
    hex: '#FFB6C1',
    lowerName: 'lightpink',
    upperName: 'LIGHTPINK'
  },
  {
    name: 'LightSalmon',
    hex: '#FFA07A',
    lowerName: 'lightsalmon',
    upperName: 'LIGHTSALMON'
  },
  {
    name: 'LightSeaGreen',
    hex: '#20B2AA',
    lowerName: 'lightseagreen',
    upperName: 'LIGHTSEAGREEN'
  },
  {
    name: 'LightSkyBlue',
    hex: '#87CEFA',
    lowerName: 'lightskyblue',
    upperName: 'LIGHTSKYBLUE'
  },
  {
    name: 'LightSlateGrey',
    hex: '#778899',
    lowerName: 'lightslategrey',
    upperName: 'LIGHTSLATEGREY'
  },
  {
    name: 'LightSteelBlue',
    hex: '#B0C4DE',
    lowerName: 'lightsteelblue',
    upperName: 'LIGHTSTEELBLUE'
  },
  {
    name: 'LightYellow',
    hex: '#FFFFE0',
    lowerName: 'lightyellow',
    upperName: 'LIGHTYELLOW'
  },
  {
    name: 'Lime',
    hex: '#00FF00',
    lowerName: 'lime',
    upperName: 'LIME'
  },
  {
    name: 'LimeGreen',
    hex: '#32CD32',
    lowerName: 'limegreen',
    upperName: 'LIMEGREEN'
  },
  {
    name: 'Linen',
    hex: '#FAF0E6',
    lowerName: 'linen',
    upperName: 'LINEN'
  },
  {
    name: 'Magenta',
    hex: '#FF00FF',
    lowerName: 'magenta',
    upperName: 'MAGENTA'
  },
  {
    name: 'Maroon',
    hex: '#800000',
    lowerName: 'maroon',
    upperName: 'MAROON'
  },
  {
    name: 'MediumAquaMarine',
    hex: '#66CDAA',
    lowerName: 'mediumaquamarine',
    upperName: 'MEDIUMAQUAMARINE'
  },
  {
    name: 'MediumBlue',
    hex: '#0000CD',
    lowerName: 'mediumblue',
    upperName: 'MEDIUMBLUE'
  },
  {
    name: 'MediumOrchid',
    hex: '#BA55D3',
    lowerName: 'mediumorchid',
    upperName: 'MEDIUMORCHID'
  },
  {
    name: 'MediumPurple',
    hex: '#9370D8',
    lowerName: 'mediumpurple',
    upperName: 'MEDIUMPURPLE'
  },
  {
    name: 'MediumSeaGreen',
    hex: '#3CB371',
    lowerName: 'mediumseagreen',
    upperName: 'MEDIUMSEAGREEN'
  },
  {
    name: 'MediumSlateBlue',
    hex: '#7B68EE',
    lowerName: 'mediumslateblue',
    upperName: 'MEDIUMSLATEBLUE'
  },
  {
    name: 'MediumSpringGreen',
    hex: '#00FA9A',
    lowerName: 'mediumspringgreen',
    upperName: 'MEDIUMSPRINGGREEN'
  },
  {
    name: 'MediumTurquoise',
    hex: '#48D1CC',
    lowerName: 'mediumturquoise',
    upperName: 'MEDIUMTURQUOISE'
  },
  {
    name: 'MediumVioletRed',
    hex: '#C71585',
    lowerName: 'mediumvioletred',
    upperName: 'MEDIUMVIOLETRED'
  },
  {
    name: 'MidnightBlue',
    hex: '#191970',
    lowerName: 'midnightblue',
    upperName: 'MIDNIGHTBLUE'
  },
  {
    name: 'MintCream',
    hex: '#F5FFFA',
    lowerName: 'mintcream',
    upperName: 'MINTCREAM'
  },
  {
    name: 'MistyRose',
    hex: '#FFE4E1',
    lowerName: 'mistyrose',
    upperName: 'MISTYROSE'
  },
  {
    name: 'Moccasin',
    hex: '#FFE4B5',
    lowerName: 'moccasin',
    upperName: 'MOCCASIN'
  },
  {
    name: 'NavajoWhite',
    hex: '#FFDEAD',
    lowerName: 'navajowhite',
    upperName: 'NAVAJOWHITE'
  },
  {
    name: 'Navy',
    hex: '#000080',
    lowerName: 'navy',
    upperName: 'NAVY'
  },
  {
    name: 'OldLace',
    hex: '#FDF5E6',
    lowerName: 'oldlace',
    upperName: 'OLDLACE'
  },
  {
    name: 'Olive',
    hex: '#808000',
    lowerName: 'olive',
    upperName: 'OLIVE'
  },
  {
    name: 'OliveDrab',
    hex: '#6B8E23',
    lowerName: 'olivedrab',
    upperName: 'OLIVEDRAB'
  },
  {
    name: 'Orange',
    hex: '#FFA500',
    lowerName: 'orange',
    upperName: 'ORANGE'
  },
  {
    name: 'OrangeRed',
    hex: '#FF4500',
    lowerName: 'orangered',
    upperName: 'ORANGERED'
  },
  {
    name: 'Orchid',
    hex: '#DA70D6',
    lowerName: 'orchid',
    upperName: 'ORCHID'
  },
  {
    name: 'PaleGoldenRod',
    hex: '#EEE8AA',
    lowerName: 'palegoldenrod',
    upperName: 'PALEGOLDENROD'
  },
  {
    name: 'PaleGreen',
    hex: '#98FB98',
    lowerName: 'palegreen',
    upperName: 'PALEGREEN'
  },
  {
    name: 'PaleTurquoise',
    hex: '#AFEEEE',
    lowerName: 'paleturquoise',
    upperName: 'PALETURQUOISE'
  },
  {
    name: 'PaleVioletRed',
    hex: '#D87093',
    lowerName: 'palevioletred',
    upperName: 'PALEVIOLETRED'
  },
  {
    name: 'PapayaWhip',
    hex: '#FFEFD5',
    lowerName: 'papayawhip',
    upperName: 'PAPAYAWHIP'
  },
  {
    name: 'PeachPuff',
    hex: '#FFDAB9',
    lowerName: 'peachpuff',
    upperName: 'PEACHPUFF'
  },
  {
    name: 'Peru',
    hex: '#CD853F',
    lowerName: 'peru',
    upperName: 'PERU'
  },
  {
    name: 'Pink',
    hex: '#FFC0CB',
    lowerName: 'pink',
    upperName: 'PINK'
  },
  {
    name: 'Plum',
    hex: '#DDA0DD',
    lowerName: 'plum',
    upperName: 'PLUM'
  },
  {
    name: 'PowderBlue',
    hex: '#B0E0E6',
    lowerName: 'powderblue',
    upperName: 'POWDERBLUE'
  },
  {
    name: 'Purple',
    hex: '#800080',
    lowerName: 'purple',
    upperName: 'PURPLE'
  },
  {
    name: 'Red',
    hex: '#FF0000',
    lowerName: 'red',
    upperName: 'RED'
  },
  {
    name: 'RosyBrown',
    hex: '#BC8F8F',
    lowerName: 'rosybrown',
    upperName: 'ROSYBROWN'
  },
  {
    name: 'RoyalBlue',
    hex: '#4169E1',
    lowerName: 'royalblue',
    upperName: 'ROYALBLUE'
  },
  {
    name: 'SaddleBrown',
    hex: '#8B4513',
    lowerName: 'saddlebrown',
    upperName: 'SADDLEBROWN'
  },
  {
    name: 'Salmon',
    hex: '#FA8072',
    lowerName: 'salmon',
    upperName: 'SALMON'
  },
  {
    name: 'SandyBrown',
    hex: '#F4A460',
    lowerName: 'sandybrown',
    upperName: 'SANDYBROWN'
  },
  {
    name: 'SeaGreen',
    hex: '#2E8B57',
    lowerName: 'seagreen',
    upperName: 'SEAGREEN'
  },
  {
    name: 'SeaShell',
    hex: '#FFF5EE',
    lowerName: 'seashell',
    upperName: 'SEASHELL'
  },
  {
    name: 'Sienna',
    hex: '#A0522D',
    lowerName: 'sienna',
    upperName: 'SIENNA'
  },
  {
    name: 'Silver',
    hex: '#C0C0C0',
    lowerName: 'silver',
    upperName: 'SILVER'
  },
  {
    name: 'SkyBlue',
    hex: '#87CEEB',
    lowerName: 'skyblue',
    upperName: 'SKYBLUE'
  },
  {
    name: 'SlateBlue',
    hex: '#6A5ACD',
    lowerName: 'slateblue',
    upperName: 'SLATEBLUE'
  },
  {
    name: 'SlateGrey',
    hex: '#708090',
    lowerName: 'slategrey',
    upperName: 'SLATEGREY'
  },
  {
    name: 'Snow',
    hex: '#FFFAFA',
    lowerName: 'snow',
    upperName: 'SNOW'
  },
  {
    name: 'SpringGreen',
    hex: '#00FF7F',
    lowerName: 'springgreen',
    upperName: 'SPRINGGREEN'
  },
  {
    name: 'SteelBlue',
    hex: '#4682B4',
    lowerName: 'steelblue',
    upperName: 'STEELBLUE'
  },
  {
    name: 'Tan',
    hex: '#D2B48C',
    lowerName: 'tan',
    upperName: 'TAN'
  },
  {
    name: 'Teal',
    hex: '#008080',
    lowerName: 'teal',
    upperName: 'TEAL'
  },
  {
    name: 'Thistle',
    hex: '#D8BFD8',
    lowerName: 'thistle',
    upperName: 'THISTLE'
  },
  {
    name: 'Tomato',
    hex: '#FF6347',
    lowerName: 'tomato',
    upperName: 'TOMATO'
  },
  {
    name: 'Turquoise',
    hex: '#40E0D0',
    lowerName: 'turquoise',
    upperName: 'TURQUOISE'
  },
  {
    name: 'Violet',
    hex: '#EE82EE',
    lowerName: 'violet',
    upperName: 'VIOLET'
  },
  {
    name: 'Wheat',
    hex: '#F5DEB3',
    lowerName: 'wheat',
    upperName: 'WHEAT'
  },
  {
    name: 'White',
    hex: '#FFFFFF',
    lowerName: 'white',
    upperName: 'WHITE'
  },
  {
    name: 'WhiteSmoke',
    hex: '#F5F5F5',
    lowerName: 'whitesmoke',
    upperName: 'WHITESMOKE'
  },
  {
    name: 'Yellow',
    hex: '#FFFF00',
    lowerName: 'yellow',
    upperName: 'YELLOW'
  },
  {
    name: 'YellowGreen',
    hex: '#9ACD32',
    lowerName: 'yellowgreen',
    upperName: 'YELLOWGREEN'
  }
];
