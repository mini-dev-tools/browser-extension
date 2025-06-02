/**
 * Color Store Actions
 * Business logic, mutations, and async operations
 */

import { v4 as uuidv4 } from 'uuid';
import { toast } from 'vue-sonner';
import type { 
  ColorState, 
  ColorPalette, 
  PaletteColor, 
  ColorHistory, 
  ColorSource,
  UndoData 
} from './types';
import { COLOR_SOURCE_DISPLAY_NAMES, COLOR_HISTORY_LIMIT, PALETTE_VERSION } from './constants';
import { cleanupColorHistory, validatePalette } from './state';

/**
 * Palette CRUD Operations
 */
export const createPalette = (
  state: ColorState,
  name: string, 
  colors: Omit<PaletteColor, 'id'>[], 
  description?: string, 
  tags?: string[]
): ColorPalette => {
  const palette: ColorPalette = {
    id: uuidv4(),
    name,
    description,
    colors: colors.map(color => ({
      ...color,
      id: uuidv4()
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: PALETTE_VERSION,
    tags
  };
  
  state.palettes.push(palette);
  return palette;
};

export const updatePalette = (
  state: ColorState,
  id: string, 
  updates: Partial<Omit<ColorPalette, 'id' | 'createdAt'>>
): ColorPalette | null => {
  const paletteIndex = state.palettes.findIndex(p => p.id === id);
  if (paletteIndex === -1) return null;
  
  state.palettes[paletteIndex] = {
    ...state.palettes[paletteIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return state.palettes[paletteIndex];
};

export const deletePalette = (state: ColorState, id: string): boolean => {
  const index = state.palettes.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  state.palettes.splice(index, 1);
  
  // Clear selection if deleted palette was selected
  if (state.selectedPaletteId === id) {
    state.selectedPaletteId = null;
  }
  
  return true;
};

export const duplicatePalette = (state: ColorState, id: string): ColorPalette | null => {
  const originalPalette = state.palettes.find(p => p.id === id);
  if (!originalPalette) return null;
  
  return createPalette(
    state,
    `${originalPalette.name} (Copy)`,
    originalPalette.colors.map(({ id, ...color }) => color),
    originalPalette.description,
    originalPalette.tags
  );
};

/**
 * Color Operations Within Palettes
 */
export const addColorToPalette = (
  state: ColorState,
  paletteId: string, 
  color: Omit<PaletteColor, 'id'>
): PaletteColor | null => {
  const palette = state.palettes.find(p => p.id === paletteId);
  if (!palette) return null;
  
  const newColor: PaletteColor = {
    ...color,
    id: uuidv4()
  };
  
  palette.colors.push(newColor);
  palette.updatedAt = new Date().toISOString();
  
  return newColor;
};

export const updateColorInPalette = (
  state: ColorState,
  paletteId: string, 
  colorId: string, 
  updates: Partial<Omit<PaletteColor, 'id'>>
): PaletteColor | null => {
  const palette = state.palettes.find(p => p.id === paletteId);
  if (!palette) return null;
  
  const colorIndex = palette.colors.findIndex(c => c.id === colorId);
  if (colorIndex === -1) return null;
  
  palette.colors[colorIndex] = {
    ...palette.colors[colorIndex],
    ...updates
  };
  palette.updatedAt = new Date().toISOString();
  
  return palette.colors[colorIndex];
};

export const removeColorFromPalette = (
  state: ColorState,
  paletteId: string, 
  colorId: string
): boolean => {
  const palette = state.palettes.find(p => p.id === paletteId);
  if (!palette) return false;
  
  const colorIndex = palette.colors.findIndex(c => c.id === colorId);
  if (colorIndex === -1) return false;
  
  palette.colors.splice(colorIndex, 1);
  palette.updatedAt = new Date().toISOString();
  
  return true;
};

/**
 * Color History Management
 */
export const addToHistory = (
  state: any, // Use any to handle reactive state properly
  hex: string, 
  source: ColorSource = 'picker', 
  sourceName?: string, 
  context?: string
): void => {
  console.log('addToHistory called with:', { hex, source, sourceName, context });
  
  // Handle both reactive state (from store) and localStorage ref (from Chrome extension)
  let historyArray: ColorHistory[];
  let isRef = false;
  
  if (state.colorHistory?.value && Array.isArray(state.colorHistory.value)) {
    // This is a ref from useLocalStorage
    historyArray = state.colorHistory.value;
    isRef = true;
  } else if (Array.isArray(state.colorHistory)) {
    // This is direct array access from store
    historyArray = state.colorHistory;
    isRef = false;
  } else {
    console.error('Color history is not properly initialized:', state.colorHistory);
    return;
  }
  
  console.log('Current history length:', historyArray.length);
  
  // Check if color already exists in recent history
  const existingIndex = historyArray.findIndex(
    (item: ColorHistory) => item.hex.toLowerCase() === hex.toLowerCase()
  );
  
  const isUpdate = existingIndex !== -1;
  console.log('Is update:', isUpdate, 'existing index:', existingIndex);
  
  if (isUpdate) {
    // Update existing entry
    const existing = historyArray[existingIndex];
    existing.timestamp = Date.now();
    existing.source = source;
    if (sourceName) existing.sourceName = sourceName;
    if (context) existing.context = context;
    
    // Move to front
    historyArray.splice(existingIndex, 1);
    historyArray.unshift(existing);
  } else {
    // Add new entry
    const historyItem: ColorHistory = {
      id: uuidv4(),
      hex: hex.toLowerCase(),
      timestamp: Date.now(),
      source,
      sourceName,
      context
    };
    
    console.log('Adding new history item:', historyItem);
    historyArray.unshift(historyItem);
  }
  
  // Clean up history (remove old entries and duplicates)
  const cleanedHistory = cleanupColorHistory(historyArray, COLOR_HISTORY_LIMIT);
  
  // Update the state correctly based on how it's stored
  if (isRef) {
    state.colorHistory.value = cleanedHistory;
  } else {
    state.colorHistory.splice(0, state.colorHistory.length, ...cleanedHistory);
  }
  
  console.log('History after update:', cleanedHistory.length);
  
  // Show toast notification
  showHistoryToast(hex, source, sourceName, context, isUpdate);
};

export const clearHistory = (state: any): void => {
  if (state.colorHistory?.value && Array.isArray(state.colorHistory.value)) {
    // This is a ref from useLocalStorage
    state.colorHistory.value.splice(0);
  } else if (Array.isArray(state.colorHistory)) {
    // This is direct array access from store
    state.colorHistory.splice(0);
  }
};

export const removeFromHistory = (state: any, id: string): boolean => {
  let historyArray: ColorHistory[];
  
  if (state.colorHistory?.value && Array.isArray(state.colorHistory.value)) {
    // This is a ref from useLocalStorage
    historyArray = state.colorHistory.value;
  } else if (Array.isArray(state.colorHistory)) {
    // This is direct array access from store
    historyArray = state.colorHistory;
  } else {
    return false;
  }
  
  const index = historyArray.findIndex((item: ColorHistory) => item.id === id);
  if (index === -1) return false;
  
  historyArray.splice(index, 1);
  return true;
};

/**
 * Toast Notifications for History Actions
 */
export const showHistoryToast = (
  hex: string, 
  source?: ColorSource, 
  sourceName?: string, 
  context?: string, 
  isUpdate: boolean = false
): void => {
  const displaySource = sourceName || COLOR_SOURCE_DISPLAY_NAMES[source || 'picker'] || 'Unknown';
  const action = isUpdate ? 'Updated in' : 'Added to';
  
  let title = `${action} history`;
  let description = hex.toUpperCase();
  
  if (context) {
    title += ` from ${displaySource}`;
    description += ` • ${context}`;
  } else {
    title += ` from ${displaySource}`;
  }

  // Store undo data
  const undoData: UndoData = {
    hex: hex.toLowerCase(),
    wasUpdate: isUpdate,
    previousPosition: isUpdate ? 0 : -1
  };
  
  toast(title, {
    description: description,
    duration: 3000,
    style: {
      borderLeft: `4px solid ${hex}`
    },
    action: {
      label: 'Undo',
      onClick: () => undoHistoryAction(undoData)
    },
    dismissible: true
  });
};

export const undoHistoryAction = (undoData: UndoData): void => {
  // This would need access to the store state, so it should be implemented in the store
  toast('Undo functionality needs store access', {
    duration: 2000,
    dismissible: true
  });
};

/**
 * Palette Selection
 */
export const selectPalette = (state: ColorState, id: string | null): void => {
  state.selectedPaletteId = id;
};

/**
 * Import/Export Operations
 */
export const exportPalette = (state: ColorState, id: string): string | null => {
  const palette = state.palettes.find(p => p.id === id);
  if (!palette) return null;
  
  return JSON.stringify(palette, null, 2);
};

export const importPalette = (state: ColorState, paletteData: string): ColorPalette | null => {
  try {
    const palette = JSON.parse(paletteData) as ColorPalette;
    
    // Validate palette structure
    if (!validatePalette(palette)) {
      throw new Error('Invalid palette format');
    }
    
    // Generate new ID to avoid conflicts
    palette.id = uuidv4();
    palette.createdAt = new Date().toISOString();
    palette.updatedAt = new Date().toISOString();
    
    // Generate new color IDs
    palette.colors = palette.colors.map(color => ({
      ...color,
      id: uuidv4()
    }));
    
    state.palettes.push(palette);
    return palette;
  } catch (error) {
    console.error('Failed to import palette:', error);
    return null;
  }
};