#!/usr/bin/env bash
set -euo pipefail

trim() {
  # shellcheck disable=SC2001
  echo "$1" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

has_upstream() {
  git rev-parse --abbrev-ref --symbolic-full-name "@{u}" >/dev/null 2>&1
}

ahead_behind_counts() {
  if has_upstream; then
    local counts
    counts="$(git rev-list --left-right --count HEAD...@{u} 2>/dev/null || echo '0 0')"
    # Output format: "<ahead> <behind>"
    echo "$counts"
  else
    echo "0 0"
  fi
}

working_tree_count() {
  local count
  count="$(git status --porcelain | wc -l)"
  trim "$count"
}

print_repo_state() {
  local label="$1"
  local dirty
  local counts
  local ahead
  local behind

  dirty="$(working_tree_count)"
  counts="$(ahead_behind_counts)"
  ahead="$(echo "$counts" | awk '{print $1}')"
  behind="$(echo "$counts" | awk '{print $2}')"

  if [[ "$dirty" == "0" ]]; then
    echo "[gitsave] ${label}: working tree clean | ahead ${ahead} | behind ${behind}"
  else
    echo "[gitsave] ${label}: ${dirty} changed file(s) | ahead ${ahead} | behind ${behind}"
  fi
}

run_repo_cleanup() {
  if [ -x "$(pwd)/scripts/gitsave-cleanup.sh" ] || [ -f "scripts/gitsave-cleanup.sh" ]; then
    echo "Running repository cleanup script..."
    bash scripts/gitsave-cleanup.sh || true
  fi
}

usage() {
  echo "Usage: gitsave [\"commit message\"] [--guard|--no-guard] [--clean|--no-clean] [--allow-mixed] [--allow-large] [--allow-behind]" >&2
  echo "Example: gitsave \"fix: wire places quick add\"" >&2
  echo "Defaults: --no-guard --no-clean" >&2
  echo "Safety defaults: block behind-state pushes, mixed-layer commits, and commits over 20 files unless explicitly allowed." >&2
}

classify_path() {
  local file="$1"

  case "$file" in
    packages/*/src/runtime/models/*|packages/*/src/runtime/models/**/*)
      echo "models"
      ;;
    packages/*/src/runtime/composables/*|packages/*/src/runtime/composables/**/* )
      echo "composables"
      ;;
    packages/*/src/runtime/components/*|packages/*/src/runtime/components/**/*|projects/*/*/app/components/*|projects/*/*/app/components/**/*|packages/*/src/runtime/pages/*|packages/*/src/runtime/pages/**/*|projects/*/*/app/pages/*|projects/*/*/app/pages/**/*|packages/*/src/runtime/layouts/*|packages/*/src/runtime/layouts/**/*|projects/*/*/app/layouts/*|projects/*/*/app/layouts/**/* )
      echo "ui"
      ;;
    docs/*|docs/**/*|README.md|AGENTS.md|packages/*/docs/*|packages/*/docs/**/* )
      echo "docs"
      ;;
    scripts/*|scripts/**/*|tools/*|tools/**/*|package.json|pnpm-lock.yaml|pnpm-workspace.yaml|tsconfig.json|tsconfig.base.json|eslint.config.js|.vscode/*|.vscode/**/*|mirror/*|mirror/**/* )
      echo "tooling"
      ;;
    *)
      echo "other"
      ;;
  esac
}

print_staged_summary() {
  local files=("$@")
  local count="${#files[@]}"
  local category
  local seen=""
  local categories=()

  for file in "${files[@]}"; do
    category="$(classify_path "$file")"
    if [[ ",$seen," != *",$category,"* ]]; then
      categories+=("$category")
      seen+="${seen:+,}$category"
    fi
  done

  echo "[gitsave] staged ${count} file(s) | categories: ${categories[*]}"
}

ensure_simple_scope() {
  local allow_mixed="$1"
  local allow_large="$2"
  shift 2
  local files=("$@")
  local count="${#files[@]}"
  local category
  local seen=""
  local categories=()

  for file in "${files[@]}"; do
    category="$(classify_path "$file")"
    if [[ ",$seen," != *",$category,"* ]]; then
      categories+=("$category")
      seen+="${seen:+,}$category"
    fi
  done

  if ! $allow_large && (( count > 20 )); then
    echo "[gitsave] Refusing to save ${count} files in one go." >&2
    echo "[gitsave] Keep saves phase-sized. Re-run with --allow-large if this is intentional." >&2
    return 1
  fi

  if ! $allow_mixed && (( ${#categories[@]} > 1 )); then
    echo "[gitsave] Refusing mixed-layer save across categories: ${categories[*]}" >&2
    echo "[gitsave] Keep one phase per save. Re-run with --allow-mixed if this is intentional." >&2
    printf '%s\n' "[gitsave] Staged files:" >&2
    printf '  - %s\n' "${files[@]}" >&2
    return 1
  fi

  return 0
}

commit_message=""
run_guard=false
run_clean=false
allow_mixed=false
allow_large=false
allow_behind=false

# Parse args
args=()
for a in "$@"; do
  case "$a" in
    --guard) run_guard=true ;;
    --no-guard) run_guard=false ;;
    --clean) run_clean=true ;;
    --no-clean) run_clean=false ;;
    --allow-mixed) allow_mixed=true ;;
    --allow-large) allow_large=true ;;
    --allow-behind) allow_behind=true ;;
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

print_repo_state "start"

if has_upstream; then
  counts="$(ahead_behind_counts)"
  ahead_count="$(echo "$counts" | awk '{print $1}')"
  behind_count="$(echo "$counts" | awk '{print $2}')"
  if ! $allow_behind && [[ "$behind_count" != "0" ]]; then
    echo "[gitsave] Refusing save because branch is behind upstream by ${behind_count}." >&2
    echo "[gitsave] Pull/rebase first, or re-run with --allow-behind if you really want to continue." >&2
    exit 1
  fi
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

# Always run repository cleanup before staging so cleanup changes are saved
run_repo_cleanup

# Stage everything, including deletions.
git add -A

if git diff --cached --quiet; then
  # If nothing new to commit, still push if we're ahead of upstream.
  if has_upstream; then
    ahead_count=$(git rev-list --count "@{u}..HEAD" 2>/dev/null || echo "0")
    if [[ "${ahead_count}" != "0" ]]; then
      echo "No changes to commit, but branch is ahead by ${ahead_count}; pushing..." >&2
      git push origin "$current_branch"
      echo "Saved: pushed $current_branch to origin." >&2
      print_repo_state "end"
    else
      echo "No changes to commit." >&2
      print_repo_state "end"
    fi
  else
    echo "No changes to commit (no upstream configured)." >&2
    print_repo_state "end"
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

  print_staged_summary "${staged_changes[@]}"
  ensure_simple_scope "$allow_mixed" "$allow_large" "${staged_changes[@]}" || exit 1

  primary_file="${staged_changes[0]}"
  extra_count=$(( ${#staged_changes[@]} - 1 ))

  if [[ $extra_count -le 0 ]]; then
    commit_message="chore: update ${primary_file}"
  else
    commit_message="chore: update ${primary_file} (+${extra_count} more)"
  fi
else
  staged_changes=()
  while IFS= read -r line; do
    staged_changes+=("$line")
  done < <(git diff --cached --name-only)

  if [[ ${#staged_changes[@]} -eq 0 ]]; then
    echo "No staged files detected after add." >&2
    exit 1
  fi

  print_staged_summary "${staged_changes[@]}"
  ensure_simple_scope "$allow_mixed" "$allow_large" "${staged_changes[@]}" || exit 1
fi

# Create the commit.
if ! git commit -m "$commit_message"; then
  echo "Commit failed. Resolve the error above and try again." >&2
  exit 1
fi

# Push to the matching branch on origin.
git push origin "$current_branch"

echo "Saved: committed to $current_branch and pushed to origin."
print_repo_state "end"
