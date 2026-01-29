import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Use root in dev so http://127.0.0.1:5173/ loads the app; set VITE_BASE for deploy (e.g. /temp_project/my-app/)
  base: process.env.VITE_BASE || (process.env.NODE_ENV === 'development' ? '/' : '/temp_project/my-app/'),
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: true,
  },
})
