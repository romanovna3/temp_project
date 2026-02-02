import '@chesscom/design-system/dist/variables.css'
import '@chesscom/design-system/dist/cc-utils.css'
import '@chesscom/design-system/dist/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Dark mode by default: html and body have .dark-mode in index.html (WEB-DS-PACKAGE-SETUP)
createApp(App).use(router).mount('#app')
