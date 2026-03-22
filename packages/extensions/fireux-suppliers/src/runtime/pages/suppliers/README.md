# Suppliers Pages

Authority: Operational
Updated: 2026-03-22
Scope: `packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/*`.

This folder owns the public `Supplier` route tree.

## Current Routes

- `index.vue`
- `[id].vue`
- `create.vue`
- `admin/[id].vue`
- `learn-more.vue`

## Local Contract

- `index.vue`, `[id].vue`, and `learn-more.vue` are public supplier pages
- `admin/[id].vue` is a privileged management surface
- `create.vue` is the public root-create page for `Supplier`
- `console/supplier/create.vue` is the operational console create page

Console creation canon:
- public create makes the root supplier record
- console create ensures the app supplier overlay and may create root first when missing

## Aligned With

Public console root-create examples:
- `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/create.vue`
- `packages/extensions/fireux-properties/src/runtime/pages/portfolios/create.vue`

## Not Aligned Yet

- public and console supplier create still reuse the same create system
- the data behavior is already close to canon, but the page-role split is clearer in docs than in the current implementation
- some supplier dashboard and admin internals still sit on profile-era infrastructure even though the surface language has been neutralized

## Short Version

Treat `suppliers/create.vue` as the public root-create page for the supplier console.
The console route should own overlay enablement.
