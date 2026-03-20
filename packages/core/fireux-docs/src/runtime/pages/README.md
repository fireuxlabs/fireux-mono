# Pages Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src/runtime/pages` only.

Learn how `runtime/pages/` is used across FireUX module packages.

## Pages Directory

`pages/` contains package-delivered Nuxt pages and route surfaces.

## What Belongs Here

- pages owned by the package
- route trees delivered through the runtime layer
- page groupings that reflect delivery rather than a second package architecture

## Aligned In Repo

- `runtime/pages/` is the strongest and most universal runtime pattern in the repo
- pages are already consistently treated as runtime delivery
- route surfaces are already colocated under `runtime/pages/`

## Not Aligned Yet

- route grouping still varies by package
- packages that do not deliver routed UI should stay narrower rather than imitating fuller page trees

## Roadmap To Reconciliation

1. Keep delivered pages in `runtime/pages/`.
2. Clarify route strategy separately from page location.
3. Let domain grouping stay practical and delivery-first.

## Short Version

Delivered runtime pages belong here.
