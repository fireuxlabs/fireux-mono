# Layouts Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src/runtime/layouts` only.

Learn how `runtime/layouts/` is used across FireUX module packages.

## Layouts Directory

`layouts/` contains package-owned Nuxt layouts delivered by the module.

## What Belongs Here

- layouts used by delivered runtime pages
- layout-level UI wrappers that the package genuinely owns

## Aligned In Repo

- `runtime/layouts/` is already used in `fireux-core`, `fireux-kitchens`, and `fireux-granite`
- the repo already treats layouts as a runtime concern when they are needed

## Not Aligned Yet

- `runtime/layouts/` is selective rather than common
- packages without real layout ownership should stay narrower

## Roadmap To Reconciliation

1. Keep layouts optional.
2. Use them only when the runtime surface genuinely needs them.
3. Keep layout delivery inside runtime.

## Short Version

Package-owned layouts belong here when the module genuinely ships them.
