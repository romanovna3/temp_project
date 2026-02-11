# Full Setup: Clone This Environment on a New Computer

This document walks through **every step** to replicate the Cursor + MCP + Vue project setup on a new machine. Nothing is skipped. Use it when setting up a second computer or onboarding.

---

## Prerequisites

- A **new Mac** (this guide is written for macOS; adjust paths/commands for Windows/Linux where noted).
- **GitHub account** in the same org that has access to `@chesscom` packages (e.g. chess-com org).
- **Cursor** installed from [cursor.com](https://cursor.com) (or you’ll install it in the steps below).

---

## Part 1: System and CLI Basics

### 1.1 Xcode Command Line Tools (macOS)

Required for `git`, `make`, and compilers used by some npm native modules.

1. Open **Terminal** (Spotlight: `Cmd+Space` → “Terminal”).
2. Run:
   ```bash
   xcode-select --install
   ```
3. If a dialog appears, click **Install** and wait for it to finish.
4. Verify:
   ```bash
   git --version
   ```
   You should see a version (e.g. `git version 2.x.x`).

**If you see “command not found”:** Run the install again and restart the terminal.

---

### 1.2 Homebrew (macOS/Linux)

Used to install Node and other tools in a consistent way.

1. Install Homebrew (from [brew.sh](https://brew.sh)):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. Follow the on-screen instructions (you may need to add Brew to your `PATH` as it suggests).
3. Verify:
   ```bash
   brew --version
   ```

**Common mistake:** Forgetting to run the “Add Homebrew to your PATH” commands that the installer prints (e.g. for Apple Silicon). Copy-paste those into your terminal and run them.

---

### 1.3 Node.js

The project and CI use **Node 20** (see `.github/workflows/deploy.yml`). Using the same version locally avoids “works on my machine” issues.

**Option A – Homebrew (simplest):**

```bash
brew install node@20
brew link --overwrite node@20
```

**Option B – nvm (good if you need multiple Node versions):**

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# Restart terminal or: source ~/.zshrc
nvm install 20
nvm use 20
nvm alias default 20
```

Verify:

```bash
node --version   # should be v20.x.x
npm --version   # should be 10.x or similar
```

**Common mistake:** Using a very old Node (e.g. 16) or a pre-release (e.g. 25) when CI uses 20; stick to **Node 20** unless you have a reason not to.

---

### 1.4 Git identity (if not already set)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Optional: set the default branch name:

```bash
git config --global init.defaultBranch main
```

---

## Part 2: GitHub and npm authentication

The app depends on the **@chesscom** npm package from GitHub Packages. You must authenticate npm to `npm.pkg.github.com`.

### 2.1 GitHub Personal Access Token (PAT)

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
2. **Generate new token (classic)**.
3. Name it something like `npm-packages-new-machine`.
4. Scopes:
   - **read:packages** (required to pull `@chesscom/design-system`).
   - **repo** (needed if the package or this repo is private and you push).
5. Generate and **copy the token** (you won’t see it again).

### 2.2 Configure npm to use the token

Run **once** (replace with your real token):

```bash
npm config set //npm.pkg.github.com/:_authToken YOUR_TOKEN_HERE
```

Verify (token will be hidden):

```bash
npm config get //npm.pkg.github.com/:_authToken
# Should output your token; if empty, the set command failed or was wrong.
```

**Common mistakes:**

- Using the wrong scope (missing `read:packages`) → `npm install` will fail with 404 or 401 for `@chesscom/design-system`.
- Configuring the token in the project only (e.g. `.env`) but not in global npm config → `npm install` in `my-app` can still fail; the npm config above is what npm uses for `npm.pkg.github.com`.

---

## Part 3: Cursor IDE

### 3.1 Install Cursor

1. Go to [cursor.com](https://cursor.com) and download the macOS app.
2. Install (drag to Applications if needed).
3. Open Cursor and complete any first-run sign-in or setup.

### 3.2 Open the project in Cursor

Do this **after** you’ve cloned the repo (see Part 4). In Cursor: **File → Open Folder** and choose the project root (the folder that contains `my-app` and `.cursor`).

---

## Part 4: Clone the repo and install dependencies

### 4.1 Clone

From a directory where you keep projects (e.g. `~/projects`):

```bash
cd ~/projects   # or your preferred path
git clone https://github.com/YOUR_ORG/temp_project.git
cd temp_project
```

Replace `YOUR_ORG` with the real org or username (e.g. `romanovna3`).

If you use SSH:

```bash
git clone git@github.com:YOUR_ORG/temp_project.git
cd temp_project
```

### 4.2 Install app dependencies

From the **project root** (`temp_project`):

```bash
cd my-app
npm install
cd ..
```

You should see `node_modules` and `package-lock.json` in `my-app/`. If you get **404** or **401** on `@chesscom/design-system`, go back to Part 2 and fix the npm token and scopes.

**Common mistake:** Running `npm install` from the project root instead of from `my-app`. The `package.json` and `.npmrc` live in `my-app/`; always run `npm install` (and `npm run dev`) from **inside** `my-app`.

---

## Part 5: MCP (Model Context Protocol) setup

MCP gives Cursor access to Figma, the browser, and (if configured) the Chess.com Design System. Configuration can live in the **project** or in your **user** Cursor config.

### 5.1 Project-level MCP (already in the repo)

The repo has **`.cursor/mcp.json`**. Once you’ve opened this project in Cursor, these servers are used when you work in this folder:

- **Figma Desktop** – talks to the Figma desktop app (URL transport).
- **Browser MCP** – uses `npx @browsermcp/mcp` (stdio).

You don’t need to copy this file manually; it’s in the repo. Just ensure Cursor has **opened the project folder** that contains `.cursor/`.

### 5.2 Figma Desktop MCP

- **Figma desktop app** must be installed and running.
- The MCP server in `.cursor/mcp.json` points to `http://127.0.0.1:3845/mcp`. The Figma desktop plugin/listener must be enabled so that port is active.
- If Figma MCP doesn’t work: confirm Figma is open, the Figma MCP/plugin is enabled, and no firewall is blocking `127.0.0.1:3845`.

### 5.3 Browser MCP (browsermcp)

- Uses `npx @browsermcp/mcp`. The first time Cursor uses it, `npx` may download the package; allow it.
- If you get “command not found” or timeouts, ensure **Node and npm** are on your PATH (Part 1.3) and try again after a Cursor restart.

### 5.4 User-level / global MCP (e.g. Chess.com Design System, Cursor Browser)

If you use **Chess.com Design System MCP** or **Cursor IDE Browser** (or other MCPs) that are not in `.cursor/mcp.json`, they are usually added **globally**:

1. In Cursor: **Cursor Settings** (gear or Cursor menu) → **Features** → **MCP**.
2. Use **“Add new MCP server”** and fill in the transport (stdio/URL) and command or URL as required by that MCP’s docs.

Or edit the **global** config file:

- **macOS/Linux:** `~/.cursor/mcp.json`
- **Windows:** `%USERPROFILE%\.cursor\mcp.json`

Example structure (merge with any existing `mcpServers`):

```json
{
  "mcpServers": {
    "chesscom-design-system": {
      "command": "npx",
      "args": ["-y", "@chesscom/design-system-mcp"]
    }
  }
}
```

(Use the exact command/args from the Chess.com Design System MCP or Cursor Browser documentation.)

**Common mistake:** Adding a server only in the project’s `.cursor/mcp.json` but the server needing a **global** config (e.g. API keys in `~/.cursor/mcp.json`). If an MCP is documented as “user-level,” configure it in Cursor Settings or `~/.cursor/mcp.json`.

### 5.5 Restart Cursor after MCP changes

After changing `.cursor/mcp.json` or global MCP settings, **restart Cursor** so it reloads MCP servers. Then check **Cursor Settings → MCP** to see that the servers show as connected or running.

---

## Part 6: Cursor rules (in repo)

The project includes **`.cursor/rules/`** with rule files that Cursor applies when working in this repo:

- **design-system.mdc** – Use Chess.com Design System MCP for components/tokens; dark mode default; typography and component usage.
- **crash-debug.mdc** – Error -102 = connection refused; start dev server and use the URL Vite prints.
- **opening-courses-v1-crash-102.mdc** – Specific fixes for the Opening Courses V1 route crash.
- **coach-copy.mdc** – Don’t change coach bubble copy unless the user asks.

These are **already in the repo**. After cloning, they apply automatically when you open the project in Cursor. No extra setup.

---

## Part 7: Run the app locally

1. Open a terminal (in Cursor or external).
2. From the **project root**:
   ```bash
   cd my-app
   npm run dev
   ```
3. Vite will start and print something like:
   ```text
   ➜  Local:   http://127.0.0.1:5173/
   ```
4. Open **that exact URL** in your browser (e.g. `http://127.0.0.1:5173/`). If 5173 is in use, Vite may use 5174; use the URL Vite prints.
5. Keep the terminal running while you use the app.

**If you see “Error Code: -102” in the browser:**

- **-102** = **ERR_CONNECTION_REFUSED**: the browser can’t reach the dev server.
- Fix: Start the dev server (`cd my-app && npm run dev`) and open the URL Vite prints. Don’t use a different port or an old URL.
- See also: `my-app/HOW-TO-RUN.md` and `.cursor/rules/crash-debug.mdc`.

---

## Part 8: Optional – GitHub Pages and CI

If you need to deploy or run the same workflow as this repo:

1. **GitHub Pages**
   - Repo → **Settings** → **Pages**.
   - Under **Build and deployment**, set **Source** to **GitHub Actions**.

2. **NPM_TOKEN secret**
   - Repo → **Settings** → **Secrets and variables** → **Actions**.
   - **New repository secret**: Name **NPM_TOKEN**, Value = your GitHub PAT with `read:packages` (and `repo` if the design system repo is private).
   - The workflow uses this to run `npm ci` and install `@chesscom/design-system` in CI.

3. Push to `main` (or re-run the “Deploy to GitHub Pages” workflow) to deploy. The site will be at `https://<org-or-user>.github.io/temp_project/`.

---

## Checklist summary

Use this to verify nothing was skipped:

- [ ] **System:** Xcode Command Line Tools installed (`git --version` works).
- [ ] **System:** Homebrew installed (`brew --version` works).
- [ ] **System:** Node 20 installed (`node --version` shows v20.x).
- [ ] **Git:** `user.name` and `user.email` set if you plan to commit.
- [ ] **GitHub:** PAT created with `read:packages` (and `repo` if needed).
- [ ] **npm:** `npm config set //npm.pkg.github.com/:_authToken YOUR_TOKEN` run once.
- [ ] **Cursor:** Installed and opened the project folder (the one with `my-app` and `.cursor`).
- [ ] **Repo:** Cloned; `cd my-app && npm install` completed without 404/401.
- [ ] **MCP:** Figma desktop running if using Figma MCP; global MCPs (e.g. Chess.com DS) added in Cursor Settings or `~/.cursor/mcp.json` if you use them; Cursor restarted after MCP changes.
- [ ] **Run:** `cd my-app && npm run dev` and browser opened to the printed URL (e.g. `http://127.0.0.1:5173/`).
- [ ] **Optional:** GitHub Pages source set to GitHub Actions; **NPM_TOKEN** secret added for CI.

---

## Quick reference – commands in order

```bash
# 1. System (run once per machine)
xcode-select --install
# Install Homebrew from https://brew.sh, then:
brew install node@20
brew link --overwrite node@20

# 2. npm auth (run once, use your token)
npm config set //npm.pkg.github.com/:_authToken YOUR_TOKEN_HERE

# 3. Clone and install (from your projects directory)
git clone https://github.com/YOUR_ORG/temp_project.git
cd temp_project/my-app
npm install
cd ..

# 4. Run the app
cd my-app
npm run dev
# Open http://127.0.0.1:5173/ (or the URL Vite prints) in the browser.
```

Then install Cursor, open the `temp_project` folder in Cursor, and configure any global MCPs you need. After that, you have a full clone of the setup described in this document.
