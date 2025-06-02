# Store Organization Convention

## Overview
This document outlines the standardized structure for organizing Pinia stores in the Arzs Mini Dev Tools project. This convention ensures consistency, maintainability, and scalability across all feature stores.

## Folder Structure Convention

```
src/stores/
├── {feature}/
│   ├── index.ts          # Main store definition and public API
│   ├── types.ts          # All TypeScript interfaces and types
│   ├── actions.ts        # Store actions (mutations, business logic)
│   ├── getters.ts        # Computed values and selectors
│   ├── state.ts          # Initial state and state management
│   ├── utils.ts          # Feature-specific utilities
│   ├── constants.ts      # Default values, configuration, static data
│   └── services.ts       # External services (localStorage, API calls)
├── index.ts              # Store registry and exports
└── {legacy-stores}.ts    # Existing single-file stores (to be migrated)
```

## File Responsibilities

### `index.ts` - Main Store Definition
- **Purpose**: Primary export point and store definition
- **Contains**:
  - Pinia store definition using `defineStore()`
  - Exported getters and actions
  - Public API for the store
  - Type re-exports for convenience
  - Legacy compatibility exports if needed

**Example:**
```typescript
import { defineStore } from 'pinia';
import { createInitialState } from './state';
import * as actions from './actions';
import * as getters from './getters';

// Re-export types for convenience
export type * from './types';

export const useFeatureStore = defineStore('feature', {
  state: createInitialState,
  getters: {
    // Map getters from getters.ts
  },
  actions: {
    // Map actions from actions.ts
  }
});
```

### `types.ts` - Type Definitions
- **Purpose**: Centralized type definitions
- **Contains**:
  - Interfaces for all store entities
  - Union types and enums
  - Generic types for the feature
  - State shape interfaces
  - Action parameter types

**Example:**
```typescript
export interface FeatureItem {
  id: string;
  name: string;
  createdAt: string;
}

export interface FeatureState {
  items: FeatureItem[];
  selectedId: string | null;
}

export type FeatureSource = 'user' | 'import' | 'default';
```

### `actions.ts` - Business Logic
- **Purpose**: All store mutations and business logic
- **Contains**:
  - CRUD operations
  - Async operations
  - Data transformations
  - Side effects
  - External API calls

**Example:**
```typescript
import type { FeatureState, FeatureItem } from './types';

export const createItem = (
  state: FeatureState,
  name: string
): FeatureItem => {
  const item: FeatureItem = {
    id: uuidv4(),
    name,
    createdAt: new Date().toISOString()
  };
  
  state.items.push(item);
  return item;
};
```

### `getters.ts` - Computed Values
- **Purpose**: Derived state and computed values
- **Contains**:
  - Filtered data
  - Computed properties
  - Search and sort functions
  - Statistics and aggregations

**Example:**
```typescript
import type { FeatureState, FeatureItem } from './types';

export const getItemById = (state: FeatureState) => (id: string): FeatureItem | undefined => {
  return state.items.find(item => item.id === id);
};

export const getItemCount = (state: FeatureState): number => {
  return state.items.length;
};
```

### `state.ts` - State Management
- **Purpose**: Initial state and state utilities
- **Contains**:
  - Initial state creation
  - State persistence logic (localStorage)
  - State validation functions
  - Migration utilities

**Example:**
```typescript
import { useLocalStorage } from '@vueuse/core';
import type { FeatureState } from './types';

export const createInitialState = () => {
  return {
    items: useLocalStorage<FeatureItem[]>('feature-items', []),
    selectedId: useLocalStorage<string | null>('feature-selected', null)
  };
};
```

### `utils.ts` - Pure Functions
- **Purpose**: Utility functions and transformations
- **Contains**:
  - Pure helper functions
  - Data transformations
  - Validation functions
  - Format converters

**Example:**
```typescript
export const validateItemName = (name: string): boolean => {
  return name.length > 0 && name.length <= 100;
};

export const sortItemsByName = (items: FeatureItem[]): FeatureItem[] => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
};
```

### `constants.ts` - Static Data
- **Purpose**: Configuration and default values
- **Contains**:
  - Default data sets
  - Configuration constants
  - Enum mappings
  - Static lookup tables

**Example:**
```typescript
export const DEFAULT_ITEMS: FeatureItem[] = [
  { id: '1', name: 'Default Item', createdAt: '2024-01-01' }
];

export const ITEM_TYPES = {
  USER: 'user',
  SYSTEM: 'system',
  IMPORTED: 'imported'
} as const;
```

### `services.ts` - External Integrations (Optional)
- **Purpose**: External service integrations
- **Contains**:
  - API client functions
  - Third-party service integrations
  - Complex localStorage operations
  - File system operations

## Implementation Guidelines

### Import Strategy
```typescript
// From components - use the main store export
import { useFeatureStore } from '@/stores/feature'
import type { FeatureItem } from '@/stores/feature/types'

// From within store files - use relative imports
import type { FeatureItem } from './types'
import { validateItemName } from './utils'
import { DEFAULT_ITEMS } from './constants'
```

### Naming Conventions
- **Store names**: `useFeatureStore` (camelCase)
- **File names**: `kebab-case.ts`
- **Types**: `PascalCase` for interfaces, `camelCase` for properties
- **Constants**: `UPPER_SNAKE_CASE`
- **Functions**: `camelCase`

### State Management Best Practices
1. **Use useLocalStorage** for persistent state in `state.ts`
2. **Keep actions pure** when possible
3. **Use getters for computed values** instead of computing in components
4. **Validate data** in actions before mutations
5. **Handle errors gracefully** with try-catch blocks

### Migration Strategy
For existing single-file stores:

1. **Create new folder structure** for the feature
2. **Move types** to `types.ts`
3. **Extract actions** to `actions.ts`
4. **Extract getters** to `getters.ts`
5. **Set up state management** in `state.ts`
6. **Update imports** in components
7. **Add backward compatibility** exports if needed
8. **Remove old store file** after verification

## Example Implementation: Colors Store

The colors store has been successfully migrated to this convention:

```
src/stores/colors/
├── index.ts          # Main useColorsStore export
├── types.ts          # ColorPalette, ColorHistory, etc.
├── actions.ts        # createPalette, updatePalette, etc.
├── getters.ts        # getPaletteById, getRecentColors, etc.
├── state.ts          # localStorage integration
├── utils.ts          # ColorConverter, validation, etc.
└── constants.ts      # DEFAULT_PALETTES, COLOR_SOURCES, etc.
```

### Import Examples:
```typescript
// Component usage
import { useColorsStore } from '@/stores/colors'
import type { ColorPalette } from '@/stores/colors'

// Legacy compatibility (still supported)
import { usePaletteStore } from '@/stores/colors'
```

## Benefits of This Convention

### 1. **Scalability**
- Each file has a single responsibility
- Easy to add new features without bloating existing files
- Clear structure for team development

### 2. **Maintainability**
- Predictable file locations
- Consistent organization across features
- Easy to find and modify specific functionality

### 3. **Type Safety**
- Centralized type definitions
- Strong typing throughout the store
- Better IDE support and autocomplete

### 4. **Testability**
- Pure functions in utils.ts are easily testable
- Actions can be tested independently
- Getters can be tested with mock state

### 5. **Performance**
- Tree-shaking friendly structure
- Selective imports reduce bundle size
- Clear separation of concerns

## Migration Checklist

When migrating existing stores:

- [ ] Create new folder structure
- [ ] Extract and organize types
- [ ] Split actions and getters
- [ ] Set up state management
- [ ] Update all component imports
- [ ] Test functionality thoroughly
- [ ] Update documentation
- [ ] Remove old store file
- [ ] Update store registry

## Future Considerations

### Store Composition
For complex features, consider sub-stores:
```
src/stores/feature/
├── index.ts
├── core/           # Core feature store
│   ├── index.ts
│   ├── types.ts
│   └── ...
└── advanced/       # Advanced feature store
    ├── index.ts
    ├── types.ts
    └── ...
```

### Plugin Integration
Stores can be enhanced with Pinia plugins:
- State persistence plugins
- DevTools integration
- Undo/redo functionality
- Real-time synchronization

This convention provides a solid foundation for scalable, maintainable store architecture while maintaining flexibility for future enhancements.