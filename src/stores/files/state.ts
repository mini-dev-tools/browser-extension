/**
 * File Store State
 * Initial state configuration for file management
 */

import { FileState } from './types';
import { DEFAULT_FILE_TYPES } from './constants';

export const createInitialState = (): FileState => ({
  files: [],
  currentFileId: null,
  availableTypes: DEFAULT_FILE_TYPES
});