# Phase D: Module Standardization Report

This report summarizes the standardization of Nuxt modules across core, extensions, and tenants, focusing on:

- Split config pattern (components, composables, models, pages, plugins, server, runtime)
- Unified runtimeConfig helper: `configureRuntime(nuxt, key, defaults?)`
- Tenants ensure core installed
- Nitro wasm enabled consistently

## Summary Table

| Package                  | Split-config used | Runtime helper | Runtime key | Installs core | Nitro wasm |
| ------------------------ | ----------------- | -------------- | ----------- | ------------- | ---------- |
| core/fireux-core         | Yes               | Yes            | core        | N/A           | Yes        |
| extensions/fireux-jobs   | Yes               | Yes            | jobs        | N/A           | Yes        |
| extensions/fireux-places | Yes               | Yes            | places      | N/A           | Yes        |
| tenants/fireux-misebox   | Yes               | Yes            | misebox     | Yes           | Yes        |
| tenants/fireux-cleanbox  | Yes               | Yes            | cleanbox    | Yes           | Yes        |

## Key Changes

- Core: import fix to `./config/runtime-config` (removed `.ts`); helper now accepts `(nuxt, key, defaults?)` and used with key `core`.
- Jobs: updated helper signature and module usage (`configureRuntime(nuxt, 'jobs')`).
- Places: refactored module to delegate to config functions and use unified runtime helper (`'places'`).
- Misebox & Cleanbox: refactored modules to split-config pattern and added per-tenant runtime-config helper; ensured `installModule('fireux-core')` remains; applied Nitro wasm tweak.

## Diffs (high-level)

- core/src/module.ts: `configureRuntime(nuxt)` -> `configureRuntime(nuxt, 'core')` and import path sans extension.
- core/src/config/runtime-config.ts: new signature and safer augmentation.
- jobs/src/config/runtime-config.ts + jobs/src/module.ts: updated usage/signature.
- places/src/module.ts + places/src/config/runtime-config.ts: standardized; removed inline kit calls.
- tenants/\*/src/module.ts: standardized; added `src/config/runtime-config.ts` for missing tenants.

## Skipped/Notes

- Did not change package.json exports or build configs in this pass.
- Left domain logic and templates untouched.

## Next steps

- Run typecheck to catch any stragglers.
- Smoke-run dev tasks: dev:all-extended.
- Consider adding minimal tests to assert runtime keys exist.
