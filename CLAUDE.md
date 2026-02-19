# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mini Dev Tools — a Chrome Extension (Manifest v3) built with Vue 3 + TypeScript providing developer utilities (color tools, text tools, UUID/password/hash generators, JWT decoder, screenshot, etc.). Also runs as a standalone web app.

## Commands

```bash
# Development
npm run dev              # Vite dev server
npm run watch:all        # Watch both src (Vite) and public files

# Build (type-checks then builds, copies public files to dist/)
npm run build

# Type checking only
npx vue-tsc --noEmit

# Format
npx prettier --write .

# Package for Chrome Web Store
npm run package          # Creates chrome-extension.zip from dist/

# Safari conversion
make safari              # Converts dist/ to Safari extension
```

No test framework is configured.

## Architecture

### Entry Points

Three HTML entry points built by Vite (configured in `vite.config.ts`):
- **`pop.html`** — Extension popup (compact, 700px max-width)
- **`web-tools.html`** — Full options/tools page
- **`index.html`** — Standalone web version

All three mount the same Vue app from `src/main.ts` → `src/App.vue`.

### Extension Scripts (in `public/`, plain JS, not bundled by Vite)

- **`background.js`** — Service worker: screenshots, recording, color picker, window resizer, website blocking, context menus, message routing
- **`content.js`** — Content script: full-page screenshot scrolling, EyeDropper API, script injection (URL pattern matching), recording control
- **`offscreen.js`** — MediaRecorder for screen/tab recording
- **`whatsapp-blur.js`** — WhatsApp Web privacy blur feature

These are copied to `dist/` during build, not processed by Vite.

### Vue App Structure

- **`src/views/`** — 27 tool pages, routed via Vue Router (`src/router/`)
- **`src/components/ui/`** — shadcn-vue components (50+); add new ones via `npx shadcn-vue@latest add <component>`
- **`src/components/colors/`** and **`src/components/elements/`** — Domain-specific components
- **`src/stores/`** — Pinia stores; feature stores use a modular folder convention (see `store-conventions.md`):
  ```
  stores/{feature}/index.ts, types.ts, actions.ts, getters.ts, state.ts, utils.ts, constants.ts
  ```
- **`src/helpers/`** — Utility functions (color conversions, text utils, file generation)
- **`src/services/`** — Business logic (e.g., screenshot service)

### Path Alias

`@/` resolves to `./src/` (configured in both `vite.config.ts` and `tsconfig.json`).

### Styling

Tailwind CSS 3 + SCSS. Responsive breakpoints: mobile (<640px), popup (640–767px), desktop (≥768px). Light/dark theme support via CSS variables.

## Code Conventions

- Vue 3 Composition API (`<script setup lang="ts">`)
- Prettier: single quotes, no trailing commas, semicolons, 80 char width
- Store naming: `useFeatureStore` (camelCase); types in PascalCase; constants in UPPER_SNAKE_CASE
- Components import from `@/stores/feature`; internal store files use relative imports
- State persistence via `useLocalStorage` from `@vueuse/core` or Chrome `storage` API
