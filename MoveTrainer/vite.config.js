import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/** Local dev: `/`. Deploy like upstream: `VITE_BASE=/ChessDesign/game-review-layout/ npm run build` */
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [vue()],
  server: {
    host: true,
    port: 5174,
    strictPort: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
