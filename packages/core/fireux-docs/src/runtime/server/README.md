# Server Directory

Authority: Operational
Updated: 2026-04-11
Scope: `packages/*/fireux-*/src/runtime/server` only.

Learn how `runtime/server/` is used across FireUX module packages.

## Server Directory

`server/` contains package-delivered server routes, handlers, and server-only support code.

## What Belongs Here

- package-owned API handlers
- server routes or handlers that the package genuinely delivers
- server-only support code that belongs to delivered server behavior

For ecosystem apps with a registry split, `runtime/server/` is also the right home for API seams that expose:

- `project` and `ecosystem` from `(default)`
- `apps` from the named operational database when app truth is required

Those handlers should not pretend the named operational database is the same thing as the registry database.

## Aligned In Repo

- `runtime/server/` is already used in `fireux-core`, `fireux-places`, and `fireux-products`
- where server delivery exists, the repo already treats it as part of runtime

## Not Aligned Yet

- `runtime/server/` is selective rather than broad across package families
- some packages do not need it and should stay narrower

## Current Dev Snapshot Seam

One server seam is now part of repo-wide drift tooling:

- `runtime/server/api/dev/collection-snapshot.post.ts`

Purpose:

- list direct subcollections for known collection docs
- return lightweight direct subcollection snapshots for dev JSON inspection
- support collection-manager drift checks without changing public entity fetch contracts

Rules:

- dev-only
- operational inspection only
- direct subcollections only by default
- should use the active runtime Firestore selection, including named databases where configured

This is a valid `runtime/server/` use case because:

- subcollections are not visible in the normal client collection payload
- the behavior belongs to runtime delivery and runtime inspection
- the repo now depends on this seam for drift discovery work

## Roadmap To Reconciliation

1. Keep server delivery optional.
2. Use it for real service seams.
3. Keep routine runtime delivery outside server-only structure unless clearly justified.

## Short Version

Server-side runtime delivery belongs here when a package genuinely owns it.
