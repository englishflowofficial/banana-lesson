// `vitest/config` re-exports Vite's defineConfig with the `test` block typed.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages project site lives at https://englishflowofficial.github.io/banana-lesson/
// so every emitted asset URL must be prefixed with the repository name.
export default defineConfig({
  base: '/banana-lesson/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    // The sandbox preview proxies the dev server through its own host name.
    allowedHosts: true,
    port: 5173,
  },
  preview: {
    host: true,
    allowedHosts: true,
    port: 4173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
