import '@chesscom/design-system/dist/variables.css'
import '@chesscom/design-system/dist/cc-utils.css'
import '@chesscom/design-system/dist/style.css'

import { createApp } from 'vue'

// #region agent log
fetch('http://127.0.0.1:7249/ingest/fd793dea-b233-4457-aa9c-fda6b0d9d190',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ee0b0a'},body:JSON.stringify({sessionId:'ee0b0a',location:'main.js:7',message:'main.js before App import',data:{},timestamp:Date.now(),hypothesisId:'H-E'})}).catch(()=>{});
// #endregion

let App
try {
  App = (await import('./App.vue')).default
// #region agent log
  fetch('http://127.0.0.1:7249/ingest/fd793dea-b233-4457-aa9c-fda6b0d9d190',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ee0b0a'},body:JSON.stringify({sessionId:'ee0b0a',location:'main.js:13',message:'App imported successfully',data:{appType:typeof App},timestamp:Date.now(),hypothesisId:'H-E'})}).catch(()=>{});
// #endregion
} catch(e) {
// #region agent log
  fetch('http://127.0.0.1:7249/ingest/fd793dea-b233-4457-aa9c-fda6b0d9d190',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ee0b0a'},body:JSON.stringify({sessionId:'ee0b0a',location:'main.js:17',message:'App import FAILED',data:{error:String(e),stack:e?.stack?.slice(0,500)},timestamp:Date.now(),hypothesisId:'H-E'})}).catch(()=>{});
// #endregion
}

document.body.classList.add('dark-mode')

try {
  const app = createApp(App)
  app.provide('design-system-key', {
    trans: { Back: 'Back', Close: 'Close' },
    routes: { webMemberView: () => '#' },
  })
  app.config.errorHandler = (err, vm, info) => {
// #region agent log
    fetch('http://127.0.0.1:7249/ingest/fd793dea-b233-4457-aa9c-fda6b0d9d190',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ee0b0a'},body:JSON.stringify({sessionId:'ee0b0a',location:'main.js:errorHandler',message:'Vue runtime error',data:{error:String(err),stack:err?.stack?.slice(0,500),info},timestamp:Date.now(),hypothesisId:'H-A'})}).catch(()=>{});
// #endregion
  }
  app.mount('#app')
// #region agent log
  fetch('http://127.0.0.1:7249/ingest/fd793dea-b233-4457-aa9c-fda6b0d9d190',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ee0b0a'},body:JSON.stringify({sessionId:'ee0b0a',location:'main.js:mount',message:'App mounted',data:{},timestamp:Date.now(),hypothesisId:'H-E'})}).catch(()=>{});
// #endregion
} catch(e) {
// #region agent log
  fetch('http://127.0.0.1:7249/ingest/fd793dea-b233-4457-aa9c-fda6b0d9d190',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ee0b0a'},body:JSON.stringify({sessionId:'ee0b0a',location:'main.js:mountError',message:'Mount FAILED',data:{error:String(e),stack:e?.stack?.slice(0,500)},timestamp:Date.now(),hypothesisId:'H-E'})}).catch(()=>{});
// #endregion
}
