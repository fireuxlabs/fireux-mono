# Console Supplier Pages

Authority: Operational
Updated: 2026-03-30
Scope: `packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/*`.

This folder owns the operational supplier console workspace.

Use `packages/core/fireux-docs/src/runtime/concepts/console-entry/README.md` for the shared console-entry concept.
This README only explains the supplier-console delta.

## Current Routes

- `index.vue`
- `overview.vue`
- `create.vue`
- `demo/index.vue`
- `demo/[scenarioId].vue`

## Local Contract

- this folder is operational, not public
- apps must opt into supplier visibility through `consoleFamilies`
- `index.vue` is the family-specific chooser in console shell
- `overview.vue` is the first selected-supplier workspace page
- `create.vue` belongs to the console create family
- demo entry stays route-driven through the shared console runtime helpers

Supplier-console delta:
- console create ensures `apps/<appId>/suppliers/<supplierId>`
- console create creates the root supplier first when missing
- console create seeds console authority for the current operator

## Short Version

This folder is the supplier-console half of the shared console-entry concept.
Treat Supplier like the other console families: owned live targets plus shared demo entry.
