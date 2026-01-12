#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/mirror-links.sh mirror/mirror.txt mirror
#
# The list file contains one repo-relative file path per line.

LIST_FILE="${1:-}"
MIRROR_DIR="${2:-mirror}"

if [[ -z "${LIST_FILE}" ]]; then
  echo "Usage: $0 <list-file> [mirror-dir]" >&2
  exit 1
fi

if [[ ! -f "${LIST_FILE}" ]]; then
  echo "List file not found: ${LIST_FILE}" >&2
  exit 1
fi

kebab() {
  # Convert e.g. "MyThing" -> "my-thing" and sanitize to [a-z0-9-]
  local s="${1}"  
  s="$(printf '%s' "${s}" | sed -E 's/([a-z0-9])([A-Z])/\1-\2/g')"
  s="$(printf '%s' "${s}" | tr '[:upper:]' '[:lower:]')"
  s="$(printf '%s' "${s}" | tr -cs 'a-z0-9' '-')"
  s="$(printf '%s' "${s}" | sed -E 's/^-+//; s/-+$//')"
  printf '%s' "${s}"
}

infer_entity() {
  local rel="${1}"
  local entity=""

  if [[ "${rel}" == *"/organisms/App/"*"/Cards/Cell.vue" ]]; then
    entity="App"
  elif [[ "${rel}" == *"/organisms/User/"*"/Cards/Cell.vue" ]]; then
    entity="User"
  elif [[ "${rel}" == *"/organisms/profiles/"*"/Cards/Cell.vue" ]]; then
    entity="${rel#*/organisms/profiles/}"
    entity="${entity%%/*}"
  elif [[ "${rel}" == *"/organisms/objects/"*"/Cards/Cell.vue" ]]; then
    entity="${rel#*/organisms/objects/}"
    entity="${entity%%/*}"
  else
    # Fallback: parent folder of Cards
    entity="$(basename "$(dirname "$(dirname "${rel}")")")"
  fi

  kebab "${entity}"
}

infer_pkg() {
  local rel="${1}"
  # packages/<group>/<pkg>/...
  printf '%s' "${rel}" | cut -d/ -f3
}

rel_prefix_for() {
  # Generate ../ prefix to reach repo root from MIRROR_DIR
  local dir="${1%/}"
  local prefix=""
  IFS='/' read -r -a parts <<< "${dir}"
  for _ in "${parts[@]}"; do
    prefix="../${prefix}"
  done
  printf '%s' "${prefix}"
}

mkdir -p "${MIRROR_DIR}"

# Wipe old mirror content in the target dir, but preserve README and (if it
# lives inside the mirror dir) the list file.
preserve=("README.md")

list_abs="$(cd "$(dirname "${LIST_FILE}")" && pwd)/$(basename "${LIST_FILE}")"
mirror_abs="$(cd "${MIRROR_DIR}" && pwd)"

if [[ "${list_abs}" == "${mirror_abs}/"* ]]; then
  preserve+=("$(basename "${LIST_FILE}")")
fi

find "${MIRROR_DIR}" -mindepth 1 -maxdepth 1 \
  $(printf "! -name %q " "${preserve[@]}") \
  -exec rm -rf {} +

prefix="$(rel_prefix_for "${MIRROR_DIR}")"

while IFS= read -r rel; do
  [[ -z "${rel}" ]] && continue
  [[ "${rel}" =~ ^# ]] && continue

  if [[ ! -f "${rel}" ]]; then
    echo "SKIP missing: ${rel}" >&2
    continue
  fi

  entity="$(infer_entity "${rel}")"
  name="${entity}-cell.mirror.vue"

  if [[ -e "${MIRROR_DIR}/${name}" ]]; then
    pkg="$(kebab "$(infer_pkg "${rel}")")"
    name="${pkg}-${name}"
  fi

  n=2
  while [[ -e "${MIRROR_DIR}/${name}" ]]; do
    base="${name%.vue}"
    name="${base}.${n}.vue"
    n=$((n + 1))
  done

  ln -sf "${prefix}${rel}" "${MIRROR_DIR}/${name}"
  echo "LINKED: ${MIRROR_DIR}/${name} -> ${rel}"

done < "${LIST_FILE}"
