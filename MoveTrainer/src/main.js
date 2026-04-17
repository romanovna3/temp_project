import '@chesscom/design-system/dist/variables.css'
import '@chesscom/design-system/dist/cc-utils.css'
import '@chesscom/design-system/dist/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.config.errorHandler = (err, _instance, info) => {
  console.error('[Vue error]', info, err)
}
app.use(router)
app.mount('#app')
