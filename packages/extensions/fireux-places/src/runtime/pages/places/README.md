# Places Pages

Authority: Operational
Updated: 2026-06-04
Scope: `packages/extensions/fireux-places/src/runtime/pages/places/*`.

This folder owns the `Place` public route tree.

## Current Routes

- `index.vue`
- `create.vue`
- `[id]/index.vue` accepts canonical Place id or stored slug
- `[id]/edit.vue` accepts canonical Place id or stored slug
- `learn-more.vue`

## Local Contract

- `index.vue`, `[id]/index.vue`, and `learn-more.vue` are public place pages
- `create.vue` is a real place creation surface
- `[id]/edit.vue` belongs to the public entity edit family
- `[id]` is the Place public locator segment; it may receive a canonical Place id or a stored slug

## Aligned With

Public entity edit family examples:
- `packages/extensions/fireux-companies/src/runtime/pages/companies/[id]/edit.vue`
- `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[slug]/edit.vue`
- `packages/extensions/fireux-places/src/runtime/pages/places/[id]/edit.vue`

## Not Aligned Yet

- debug output still exists here and not across the full edit family
- create and edit both exist here, but they are different route roles and should not be treated as one family

## Short Version

This folder is a strong public entity route tree.
Its edit route is part of the shared edit family, while its create route belongs to the mixed public-create bucket.
