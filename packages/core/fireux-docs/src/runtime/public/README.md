# Public Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src/runtime/public` only.

Learn how `runtime/public/` is used across FireUX module packages.

## Public Directory

`public/` contains static public files delivered by the package runtime.

## What Belongs Here

- images and static media meant to be served publicly
- package-owned public assets that should keep stable public paths

## Aligned In Repo

- `runtime/public/` is already used in `fireux-core` and several ecosystem packages
- ecosystem packages show a clear and consistent use case for this surface

## Not Aligned Yet

- many extension packages do not currently need `runtime/public/`
- the written separation between `runtime/assets/` and `runtime/public/` still needs to stay explicit

## Roadmap To Reconciliation

1. Keep static public assets in `runtime/public/`.
2. Keep build-processed assets in `runtime/assets/`.
3. Do not blur the two surfaces.

## Short Version

Publicly served static files belong here.
