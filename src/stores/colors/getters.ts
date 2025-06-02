/**
 * Color Store Getters
 * Computed values, selectors, and derived state
 */

import type { ColorState, ColorPalette, ColorHistory, GradientStop } from './types';
import { searchPalettes, filterPalettesByTags, sortPalettes, paletteToGradientStops } from './utils';

/**
 * Palette Getters
 */
export const getPaletteById = (state: ColorState) => (id: string): ColorPalette | undefined => {
  return state.palettes.find(palette => palette.id === id);
};

export const getSelectedPalette = (state: ColorState): ColorPalette | null => {
  if (!state.selectedPaletteId) return null;
  return state.palettes.find(palette => palette.id === state.selectedPaletteId) || null;
};

export const getPalettesByTag = (state: ColorState) => (tag: string): ColorPalette[] => {
  return state.palettes.filter(palette => 
    palette.tags?.includes(tag)
  );
};

export const getPalettesByTags = (state: ColorState) => (tags: string[]): ColorPalette[] => {
  return filterPalettesByTags(state.palettes, tags);
};

export const searchPalettesGetter = (state: ColorState) => (query: string): ColorPalette[] => {
  return searchPalettes(state.palettes, query);
};

export const getSortedPalettes = (state: ColorState) => (
  sortBy: 'name' | 'createdAt' | 'updatedAt' = 'name',
  sortOrder: 'asc' | 'desc' = 'asc'
): ColorPalette[] => {
  return sortPalettes(state.palettes, sortBy, sortOrder);
};

/**
 * Tag Getters
 */
export const getAllUniqueTags = (state: ColorState): string[] => {
  const allTags = state.palettes.flatMap(palette => palette.tags || []);
  return [...new Set(allTags)].sort();
};

export const getTagCounts = (state: ColorState): Record<string, number> => {
  const tagCounts: Record<string, number> = {};
  
  state.palettes.forEach(palette => {
    palette.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return tagCounts;
};

export const getPopularTags = (state: ColorState, limit: number = 10): string[] => {
  const tagCounts = getTagCounts(state);
  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([tag]) => tag);
};

/**
 * Color History Getters
 */
export const getRecentColors = (state: ColorState) => (limit: number = 10): ColorHistory[] => {
  return state.colorHistory
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

export const getColorHistoryBySource = (state: ColorState) => (source: string): ColorHistory[] => {
  return state.colorHistory.filter(item => item.source === source);
};

export const getUniqueColorsFromHistory = (state: ColorState): ColorHistory[] => {
  const seen = new Set<string>();
  return state.colorHistory.filter(item => {
    const hexLower = item.hex.toLowerCase();
    if (seen.has(hexLower)) {
      return false;
    }
    seen.add(hexLower);
    return true;
  });
};

/**
 * Statistics Getters
 */
export const getPaletteCount = (state: ColorState): number => {
  return state.palettes.length;
};

export const getTotalColorCount = (state: ColorState): number => {
  return state.palettes.reduce((total, palette) => total + palette.colors.length, 0);
};

export const getAverageColorsPerPalette = (state: ColorState): number => {
  if (state.palettes.length === 0) return 0;
  return getTotalColorCount(state) / state.palettes.length;
};

export const getHistoryCount = (state: ColorState): number => {
  return state.colorHistory.length;
};

export const getPalettesByColorCount = (state: ColorState): Record<string, ColorPalette[]> => {
  const grouped: Record<string, ColorPalette[]> = {
    small: [],     // 1-5 colors
    medium: [],    // 6-15 colors
    large: []      // 16+ colors
  };
  
  state.palettes.forEach(palette => {
    const colorCount = palette.colors.length;
    if (colorCount <= 5) {
      grouped.small.push(palette);
    } else if (colorCount <= 15) {
      grouped.medium.push(palette);
    } else {
      grouped.large.push(palette);
    }
  });
  
  return grouped;
};

/**
 * Utility Getters
 */
export const getPaletteAsGradientStops = (state: ColorState) => (id: string): GradientStop[] => {
  const palette = getPaletteById(state)(id);
  if (!palette) return [];
  
  return paletteToGradientStops(palette);
};

export const getPaletteAsLinearGradient = (state: ColorState) => (id: string): string => {
  const stops = getPaletteAsGradientStops(state)(id);
  if (stops.length === 0) return '';
  
  const gradientStops = stops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
  return `linear-gradient(45deg, ${gradientStops})`;
};

export const getPaletteAsCssVariables = (state: ColorState) => (id: string): string => {
  const palette = getPaletteById(state)(id);
  if (!palette) return '';
  
  return palette.colors.map((color, index) => 
    `  --color-${index + 1}: ${color.hex};`
  ).join('\n');
};

/**
 * Search and Filter Getters
 */
export const getFilteredPalettes = (state: ColorState) => (filters: {
  search?: string;
  tags?: string[];
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}): ColorPalette[] => {
  let filtered = [...state.palettes];
  
  // Apply search filter
  if (filters.search) {
    filtered = searchPalettes(filtered, filters.search);
  }
  
  // Apply tag filter
  if (filters.tags && filters.tags.length > 0) {
    filtered = filterPalettesByTags(filtered, filters.tags);
  }
  
  // Apply sorting
  if (filters.sortBy) {
    filtered = sortPalettes(filtered, filters.sortBy, filters.sortOrder);
  }
  
  return filtered;
};

/**
 * Validation Getters
 */
export const isPaletteNameUnique = (state: ColorState) => (name: string, excludeId?: string): boolean => {
  return !state.palettes.some(palette => 
    palette.name.toLowerCase() === name.toLowerCase() && 
    palette.id !== excludeId
  );
};

export const hasUnsavedChanges = (state: ColorState): boolean => {
  // This could be enhanced to track actual changes
  // For now, just check if there are any palettes
  return state.palettes.length > 0;
};

/**
 * Recent Activity Getters
 */
export const getRecentlyModifiedPalettes = (state: ColorState, limit: number = 5): ColorPalette[] => {
  return [...state.palettes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
};

export const getRecentlyCreatedPalettes = (state: ColorState, limit: number = 5): ColorPalette[] => {
  return [...state.palettes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};