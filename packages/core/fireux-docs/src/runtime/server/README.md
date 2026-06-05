# Server Directory

Authority: Operational
Updated: 2026-04-17
Scope: `packages/*/fireux-*/src/runtime/server` only.

This page documents FireUX rules for `runtime/server/`.
It does not explain general Nitro or Nuxt server behavior.

For Nuxt mechanics, use Nuxt documentation.
This page is only for FireUX server seams and runtime-only overrides.

## FireUX Rule

`runtime/server/` is for package-owned server delivery that FireUX genuinely needs at runtime.

The main FireUX question is not “how server handlers work.”
It is “when server seams are part of canon rather than accidental complexity.”

## FireUX Uses

Valid FireUX server uses include:

- package-owned API handlers
- runtime-only service seams
- internal inspection routes
- hosted tool-provider response helpers
- registry or mirror reads that should stay off the client
- server support code that belongs directly to delivered runtime behavior

## FireUX Override

FireUX adds a few explicit server concerns:

- registry and operational database concerns may need different server seams
- internal dev inspection routes are valid when they support canon or drift checks
- client UI should not hide database or authority decisions that belong in a server seam

For ecosystem apps with the registry split:

- `(default)` may expose registry and public-mirror truth such as `project` and `ecosystem`
- the named operational database carries day-to-day operational truth such as `apps` and domain collections

Those seams must stay explicit.

## FireUX Dev And Internal Seams

Developer and internal routes are valid here when they support repo truth, for example:

- collection drift inspection
- draft doc checks
- runtime-only environment inspection

These are FireUX runtime seams, not public product APIs.

## What This README Should Answer

Use this branch README when the question is:

- should this behavior live in a server seam at all
- is this a public API, an internal route, or a dev inspection route
- does this handler protect an important FireUX runtime boundary

If the question is only about Nitro route syntax, that belongs to Nuxt docs instead.

## Short Version

`runtime/server/` is for real FireUX server seams and runtime-only overrides.

The FireUX concern is boundary ownership, not basic server-handler mechanics.
