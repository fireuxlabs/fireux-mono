---
title: FireUX Places Overview
status: active
updated: 2025-10-15
---

# FireUX Places — Overview

## Scope

- Source of truth for the Places extension shipped from `packages/extensions/fireux-places`.
- Verified against the current code on 2025-10-15 (see `module.ts`, `runtime/` components, and server API handlers).

## Module entry

- `src/module.ts` installs `fireux-core`, registers runtime assets, and exposes composables/pages.
- Tenants import it (e.g. `fireux-misebox` lists the extension in its dependencies) — apps just add the tenant in `createFireuxConfig`.

## Search flow

- UI root: `src/runtime/pages/places/index.vue` renders `OrganismsPlacesSearchSection` and a saved-places sidebar.
- State machine: `src/runtime/composables/usePlacesSearch.ts` fan-outs to Firestore first (`useFirestoreSearch`) and falls back to Google Autocomplete once the query exceeds three characters.
- Result cards live under `src/runtime/components/organisms/places/Search/` (Bar, Dropdown, Section, Selected).

## Logo + details pipeline

- `src/runtime/composables/usePlaceLogos.ts` manages logo resolution with per-place caches, abortable fetches, retries, and sanitisation guards.
- `usePlacesSearch.ts` hydrates shortlist logos opportunistically and hands the selected card to the logo state helper (priority requests, auto-retry on empty).
- `src/runtime/components/organisms/places/Cell.vue` (and `Selected.vue`) bind the state helper so UI spinners map to real network progress.

## Saving confirmation

- `src/runtime/composables/usePlaceSave.ts` ensures Firestore persistence by calling `useFirestoreManager.setDocument` with canonicalised IDs.
- `OrganismsPlacesSearchSection.vue` coordinates confirmation: fetches Google details, uploads the avatar (see below), and emits the saved payload.

## Server endpoints

- `src/runtime/server/api/places/autocomplete.get.ts` — Google Autocomplete proxy with a simple per-IP rate limiter.
- `src/runtime/server/api/places/details.get.ts` — Google Place Details proxy used before saving.
- `src/runtime/server/api/places/logo.get.ts` — progressive logo resolver (homepage crawl → score → Clearbit/Unavatar/Google S2 → placeholder).

## Storage + avatars

- Logo uploads flow through the confirm handler using `uploadFromUrl('places/${placeId}/avatar', ...)`.
- Sanitisation lives inside `usePlaceLogos.ts` (`sanitizeLogoAvatar`, fallback chain rejects Google default pins).

## Data model

- `src/runtime/models/place.model.ts` defines types for shortlist cells, saved documents, and detail payloads.
- Saved documents live in Firestore collection `places` with `search_term` indexed for prefix search.

## Quick checks when editing

- Run `pnpm dev:misebox` and visit `/places` — shortlist should surface Firestore hits instantly, Google hits after three characters.
- Confirm that `/api/places/logo?q=<name>` returns a URL (watch server logs for `[places-logo]`).
- After confirmation, Firestore should contain `places/<canonicalId>` and Storage should hold `places/<canonicalId>/avatar`.

## Related scripts

- `sporadic-places-files.md` (root of the package) is now redundant — consult this overview instead.
