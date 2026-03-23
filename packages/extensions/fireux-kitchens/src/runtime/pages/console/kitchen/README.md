# Console Kitchen Pages

Authority: Operational
Updated: 2026-03-23
Scope: `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/*`.

This folder owns the kitchen console workspace.

## Human Brief

The Kitchen Console is the operational control layer for a kitchen.

It is not the kitchen itself.
It is the app-hosted system that runs the kitchen day to day.

Kitchen split:
- root public kitchen
  - identity
  - name
  - place
  - basic public info
- app-hosted kitchen console
  - operations
  - runtime state
  - working records

For a kitchen console to exist, the kitchen must first have a root public entity.
The app then hosts the kitchen console for that kitchen.

Kitchen-owned operational data lives beneath:
- `apps/<appId>/kitchens/<kitchenId>/...`

That includes:
- ingredients
- recipes
- dishes
- menus
- mise
- orders
- supplier links
- internal lists and structures

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
- create the root public kitchen first when missing
- act as the operational onboarding path for kitchens

Operational data canon:
- root kitchen stays at `kitchens/<kitchenId>`
- kitchen console children live under `apps/<appId>/kitchens/<kitchenId>/...`
- the console is alive; the root kitchen is comparatively static

## Aligned With

Console create family examples:
- `packages/extensions/fireux-suppliers/src/runtime/pages/console/supplier/create.vue`
- `packages/ecosystem/fireux-granite/src/runtime/pages/console/portfolio/create.vue`

## Current Alignment

- `create.vue` follows the shared console create canon
- root kitchen reads remain root-scoped
- kitchen-owned operational reads and writes now default to the app-hosted console path
- the wider kitchen console tree is still richer than the other consoles, so this folder remains the main vertical proof of the console model

## Short Version

This folder is the live kitchen workspace.
Treat `create.vue` as the console ensure-create example, and the other routes as the operational system that runs the kitchen.
