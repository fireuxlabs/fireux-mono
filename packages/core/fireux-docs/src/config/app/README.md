# App Config Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src/config/app` only.

Learn how `config/app/` is used across FireUX module packages.

## App Config Directory

`app/` contains app-consumer support exposed by a package.

## What Belongs Here

- app-facing config helpers
- runtime config setters used by consuming apps
- support files that belong to app setup rather than module wiring

## Aligned In Repo

- `config/app/` is already used in `fireux-core`
- it reads clearly as app-consumer support rather than runtime delivery

## Not Aligned Yet

- `config/app/` is valid but currently core-specific
- it should not become an expected package-family default

## Roadmap To Reconciliation

1. Keep `config/app/` explicitly supportive.
2. Use it only when a package genuinely serves consuming apps at setup time.
3. Do not let it expand into a parallel layer beside runtime.

## Short Version

App-consumer setup helpers belong here when a package genuinely needs them.
