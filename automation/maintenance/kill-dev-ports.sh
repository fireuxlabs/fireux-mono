#!/usr/bin/env bash

# Dev helper: stop local dev servers bound to ports 3000-3006

set -euo pipefail

PORTS=(3000 3001 3002 3003 3004 3005 3006)

if ! command -v lsof >/dev/null 2>&1; then
  echo "lsof is required but was not found in PATH." >&2
  exit 1
fi

any_killed=false

for port in "${PORTS[@]}"; do
  if pids=$(lsof -ti "tcp:${port}" 2>/dev/null); then
    if [[ -n "${pids}" ]]; then
      echo "Stopping processes on port ${port}: ${pids}" 
      # shellcheck disable=SC2086
      kill ${pids} && any_killed=true
    fi
  fi
done

if [[ "${any_killed}" == false ]]; then
  echo "No processes were running on ports ${PORTS[*]}."
fi
