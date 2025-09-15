# Chefs Index: Behavior and Tenancy Notes

Effective: 2025-09-15
Scope: Core + Misebox tenant (global chefs) and Niederhorn tenant (app-scoped chefs)

## Overview

The Chefs index page renders a tenancy-aware CTA stack and a list of Chef profiles via `OrganismsProfileRoot`.

- Misebox (main tenant/app): shows the global ecosystem-wide chefs collection (`chefs/*`).
- Niederhorn (app variant): should show only app-scoped chefs (`apps/{appId}/chefs/*`).

CTAs (call-to-action) stack in order:

1. Core identity CTA: shown when no CoreUser.
2. App membership CTA: shown when appTenancy is `tennant` and user is not a member.
3. Chef CTA: shown when signed-in and allowed for the app (app member if tenant).

## Current implementation

File: `packages/tenants/fireux-misebox/src/runtime/pages/chefs/index.vue`

- Uses `OrganismsProfileRoot :config="chefConfig"` with three slots:
  - `#profile-pill`, `#profile-card`: when the current user has a Chef profile
  - `#profile-item`: for the list/grid items
- Navigation uses new ID convention: `id` equals the document ID (uid). Links `/chefs/{id}`.
- `OrganismsProfileRoot` now:
  - Pulls current user’s profile from app scope (preferred) then ecosystem fallback
  - Lists profiles from the ecosystem collection via `useProfile(config).ecosystemCollection`

File: `packages/core/fireux-core/src/runtime/components/organisms/Profile/Root.vue`

- Simplified API: `config` only; no filter composables.
- Returns:
  - current (computed): `appProfile || ecosystemProfile`
  - list (computed): `ecosystemCollection || []`

## Tenancy behavior

- Misebox (global): Rendering uses `ecosystemCollection` -> all global chefs (chefs/\*). This is desired.
- Niederhorn (app-scoped): Should render `apps/{appId}/chefs/*` only.

Today, `OrganismsProfileRoot` always lists `ecosystemCollection`. For Niederhorn to list only app-scoped chefs, it needs either:

- a toggle on `config` (e.g., `scope: 'ecosystem' | 'app' | 'auto'`) or
- a per-page override prop (e.g., `scope="app"`) or
- a second list component specialized for app scope.

Recommendation: add an optional `scope` prop to `OrganismsProfileRoot` with default `'ecosystem'` to avoid breaking Misebox. Pass `scope="app"` from Niederhorn’s chefs index.

Proposed behavior:

- `scope='ecosystem'` -> list uses `ecosystemCollection` (chefs/\*)
- `scope='app'` -> list uses `appCollection` (apps/{appId}/chefs/\*)
- `scope='auto'` -> if appTenancy is tenant, prefer app; else ecosystem

## CTA logic summary

- Core CTA: `v-if="!coreUser"`
- App CTA: `v-if="appTenancy === 'tennant' && !appUser"`
- Chef CTA: `v-if="coreUser && (appTenancy !== 'tennant' || appUser)"`

This gates creation appropriately for both global and app-scoped contexts.

## Minimal changes to support Niederhorn app scope

1. Extend `useProfile(config)` to expose an app-scoped collection ref:
   - Add `appCollection = firestoreFetchCollection(`apps/${appId}/${config.collectionName}`)` guarded on `appId`.
2. Update `OrganismsProfileRoot` to accept an optional `scope` prop and choose list accordingly.
3. In Niederhorn’s `pages/chefs/index.vue`, pass `scope="app"` to `OrganismsProfileRoot`.

This preserves the current Misebox behavior by default and adds an explicit path for app-specific listing.

## References

- Root: `packages/core/fireux-core/src/runtime/components/organisms/Profile/Root.vue`
- Chefs page (Misebox): `packages/tenants/fireux-misebox/src/runtime/pages/chefs/index.vue`
- Chef model: `packages/tenants/fireux-misebox/src/runtime/models/profiles/Chef.model.ts`
- Profile composable: `packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfile.ts`

## Future enhancements

- Reintroduce optional page-level filters (search, facets) without coupling into core.
- Add SSR-friendly loading skeletons for list and CTA areas.
- Consider a tiny `ProfileList` wrapper that can accept a pre-filtered array to remain framework-agnostic.
