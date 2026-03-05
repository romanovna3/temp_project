# GitHub Actions: NPM_TOKEN and 401 Unauthorized

When the deploy workflow fails with **401 Unauthorized** on `npm ci` (downloading `@chesscom/design-system`), use this checklist.

## 1. Secret is set and named correctly

- Repo → **Settings** → **Secrets and variables** → **Actions**
- There must be a **repository secret** named exactly **`NPM_TOKEN`** (all caps).
- If you see "Check NPM_TOKEN" failing with "NPM_TOKEN secret is not set", add or rename the secret.

## 2. Token type and scopes

- **Classic PAT (recommended):** GitHub → Settings (your profile) → Developer settings → Personal access tokens → Tokens (classic).
- Create a token with:
  - **read:packages** — required to pull from GitHub Packages.
  - **repo** — required if `@chesscom/design-system` is in a **private** repo (so the token can see that repo’s packages).

If the package is **public** under the `@chesscom` org, `read:packages` alone can be enough. If it’s private, you need `repo` (or a token from an account that has access to that org/repo).

## 3. Who can access `@chesscom` packages?

The package is under the **@chesscom** scope on `npm.pkg.github.com`. So:

- If **you** publish `@chesscom/design-system` under your user: your PAT with `read:packages` is enough.
- If the package is under the **Chess.com organization**: your GitHub user must have **read access to that org’s packages**. Options:
  - You are a member of the org and the package is visible to you, **or**
  - The org has granted your user (or the repo) access to the package, **or**
  - You use a **token from a user who does have access** (e.g. a teammate) as `NPM_TOKEN`.

If you’re not in the org and don’t have access, you’ll get 401 even with a valid PAT. In that case you need the org admin to grant package read access, or to use a token from someone who already has access.

## 4. Regenerate and update the secret

- Create a **new** classic PAT with `read:packages` (and `repo` if needed).
- In the repo: **Settings** → **Secrets and variables** → **Actions** → **NPM_TOKEN** → **Update**; paste the new token and save.
- Re-run the failed workflow (Actions → run → Re-run all jobs).

## 5. Verify locally (same token)

On your machine (replace with your token):

```bash
npm config set //npm.pkg.github.com/:_authToken YOUR_TOKEN_HERE
cd my-app && npm ci
```

If this works locally but CI still gets 401, the token in the repo secret may be different, expired, or the CI runner may not have access to the same org packages (see section 3).
