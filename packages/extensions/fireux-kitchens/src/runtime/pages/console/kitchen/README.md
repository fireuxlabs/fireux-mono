# Console Kitchen Pages

Authority: Operational
Updated: 2026-03-28
Scope: `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/*`.

This folder owns the kitchen console workspace.

Use `packages/core/fireux-docs/src/runtime/concepts/console-entry/README.md` for the shared console-entry concept.
This README only explains the kitchen-console delta.

## Current Routes

- `index.vue`
- `overview.vue`
- `create.vue`
- `menu.vue`
- `recipes.vue`
- `orders.vue`
- `ingredients.vue`
- `mise.vue`
- `team.vue`
- and other kitchen-owned operational views

## Local Contract

- this folder is operational, not public
- apps must opt into kitchen visibility through `consoleFamilies`
- `index.vue` is the family-specific chooser in console shell
- `create.vue` is the kitchen console create page
- the rest of the routes are kitchen-owned operational delivery

Kitchen-specific delta:
- live kitchen entry is Chef-aware
- `index.vue` and `/kitchens` intentionally share the same chooser component
- console create ensures `apps/<appId>/kitchens/<kitchenId>`
- console create creates the public kitchen first when missing
- console create seeds user-based console authority and may also link the kitchen to the Chef profile as a prerequisite/relationship side effect
- operational records live under `apps/<appId>/kitchens/<kitchenId>/...`

Kitchen is currently the reference implementation of the shared console-entry pattern.
It proves:
- `/console` -> choose family
- `/console/kitchen` -> choose kitchen instance, mode, or create console
- `/kitchens` -> public discovery plus the same chooser
- `/kitchens/create` -> public create
- `/console/kitchen/create` -> console create

## Short Version

This folder is the kitchen-console half of the shared console-entry concept.
Treat it as the current reference implementation of that pattern.
