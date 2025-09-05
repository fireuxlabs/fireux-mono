#!/usr/bin/env bash
set -euo pipefail
if grep -R "addImportsDir(.*runtime/models" -n packages projects | grep -v ".nuxt" ; then
  echo "❌ Found addImportsDir(runtime/models). Models must not be auto-imported."
  exit 1
fi
echo "✅ No forbidden model auto-imports found."
