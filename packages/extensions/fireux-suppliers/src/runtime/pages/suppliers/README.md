# Suppliers Pages

Authority: Operational
Updated: 2026-03-23
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

- shared admin-create helpers and view toggles still use generic core profile-era names
- supplier still has some legacy content fields in the model and detail/edit surfaces

## Short Version

Treat `suppliers/create.vue` as the public root-create page for the supplier console.
The console route owns overlay enablement, and the live implementation now follows that rule.
