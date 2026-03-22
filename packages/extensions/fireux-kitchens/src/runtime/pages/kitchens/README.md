# Kitchens Pages

Authority: Operational
Updated: 2026-03-22
Scope: `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/*`.

This folder owns the public `Kitchen` route tree.

## Current Routes

- `index.vue`
- `[id].vue`
- `[id]/menu/[[menuId]].vue`
- `create.vue`
- `edit/[id].vue`
- `learn-more.vue`
- `learn-more/dev.vue`

## Local Contract

- `index.vue`, `[id].vue`, and menu detail are public or shareable kitchen delivery
- `create.vue` is the public root-create page for `Kitchen`
- `edit/[id].vue` belongs to the public entity edit family

Console creation canon:
- public create makes the root kitchen record
- console create ensures the app kitchen overlay and may create root first when missing

## Aligned With

Public entity edit family examples:
- `packages/extensions/fireux-companies/src/runtime/pages/companies/edit/[id].vue`
- `packages/extensions/fireux-places/src/runtime/pages/places/edit/[id].vue`

## Not Aligned Yet

- kitchen edit still carries place-backed assumptions
- public create and public edit are both present here, but they do not belong to the same family
- public and console kitchen create still reuse the same create system
- current kitchen create writes the root kitchen record, but console create does not yet explicitly ensure the app kitchen overlay

## Short Version

This folder mixes shareable kitchen pages with creation and edit.
`create.vue` is the public root-create page for the kitchen console, while `edit/[id].vue` is part of the public entity edit family.
