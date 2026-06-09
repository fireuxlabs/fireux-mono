# Kitchens Pages

Authority: Operational
Updated: 2026-05-17
Scope: `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/*`.

This folder owns the public `Kitchen` route tree.

Use `packages/core/fireux-docs/src/runtime/concepts/console-entry/README.md` for the shared console-entry concept.
This README only explains the kitchen delta.

## Current Routes

- `index.vue`
- `[slug]/index.vue`
- `[slug]/edit.vue`
- `[slug]/menus/index.vue`
- `[slug]/menus/[menuId].vue`
- `[slug]/operator.vue`
- `create.vue`
- `learn-more.vue`
- `learn-more/dev.vue`

## Local Contract

- `index.vue` is the public kitchen index
- `index.vue` embeds the same chooser used by `/console/kitchen`
- `[slug]/index.vue` and menus index/detail are public kitchen delivery
- `[slug]/edit.vue` belongs to the public kitchen edit family
- `[slug]/operator.vue` is the public-to-private operator bridge
- `create.vue` is the public kitchen create page

Kitchen-specific delta:
- the public index can browse kitchens and also enter the kitchen chooser
- the collection below the chooser is public kitchen browsing, not console entry
- public kitchen URLs use `kitchen.slug`; `kitchen.id` remains the stored Firestore identity
- public create is place-backed and creates `kitchens/<id>` when missing
- when app context exists, the shared console create seam may also create `apps/<appId>/kitchens/<id>`
- entering live kitchen console routes uses operator-based Kitchen access, not Chef profile presence
- public menu publishing reads app-scoped Kitchen children:
  - `apps/<appId>/kitchens/<kitchenId>/menus/<menuId>`
  - `apps/<appId>/kitchens/<kitchenId>/dishes/<dishId>`
- public menu and dish copy renders directly from menu/dish text
- public menu delivery must not depend on private working `mise` or console operation lines

## Short Version

This folder owns the public kitchen side of the shared console-entry concept.
Its delta is:
- public browsing
- public kitchen create
- operator-aware live entry from the public chooser
