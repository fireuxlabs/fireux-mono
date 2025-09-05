#!/usr/bin/env bash
set -euo pipefail
FORBIDDEN=$(find packages/tenants -path '*/node_modules/*' -prune -o \( -name '*.d.ts' -o -path '*/src/runtime/*/index.ts' \) -print)
if [ -n "$FORBIDDEN" ]; then
  echo "Forbidden files detected:" >&2
  echo "$FORBIDDEN" >&2
  exit 1
fi
echo 'Guard OK'
