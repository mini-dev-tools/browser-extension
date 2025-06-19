/**
 * File Store Actions
 * Business logic and state mutations for file management
 */

import { FileState, FileActions, FileContent, FileType } from './types';
import { 
  generateFileId, 
  createDefaultFile, 
  findFileTypeByExtension,
  extractFileExtension,
  getFileNameWithoutExtension,
  sanitizeFileName 
} from './utils';
import { fileHandler } from '../../helpers/fileHandler';

export const createActions = (state: FileState): FileActions => ({
  createFile: (name?: string, fileType?: FileType): FileContent => {
    const defaultFile = createDefaultFile(fileType);
    const now = new Date().toISOString();
    
    const newFile: FileContent = {
      ...defaultFile,
      id: generateFileId(),
      name: name || defaultFile.name,
      createdAt: now,
      updatedAt: now
    };

    state.files.unshift(newFile);
    state.currentFileId = newFile.id;
    
    return newFile;
  },

  updateFile: (id: string, updates: Partial<Omit<FileContent, 'id' | 'createdAt'>>): FileContent | null => {
    const fileIndex = state.files.findIndex(file => file.id === id);
    if (fileIndex === -1) return null;

    const updatedFile = {
      ...state.files[fileIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    state.files[fileIndex] = updatedFile;
    return updatedFile;
  },

  deleteFile: (id: string): boolean => {
    const fileIndex = state.files.findIndex(file => file.id === id);
    if (fileIndex === -1) return false;

    state.files.splice(fileIndex, 1);
    
    if (state.currentFileId === id) {
      state.currentFileId = state.files.length > 0 ? state.files[0].id : null;
    }
    
    return true;
  },

  duplicateFile: (id: string): FileContent | null => {
    const originalFile = state.files.find(file => file.id === id);
    if (!originalFile) return null;

    const now = new Date().toISOString();
    const duplicatedFile: FileContent = {
      ...originalFile,
      id: generateFileId(),
      name: `${originalFile.name}_copy`,
      createdAt: now,
      updatedAt: now
    };

    state.files.unshift(duplicatedFile);
    return duplicatedFile;
  },

  selectFile: (id: string | null): void => {
    if (id === null || state.files.some(file => file.id === id)) {
      state.currentFileId = id;
    }
  },

  importFile: async (file: File): Promise<FileContent> => {
    return new Promise((resolve, reject) => {
      const fileName = file.name;
      const fileExtension = extractFileExtension(fileName);
      const fileNameWithoutExt = getFileNameWithoutExtension(fileName);
      
      const detectedType = findFileTypeByExtension(fileExtension);
      const fileType = detectedType || state.availableTypes[0]; // Default to text if not found

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

        state.files.unshift(newFile);
        state.currentFileId = newFile.id;
        resolve(newFile);
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  exportFile: (id: string): void => {
    const file = state.files.find(f => f.id === id);
    if (!file) return;

    const filename = file.name + file.extension;
    new fileHandler(file.content)
      .setFileName(filename)
      .setFileMimeType(file.mime)
      .downloadFile();
  },

  updateFileContent: (id: string, content: string): void => {
    const fileIndex = state.files.findIndex(file => file.id === id);
    if (fileIndex !== -1) {
      state.files[fileIndex].content = content;
      state.files[fileIndex].updatedAt = new Date().toISOString();
    }
  },

  updateFileName: (id: string, name: string): void => {
    const fileIndex = state.files.findIndex(file => file.id === id);
    if (fileIndex !== -1) {
      state.files[fileIndex].name = name;
      state.files[fileIndex].updatedAt = new Date().toISOString();
    }
  },

  updateFileType: (id: string, fileType: FileType): void => {
    const fileIndex = state.files.findIndex(file => file.id === id);
    if (fileIndex !== -1) {
      state.files[fileIndex].fileType = fileType;
      state.files[fileIndex].extension = fileType.extension;
      state.files[fileIndex].mime = fileType.mime;
      state.files[fileIndex].updatedAt = new Date().toISOString();
    }
  },

  searchFiles: (query: string): FileContent[] => {
    if (!query.trim()) return state.files;
    
    const lowercaseQuery = query.toLowerCase();
    return state.files.filter(file => {
      const content = file.content || '';
      const contentStr = typeof content === 'string' ? content : String(content);
      return file.name.toLowerCase().includes(lowercaseQuery) ||
        contentStr.toLowerCase().includes(lowercaseQuery) ||
        file.fileType.label.toLowerCase().includes(lowercaseQuery);
    });
  },

  getFilesByType: (extension: string): FileContent[] => {
    return state.files.filter(file => file.extension === extension);
  }
});