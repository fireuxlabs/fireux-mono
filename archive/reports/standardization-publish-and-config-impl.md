# FireUX Phase B Implementation Report

Date: 2025-08-30

## Summary

Applied Phase B changes to standardize publish targets (dist-only), unify build tool usage, and normalize config layout in fireux-core.

## Changes Applied

### 1) Core config file moves (fireux-core)

- Moved:
  - packages/core/fireux-core/src/runtime/config/assets-config.ts → src/config/assets-config.ts
  - packages/core/fireux-core/src/runtime/config/layouts-config.ts → src/config/layouts-config.ts
  - packages/core/fireux-core/src/runtime/config/errors-config.ts → src/config/errors-config.ts
- Removed: packages/core/fireux-core/src/runtime/config/ (now empty)
- Import updates: No references to `runtime/config/` were found; no import rewrites needed.

### 2) Package.json standardization

- fireux-core (packages/core/fireux-core/package.json)
  - main: ./dist/module.mjs
  - types: ./dist/types.d.ts
  - exports: dist-only with ./package.json entry
  - typesVersions: now map to ./dist/\*\* only
  - files: ["dist", "src/runtime"]
  - scripts: dev now uses `nuxt-module-build build --stub`; postbuild cleans dist/\*_/_.map

- fireux-jobs (packages/extensions/fireux-jobs/package.json)
  - main: ./dist/module.mjs
  - types: ./dist/types.d.ts
  - exports: dist-only with ./package.json entry
  - typesVersions: now map to ./dist/\*\* only
  - files: ["dist", "src/runtime"]
  - scripts: dev now uses `nuxt-module-build build --stub`; postbuild cleans dist/\*_/_.map

- fireux-places, fireux-misebox, fireux-cleanbox
  - Already compliant; no changes needed.

### 3) Safety sweep

- Verified no remaining exports/typesVersions point to src/\*\* across packages.
- Verified no `runtime/config/` imports in fireux-core.

## Build & Typecheck

Attempted to run builds and typechecks but environment reported an engine mismatch:

- pnpm error: Expected version ">=10"; current is 9.1.0.
- Recommendation: upgrade pnpm globally.

Suggested commands (optional):

```bash
# Upgrade pnpm to a supported version
pnpm i -g pnpm

# Then run the validation pipeline
pnpm -r --filter "./packages/*/*" run clean
pnpm -r --filter "./packages/*/*" run build
pnpm -r --filter "./packages/*/*" exec tsc --noEmit
```

## Verification Greps

Planned checks (ran what was possible without building):

```bash
# No src paths in package exports/typesVersions
git grep -n '"exports"' packages/*/*/package.json
(grep for src/ in exports/typesVersions returned no matches)

# Config files present and correctly located
find packages -name "assets-config.ts" -o -name "layouts-config.ts" -o -name "errors-config.ts"
find packages -path "*/src/config/*" -name "*-config.ts" | grep -E "(assets|layouts|errors)"
```

## Commit

A single atomic commit is ready to create:

```bash
git add packages/*/*
# Commit message:
# chore: dist-only publish + unified builder; normalize core config layout (assets/layouts/errors under src/config)
```

## Notes

- No changes were made to projects/\*\* per guardrails.
- Typescript remains for typechecking; no emit scripts were introduced.
- src/runtime kept in files to support Nuxt runtime discovery.
