# Middleware Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src/runtime/middleware` only.

Learn how `runtime/middleware/` is used across FireUX module packages.

## Middleware Directory

`middleware/` contains runtime route middleware delivered by the package.

## What Belongs Here

- route middleware used by delivered runtime flows
- middleware files that are genuinely part of package delivery

## Aligned In Repo

- `runtime/middleware/` is already used in `fireux-core`
- the repo already places middleware under runtime when it exists

## Not Aligned Yet

- middleware is currently selective rather than shared across package families
- packages that do not ship middleware should stay narrower

## Roadmap To Reconciliation

1. Keep middleware optional.
2. Use it only for real runtime middleware.
3. Avoid creating empty middleware directories for symmetry.

## Short Version

Runtime route middleware belongs here when a package genuinely ships it.
