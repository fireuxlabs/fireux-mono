# Apps Pages

Authority: Operational
Updated: 2026-03-21
Scope: `packages/core/fireux-core/src/runtime/pages/apps/*`.

This folder owns the public app index and the current ensure-first app create surface.

## Current Routes

- `index.vue`
- `create.vue`

## Local Contract

- `index.vue` is the canonical app index
- `create.vue` is an ensure-first bootstrap page, not ordinary app CRUD

`create.vue` should:
- read runtime config first
- create `/apps/<appId>` only when missing
- re-run onboarding and bootstrap state safely
- stay safe to run multiple times

## Family

This folder currently spans two route roles:
- public system index
- ensure-first platform bootstrap

That mix is acceptable for now because `App` is an active platform entity that still needs a fallback bootstrap surface.

## Not Aligned Yet

- app bootstrap still depends on runtime config and onboarding state rather than a simple record form
- there is no separate app repair or diagnostics tree because the create route already carries that load

## Short Version

Keep `apps/create.vue` truthful:
it bootstraps or repairs the current app, not a generic app record chosen by the user.
