/**
 * Color Store Type Definitions
 * Centralized type definitions for the color management system
 */

export interface PaletteColor {
  id: string;
  name: string;
  hex: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  description?: string;
  colors: PaletteColor[];
  createdAt: string;
  updatedAt: string;
  version: string;
  tags?: string[];
}

export interface ColorHistory {
  id: string;
  hex: string;
  timestamp: number;
  source?: ColorSource;
  sourceName?: string;
  context?: string;
}

export type ColorSource = 
  | 'picker' 
  | 'palette' 
  | 'generator' 
  | 'shades' 
  | 'material' 
  | 'eye_drop' 
  | 'contrast' 
  | 'import' 
  | 'manual';

export interface GradientStop {
  color: string;
  position: number;
}

export interface UndoData {
  hex: string;
  wasUpdate: boolean;
  previousPosition: number;
}

export interface ColorConversions {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  hsv: HSV;
}

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

export interface PaletteFilters {
  search?: string;
  tags?: string[];
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ColorState {
  palettes: ColorPalette[];
  colorHistory: ColorHistory[];
  selectedPaletteId: string | null;
}

export interface ColorActions {
  // Palette CRUD
  createPalette(name: string, colors: Omit<PaletteColor, 'id'>[], description?: string, tags?: string[]): ColorPalette;
  updatePalette(id: string, updates: Partial<Omit<ColorPalette, 'id' | 'createdAt'>>): ColorPalette | null;
  deletePalette(id: string): boolean;
  duplicatePalette(id: string): ColorPalette | null;
  
  // Color operations
  addColorToPalette(paletteId: string, color: Omit<PaletteColor, 'id'>): PaletteColor | null;
  updateColorInPalette(paletteId: string, colorId: string, updates: Partial<Omit<PaletteColor, 'id'>>): PaletteColor | null;
  removeColorFromPalette(paletteId: string, colorId: string): boolean;
  
  // History management
  addToHistory(hex: string, source?: ColorSource, sourceName?: string, context?: string): void;
  clearHistory(): void;
  removeFromHistory(id: string): boolean;
  
  // Utility functions
  selectPalette(id: string | null): void;
  exportPalette(id: string): string | null;
  importPalette(paletteData: string): ColorPalette | null;
  searchPalettes(query: string): ColorPalette[];
}

export interface ColorGetters {
  getPaletteById: (id: string) => ColorPalette | undefined;
  getSelectedPalette: ColorPalette | null;
  getPalettesByTag: (tag: string) => ColorPalette[];
  getRecentColors: (limit?: number) => ColorHistory[];
  getAllUniqueTags: string[];
  getPaletteAsGradientStops: (id: string) => GradientStop[];
}

/**
 * Color variation for weight-based color systems
 */
export interface ColorVariation {
  weight: number;
  hex: string;
}

/**
 * Color family containing multiple weight variations
 */
export interface ColorFamily {
  color: string;
  variations: ColorVariation[];
}