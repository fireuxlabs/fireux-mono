# Kitchen Creation Report
Updated: 2026-03-25
Authority: Tier2 (Operational reference; canonical runtime policy is in `docs/runtime-contract.md`)

Generated: 2026-02-18

## Objective
Document the full current state of kitchen creation and define a consistent Kitchen↔Place relationship contract before wiring the full real-console flow.

## Executive Summary
- `/kitchens/create` is now wired to the real creation flow (`KitchenCreateSystem`).
- `/kitchens/create` is public create: it creates the root public kitchen entity.
- `/console/kitchen/create` is console activation: it ensures the app-hosted kitchen console overlay.
- Kitchen creation is place-backed by default: `useKitchenCreate()` now enforces place existence for live kitchens.
- Kitchens remain thin marker docs; place fields are sourced from `places/{id}` via read-time hydration.
- Relationship flows may still reference or ensure kitchens from outside the kitchens package, but that must not be treated as console authority.

## Three Truths

Kitchen has three separate truths:
- it exists as a public kitchen
- it can be operated as a kitchen console
- it can be connected to a person

That means:
- `Create Kitchen` creates the public kitchen
- `Activate Kitchen Console` ensures the app-hosted kitchen console
- `Add Kitchen To Profile` or workplace linking is relationship only

Relationship is not console authority.

## Current User Path (Public Create)
1. CTA links user to `/kitchens/create`.
2. Create page renders `KitchenCreateSystem`.
3. User confirms a place from search.
4. Flow ensures place exists, checks `kitchens/{id}`, then creates or reports existing kitchen.
5. Success currently stays on the same page (shows created/existing id).

## File Inventory

### 1) Entry Points and Route Surfaces
- `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/create.vue`
  - Public kitchen create route; mounts `KitchenCreateSystem` in `public` mode.
- `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/create.vue`
  - Console kitchen activation route; mounts `KitchenCreateSystem` in `console` mode.
- `packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/CTA.vue`
  - Shared chooser surface for public and console entry.
- `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/learn-more.vue`
  - “Create a kitchen” button also routes to `/kitchens/create`.
- `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/index.vue`
  - Kitchens listing page (`Misebox kitchens.`) and CTA host.

### 2) Kitchen Creation Core
- `packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Create/System.vue`
  - Creation workflow UI.
  - Uses `PlaceSearchSection` and `useKitchenCreate`.
  - Supports `public` and `console` modes.
  - In console mode, ensures the app overlay and links the kitchen to the chef profile as an association.
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenCreate.ts`
  - Canon kitchen create mutation.
  - Writes live kitchens to `misebox/kitchens`.
  - Writes test kitchens to `misebox-simulation/kitchens`.
  - Enforces place-backed create by default for live kitchens.
  - Supports explicit escape hatch via `ensurePlace: false` option.
  - Sets `is_test_kitchen` explicitly (`false` for live, `true` for test).

### 3) Kitchen Model + Read/Hydration Contract
- `packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts`
  - Stored `Kitchen` is minimal: `id`, `is_test_kitchen`, timestamps.
  - Runtime `Kitchen` is hydrated with place fields at read time.
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenFetch.ts`
  - Hydrates kitchens with `places/{id}` data.

### 4) Place Search + Place Persistence Dependencies
- `packages/extensions/fireux-places/src/runtime/components/organisms/Place/Search/Section.vue`
  - Search/select/confirm place flow.
  - Emits `{ placeId, place }` payload.
- `packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/mutations/usePlaceSave.ts`
  - `ensurePlaceExists()` creates `places/{id}` if missing.
  - Hydrates via Google details if needed and uploads image to Firebase Storage when applicable.
- `packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/fetch/search/usePlacesSearch.ts`
  - Firestore-first + Google-supplement search pipeline.
- `packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/place/fetch/google/usePlacesGoogle.ts`
  - Google autocomplete/details client adapters.
- `packages/extensions/fireux-places/src/runtime/server/api/places/autocomplete.get.ts`
  - Server proxy to Google Places autocomplete, includes basic rate limiting.
- `packages/extensions/fireux-places/src/runtime/server/api/places/details.get.ts`
  - Server proxy to Google Place details.
- `packages/extensions/fireux-places/src/runtime/server/api/places/logo.get.ts`
  - Best-effort logo resolution endpoint.
- `packages/extensions/fireux-places/src/runtime/server/utils/places-api-key.ts`
  - API key resolution for places server endpoints.

### 5) Core Firestore Write Helpers
- `packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCreate.ts`
  - `setDocument()` stamps `created_at` + `updated_at` by default.
  - Optional creator/app stamping support.

### 6) Post-Create and Edit Surfaces
- `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[id].vue`
  - Kitchen detail page (hydrated from place).
- `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/edit/[id].vue`
  - Edit page uses place editor for kitchen’s place-bound fields.
- `packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Edit.vue`
  - Kitchen edit message indicates thin-marker approach.
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenUpdate.ts`
  - Kitchen patch mutation.

### 7) Runtime Selection/Data Context (Console Side)
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/useActiveKitchen.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/state.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/useRuntimeKitchenDocument.ts`
- `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/useRuntimeKitchenData.ts`

### 8) Cross-Extension Consumers of `useKitchenCreate`
- `packages/extensions/fireux-jobs/src/runtime/components/organisms/Job/Create/Location.vue`
- `packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Fields/ExperienceSection.vue`

These may ensure public kitchen docs as side effects when selecting workplaces/experience locations.
They do not create the kitchen console overlay.

## Runtime Flow (Current)
1. User searches place in `PlaceSearchSection`.
2. Confirm emits `placeId` + normalized place draft.
3. `Kitchen/Create/System.vue` calls `ensurePlaceExists(place)`.
4. It checks `kitchens/{placeId}`:
   - If exists: shows “Kitchen already exists”.
   - If missing: calls `createKitchen({ id: placeId, place })`.
5. `createKitchen()` re-validates place backing (unless explicitly disabled for test/internal usage).
6. `createKitchen()` writes kitchen doc via `setDocument()`.
7. Success state shows created kitchen id.

## Kitchen ↔ Place Relationship (Canonical Contract)

### Invariant
For live kitchens, a kitchen must always be place-backed.

### Identity Rule
- Kitchen document id equals place document id.
- Required pair:
  - `places/{id}` exists
  - `kitchens/{id}` exists

### Data Ownership Rule
- `places/{id}` owns location/business identity fields (name, address, geo, image, claim).
- `kitchens/{id}` owns kitchen-scoped marker/state only (currently thin record with test flag + stamps).
- Kitchen runtime object is hydrated from place at read time.

### Creation Rule
- Live create must fail if place cannot be ensured.
- Live create accepts either:
  - explicit `place` payload (preferred), or
  - pre-existing `places/{id}` document.

### Exception Rule
- Test/internal flows may opt out via `ensurePlace: false`.
- This is escape-hatch behavior and should not be default for live kitchens.

### Why this matters
- Prevents broken foreign-key style states (`kitchens/{id}` without `places/{id}`).
- Keeps all read surfaces deterministic.
- Removes caller-by-caller responsibility for place enforcement.

## Remaining Gaps
1. Public create versus console activation can still be blurred in product copy
- Public create and console activation are now different behaviors and should stay differently labeled.

2. Relationship and authority must stay distinct
- `chef.kitchen_ids` is association.
- Console access comes from overlay governance or allowed claim rules.

3. Duplicate place ensure behavior
- Place is ensured in `PlaceSearchSection` path and again in `useKitchenCreate`.
- Safe but redundant; can be simplified later.

4. No explicit auth gate on create route
- `kitchens/create.vue` currently lacks `requiresAuth: true`.

5. Schema drift risk from cross-extension calls
- Jobs components pass extra fields (e.g. `website`, `professionals_current`, `professionals_alumni`) into `createKitchen()`.
- Current mutation can persist unexpected keys unless payload is explicitly narrowed.

6. UX gap after success
- Current creation system shows success/existing state but does not auto-redirect to detail/console.

## Next Wiring Steps (Recommended)
1. Lock route and CTA labels around:
   - `Create Kitchen`
   - `Activate Kitchen Console`
   - `Add Kitchen To Profile`
2. Add explicit payload allow-list in `useKitchenCreate` to prevent schema drift from cross-extension callers.
3. Decide single place-ensure owner for UI flow (component vs mutation), keeping mutation-level guard as safety.

## Additional Observations
- Kitchen read/edit flow is already place-centric and compatible with the thin-marker model.
- Place APIs depend on configured Google Places API key (`resolvePlacesApiKey`).
- If key/env is missing, create-by-search can degrade to empty/failed upstream results.
