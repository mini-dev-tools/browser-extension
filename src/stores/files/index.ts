/**
 * File Store
 * Pinia store for file management with persistent storage
 */

import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import { computed, ref } from 'vue';

import type { FileContent, FileType } from './types';
import { DEFAULT_FILE_TYPES, DEFAULT_FILE_CONTENT, FILE_STORAGE_KEY, CURRENT_FILE_STORAGE_KEY } from './constants';
import { generateFileId, findFileTypeByExtension, extractFileExtension, getFileNameWithoutExtension } from './utils';
import { fileHandler } from '../../helpers/fileHandler';

export const useFileStore = defineStore('files', () => {
  // Persistent state using localStorage
  const files = useLocalStorage<FileContent[]>(FILE_STORAGE_KEY, []);
  const currentFileId = useLocalStorage<string | null>(CURRENT_FILE_STORAGE_KEY, null);
  
  // Computed values
  const getCurrentFile = computed(() => {
    if (!currentFileId.value) return null;
    return files.value.find(file => file.id === currentFileId.value) || null;
  });

  const availableTypes = ref(DEFAULT_FILE_TYPES);

  // Actions
  const createFile = (name?: string, fileType?: FileType): FileContent => {
    const type = fileType || DEFAULT_FILE_TYPES[0];
    const now = new Date().toISOString();
    
    const newFile: FileContent = {
      id: generateFileId(),
      name: name || 'untitled',
      extension: type.extension,
      mime: type.mime,
      content: DEFAULT_FILE_CONTENT[type.extension as keyof typeof DEFAULT_FILE_CONTENT] || '',
      fileType: type,
      createdAt: now,
      updatedAt: now
    };

    files.value.unshift(newFile);
    currentFileId.value = newFile.id;
    
    return newFile;
  };

  const selectFile = (id: string | null): void => {
    if (id === null || files.value.some(file => file.id === id)) {
      currentFileId.value = id;
    }
  };

  const updateFile = (id: string, updates: Partial<Omit<FileContent, 'id' | 'createdAt'>>): FileContent | null => {
    const fileIndex = files.value.findIndex(file => file.id === id);
    if (fileIndex === -1) return null;

    const updatedFile = {
      ...files.value[fileIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    files.value[fileIndex] = updatedFile;
    return updatedFile;
  };

  const deleteFile = (id: string): boolean => {
    const fileIndex = files.value.findIndex(file => file.id === id);
    if (fileIndex === -1) return false;

    files.value.splice(fileIndex, 1);
    
    if (currentFileId.value === id) {
      currentFileId.value = files.value.length > 0 ? files.value[0].id : null;
    }
    
    return true;
  };

  const duplicateFile = (id: string): FileContent | null => {
    const originalFile = files.value.find(file => file.id === id);
    if (!originalFile) return null;

    const now = new Date().toISOString();
    const duplicatedFile: FileContent = {
      ...originalFile,
      id: generateFileId(),
      name: `${originalFile.name}_copy`,
      createdAt: now,
      updatedAt: now
    };

    files.value.unshift(duplicatedFile);
    return duplicatedFile;
  };

  const importFile = async (file: File): Promise<FileContent> => {
    return new Promise((resolve, reject) => {
      const fileName = file.name;
      const fileExtension = extractFileExtension(fileName);
      const fileNameWithoutExt = getFileNameWithoutExtension(fileName);
      
      const detectedType = findFileTypeByExtension(fileExtension);
      const fileType = detectedType || DEFAULT_FILE_TYPES[0];

      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result?.toString() || '';
        const now = new Date().toISOString();
        
        const newFile: FileContent = {
          id: generateFileId(),
          name: fileNameWithoutExt,
          extension: fileType.extension,
          mime: file.type || fileType.mime,
          content,
          fileType,
          createdAt: now,
          updatedAt: now
        };

        files.value.unshift(newFile);
        currentFileId.value = newFile.id;
        resolve(newFile);
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const exportFile = (id: string): void => {
    const file = files.value.find(f => f.id === id);
    if (!file) return;

    const filename = file.name + file.extension;
    new fileHandler(file.content)
      .setFileName(filename)
      .setFileMimeType(file.mime)
      .downloadFile();
  };

  const updateFileContent = (id: string, content: string): void => {
    const fileIndex = files.value.findIndex(file => file.id === id);
    if (fileIndex !== -1) {
      files.value[fileIndex].content = content;
      files.value[fileIndex].updatedAt = new Date().toISOString();
    }
  };

  const updateFileName = (id: string, name: string): void => {
    const fileIndex = files.value.findIndex(file => file.id === id);
    if (fileIndex !== -1) {
      files.value[fileIndex].name = name;
      files.value[fileIndex].updatedAt = new Date().toISOString();
    }
  };

  const updateFileType = (id: string, fileType: FileType): void => {
    const fileIndex = files.value.findIndex(file => file.id === id);
    if (fileIndex !== -1) {
      files.value[fileIndex].fileType = fileType;
      files.value[fileIndex].extension = fileType.extension;
      files.value[fileIndex].mime = fileType.mime;
      files.value[fileIndex].updatedAt = new Date().toISOString();
    }
  };

  const searchFiles = (query: string): FileContent[] => {
    if (!query.trim()) return files.value;
    
    const lowercaseQuery = query.toLowerCase();
    return files.value.filter(file =>
      file.name.toLowerCase().includes(lowercaseQuery) ||
      file.content.toLowerCase().includes(lowercaseQuery) ||
      file.fileType.label.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    // State
    files: files,
    currentFileId: currentFileId,
    availableTypes,
    
    // Getters
    getCurrentFile,
    
    // Actions
    createFile,
    selectFile,
    updateFile,
    deleteFile,
    duplicateFile,
    importFile,
    exportFile,
    updateFileContent,
    updateFileName,
    updateFileType,
    searchFiles
  };
});

// Export types for convenience
export type * from './types';