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

Standard dimensions:
- `logo.png`: PNG, exactly `512x512`
- `thumbnail.png`: PNG, exactly `1200x630`
- `wordmark-light.png` / `wordmark-dark.png`: PNG, at least `256x64`, aspect at least `3:1`
- `cover.png`: PNG, `16:9`, at least `1280x720`
- `favicon.ico`: ICO or PNG, square, at least `32x32`
- `pwa/icon-192.png` / `pwa/icon-512.png`: PNG, exactly `192x192` / `512x512`

Operational rule:
- drag and drop or copy the exported assets into the local app bucket before initializing onboarding
- if `figma-export/apps/<app-id>/` is empty during local-only console work, you may temporarily loan another app's export to unblock development
- replace any loaned assets with the real app export before release

## Family

This folder currently spans two route roles:
- public system index
- ensure-first platform bootstrap

That mix is acceptable for now because `App` is an active platform entity that still needs an ensure-first bootstrap surface.

## Field Groups

`AppModel` is stored once as root truth at `apps/{appId}`.
Field groups do not create separate App records. They only say which surface
should handle each field on the same root App record.

Simple rule:

- If it changes how the app looks to users: Admin.
- If it changes how the app is built or checked: Developer.
- If it changes where the app belongs: App Control.
- If it is calculated or internal: System.

Admin runs the app. It may edit public app content and membership:

- `tagline`
- `description`
- `short_bio`
- `long_bio`
- `social_links`
- `join_requests`
- `admin_ids` / app user roles

Developer builds and checks the app. `/dashboard/developer` is gated by
`DEVELOPER_ID` and owns:

- `media`
- `database_id`
- `fireux_native`
- `fireux_size`
- `fireux_repo`

App Control changes where the app belongs, what it is called, and how it is
found. These fields can affect other records, links, SEO, cards, or app identity,
so they do not belong in Admin:

- `project_id`
- `ecosystem_id`
- `slug`
- `status`
- `team`
- `role`
- `ecosystem`
- `app_name`
- `app_short_name`

System owns calculated/internal fields:

- `id`
- `derived`
- `created`
- `updated`

## Not Aligned Yet

- app bootstrap still depends on runtime config and onboarding state rather than a simple record form
- there is no separate app repair or diagnostics tree because the create route already carries that load

## Short Version

Keep `apps/create.vue` truthful:
it bootstraps or repairs the current app, not a generic app record chosen by the user.
