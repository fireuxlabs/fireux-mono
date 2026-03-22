# Console Kitchen Pages

Authority: Operational
Updated: 2026-03-22
Scope: `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/*`.

This folder owns the operational kitchen console workspace.

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
- `create.vue` belongs to the console create family
- the rest of the routes are kitchen-owned operational delivery

Console creation canon:
- ensure `/apps/<appId>/kitchens/<kitchenId>`
- create the root kitchen first when missing
- act as the operational onboarding path for kitchens

## Aligned With

Console create family examples:
- `packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/create.vue`
- `packages/ecosystem/fireux-granite/src/runtime/pages/console/portfolio/create.vue`

## Not Aligned Yet

- create-system props and return flows still vary by console
- the wider kitchen console tree is richer than the other consoles, so only `create.vue` is part of the shared family right now
- current `create.vue` still reuses the same create system as the public kitchen route
- the app kitchen overlay behavior is part of canon, but not yet explicit in the current implementation

## Short Version

This folder is a real console workspace.
Treat `create.vue` as the console ensure-create example, and the other routes as kitchen-specific operations.
