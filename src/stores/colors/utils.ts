/**
 * Color Store Utilities
 * Pure functions for color operations, conversions, and calculations
 */

import type { RGB, HSL, HSV, ColorPalette, GradientStop, PaletteColor, ColorHistory } from './types';

/**
 * Color Conversion Utilities
 */
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

  static hexToHsl(hex: string): HSL {
    const rgb = this.hexToRgb(hex);
    return this.rgbToHsl(rgb.r, rgb.g, rgb.b);
  }

  static hslToHex(h: number, s: number, l: number): string {
    const rgb = this.hslToRgb(h, s, l);
    return this.rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  static hexToHsv(hex: string): HSV {
    const rgb = this.hexToRgb(hex);
    return this.rgbToHsv(rgb.r, rgb.g, rgb.b);
  }

  static hsvToHex(h: number, s: number, v: number): string {
    const rgb = this.hsvToRgb(h, s, v);
    return this.rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  static rgbToHsl(r: number, g: number, b: number): HSL {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number, l: number;
    
    l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  static hslToRgb(h: number, s: number, l: number): RGB {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r: number, g: number, b: number;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  static rgbToHsv(r: number, g: number, b: number): HSV {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number, v: number;
    
    v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    
    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  }

  static hsvToRgb(h: number, s: number, v: number): RGB {
    h /= 360;
    s /= 100;
    v /= 100;
    
    const c = v * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = v - c;
    
    let r: number, g: number, b: number;
    
    if (h < 1/6) {
      [r, g, b] = [c, x, 0];
    } else if (h < 2/6) {
      [r, g, b] = [x, c, 0];
    } else if (h < 3/6) {
      [r, g, b] = [0, c, x];
    } else if (h < 4/6) {
      [r, g, b] = [0, x, c];
    } else if (h < 5/6) {
      [r, g, b] = [x, 0, c];
    } else {
      [r, g, b] = [c, 0, x];
    }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }
}

/**
 * Color Validation Utilities
 */
export const isValidHexColor = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
};

export const normalizeHexColor = (hex: string): string => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert 3-digit to 6-digit
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  // Add # prefix and convert to uppercase
  return '#' + hex.toUpperCase();
};

/**
 * Palette Utilities
 */
export const generateRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const generateRandomPalette = (count: number = 5): Omit<PaletteColor, 'id'>[] => {
  return Array.from({ length: count }, (_, index) => ({
    name: `Color ${index + 1}`,
    hex: generateRandomColor()
  }));
};

export const paletteToGradientStops = (palette: ColorPalette): GradientStop[] => {
  if (!palette || palette.colors.length === 0) return [];
  
  return palette.colors.map((color, index) => ({
    color: color.hex,
    position: Math.round((index / (palette.colors.length - 1)) * 100)
  }));
};

export const generateCssFromPalette = (palette: ColorPalette): string => {
  const cssVars = palette.colors.map((color, index) => 
    `  --color-${color.name.toLowerCase().replace(/\s+/g, '-')}: ${color.hex};`
  ).join('\n');
  
  const linearGradient = palette.colors.map(color => color.hex).join(', ');
  
  return `:root {
${cssVars}
  
  /* Gradient using all colors */
  --gradient-${palette.name.toLowerCase().replace(/\s+/g, '-')}: linear-gradient(45deg, ${linearGradient});
}`;
};

/**
 * Color Analysis Utilities
 */
export const calculateLuminance = (hex: string): number => {
  const rgb = ColorConverter.hexToRgb(hex);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const calculateContrastRatio = (color1: string, color2: string): number => {
  const l1 = calculateLuminance(color1);
  const l2 = calculateLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

export const isColorLight = (hex: string): boolean => {
  return calculateLuminance(hex) > 0.5;
};

export const getTextColorForBackground = (backgroundColor: string): string => {
  return isColorLight(backgroundColor) ? '#000000' : '#FFFFFF';
};

/**
 * Search and Filter Utilities
 */
export const searchPalettes = (palettes: ColorPalette[], query: string): ColorPalette[] => {
  if (!query.trim()) return palettes;
  
  const lowerQuery = query.toLowerCase();
  return palettes.filter(palette =>
    palette.name.toLowerCase().includes(lowerQuery) ||
    palette.description?.toLowerCase().includes(lowerQuery) ||
    palette.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    palette.colors.some(color => 
      color.name.toLowerCase().includes(lowerQuery) ||
      color.hex.toLowerCase().includes(lowerQuery)
    )
  );
};

export const filterPalettesByTags = (palettes: ColorPalette[], tags: string[]): ColorPalette[] => {
  if (!tags.length) return palettes;
  
  return palettes.filter(palette =>
    tags.some(tag => palette.tags?.includes(tag))
  );
};

export const sortPalettes = (
  palettes: ColorPalette[], 
  sortBy: 'name' | 'createdAt' | 'updatedAt' = 'name',
  sortOrder: 'asc' | 'desc' = 'asc'
): ColorPalette[] => {
  return [...palettes].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

/**
 * Color History Utilities
 */
export const formatColorHistory = (history: ColorHistory[]): ColorHistory[] => {
  return history.sort((a, b) => b.timestamp - a.timestamp);
};

export const deduplicateColorHistory = (history: ColorHistory[]): ColorHistory[] => {
  const seen = new Set<string>();
  return history.filter(item => {
    if (seen.has(item.hex.toLowerCase())) {
      return false;
    }
    seen.add(item.hex.toLowerCase());
    return true;
  });
};