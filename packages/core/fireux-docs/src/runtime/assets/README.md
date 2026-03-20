# Assets Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src/runtime/assets` only.

Learn how `runtime/assets/` is used across FireUX module packages.

## Assets Directory

`assets/` contains build-processed runtime assets shipped by the package.

## What Belongs Here

- imported stylesheets
- asset files used by runtime pages, components, or layouts
- build-processed assets that are not meant to be served as public static files

## Aligned In Repo

- `runtime/assets/` is already used in `fireux-core`
- this proves it is a valid runtime surface when a package ships imported assets

## Not Aligned Yet

- `runtime/assets/` is not a common package-family pattern
- the boundary between `runtime/assets/` and `runtime/public/` still needs to stay explicit

## Roadmap To Reconciliation

1. Keep `runtime/assets/` optional.
2. Use it only for build-processed assets.
3. Keep publicly served static files in `runtime/public/`.

## Short Version

Imported runtime assets belong here when a package genuinely needs them.
