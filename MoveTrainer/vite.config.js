/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

/**
 * Default `/` so local dev (`npm run dev`) matches router paths like `/move-trainer`.
 * Production deploy: set `VITE_BASE=/ChessDesign/game-review-layout/` (or your path).
 */
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@chess/components': fileURLToPath(new URL('./shared/chess-components', import.meta.url)),
      '@chesscom/design-system': fileURLToPath(new URL('./node_modules/@chesscom/design-system', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
  test: {
    environment: 'jsdom',
  },
})
