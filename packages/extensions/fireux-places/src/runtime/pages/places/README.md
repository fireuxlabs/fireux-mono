# Places Pages

Authority: Operational
Updated: 2026-03-21
Scope: `packages/extensions/fireux-places/src/runtime/pages/places/*`.

This folder owns the `Place` public route tree.

## Current Routes

- `index.vue`
- `[id].vue`
- `create.vue`
- `edit/[id].vue`
- `learn-more.vue`

## Local Contract

- `index.vue`, `[id].vue`, and `learn-more.vue` are public place pages
- `create.vue` is a real place creation surface
- `edit/[id].vue` belongs to the public entity edit family

## Aligned With

Public entity edit family examples:
- `packages/extensions/fireux-companies/src/runtime/pages/companies/edit/[id].vue`
- `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/edit/[id].vue`

## Not Aligned Yet

- debug output still exists here and not across the full edit family
- create and edit both exist here, but they are different route roles and should not be treated as one family

## Short Version

This folder is a strong public entity route tree.
Its edit route is part of the shared edit family, while its create route belongs to the mixed public-create bucket.
