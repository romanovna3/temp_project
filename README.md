# Chess.com Prototype (Cursor Setup)

Zero to Hero: Building a Chess.com Prototype with Cursor.

## What’s already done

- **Part 1:** Node (v25) and Git are installed.
- **Part 4:** Design system rules for Cursor: `.cursor/rules/design-system.mdc`
- **Part 3:** Vue app in `my-app/` with:
  - Vue 3 + Vite
  - `.npmrc` for `@chesscom` registry
  - Design system CSS in `src/main.js`
  - Sample `CcButton` and `CcIcon` in `App.vue`
- **Part 5:** GitHub Actions workflow: `.github/workflows/deploy.yml` (deploys `my-app` to GitHub Pages on push to `main`)

**Setting up on a new computer?** Use **[docs/SETUP-NEW-MACHINE.md](docs/SETUP-NEW-MACHINE.md)** for step-by-step instructions (Homebrew, Node, Cursor, MCP, npm token, and common mistakes).

## What you need to do

### 1. Part 2: GitHub and npm token (if not done)

- Be in the **chess-com** GitHub org (ask your manager or Design System team).
- Create a **Personal Access Token (classic)** with `read:packages` (and `repo` if you’ll push).
- Configure npm (run once, replace with your token):

  ```bash
  npm config set //npm.pkg.github.com/:_authToken YOUR_TOKEN_HERE
  ```

### 2. Install dependencies and create lockfile

From the **project root**:

```bash
cd my-app
npm install
cd ..
```

This creates `my-app/package-lock.json` so the GitHub Actions workflow can run `npm ci`.

### 3. Run locally

```bash
cd my-app
npm run dev
```

### 4. Serve the website from GitHub Pages

1. **Enable GitHub Pages**  
   On GitHub: open **romanovna3/temp_project** → **Settings** → **Pages**.  
   Under **Build and deployment**, set **Source** to **GitHub Actions**.

2. **Add NPM token** (needed to install `@chesscom` design system in CI)  
   **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.  
   - Name: **NPM_TOKEN**  
   - Value: a GitHub Personal Access Token (classic) with scope **read:packages** (and **repo** if the package is in a private repo).

3. **Deploy**  
   Push to `main` (or re-run the **Deploy to GitHub Pages** workflow from the **Actions** tab).  
   The workflow builds the app and deploys it to GitHub Pages.

4. **Your live site**  
   After the workflow succeeds: **https://romanovna3.github.io/temp_project/**

## Daily workflow

- Use **Cursor + MCP**: ask for components, tokens, icons, and “implement this Figma design: [URL]”.
- Edit in Cursor → run `npm run dev` in `my-app` → commit and push to deploy.

## Troubleshooting

- **`npm install` fails for design-system:** Check PAT has `read:packages`, run `npm config list`, confirm you’re in chess-com org.
- **MCP not working:** Restart Cursor, check MCP settings, confirm servers are running.
- **Build fails on GitHub Actions:** Check **NPM_TOKEN** secret and that the token hasn’t expired.
