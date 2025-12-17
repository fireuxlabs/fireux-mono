#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: gitsave [\"commit message\"]" >&2
  echo "Example: gitsave \"fix: wire places quick add\"" >&2
  echo "If no message is provided, one will be generated from changed files." >&2
}

commit_message="$*"

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

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

# Guard must pass before we save.
# Root guard is the single entrypoint and may cascade into other guards.
if ! pnpm -s guard; then
  echo "Guard failed. Fix the issues above before saving." >&2
  exit 1
fi

# Stage everything, including deletions.
git add -A

if git diff --cached --quiet; then
  echo "No changes to commit." >&2
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

# Push to the matching branch on origin.
git push origin "$current_branch"

# Provide a friendly summary.
echo "Saved: committed to $current_branch and pushed to origin."
