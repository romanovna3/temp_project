import '@chesscom/design-system/dist/variables.css'
import '@chesscom/design-system/dist/cc-utils.css'
import '@chesscom/design-system/dist/style.css'

import { createApp } from 'vue'
import { provideDesignSystem } from '@chesscom/design-system'
import App from './App.vue'
import router from './router/index.js'

document.body.classList.add('dark-mode')

const app = createApp(App)
app.use(router)
provideDesignSystem(app, {
  trans: { Back: 'Back', Close: 'Close' },
  routes: { webMemberView: () => '#' },
  features: [],
})
app.mount('#app')
