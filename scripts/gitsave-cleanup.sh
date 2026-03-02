#!/usr/bin/env bash
set -euo pipefail

echo "gitsave cleanup: moving reports and removing build artifacts"

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

echo "gitsave cleanup complete."
