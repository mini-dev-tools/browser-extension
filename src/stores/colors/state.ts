/**
 * Color Store State Management
 * Initial state definition and state persistence logic
 */

import { watch } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import type { ColorState, ColorPalette, ColorHistory } from './types';
import { DEFAULT_PALETTES } from './constants';

/**
 * Check if running in Chrome extension context
 */
const isChromeExtension = (): boolean => {
  try {
    const hasChrome = typeof chrome !== 'undefined';
    const hasRuntime = hasChrome && chrome.runtime;
    const hasId = hasRuntime && !!chrome.runtime.id;
    const hasStorage = hasChrome && typeof (chrome as any).storage !== 'undefined';
    
    console.log('Chrome extension detection:', {
      hasChrome,
      hasRuntime,
      hasId,
      hasStorage,
      userAgent: navigator.userAgent.includes('Chrome'),
      location: window.location.href
    });
    
    return hasChrome && hasRuntime && hasId && hasStorage;
  } catch (error) {
    console.error('Error detecting Chrome extension context:', error);
    return false;
  }
};

/**
 * Convert Chrome extension color format to store color history format
 */
const convertChromeColorToHistory = (chromeColor: any): ColorHistory => {
  return {
    id: chromeColor.id || Date.now().toString(),
    hex: chromeColor.hex,
    timestamp: chromeColor.timestamp || Date.now(),
    source: chromeColor.source || 'eye_drop',
    sourceName: chromeColor.sourceName,
    context: chromeColor.context
  };
};

/**
 * Chrome storage wrapper for reactive data
 */
const createChromeStorageRef = <T>(key: string, defaultValue: T) => {
  // Start with localStorage as base
  const ref = useLocalStorage(key, defaultValue);
  
  // If in Chrome extension, enhance with Chrome storage sync
  if (isChromeExtension()) {
    console.log(`Setting up Chrome storage sync for key: ${key}`);
    
    // Load initial value from Chrome storage
    (chrome as any).storage.local.get([key]).then((result: any) => {
      console.log(`Chrome storage result for ${key}:`, result);
      if (result[key] !== undefined && Array.isArray(result[key])) {
        let chromeData = result[key];
        
        // Convert Chrome format to store format for colorHistory
        if (key === 'colorHistory') {
          console.log(`Converting ${chromeData.length} Chrome colors to history format`);
          const convertedData = chromeData.map(convertChromeColorToHistory);
          console.log(`Setting ${key} value from Chrome storage:`, convertedData);
          ref.value = convertedData as T;
        } else {
          ref.value = chromeData as T;
        }
      } else {
        console.log(`No existing value in Chrome storage for ${key}, keeping localStorage default`);
        // Sync current localStorage value to Chrome storage
        (chrome as any).storage.local.set({ [key]: ref.value });
      }
    }).catch((error: any) => {
      console.error(`Error loading from Chrome storage for ${key}:`, error);
    });
    
    // Watch for changes in the ref and sync to Chrome storage
    let isUpdating = false;
    watch(ref, (newValue) => {
      if (!isUpdating && newValue) {
        console.log(`Syncing ${key} to Chrome storage:`, newValue);
        (chrome as any).storage.local.set({ [key]: newValue }).catch((error: any) => {
          console.error(`Error saving to Chrome storage for ${key}:`, error);
        });
      }
    }, { deep: true, immediate: false });
    
    // Listen for Chrome storage changes from other contexts (like content script)
    const storageListener = (changes: any, areaName: string) => {
      if (areaName === 'local' && changes[key]) {
        console.log(`Chrome storage changed externally for ${key}:`, changes[key]);
        isUpdating = true;
        
        let newValue = changes[key].newValue;
        if (key === 'colorHistory' && Array.isArray(newValue)) {
          newValue = newValue.map(convertChromeColorToHistory);
          console.log(`Converted external Chrome data for ${key}:`, newValue);
        }
        
        ref.value = newValue;
        // Reset the updating flag after Vue's next tick
        setTimeout(() => { isUpdating = false; }, 0);
      }
    };
    
    (chrome as any).storage.onChanged.addListener(storageListener);
  } else {
    console.log(`Using localStorage only for key: ${key} (not in Chrome extension)`);
  }
  
  return ref;
};

/**
 * Initialize default palettes for new users or missing palettes for existing users
 */
export const initializeDefaultPalettes = (existingPalettes: ColorPalette[]): ColorPalette[] => {
  const existingIds = existingPalettes.map(p => p.id);
  const missingPalettes = DEFAULT_PALETTES.filter(p => !existingIds.includes(p.id));
  
  if (missingPalettes.length > 0) {
    return [...existingPalettes, ...missingPalettes];
  }
  
  return existingPalettes;
};

/**
 * Create initial state with localStorage persistence
 */
export const createInitialState = () => {
  // Use simple localStorage for all data - stable and reliable
  const palettes = useLocalStorage<ColorPalette[]>('color-palettes', DEFAULT_PALETTES);
  const colorHistory = useLocalStorage<ColorHistory[]>('color-history', []);
  const selectedPaletteId = useLocalStorage<string | null>('selected-palette-id', null);
  
  console.log('Creating initial color store state with localStorage');
  console.log('Initial history length:', colorHistory.value?.length || 'undefined');
  
  // Initialize missing default palettes
  palettes.value = initializeDefaultPalettes(Array.isArray(palettes.value) ? palettes.value : DEFAULT_PALETTES);
  
  // Ensure colorHistory is an array
  if (!Array.isArray(colorHistory.value)) {
    colorHistory.value = [];
  }
  
  return {
    palettes,
    colorHistory,
    selectedPaletteId
  };
};

/**
 * State validation utilities
 */
export const validatePalette = (palette: Partial<ColorPalette>): boolean => {
  return !!(
    palette.id &&
    palette.name &&
    palette.colors &&
    Array.isArray(palette.colors) &&
    palette.createdAt &&
    palette.updatedAt &&
    palette.version
  );
};

export const validateColorHistory = (history: Partial<ColorHistory>): boolean => {
  return !!(
    history.id &&
    history.hex &&
    typeof history.timestamp === 'number'
  );
};

/**
 * State cleanup utilities
 */
export const cleanupColorHistory = (history: ColorHistory[], maxItems: number = 50): ColorHistory[] => {
  // Sort by timestamp (newest first) and limit
  const sorted = history
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, maxItems);
  
  // Remove duplicates based on hex color
  const seen = new Set<string>();
  return sorted.filter(item => {
    const hexLower = item.hex.toLowerCase();
    if (seen.has(hexLower)) {
      return false;
    }
    seen.add(hexLower);
    return true;
  });
};

export const migratePaletteData = (palette: any): ColorPalette | null => {
  try {
    // Handle legacy palette format if needed
    if (palette.uuid && !palette.id) {
      palette.id = palette.uuid;
      delete palette.uuid;
    }
    
    // Ensure required fields exist
    if (!palette.version) {
      palette.version = '1.0';
    }
    
    if (!palette.createdAt) {
      palette.createdAt = new Date().toISOString();
    }
    
    if (!palette.updatedAt) {
      palette.updatedAt = new Date().toISOString();
    }
    
    // Ensure colors have IDs
    if (palette.colors && Array.isArray(palette.colors)) {
      palette.colors = palette.colors.map((color: any, index: number) => ({
        id: color.id || `color-${index}`,
        name: color.name || `Color ${index + 1}`,
        hex: color.hex || color.color || '#000000'
      }));
    }
    
    return validatePalette(palette) ? palette as ColorPalette : null;
  } catch (error) {
    console.error('Failed to migrate palette data:', error);
    return null;
  }
};