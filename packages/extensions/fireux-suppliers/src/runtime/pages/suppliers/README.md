# Suppliers Pages

Authority: Operational
Updated: 2026-05-17
Scope: `packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/*`.

This folder owns the public `Supplier` route tree.

Use `packages/core/fireux-docs/src/runtime/concepts/console-entry/README.md` for the shared console-entry concept.
This README only explains the supplier delta.

## Current Routes

- `index.vue`
- `[id].vue`
- `[id]/operator.vue`
- `create.vue`
- `admin/[id].vue`
- `learn-more.vue`

## Local Contract

- `index.vue`, `[id].vue`, and `learn-more.vue` are public supplier pages
- `[id]/operator.vue` is the public-to-private operator bridge
- `admin/[id].vue` is legacy redirect-only; public supplier route canon uses `operator`
- `create.vue` is the public root-create page for `Supplier`
- `console/supplier/create.vue` is the operational console create page

Supplier-specific delta:
- public create creates or ensures `suppliers/<id>`
- public create does not ensure `apps/<appId>/suppliers/<id>`
- live supplier entry still follows the current operator/company assumption
- supplier remains intentionally thinner than Kitchen and Portfolio

## Short Version

This folder owns the public supplier side of the shared console-entry concept.
Its delta is:
- public supplier discovery
- public supplier create
- thinner operator-first supplier entry
