# Kitchens Pages

Authority: Operational
Updated: 2026-03-25
Scope: `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/*`.

This folder owns the public `Kitchen` route tree.

Use `packages/core/fireux-docs/src/runtime/concepts/console-entry/README.md` for the shared console-entry concept.
This README only explains the kitchen delta.

## Current Routes

- `index.vue`
- `[id].vue`
- `[kitchenSlug]/menus/index.vue`
- `[kitchenSlug]/menus/[menuId].vue`
- `create.vue`
- `edit/[id].vue`
- `learn-more.vue`
- `learn-more/dev.vue`

## Local Contract

- `index.vue` is the public kitchen index
- `index.vue` embeds the same chooser used by `/console/kitchen`
- `[id].vue` and menus index/detail are public kitchen delivery
- `create.vue` is the public kitchen create page
- `edit/[id].vue` belongs to the public kitchen edit family

Kitchen-specific delta:
- the public index can browse kitchens and also enter the kitchen chooser
- the collection below the chooser is public kitchen browsing, not console entry
- public create is place-backed and creates or ensures `kitchens/<id>`
- public create does not ensure `apps/<appId>/kitchens/<id>`
- entering live kitchen routes normally ensure a Chef profile first

## Short Version

This folder owns the public kitchen side of the shared console-entry concept.
Its delta is:
- public browsing
- public kitchen create
- Chef-aware live entry from the public chooser
