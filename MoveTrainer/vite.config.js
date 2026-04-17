import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  base: '/ChessDesign/game-review-layout/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Only change vs macakuaya/ChessDesign monorepo: vendored `shared/` lives beside this app (`../../shared` upstream).
      '@chess/components': fileURLToPath(new URL('./shared/chess-components', import.meta.url)),
      '@chesscom/design-system': fileURLToPath(new URL('./node_modules/@chesscom/design-system', import.meta.url))
    },
  },
})
