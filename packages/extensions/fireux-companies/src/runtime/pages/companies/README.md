# Companies Pages

Authority: Operational
Updated: 2026-06-04
Scope: `packages/extensions/fireux-companies/src/runtime/pages/companies/*`.

This folder owns the `Company` public route tree.

## Current Routes

- `index.vue`
- `[id]/index.vue`
- `[id]/edit.vue`
- `create.vue`
- `learn-more.vue`

## Local Contract

- `index.vue`, `[id]/index.vue`, and `learn-more.vue` are public entity pages
- `[id]/edit.vue` belongs to the public entity edit family
- `create.vue` exists, but is still placeholder-like and should not be treated as a locked family example yet

## Aligned With

Public entity edit family examples:
- `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/edit/[id].vue`
- `packages/extensions/fireux-places/src/runtime/pages/places/[id]/edit.vue`
- `packages/extensions/fireux-companies/src/runtime/pages/companies/[id]/edit.vue`

## Not Aligned Yet

- `create.vue` is not yet a real company creation flow
- preview depth and entity-specific edit details still vary across the edit family

## Short Version

This folder is a good reference for public company delivery, but only the edit route is currently part of a clearer cross-repo family.
