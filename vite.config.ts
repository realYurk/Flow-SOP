import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: './',
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  },
  server: { port: 5173 },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Reduce bundle size
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          'vendor-vue':   ['vue', 'pinia'],
          'vendor-hljs':  ['highlight.js'],
          'vendor-mermaid': ['mermaid'],
        }
      }
    },
    // Warn if chunk > 800kb
    chunkSizeWarningLimit: 800,
  }
})
