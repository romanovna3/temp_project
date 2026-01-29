#!/bin/sh
# Create repo under romanovna3 and push. Run from project root.
# Requires: gh CLI (brew install gh) and gh auth login

set -e
cd "$(dirname "$0")"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is not installed."
  echo "Install it: https://cli.github.com/ (e.g. brew install gh)"
  exit 1
fi

if [ ! -d .git ]; then
  git init
  git add .
  git commit -m "Initial commit"
fi

gh repo create romanovna3/temp_project --public --source=. --remote=origin --push
echo ""
echo "Repo created and pushed: https://github.com/romanovna3/temp_project"
