/**
 * Store Registry
 * Central export point for all application stores
 */

// Color Store
export { useColorsStore, usePaletteStore } from './colors';
export type * from './colors/types';

// File Store
export { useFileStore } from './files';
export type * from './files/types';

// Main Store (global app state)
export { useMainStore } from './mainStore';

// Settings Store
export { useSettingsStore } from './settingsStore';

// Resizer Store (window management) - Note: currently exports useMainStore
// export { useResizerStore } from './resizerStore';

/**
 * Store initialization helper
 * Call this to initialize all stores with their default data
 */
export const initializeStores = async () => {
  const { useColorsStore } = await import('./colors');
  const colorsStore = useColorsStore();
  colorsStore.initializeNewPalettes();
  
  console.log('All stores initialized');
};

/**
 * Store utilities
 */
export const resetAllStores = () => {
  // This could be used for testing or user data reset
  console.warn('Store reset not implemented yet');
};