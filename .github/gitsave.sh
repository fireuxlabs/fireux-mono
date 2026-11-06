#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
branch="$(git symbolic-ref --quiet --short HEAD || true)"
if [[ "$branch" != "main" ]]; then
  printf 'Git Save requires main. Current branch: %s\n' "${branch:-detached HEAD}" >&2
  exit 1
fi
if [[ "${1:-}" == "--" ]]; then shift; fi
if [[ $# -gt 0 ]]; then
  message="$*"
else
  message="Checkpoint $(date '+%Y-%m-%d %H:%M:%S %z')"
fi
git add -A
if git diff --cached --quiet; then
  echo "No new changes to commit. Pushing existing commits."
else
  git commit -m "$message"
fi
git push origin main
