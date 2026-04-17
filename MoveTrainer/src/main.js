import '@chesscom/design-system/dist/variables.css'
import '@chesscom/design-system/dist/cc-utils.css'
import '@chesscom/design-system/dist/style.css'

import { createApp } from 'vue'
import App from './App.vue'

document.body.classList.add('dark-mode')

const app = createApp(App)
app.provide('design-system-key', {
  trans: { Back: 'Back', Close: 'Close' },
  routes: { webMemberView: () => '#' },
})
app.mount('#app')
