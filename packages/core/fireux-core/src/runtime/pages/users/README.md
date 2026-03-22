# Users Pages

Authority: Operational
Updated: 2026-03-21
Scope: `packages/core/fireux-core/src/runtime/pages/users/*`.

This folder owns the `User` public route tree and the current ensure-first create surface.

## Current Routes

- `index.vue`
- `[handle].vue`
- `create.vue`

## Local Contract

- `index.vue` is the public users index
- `[handle].vue` is the public user detail route
- `create.vue` is an ensure-first create page, not free-form user CRUD

`create.vue` should:
- read the active auth user first
- create `/users/<uid>` only when missing
- ensure `/apps/<appId>/users/<uid>` when the active app needs the overlay
- stay safe to run multiple times

## Family

This folder currently spans two route roles:
- public identity pages
- ensure-first platform create

That mix is acceptable for now because `User` is both public identity and active platform bootstrap.

## Not Aligned Yet

- `create.vue` still reuses `UserCreateSystem`, even though the route is really setup and repair
- public identity pages and ensure-first bootstrap still share one folder

## Short Version

Keep `users/create.vue` truthful:
it is a safe ensure page that happens to live at a `create` route.
