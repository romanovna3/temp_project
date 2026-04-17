import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function getBuildTime() {
  try {
    const raw = fs.readFileSync('build-time.json', 'utf8')
    const { buildTime } = JSON.parse(raw)
    return buildTime || new Date().toISOString()
  } catch {
    return new Date().toISOString()
  }
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@move-trainer': path.resolve(__dirname, '../MoveTrainer/src'),
      '@chess/components': path.resolve(__dirname, '../MoveTrainer/shared/chess-components'),
      // Ensure DS resolves when bundling files under ../MoveTrainer (outside default root)
      '@chesscom/design-system': path.resolve(__dirname, 'node_modules/@chesscom/design-system'),
    },
  },
  define: {
    __BUILD_TIME__: JSON.stringify(getBuildTime()),
  },
  // Default base '/' so dev and preview load at root; set VITE_BASE for deploy (e.g. /temp_project/my-app/)
  base: process.env.VITE_BASE || '/',
  server: {
    host: true, // listen on 0.0.0.0 so both 127.0.0.1 and localhost work
    port: 5173,
    strictPort: false, // use next port if 5173 is taken
    open: true,
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
})
