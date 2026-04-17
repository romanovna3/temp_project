/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

/** Matches ChessDesign Pages deploy; override with `VITE_BASE=/` for root hosting. */
export default defineConfig({
  base: process.env.VITE_BASE ?? '/ChessDesign/game-review-layout/',
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
    port: 5174,
    strictPort: false,
  },
  test: {
    environment: 'jsdom',
  },
})
