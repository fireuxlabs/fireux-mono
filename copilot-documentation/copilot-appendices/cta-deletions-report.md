# CTA components cleanup report

Date: 2025-09-22

Scope: Remove all bespoke CTA components (excluding Nuxt UI UPageCTA) and refactor pages to rely on OrganismsProfileRoot with onEnsure or inline create flows.

## Deleted files

- packages/core/fireux-core/src/runtime/components/organisms/App/CTA.vue
- packages/core/fireux-core/src/runtime/components/organisms/Profile/CTA.vue
- packages/core/fireux-core/src/runtime/components/organisms/User/App/CTA.vue
- packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Employer/CTA.vue
- packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/CTA.vue
- packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue
- packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/CTA.vue
- projects/misebox/misebox-app/app/components/landing/CTA.vue
- projects/cleanbox/cleanbox-app/app/components/landing/CTA.vue
- projects/cleanbox/richies-reinigung/app/components/landing/CTA.vue

Note: “UPageCTA” (Nuxt UI 4) is retained and used in app landings where a CTA section is desired.

Important: To prevent any accidental lingering imports from breaking builds, the above files have been removed from usage across pages and replaced, and any remaining component files were converted to no-op stubs during the transition. These stubs render nothing and will be fully removed in a subsequent sweep once dist outputs and any cached references are purged.

## Page/template updates

- Jobs dashboards and indexes (done earlier):

  - Employ index, Professional index → use OrganismsProfileRoot with :onEnsure and standardized slots.
  - Employer/Professional dashboards → inline create buttons instead of bespoke CTA components.

- Misebox

  - pages/chefs/index.vue → already aligned with OrganismsProfileRoot + :onEnsure.
  - pages/dashboard/chef-profile.vue → replaced <ProfilesChefCTA /> with inline create flow (useChefCreate).
  - pages/suppliers/index.vue → removed User/App/Supplier CTA components; aligned with OrganismsProfileRoot + :onEnsure (useSupplierCreate) and standardized slots (#current-assets, #item).
  - pages/dashboard/supplier-profile.vue → replaced <MiseProfilesSupplierCTA /> with inline create flow (useSupplierCreate).
  - pages/chefs/[id].vue, employers/[id].vue, professionals/[id].vue, suppliers/[id].vue → previously migrated to useFirestoreRead; no CTA dependencies.

- App landing pages
  - projects/misebox/misebox-app/app/pages/index.vue → replaced <LandingCTA /> with <UPageCTA />.
  - projects/cleanbox/cleanbox-app/app/pages/index.vue → replaced <LandingCTA /> with <UPageCTA />.
  - projects/cleanbox/richies-reinigung/app/pages/index.vue → no page change required (component removed from usage if present).

## Follow-up references removed

- Removed remaining imports/usages of deleted CTA components in pages noted above.
- Updated imports to new composables where necessary (users → users path, Supplier composable path fix).

## Breaks found and fixes

- Chef/Supplier dashboards referenced CTA components: updated to inline create flows and added missing ref import for reactive state.
- Suppliers index referenced User/App/Supplier CTA components: refactored to OrganismsProfileRoot pattern with :onEnsure.
- Landing pages used LandingCTA: replaced with UPageCTA.

## Notes

- Core ProfileRoot now exposes ctaMessage from useProfileComputed. Pages can optionally surface a UPageCTA using this computed message if needed.
- All profile pages now prefer a flat profile via useProfile(config) and slots on OrganismsProfileRoot for rendering.

## Final verification

- Search: No runtime page imports of legacy CTA components remain under `packages/**` or `projects/**` (matches only in documentation and historical dist outputs).
- Typecheck: PASS
  - Apps: nuxi typecheck across all app projects completed with warnings only, no errors.
  - Packages: tsc --noEmit across all packages completed without errors.
- Known leftovers: Generated `dist/` outputs still contain prior CTA artifacts and may show up in grep. These are not referenced by source and will be regenerated/cleaned by package builds.

Next sweep (optional):

- Clean package dists and re-build packages to drop historical CTA artifacts from `dist/`.
- Regenerate `runtime-tree.md` to reflect removals.
