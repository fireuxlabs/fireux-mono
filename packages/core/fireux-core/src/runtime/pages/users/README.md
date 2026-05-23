# Users Pages

Authority: Operational
Updated: 2026-05-18
Scope: `packages/core/fireux-core/src/runtime/pages/users/*`.

This folder owns the `User` public route tree and the current ensure-first
identity setup surface.

## Current Routes

- `index.vue`
- `[handle].vue`
- `create.vue`

## Local Contract

- `index.vue` is the public users index
- `[handle].vue` is the public user/profile detail route
- `create.vue` is an ensure-first identity setup page, not free-form user CRUD

`create.vue` should:
- read the active auth user first
- create `/users/<uid>` in the ecosystem identity database only when missing
- ensure `/apps/<appId>/users/<uid>` when the active app needs the overlay
- stay safe to run multiple times

## Family

User is an active identity + public profile + app overlay family.

Route roles:
- `/users` is public user/profile browse.
- `/users/[handle]` is the public user/profile page.
- `/dashboard/user-profile` manages the signed-in user's identity/profile.
- `/apps/<appId>/users/<uid>` is the `AppUser` membership/capability overlay.

This mix is intentional. `User` is not just a boring root entity: the active
runtime seam resolves the signed-in identity, while public routes expose profile
surfaces and `AppUser` carries app-specific role/capability state.

## AppUser Overlay

App-specific role, capability, membership, premium, console, and onboarding
state belongs in the `AppUser` overlay, not on root `User` identity.

Root `User` remains shared identity truth. In standalone product apps, the
active app database may differ from the ecosystem identity database; user
routes and profile hydration should still resolve canonical identity from the
ecosystem identity database.

## Short Version

Keep `users/create.vue` truthful:
it is a safe identity/app-membership ensure page that happens to live at a
`create` route.
