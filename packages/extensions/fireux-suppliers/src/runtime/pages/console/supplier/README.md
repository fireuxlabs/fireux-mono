# Console Supplier Pages

Authority: Operational
Updated: 2026-03-23
Scope: `packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/*`.

This folder owns the operational supplier console workspace.

## Current Routes

- `index.vue`
- `overview.vue`
- `create.vue`

## Local Contract

- this folder is operational, not public
- `create.vue` belongs to the console create family
- `index.vue` and `overview.vue` are supplier workspace entry surfaces

Console creation canon:
- ensure `/apps/<appId>/suppliers/<supplierId>`
- create the root supplier first when missing
- act as the operational onboarding path for suppliers

## Aligned With

Console create family examples:
- `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/create.vue`
- `packages/ecosystem/fireux-granite/src/runtime/pages/console/portfolio/create.vue`

## Not Aligned Yet

- supplier console is still simpler than kitchen and portfolio console surfaces
- generic core helpers still expose some profile-era names in view/edit toggles

## Short Version

This folder is the supplier console workspace.
`create.vue` now follows the shared console ensure-create family and the rest of the workspace stays supplier-specific.
