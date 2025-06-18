/**
 * File Store Getters
 * Computed properties and data access methods
 */

import { FileState, FileGetters } from './types';

export const createGetters = (state: FileState): FileGetters => ({
  getFileById: (id: string) => {
    return state.files.find(file => file.id === id);
  },

  getCurrentFile: (() => {
    if (!state.currentFileId) return null;
    return state.files.find(file => file.id === state.currentFileId) || null;
  })(),

  getFilesByExtension: (extension: string) => {
    return state.files.filter(file => file.extension === extension);
  },

  getRecentFiles: (limit: number = 10) => {
    return state.files
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  },

  getFileTypeByExtension: (extension: string) => {
    return state.availableTypes.find(type => type.extension === extension);
  }
});