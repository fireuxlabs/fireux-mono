# Server Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src/runtime/server` only.

Learn how `runtime/server/` is used across FireUX module packages.

## Server Directory

`server/` contains package-delivered server routes, handlers, and server-only support code.

## What Belongs Here

- package-owned API handlers
- server routes or handlers that the package genuinely delivers
- server-only support code that belongs to delivered server behavior

## Aligned In Repo

- `runtime/server/` is already used in `fireux-core`, `fireux-places`, and `fireux-products`
- where server delivery exists, the repo already treats it as part of runtime

## Not Aligned Yet

- `runtime/server/` is selective rather than broad across package families
- some packages do not need it and should stay narrower

## Roadmap To Reconciliation

1. Keep server delivery optional.
2. Use it for real service seams.
3. Keep routine runtime delivery outside server-only structure unless clearly justified.

## Short Version

Server-side runtime delivery belongs here when a package genuinely owns it.
