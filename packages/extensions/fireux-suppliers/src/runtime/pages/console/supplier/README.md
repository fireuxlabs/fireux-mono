# Console Supplier Pages

Authority: Operational
Scope: `packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/*`

This folder owns the operational supplier console workspace.

## Current Routes

- `index.vue` — supplier console entry / chooser
- `overview.vue` — selected supplier overview
- `catalogue.vue` — selected supplier catalogue
- `create.vue` — supplier create flow

## Local Contract

- This folder is operational, not public.
- Apps must opt into supplier visibility through console families.
- The shared console layout owns selection guarding.
- Supplier pages should not add local "No supplier selected" guards unless they need special behaviour.
- Selected-child pages should use `nav.requiresSelection: true`.

## Supplier Console Delta

- Create flow creates `apps/<appId>/suppliers/<supplierId>` when missing.
- Create flow creates the root supplier first when missing.
- Create flow seeds console authority for the current operator.

## Short Version

Supplier is one member of the shared console family system.

Keep supplier pages aligned with kitchen, portfolio/property, and project consoles:
same shell, same meta contract, same layout-level selection guard.
