import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'

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
  },
})
