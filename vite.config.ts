import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';

const root = resolve(__dirname);
const outDir = resolve(__dirname, 'dist');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),

  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {},

  build: {
    outDir,
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: resolve(root, 'pop.html'),
        webpage: resolve(root, 'index.html'),
        full: resolve(root, 'web-tools.html'),
      }
    }
  }
})