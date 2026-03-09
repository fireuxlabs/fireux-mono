#!/usr/bin/env bash
set -euo pipefail

echo "gitsave cleanup: moving reports and removing build artifacts"

trim() {
  # shellcheck disable=SC2001
  echo "$1" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

# Move root report markdown files into scripts/reports
mkdir -p scripts/reports
for f in collection-manager-report.md global-entities-report.md handle-system-report.md page-meta-report.md; do
  if [ -f "$f" ]; then
    dest="scripts/reports/$f"
    if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
      git mv "$f" "$dest" 2>/dev/null || mv "$f" "$dest"
    else
      mv "$f" "$dest" || true
    fi
    echo "Moved $f -> $dest"
  fi
done

# Remove common forbidden build artifacts from project roots
for proj in projects/*/* projects/*; do
  if [ -d "$proj" ]; then
    for d in .firebase .output; do
      if [ -d "$proj/$d" ]; then
        rm -rf "$proj/$d"
        git rm -r --ignore-unmatch "$proj/$d" || true
        echo "Removed $proj/$d"
      fi
    done
    if [ -f "$proj/firebase-debug.log" ]; then
      rm -f "$proj/firebase-debug.log"
      git rm --ignore-unmatch "$proj/firebase-debug.log" || true
      echo "Removed $proj/firebase-debug.log"
    fi
  fi
done

# Move ecosystem-level accidental 'apps' into src and ensure docs exists
ECO=packages/ecosystem/fireux-fireux
if [ -d "$ECO/apps" ]; then
  mkdir -p "$ECO/src"
  mkdir -p "$ECO/docs"
  git mv "$ECO/apps" "$ECO/src/apps" 2>/dev/null || mv "$ECO/apps" "$ECO/src/apps"
  echo "Moved $ECO/apps -> $ECO/src/apps"
fi

if [ ! -d "$ECO/docs" ]; then
  mkdir -p "$ECO/docs"
fi

echo "gitsave cleanup: pruning stale worktree metadata"
git worktree prune || true

current_worktree="$(pwd -P)"
current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')"

cleanup_worktree() {
  local target="$1"
  local reason="$2"

  if [ ! -d "$target" ]; then
    git worktree remove --force "$target" 2>/dev/null || true
    echo "Removed stale worktree record: $target ($reason)"
    return
  fi

  if ! git -C "$target" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    rm -rf "$target" || true
    git worktree remove --force "$target" 2>/dev/null || true
    echo "Removed invalid worktree path: $target ($reason)"
    return
  fi

  local dirty
  dirty="$(git -C "$target" status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
  if [ "${dirty}" != "0" ]; then
    echo "Skipping dirty worktree: $target"
    return
  fi

  git worktree remove --force "$target" 2>/dev/null || rm -rf "$target" || true
  echo "Removed extra worktree: $target ($reason)"
}

while IFS= read -r line; do
  if [[ "$line" == worktree\ * ]]; then
    wt="${line#worktree }"
    branch=""
    detached=false
    continue
  fi

  if [[ "$line" == branch\ * ]]; then
    branch="${line#branch }"
    continue
  fi

  if [[ "$line" == detached ]]; then
    detached=true
    continue
  fi

  if [[ -z "$line" ]]; then
    wt_real="$(cd "$(dirname "$wt")" 2>/dev/null && pwd -P)/$(basename "$wt")"
    if [ "$wt_real" = "$current_worktree" ]; then
      continue
    fi

    if [[ "$wt_real" == "$HOME/.codex/worktrees/"* ]]; then
      if $detached; then
        cleanup_worktree "$wt_real" "detached codex scratch"
      elif [[ "$branch" == refs/heads/codex/* ]]; then
        cleanup_worktree "$wt_real" "codex branch worktree"
      fi
    fi
  fi
done < <(git worktree list --porcelain)

echo "gitsave cleanup: pruning merged codex branches"
while IFS= read -r branch; do
  branch="$(trim "$branch")"
  [ -n "$branch" ] || continue
  [ "$branch" != "$current_branch" ] || continue
  [[ "$branch" == codex/* ]] || continue
  git branch -D "$branch" >/dev/null 2>&1 || true
  echo "Deleted merged scratch branch: $branch"
done < <(git for-each-ref --format='%(refname:short)' --merged HEAD refs/heads)

echo "gitsave cleanup complete."
