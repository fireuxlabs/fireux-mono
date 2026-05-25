# Module Config Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src/config/module` only.

Learn how `config/module/` is used across FireUX module packages.

## Module Config Directory

`module/` contains wiring helpers used by `src/module.ts`.

## What Belongs Here

- registration helpers
- module setup utilities
- wiring helpers for runtime pages, components, composables, layouts, assets, and related setup concerns

## Aligned In Repo

- `config/module/` is the strongest shared config pattern in the repo
- it already exists in `fireux-core`, every extension package, and every ecosystem package
- it already reads as support for `module.ts` rather than as a second system
- `fireux-core/config/module/*` remains source-first for Nuxt app dev/build, while package-build validation can load compiled `dist/config/module/*.mjs` helpers

## Not Aligned Yet

- helper names and helper breadth still vary between packages
- module support still needs to stay smaller than the runtime it helps wire

## Roadmap To Reconciliation

1. Keep `config/module/` as the default config seam.
2. Keep it wiring-focused.
3. Use it as the main alignment target for support structure across extensions and ecosystems.

## Short Version

Module wiring helpers belong here.
