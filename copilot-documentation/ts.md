# TypeScript config report (ts.md)

Purpose: Inventory all tsconfig files and highlight differences causing Nuxt macro typing issues across apps and packages.

Effective: 2025-09-29

Repository: fireux-mono

## Overview

This repo uses multiple TypeScript configs across:

- Root and project-level aggregators (shared compiler options and path aliases)
- App-level Nuxt projects (each app has its own tsconfig with Nuxt-specific paths/types)
- Package-level libraries (core, extensions, tenants)

All configs generally share:

- target: ES2022
- module: ESNext
- moduleResolution: Bundler
- strict mode enabled
- noEmit + isolatedModules (type-check only for packages)

Key divergence that affects Nuxt macro typings like `definePageMeta` and `#imports`:

- App tsconfigs add Nuxt-generated type paths:
  - `"#imports": [".nuxt/imports.d.ts"]`
  - `types`: includes `nuxt`, `vite/client`, and sometimes `@vite-pwa/nuxt`
- Package tsconfigs do not and should not point to an app’s `.nuxt` folder. As a result, opening `.vue` files under packages can show missing types for macros unless shims are present.

## Config index (by path)

Root and shared:

- `tsconfig.json`

  - types: `nuxt`, `nuxt/schema`, `@nuxt/ui`
  - paths map core and extensions (no `#imports`)
  - include: all ts/tsx/mts/cts/d.ts across repo (excludes .nuxt/.output/dist)

- `projects/tsconfig.projects.json`

  - extends root; adds paths for `fireux-core` and `@fireux-*` aliases

- `projects/tsconfig.json`
  - Note: exists but is empty (potential cleanup)

Packages aggregation:

- `packages/tsconfig.json`
  - Project references for: core, extensions (jobs, places), tenants (misebox, cleanbox)
  - types: `nuxt`

Apps (Nuxt projects):

- `projects/fireux/fireux-app/tsconfig.json`
- `projects/cleanbox/cleanbox-app/tsconfig.json`
- `projects/misebox/misebox-app/tsconfig.json`
- `projects/misebox/niederhorn/tsconfig.json`
- `projects/cleanbox/richies-reinigung/tsconfig.json`
- `projects/fireux/tennant/tsconfig.json` (sic: folder spelled “tennant”)

Common traits:

- extend `../tsconfig.app.base.json` → `projects/tsconfig.projects.json` → root tsconfig
- paths include:
  - `#imports`: `.nuxt/imports.d.ts`
  - `#build/*`: `.nuxt/*`
  - `#pwa`: `@vite-pwa/nuxt/dist/runtime/composables/index.d.ts` (where relevant)
  - package aliases: `fireux-core/*`, tenant and extension packages, `#fireux-core-runtime/*`
- types: `nuxt`, `vite/client`, plus `@vite-pwa/nuxt` where used
- include: `./.nuxt/nuxt.d.ts` and app sources

Core package:

- `packages/core/fireux-core/tsconfig.json`
  - include: `src/**/*.ts` (note: excludes `.d.ts` and `.vue`)
  - types: `nuxt`, `nuxt/schema`, `@types/node`
  - paths: `#fireux-core-models/*`

Extensions:

- `packages/extensions/fireux-jobs/tsconfig.json`

  - include: `src/**/*.ts`, `src/**/*.vue`
  - types: `nuxt`, `nuxt/schema`, `@types/node`
  - paths include `#fireux-jobs-models/*`, `#fireux-core-models/*`, `fireux-core/*`, `#fireux-core-runtime/*`

- `packages/extensions/fireux-jobs/src/runtime/tsconfig.json`

  - include: `**/*.ts`, `**/*.d.ts`, `**/*.vue`
  - types: `nuxt`, `nuxt/schema`, `@types/node`
  - paths target runtime models and core runtime

- `packages/extensions/fireux-places/tsconfig.json`

  - include: `src/**/*.ts`, plus `src/runtime/env.d.ts`
  - types: `nuxt`, `nuxt/schema`, `@types/node`
  - paths: `#fireux-places-models/*`, `#fireux-core-models/*`

- `packages/extensions/tsconfig.json`
  - references: `fireux-jobs`, `fireux-places`

Tenants packages:

- `packages/tenants/fireux-misebox/tsconfig.json`

  - include: `src/**/*.ts`, `src/**/*.d.ts`, `src/**/*.vue`
  - types: `nuxt`, `nuxt/schema`, `@nuxt/ui`, `@types/node`
  - paths: tenant, extensions models, core
  - excludes some object domains by agreement

- `packages/tenants/fireux-cleanbox/tsconfig.json`

  - include: `src/**/*.ts`
  - types: `nuxt`, `nuxt/schema`, `@types/node`
  - paths: tenant models and core/runtime

- `packages/tenants/fireux-fireux/tsconfig.json`

  - include: `src/**/*.ts`
  - types: `nuxt`, `nuxt/schema`, `@types/node`
  - paths: tenant models

- `packages/tenants/tsconfig.json`
  - references: `fireux-misebox`, `fireux-cleanbox`, `fireux-fireux`

## Nuxt macro and `#imports` typing: root cause

Symptoms observed in package `.vue` files (e.g., `packages/core/fireux-core/src/runtime/pages/dev/users.vue`):

- TS errors like “Cannot find name `definePageMeta`” or “Cannot find module `#imports`”

Why this happens:

- App tsconfigs explicitly map `#imports` to that app’s generated `.nuxt/imports.d.ts`. This file doesn’t exist for packages, and packages should not depend on any particular app’s `.nuxt` directory.
- While `types: ["nuxt", "nuxt/schema"]` help with many Nuxt globals, specific macro utilities are provided via `#imports` types that live under each app’s `.nuxt` directory.

Immediate, low-risk mitigations already used:

- Avoid `#imports` in package files; prefer explicit relative imports from the package runtime where possible.
- Add a tiny local shim where needed, for example:
  - `declare const definePageMeta: (meta: any) => void`

## Recommendations

1. Shared Nuxt macro shim for packages

- Add a single shared, type-only shim in core runtime to cover common macros used in package `.vue` files:
  - File: `packages/core/fireux-core/src/runtime/types/nuxt-macros-shim.ts` (TS only, no runtime output)
  - Content: declare minimal macros used in packages (e.g., `definePageMeta`, optionally `defineNuxtRouteMiddleware`, `useHead`).
- Because `fireux-core` tsconfig includes `src/**/*.ts`, a `.ts` shim will be picked up without changing include patterns. Avoid `.d.ts` unless you add it to includes.

2. Keep `#imports` path alias only in apps

- Do not add `#imports` in package `paths`. The `.nuxt` directory is app-specific and not portable.

3. Prefer explicit imports in package runtime

- Instead of relying on implicit Nuxt auto-imports (`#imports`) in packages, import from the package’s own runtime modules or composables via established aliases (e.g., `#fireux-core-runtime/*`).

4. Minor cleanup

- Consider removing or filling `projects/tsconfig.json` (currently empty) to avoid confusion.
- Align tenant folder naming (`tennant` → `tenant`) when convenient; update references if you rename.

## Quick answers

- Why did `definePageMeta` error appear in package `.vue`? → The file wasn’t in an app context with `#imports` mapped; add a tiny shim or avoid macro usage in packages.
- Why does it work inside apps? → App tsconfigs map `#imports` to `.nuxt/imports.d.ts` and include Nuxt app types.
- Should packages point to an app’s `.nuxt`? → No. Use shims or explicit imports instead.

## Appendix: notables

- moduleResolution is consistently `Bundler` across configs (Vite-friendly).
- Most packages use `noEmit: true` and are type-only; actual bundling happens via Nuxt module consumption.
- Extensions may include `.vue` in includes; core currently includes only `src/**/*.ts`.

## Next steps (optional)

- Add the shared macro shim discussed above to eliminate per-file `declare` lines.
- If you want package-level `.vue` type-checking parity, extend includes and integrate Volar/Vite TS plugin for packages; otherwise keep package TS lean and rely on app-level checks.
