#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: gitsave [\"commit message\"] [--guard|--no-guard] [--clean|--no-clean]" >&2
  echo "Example: gitsave \"fix: wire places quick add\"" >&2
  echo "Defaults: --no-guard --no-clean" >&2
}

commit_message=""
run_guard=false
run_clean=false

# Parse args
args=()
for a in "$@"; do
  case "$a" in
    --guard) run_guard=true ;;
    --no-guard) run_guard=false ;;
    --clean) run_clean=true ;;
    --no-clean) run_clean=false ;;
    -h|--help) usage; exit 0 ;;
    *) args+=("$a") ;;
  esac
done

commit_message="${args[*]:-}"

# Ensure we are inside a Git repository.
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: not inside a git repository" >&2
  exit 1
fi

current_branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$current_branch" != "main" ]]; then
  echo "Warning: current branch is '$current_branch', not 'main'." >&2
  echo "Switch to 'main' if you intend to keep a single-branch workflow." >&2
fi

# Optional clean
if $run_clean; then
  pnpm -s clean || true
fi

# Optional guard
# Optional guard (advisory, not blocking)
if $run_guard; then
  pnpm -s pre-guard-clean || true
  if ! pnpm -s guard; then
    echo "\nGuard failed. You may fix the issues above, or continue and push anyway." >&2
    read -p "Continue and push anyway? [y/N]: " confirm
    case "$confirm" in
      [yY][eE][sS]|[yY])
        echo "Proceeding with push despite guard violations..." >&2
        ;;
      *)
        echo "Aborted by user due to guard violations." >&2
        exit 1
        ;;
    esac
  fi
fi

# Stage everything, including deletions.
git add -A

if git diff --cached --quiet; then
  # If nothing new to commit, still push if we're ahead of upstream.
  if git rev-parse --abbrev-ref --symbolic-full-name "@{u}" >/dev/null 2>&1; then
    ahead_count=$(git rev-list --count "@{u}..HEAD" 2>/dev/null || echo "0")
    if [[ "${ahead_count}" != "0" ]]; then
      echo "No changes to commit, but branch is ahead by ${ahead_count}; pushing..." >&2
      git push origin "$current_branch"
      echo "Saved: pushed $current_branch to origin." >&2
    else
      echo "No changes to commit." >&2
    fi
  else
    echo "No changes to commit (no upstream configured)." >&2
  fi
  exit 0
fi

# Auto-generate a commit message when one is not provided.
if [[ -z "$commit_message" ]]; then
  staged_changes=()
  while IFS= read -r line; do
    staged_changes+=("$line")
  done < <(git diff --cached --name-only)

  if [[ ${#staged_changes[@]} -eq 0 ]]; then
    echo "No staged files detected after add." >&2
    exit 1
  fi

  primary_file="${staged_changes[0]}"
  extra_count=$(( ${#staged_changes[@]} - 1 ))

  if [[ $extra_count -le 0 ]]; then
    commit_message="chore: update ${primary_file}"
  else
    commit_message="chore: update ${primary_file} (+${extra_count} more)"
  fi
fi

# Create the commit.
if ! git commit -m "$commit_message"; then
  echo "Commit failed. Resolve the error above and try again." >&2
  exit 1
fi

# Run repository cleanup to satisfy guard shape rules (non-fatal)
if [ -x "$(pwd)/scripts/gitsave-cleanup.sh" ] || [ -f "scripts/gitsave-cleanup.sh" ]; then
  echo "Running repository cleanup script..."
  bash scripts/gitsave-cleanup.sh || true
fi

# Stage any changes produced by cleanup
git add -A || true

# Push to the matching branch on origin.
git push origin "$current_branch"

echo "Saved: committed to $current_branch and pushed to origin."