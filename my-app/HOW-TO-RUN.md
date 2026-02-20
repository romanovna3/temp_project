# How to run the app

**If the page doesn't load or you see "Error Code: -102" / "Connection failed":**  
The dev server isn't reachable at the URL you're using. You must **start the dev server first** and then open **the exact URL** it prints (the port can change).

**Steps:**

1. **Start the dev server** (leave this terminal open):
   ```bash
   cd my-app
   npm run dev
   ```
2. Wait until you see something like:
   ```
   ➜  Local:   http://localhost:5173/
   ➜  Local:   http://127.0.0.1:5173/
   ```
   **The port may be 5174 or another number if 5173 is in use — use the URL from your terminal.**
3. **Open that exact URL** in your browser (e.g. `http://localhost:5173/` or `http://127.0.0.1:5174/`).
   - If you use **Cursor's Preview / Simple Browser**: paste the Local URL from step 2 into the preview address bar. The preview must use the same host and port as the running dev server.
4. **Don't close the terminal** where `npm run dev` is running while you use the app.

**Using `npm run preview` (production build):**
- Run `npm run build` then `npm run preview`.
- Open the URL Vite prints (e.g. `http://localhost:4173/`).

**Still not working?**
- Restart the dev server and use the **new** URL/port it prints.
- If you use a VPN or corporate network, try turning it off temporarily.
- Try another browser or a new window.
