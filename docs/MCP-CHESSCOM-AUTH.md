# Chess.com Design System MCP – setup and auth

This project’s MCP config follows the **official** [Chess.com Design System CURSOR-SETUP.md](https://github.com/ChessCom/design-system/blob/main/mcp/CURSOR-SETUP.md). Use that doc for full troubleshooting; below is the minimal setup that makes the MCP work.

## Why Cursor needs global npm config

When Cursor runs the MCP, it runs **outside your project directory**. So:

- Project-level `.npmrc` (e.g. in `my-app/`) is **not** used by Cursor.
- You must configure your **global** `~/.npmrc` (your user home directory).

You need **both** of these in `~/.npmrc`:

1. **Registry scope** – so npm looks at GitHub Packages for `@chesscom`:
   ```ini
   @chesscom:registry=https://npm.pkg.github.com
   ```
2. **Auth token** – so npm can access that registry:
   ```ini
   //npm.pkg.github.com/:_authToken=YOUR_TOKEN_HERE
   ```

If the registry line is missing, you get **404** (npm looks at npmjs.org). If the token is missing or wrong, you get **401** or **403**.

---

## Step 1: Configure global `~/.npmrc`

**Option A – GitHub CLI (recommended)**

```bash
# Ensure gh has read:packages
gh auth refresh -h github.com -s read:packages

# Add registry (only if not already there)
npm config set @chesscom:registry https://npm.pkg.github.com

# Add token (replace existing if any)
# macOS/Linux: remove old line then append new token
sed -i.bak '/^\/\/npm.pkg.github.com\/:_authToken/d' ~/.npmrc 2>/dev/null || true
echo "//npm.pkg.github.com/:_authToken=$(gh auth token)" >> ~/.npmrc
```

**Option B – Personal Access Token**

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
2. **Generate new token (classic)**; name it e.g. `npm-github-packages`.
3. Scope: enable **read:packages** (and **repo** if the package or repo is private). If your org uses SSO, click **Configure** next to the org and authorize the token for that org.
4. Generate and copy the token.

Then run:

```bash
npm config set @chesscom:registry https://npm.pkg.github.com

# Remove old token line, then add new one (replace YOUR_TOKEN with the real token)
sed -i.bak '/^\/\/npm.pkg.github.com\/:_authToken/d' ~/.npmrc 2>/dev/null || true
echo "//npm.pkg.github.com/:_authToken=YOUR_TOKEN" >> ~/.npmrc
```

---

## Step 2: Verify it works

**Check that npm can see the MCP package:**

```bash
npm view @chesscom/design-system-mcp --registry=https://npm.pkg.github.com
```

You should see package metadata (name, version, etc.). If you see **401** or **403**, the token is missing, expired, or lacks `read:packages` (or SSO for the org). If you see **404**, the registry line is missing from `~/.npmrc`.

**Check that the MCP server can start:**

```bash
npx -p @chesscom/design-system-mcp chesscom-ds-mcp
```

You should see something like: `Chess.com Design System MCP Server running on stdio`. Press Ctrl+C to exit.

---

## Step 3: Restart Cursor

After changing `~/.npmrc`, **restart Cursor** and check **Settings → MCP**. The `chesscom-design-system` server should connect.

---

## Project MCP config (already set)

This repo’s `.cursor/mcp.json` uses the official command:

```json
"chesscom-design-system": {
  "command": "npx",
  "args": ["-y", "-p", "@chesscom/design-system-mcp@latest", "chesscom-ds-mcp"]
}
```

No project-level install is required; Cursor runs `npx` and npm uses your **global** `~/.npmrc`.

---

## Quick reference

| Problem   | Likely cause              | Fix |
|----------|----------------------------|-----|
| 404      | Registry scope missing     | `npm config set @chesscom:registry https://npm.pkg.github.com` and ensure it’s in `~/.npmrc` |
| 401      | No or bad token            | Add/update `//npm.pkg.github.com/:_authToken=...` in `~/.npmrc` (see Step 1) |
| 403      | Token scope or SSO          | New token with `read:packages`; if org uses SSO, authorize the token for that org |
| MCP crash| Wrong npx args / executable | Use exact args above: `-y`, `-p`, `@chesscom/design-system-mcp@latest`, `chesscom-ds-mcp` |

For the full checklist and more troubleshooting, use the official **CURSOR-SETUP.md** from the design-system repo.
