/**
 * Color Store - Main Export
 * Centralized color and palette management for the application
 */

import { defineStore } from 'pinia';
import { createInitialState } from './state';
import * as actions from './actions';
import * as getters from './getters';

// Re-export types for convenience
export type * from './types';
export { ColorConverter } from './utils';

// Import types for internal use
import type { PaletteColor, ColorSource } from './types';

/**
 * Main Colors Store
 * Manages palettes, color history, and color-related operations
 */
export const useColorsStore = defineStore('colors', {
  state: createInitialState,

  getters: {
    // Palette getters
    getPaletteById: (state) => getters.getPaletteById(state),
    getSelectedPalette: (state) => getters.getSelectedPalette(state),
    getPalettesByTag: (state) => getters.getPalettesByTag(state),
    getPalettesByTags: (state) => getters.getPalettesByTags(state),
    searchPalettes: (state) => getters.searchPalettesGetter(state),
    getSortedPalettes: (state) => getters.getSortedPalettes(state),
    
    // Tag getters
    getAllUniqueTags: (state) => getters.getAllUniqueTags(state),
    getTagCounts: (state) => getters.getTagCounts(state),
    getPopularTags: (state) => getters.getPopularTags(state),
    
    // History getters
    getRecentColors: (state) => getters.getRecentColors(state),
    getColorHistoryBySource: (state) => getters.getColorHistoryBySource(state),
    getUniqueColorsFromHistory: (state) => getters.getUniqueColorsFromHistory(state),
    
    // Statistics getters
    getPaletteCount: (state) => getters.getPaletteCount(state),
    getTotalColorCount: (state) => getters.getTotalColorCount(state),
    getAverageColorsPerPalette: (state) => getters.getAverageColorsPerPalette(state),
    getHistoryCount: (state) => getters.getHistoryCount(state),
    getPalettesByColorCount: (state) => getters.getPalettesByColorCount(state),
    
    // Utility getters
    getPaletteAsGradientStops: (state) => getters.getPaletteAsGradientStops(state),
    getPaletteAsLinearGradient: (state) => getters.getPaletteAsLinearGradient(state),
    getPaletteAsCssVariables: (state) => getters.getPaletteAsCssVariables(state),
    
    // Filter getters
    getFilteredPalettes: (state) => getters.getFilteredPalettes(state),
    
    // Validation getters
    isPaletteNameUnique: (state) => getters.isPaletteNameUnique(state),
    hasUnsavedChanges: (state) => getters.hasUnsavedChanges(state),
    
    // Activity getters
    getRecentlyModifiedPalettes: (state) => getters.getRecentlyModifiedPalettes(state),
    getRecentlyCreatedPalettes: (state) => getters.getRecentlyCreatedPalettes(state),
  },

  actions: {
    // Initialize store
    initializeNewPalettes() {
      // This is handled automatically by the state initialization
      console.log('Colors store initialized with', this.palettes.length, 'palettes');
    },

    // Palette CRUD operations
    createPalette(name: string, colors: Omit<PaletteColor, 'id'>[], description?: string, tags?: string[]) {
      return actions.createPalette(this, name, colors, description, tags);
    },

    updatePalette(id: string, updates: Parameters<typeof actions.updatePalette>[2]) {
      return actions.updatePalette(this, id, updates);
    },

    deletePalette(id: string) {
      return actions.deletePalette(this, id);
    },

    duplicatePalette(id: string) {
      return actions.duplicatePalette(this, id);
    },

    // Color operations within palettes
    addColorToPalette(paletteId: string, color: Parameters<typeof actions.addColorToPalette>[2]) {
      return actions.addColorToPalette(this, paletteId, color);
    },

    updateColorInPalette(paletteId: string, colorId: string, updates: Parameters<typeof actions.updateColorInPalette>[3]) {
      return actions.updateColorInPalette(this, paletteId, colorId, updates);
    },

    removeColorFromPalette(paletteId: string, colorId: string) {
      return actions.removeColorFromPalette(this, paletteId, colorId);
    },

    // Color history management
    addToHistory(hex: string, source?: Parameters<typeof actions.addToHistory>[2], sourceName?: string, context?: string) {
      actions.addToHistory(this, hex, source, sourceName, context);
    },

    clearHistory() {
      actions.clearHistory(this);
    },

    removeFromHistory(id: string) {
      return actions.removeFromHistory(this, id);
    },

    // Undo functionality for history
    undoHistoryAction(undoData: Parameters<typeof actions.undoHistoryAction>[0]) {
      const colorIndex = this.colorHistory.findIndex(
        item => item.hex.toLowerCase() === undoData.hex.toLowerCase()
      );
      
      if (colorIndex !== -1) {
        if (undoData.wasUpdate) {
          // Remove the updated entry
          this.colorHistory.splice(colorIndex, 1);
          actions.showHistoryToast(undoData.hex, undefined, undefined, 'Removed from history', false);
        } else {
          // Remove the new entry
          this.colorHistory.splice(colorIndex, 1);
          actions.showHistoryToast(undoData.hex, undefined, undefined, 'Removed from history', false);
        }
      }
    },

    // Palette selection
    selectPalette(id: string | null) {
      actions.selectPalette(this, id);
    },

    // Import/Export functionality
    exportPalette(id: string) {
      return actions.exportPalette(this, id);
    },

    importPalette(paletteData: string) {
      return actions.importPalette(this, paletteData);
    },
  }
});

// Legacy compatibility - export the store as usePaletteStore
export const usePaletteStore = useColorsStore;