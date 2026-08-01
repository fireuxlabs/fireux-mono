#!/usr/bin/env bash
# @fireux-script
# last_used: 2026-07-20
# usage_note: commit-and-push helper with mandatory repository guards.
# Concurrent edit — 2026-07-20 20:46 CEST — Repo Efficiency Pass 3 of 6: remove the destructive legacy repository-cleanup hook.
set -euo pipefail

trim() {
  # shellcheck disable=SC2001
  echo "$1" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
}

run_pnpm() {
  if command -v corepack >/dev/null 2>&1; then
    corepack pnpm "$@"
  else
    pnpm "$@"
  fi
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

run_preflight_clean() {
  if [[ -f "scripts/pre-guard-clean.mjs" ]]; then
    echo "[gitsave] Running lightweight preflight clean..."
    run_pnpm -s pre-guard-clean --skip-if-dev-running || true
  fi
}

run_required_pre_push_clean() {
  if [[ -f "scripts/pre-guard-clean.mjs" ]]; then
    echo "[gitsave] Running pre-push artifact clean..."
    run_pnpm -s pre-guard-clean
  fi
}

dev_server_running() {
  if [[ ! -f "scripts/pre-guard-clean.mjs" ]]; then
    return 1
  fi

  set +e
  run_pnpm -s pre-guard-clean --check-dev --quiet >/dev/null 2>&1
  local status=$?
  set -e

  [[ "$status" == "2" ]]
}

push_current_branch() {
  if dev_server_running; then
    echo "[gitsave] Dev server is running; pushing the already guarded commit without artifact cleanup." >&2
    echo "[gitsave] Live dev artifacts stay untouched." >&2
    git push origin "$current_branch"
    return 0
  fi

  run_required_pre_push_clean
  echo "[gitsave] Pushing ${current_branch} to origin..." >&2
  git push origin "$current_branch"
}

cleanup_git_refs() {
  local current_branch="$1"
  local cleaned_any=false
  local repo_name
  local worktree_path=""
  local worktree_branch=""
  local codex_worktree_prefix="$HOME/.codex/worktrees/"

  repo_name="$(basename "$(pwd)")"

  if git remote | grep -qx 'origin'; then
    echo "[gitsave] Pruning stale origin refs..."
    git remote prune origin >/dev/null 2>&1 || true
  fi

  if git remote | grep -qx 'old-origin' && git remote | grep -qx 'origin'; then
    local old_origin_in_use=false
    while IFS= read -r upstream; do
      if [[ "$upstream" == old-origin/* ]]; then
        old_origin_in_use=true
        break
      fi
    done < <(git for-each-ref --format='%(upstream:short)' refs/heads)

    if ! $old_origin_in_use; then
      echo "[gitsave] Removing legacy remote 'old-origin'..."
      git remote remove old-origin || true
      cleaned_any=true
    fi
  fi

  if [[ "$current_branch" != "main" ]]; then
    while IFS= read -r line; do
      if [[ "$line" == worktree\ * ]]; then
        worktree_path="${line#worktree }"
        worktree_branch=""
      elif [[ "$line" == branch\ * ]]; then
        worktree_branch="${line#branch refs/heads/}"
      elif [[ -z "$line" ]]; then
        if [[ -n "$worktree_path" ]] \
          && [[ "$worktree_path" == ${codex_worktree_prefix}*"/${repo_name}" ]] \
          && [[ -z "$worktree_branch" ]]; then
          echo "[gitsave] Removing stale Codex detached worktree '$worktree_path'..."
          if git worktree remove "$worktree_path" >/dev/null 2>&1; then
            cleaned_any=true
          fi
        fi
        worktree_path=""
        worktree_branch=""
      fi
    done < <(git worktree list --porcelain && printf '\n')

    if ! $cleaned_any; then
      echo "[gitsave] No post-save branch cleanup needed."
    fi
    return 0
  fi

  while IFS= read -r branch; do
    branch="$(trim "$branch")"
    if [[ -z "$branch" || "$branch" == "$current_branch" ]]; then
      continue
    fi

    case "$branch" in
      main|master|develop|dev)
        continue
        ;;
    esac

    echo "[gitsave] Deleting merged local branch '$branch'..."
    if git branch -d "$branch" >/dev/null 2>&1; then
      cleaned_any=true
    fi
  done < <(git branch --format='%(refname:short)' --merged main)

  while IFS= read -r line; do
    if [[ "$line" == worktree\ * ]]; then
      worktree_path="${line#worktree }"
      worktree_branch=""
    elif [[ "$line" == branch\ * ]]; then
      worktree_branch="${line#branch refs/heads/}"
    elif [[ -z "$line" ]]; then
      if [[ -n "$worktree_path" ]] \
        && [[ "$worktree_path" == ${codex_worktree_prefix}*"/${repo_name}" ]] \
        && [[ -z "$worktree_branch" ]]; then
        echo "[gitsave] Removing stale Codex detached worktree '$worktree_path'..."
        if git worktree remove "$worktree_path" >/dev/null 2>&1; then
          cleaned_any=true
        fi
      fi
      worktree_path=""
      worktree_branch=""
    fi
  done < <(git worktree list --porcelain && printf '\n')

  if ! $cleaned_any; then
    echo "[gitsave] No post-save branch cleanup needed."
  fi
}

usage() {
  echo "Usage: gitsave [\"commit message\"] [--clean|--no-clean]" >&2
  echo "Example: gitsave \"fix: wire places quick add\"" >&2
  echo "Defaults: lightweight preflight clean, blocking pre-commit guard, post-save git cleanup, --no-clean" >&2
  echo "Dev server default: preserve live Nuxt artifacts after the mandatory pre-commit guard passes." >&2
  echo "Safety rules: block behind-state pushes and guard failures. Mixed layers are reported for review." >&2
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

report_mixed_scope() {
  local files=("$@")
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

  if (( ${#categories[@]} > 1 )); then
    echo "[gitsave] Mixed-layer save across categories: ${categories[*]}" >&2
    echo "[gitsave] Confirm every category belongs to the same complete phase." >&2
  fi
}

commit_message=""
run_clean=false

# Parse args
args=()
for a in "$@"; do
  case "$a" in
    --clean) run_clean=true ;;
    --no-clean) run_clean=false ;;
    -h|--help) usage; exit 0 ;;
    --*) echo "Unknown option: $a" >&2; usage; exit 1 ;;
    *) args+=("$a") ;;
  esac
done

commit_message="${args[*]:-}"

# Ensure we are inside a Git repository.
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: not inside a git repository" >&2
  exit 1
fi

if [[ -f "scripts/check-runtime.mjs" ]]; then
  node scripts/check-runtime.mjs
fi

current_branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$current_branch" != "main" ]]; then
  echo "Warning: current branch is '$current_branch', not 'main'." >&2
  echo "Switch to 'main' if you intend to keep a single-branch workflow." >&2
fi

print_repo_state "start"

# Report the complete unstaged scope before expensive guards or staging.
scope_changes=()
while IFS= read -r line; do
  [[ -n "$line" ]] && scope_changes+=("$line")
done < <(
  {
    git diff --name-only HEAD
    git ls-files --others --exclude-standard
  } | sort -u
)
report_mixed_scope "${scope_changes[@]}"

if has_upstream; then
  counts="$(ahead_behind_counts)"
  ahead_count="$(echo "$counts" | awk '{print $1}')"
  behind_count="$(echo "$counts" | awk '{print $2}')"
  if [[ "$behind_count" != "0" ]]; then
    echo "[gitsave] Refusing save because branch is behind upstream by ${behind_count}." >&2
    echo "[gitsave] Pull or rebase before saving." >&2
    exit 1
  fi
fi

# Always clear known guard-blocking local artifacts before staging.
run_preflight_clean

# Optional clean
if $run_clean; then
  if dev_server_running; then
    echo "[gitsave] Dev server is running; skipped optional clean so live artifacts stay intact." >&2
  else
    run_pnpm -s clean || true
  fi
fi

# Guard before staging/commit so a failed save never creates an unpushable commit.
if ! run_pnpm -s guard; then
  echo "\n[gitsave] Guard failed." >&2
  echo "[gitsave] Fix the issues above. Guard failures cannot be bypassed." >&2
  exit 1
fi

# Stage everything, including deletions.
git add -A

if git diff --cached --quiet; then
  # If nothing new to commit, still push if we're ahead of upstream.
  if has_upstream; then
    ahead_count=$(git rev-list --count "@{u}..HEAD" 2>/dev/null || echo "0")
    if [[ "${ahead_count}" != "0" ]]; then
      echo "No changes to commit; branch is ahead by ${ahead_count}." >&2
      push_current_branch
      cleanup_git_refs "$current_branch"
      echo "Saved: pushed $current_branch to origin." >&2
      print_repo_state "end"
    else
      echo "No changes to commit." >&2
      cleanup_git_refs "$current_branch"
      print_repo_state "end"
    fi
  else
    echo "No changes to commit (no upstream configured)." >&2
    cleanup_git_refs "$current_branch"
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
  report_mixed_scope "${staged_changes[@]}"

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
  report_mixed_scope "${staged_changes[@]}"
fi

# Create the commit.
if ! git commit -m "$commit_message"; then
  echo "Commit failed. Resolve the error above and try again." >&2
  exit 1
fi

# Push to the matching branch on origin.
push_current_branch
cleanup_git_refs "$current_branch"

echo "Saved: committed to $current_branch and pushed to origin."
print_repo_state "end"
