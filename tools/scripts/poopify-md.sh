#!/usr/bin/env bash
set -euo pipefail

# Config: set USE_GIT_MV=true to use 'git mv' instead of 'mv'
USE_GIT_MV=${USE_GIT_MV:-false}

TOC_FILE="toc.md"
if [[ ! -f "$TOC_FILE" ]]; then
  echo "❌ $TOC_FILE not found in repo root" >&2
  exit 1
fi

 moved=0
 skipped=0

 # Move each file under poop/<original/path>
 echo "→ Creating poop/ mirror and moving listed .md files…"
 # Use a portable while-read loop (works on macOS bash/zsh)
 while IFS= read -r relpath || [ -n "$relpath" ]; do
   # Skip empty lines or code fences that might appear accidentally
   [ -z "$relpath" ] && continue
   case "$relpath" in
     '```'*) continue ;;
   esac
   # If path doesn't exist, skip
   if [ ! -e "$relpath" ]; then
     skipped=$((skipped+1))
     continue
   fi
   dest_dir="poop/$(dirname "$relpath")"
   mkdir -p "$dest_dir"
   if [ "$USE_GIT_MV" = "true" ] && command -v git >/dev/null 2>&1; then
     if git mv -f "$relpath" "$dest_dir/" 2>/dev/null; then
       moved=$((moved+1))
     else
       mv -f "$relpath" "$dest_dir/"
       moved=$((moved+1))
     fi
   else
     mv -f "$relpath" "$dest_dir/"
     moved=$((moved+1))
   fi
 done < "$TOC_FILE"

# Create minimal, clean ToC with stubs
echo "→ Creating toc/ with clean stubs…"
mkdir -p toc

cat > toc/README.md <<'MD'
# FireUX Documentation (Table of Contents)

This is the lightweight index for the docs we actually maintain. Everything else has been quarantined under `poop/` until we decide to delete it.

- [Overview](./overview.md)
- [Structure](./structure.md)
- [Config](./config.md)
- [Packages](./packages.md)
- [Projects](./projects.md)
- [Firebase](./firebase.md)
- [Dev Workflow](./dev-workflow.md)
- [CI/CD](./ci-cd.md)
- [Conventions](./conventions.md)
- [Roadmap](./roadmap.md)
MD

make_stub() {
  local fname="$1"
  local title
  title=$(echo "$fname" | sed 's|.md$||I' | sed 's|-| |g' | awk '{ for (i=1;i<=NF;i++) { $i=toupper(substr($i,1,1)) substr($i,2) } print }')
  if [[ ! -e "toc/$fname" ]]; then
    cat > "toc/$fname" <<MD
# $title

> Stub. Keep this lean. Link out to real source-of-truth docs under `docs/framework` or package-level README files.

- Owner: @you
- Last Reviewed: $(date +%F)
MD
  fi
}

make_stub overview.md
make_stub structure.md
make_stub config.md
make_stub packages.md
make_stub projects.md
make_stub firebase.md
make_stub dev-workflow.md
make_stub ci-cd.md
make_stub conventions.md
make_stub roadmap.md

echo "✔ Done."
echo "• Moved: $moved files"
echo "• Skipped (not found): $skipped files"
echo "• Minimal toc/ created with stubs"
