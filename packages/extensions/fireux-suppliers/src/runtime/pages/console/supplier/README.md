# Console Supplier Pages

Authority: Operational
Updated: 2026-03-26
Scope: `packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/*`.

This folder owns the operational supplier console workspace.

Use `packages/core/fireux-docs/src/runtime/concepts/console-entry/README.md` for the shared console-entry concept.
This README only explains the supplier-console delta.

## Current Routes

- `index.vue`
- `overview.vue`
- `create.vue`

## Local Contract

- this folder is operational, not public
- `index.vue` is the family-specific chooser in console shell
- `create.vue` belongs to the console create family
- `overview.vue` is supplier workspace delivery

Supplier-console delta:
- console create ensures `apps/<appId>/suppliers/<supplierId>`
- console create creates the root supplier first when missing
- console create seeds console authority for the current operator
- supplier console stays intentionally simpler than Kitchen and Portfolio

## Short Version

This folder is the supplier-console half of the shared console-entry concept.
Treat it as a thinner console reference, not a profile-era surface.
