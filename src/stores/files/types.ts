/**
 * File Store Type Definitions
 * Centralized type definitions for the file management system
 */

export interface FileType {
  extension: string;
  mime: string;
  label: string;
  aceName: string;
  editorType?: 'ace' | 'markdown';
}

export interface FileContent {
  id: string;
  name: string;
  extension: string;
  mime: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  fileType: FileType;
}

export interface FileState {
  files: FileContent[];
  currentFileId: string | null;
  availableTypes: FileType[];
}

export interface FileActions {
  // File CRUD
  createFile(name?: string, fileType?: FileType): FileContent;
  updateFile(id: string, updates: Partial<Omit<FileContent, 'id' | 'createdAt'>>): FileContent | null;
  deleteFile(id: string): boolean;
  duplicateFile(id: string): FileContent | null;
  
  // File operations
  selectFile(id: string | null): void;
  importFile(file: File): Promise<FileContent>;
  exportFile(id: string): void;
  
  // Content management
  updateFileContent(id: string, content: string): void;
  updateFileName(id: string, name: string): void;
  updateFileType(id: string, fileType: FileType): void;
  
  // Utility functions
  searchFiles(query: string): FileContent[];
  getFilesByType(extension: string): FileContent[];
}

export interface FileGetters {
  getFileById: (id: string) => FileContent | undefined;
  getCurrentFile: FileContent | null;
  getFilesByExtension: (extension: string) => FileContent[];
  getRecentFiles: (limit?: number) => FileContent[];
  getFileTypeByExtension: (extension: string) => FileType | undefined;
}