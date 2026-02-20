import '@chesscom/design-system/dist/variables.css'
import '@chesscom/design-system/dist/cc-utils.css'
import '@chesscom/design-system/dist/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Catch unhandled errors so the app doesn’t show Error -102 / blank screen
try {
  const app = createApp(App)
  app.config.errorHandler = (err, instance, info) => {
    console.error('[Vue error]', info, err)
  }
  app.use(router)
  app.mount('#app')
} catch (err) {
  console.error('[App bootstrap error]', err)
  const root = document.getElementById('app')
  if (root) {
    root.innerHTML = '<div style="padding:2rem;color:#fff;font-family:system-ui,sans-serif;background:#312e2b;min-height:100vh">Something went wrong. Check the browser console (F12) for details.</div>'
  }
}
