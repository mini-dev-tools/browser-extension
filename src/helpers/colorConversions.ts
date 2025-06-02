export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

export class ColorConverter {
  static hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  static rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  static rgbToHsl(r: number, g: number, b: number): HSL {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  static rgbToHsv(r: number, g: number, b: number): HSV {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  }

  static hexToAllFormats(hex: string) {
    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);

    return {
      hex: hex.toUpperCase(),
      rgb: rgb,
      hsl: hsl,
      hsv: hsv,
      // Formatted strings
      hexString: hex.toUpperCase(),
      rgbString: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      rgbaString: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
      hslString: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hslaString: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`,
      hsvString: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
      // CSS custom property
      cssVar: `--color: ${hex.toLowerCase()};`,
      // Tailwind class (approximate)
      tailwindRgb: `rgb(${rgb.r} ${rgb.g} ${rgb.b})`,
      // Individual values
      rgbValues: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
      hslValues: `${hsl.h}, ${hsl.s}%, ${hsl.l}%`,
      hsvValues: `${hsv.h}, ${hsv.s}%, ${hsv.v}%`
    };
  }

  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy: ', err);
      return false;
    }
  }
}