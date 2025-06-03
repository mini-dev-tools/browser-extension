import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
// import { visualizer } from 'rollup-plugin-visualizer';

const root = resolve(__dirname);
const outDir = resolve(__dirname, 'dist');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // visualizer({
    //   filename: './dist/stats.html',
    //   open: true,
    //   gzipSize: true,
    //   brotliSize: true,
    //   template: 'treemap', // or 'sunburst', 'network', 'raw-data', 'list'
    // }),
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