#!/usr/bin/env bash
set -euo pipefail

# Search code (exclude generated/build and documentation files)
if grep -R "addImportsDir(.*runtime/models" -n packages projects \
  | grep -v ".nuxt" \
  | grep -v "/dist/" \
  | grep -v "/docs/" \
  | grep -v "\.md:" \
  ; then
  echo "❌ Found addImportsDir(runtime/models). Models must not be auto-imported."
  exit 1
fi
echo "✅ No forbidden model auto-imports found."
