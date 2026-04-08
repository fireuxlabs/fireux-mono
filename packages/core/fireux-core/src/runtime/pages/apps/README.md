# Apps Pages

Authority: Operational
Updated: 2026-04-08
Scope: `packages/core/fireux-core/src/runtime/pages/apps/*`.

This folder owns the public app index and the current ensure-first app create surface.

## Current Routes

- `index.vue`
- `create.vue`

## Local Contract

- `index.vue` is the canonical app index
- `create.vue` is an ensure-first bootstrap page, not ordinary app CRUD
- every app scaffold should include `app/app.config.ts`
- the minimal app theme contract is `ui.colors.primary` plus `ui.colors.neutral`
- custom palettes should add `ui.safelistColors` when `primary` is not a stock Nuxt UI color

`create.vue` should:
- read runtime config first
- create `/apps/<appId>` only when missing
- re-run onboarding and bootstrap state safely
- stay safe to run multiple times

## Brand Asset Prep

Before running app onboarding, prepare the local app asset bucket from the
matching Figma export:

- source: `figma-export/apps/<app-id>/`
- target: `projects/<ecosystem>/<app-id>/public/img/app/`

Expected onboarding asset set:
- `logo.png`
- `cover.png`
- `thumbnail.png`
- `wordmark-light.png`
- `wordmark-light.svg`
- `wordmark-dark.png`
- `pwa/icon-192.png`
- `pwa/icon-512.png`
- `favicon.ico`

Operational rule:
- drag and drop or copy the exported assets into the local app bucket before initializing onboarding
- if `figma-export/apps/<app-id>/` is empty during local-only console work, you may temporarily loan another app's export to unblock development
- replace any loaned assets with the real app export before release

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
