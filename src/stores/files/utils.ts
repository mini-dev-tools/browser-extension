/**
 * File Store Utilities
 * Helper functions for file operations
 */

import { FileType, FileContent } from './types';
import { DEFAULT_FILE_TYPES, DEFAULT_FILE_CONTENT } from './constants';

export const generateFileId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const getDefaultFileType = (): FileType => {
  return DEFAULT_FILE_TYPES[0]; // Default to text
};

export const findFileTypeByExtension = (extension: string): FileType | undefined => {
  return DEFAULT_FILE_TYPES.find(type => type.extension === extension);
};

export const getDefaultContentForType = (extension: string): string => {
  return DEFAULT_FILE_CONTENT[extension as keyof typeof DEFAULT_FILE_CONTENT] || '';
};

export const sanitizeFileName = (name: string): string => {
  return name.replace(/[^a-z0-9_\-\.]/gi, '_').toLowerCase();
};

export const extractFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
};

export const getFileNameWithoutExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
};

export const createDefaultFile = (fileType?: FileType): Omit<FileContent, 'id' | 'createdAt' | 'updatedAt'> => {
  const type = fileType || getDefaultFileType();
  const now = new Date().toISOString();
  
  return {
    name: 'untitled',
    extension: type.extension,
    mime: type.mime,
    content: getDefaultContentForType(type.extension),
    fileType: type
  };
};

export const validateFileContent = (content: FileContent): boolean => {
  return !!(content.id && content.name && content.extension && content.fileType);
};

export const formatFileSize = (content: string): string => {
  const bytes = new Blob([content]).size;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const getLineCount = (content: string): number => {
  return content.split('\n').length;
};