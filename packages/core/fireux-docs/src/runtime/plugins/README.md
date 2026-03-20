# Plugins Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src/runtime/plugins` only.

Learn how `runtime/plugins/` is used across FireUX module packages.

## Plugins Directory

`plugins/` contains runtime plugins shipped by the package.

## What Belongs Here

- Nuxt plugins delivered by the package
- plugin files registered by the module entrypoint or module support helpers

## Aligned In Repo

- `runtime/plugins/` is already used in `fireux-core` and `fireux-nuxtfire`
- when packages ship plugins, they already place them under runtime

## Not Aligned Yet

- plugin delivery is selective rather than broad across package families
- packages without real plugin behavior should stay narrower

## Roadmap To Reconciliation

1. Keep plugin delivery in runtime.
2. Keep it optional.
3. Do not add plugin structure for symmetry alone.

## Short Version

Runtime plugins belong here when a package genuinely ships them.
