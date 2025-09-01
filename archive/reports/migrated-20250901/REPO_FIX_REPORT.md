# FireUX Monorepo Stabilization Report

## Summary

Aligned Nuxt/Vue/Firebase versions across all apps, added explicit core subpath exports, normalized root/app tsconfigs, and hardened runtime config defaults. This locks editor/tooling behavior and eliminates config drift.

## Changes (delta)

- Core
  - fireux-core/package.json: added subpath exports for config helpers.
  - fireux-core/src/config/app/fireux-config.ts: emit runtimeConfig.public.appSettings with safe defaults.
  - fireux-core/src/runtime/composables/FireUXConfig.ts: defensive fallbacks for missing config.
- TypeScript
  - Root tsconfig.json and tsconfig.base.json cleaned (valid JSON, bundler resolution).
  - App tsconfigs replaced with minimal templates extending .nuxt/tsconfig.json.
- Apps: version alignment
  - Set nuxt 4.0.3, vue 3.5.20, firebase 11.10.0, nuxt-vuefire ^1.1.0 in:
    - projects/fireux/fireux-app/package.json
    - projects/misebox/misebox-app/package.json
    - projects/misebox/niederhorn/package.json
    - projects/cleanbox/cleanbox-app/package.json
    - projects/cleanbox/richies-reinigung/package.json

## How to verify

1. Install
   - pnpm -w install
2. TypeScript project build
   - pnpm -w tsc:check
3. Dev smoke test one app
   - pnpm dev:niederhorn (http://localhost:3003)

Expected: no missing-module errors; layouts load; warnings only.

## Rationale

- Single source of truth for framework versions prevents subtle incompatibilities.
- Minimal app tsconfigs avoid re-compiling packages and reduce IDE noise.
- Core exports make config helpers importable with stable paths.
- Runtime defaults prevent destructure crashes during early boot.

## Next steps

- Resolve any duplicate auto-import warnings in layouts/models.
- Consider consolidating @nuxt/content usage or removing if unused.
- Add a CI task running typecheck:apps + typecheck:packages on PRs.
