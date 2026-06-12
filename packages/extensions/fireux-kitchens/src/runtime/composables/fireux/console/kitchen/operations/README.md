Authority: fireux-kitchens selected Kitchen operations layer
Updated: 2026-06-10
Extends: packages/core/fireux-docs/src/runtime/concepts/console/README.md

# Kitchen Console Operations

This directory owns composables for work an operator does inside a selected Kitchen workspace.

`operations` is a code bucket, not a Firestore collection, stored entity, or public route.

Use this layer for selected-Kitchen work such as:
- dishes
- menus
- recipes
- ingredients
- mise
- orders
- stations
- supplier links

Identity lives in `console/kitchen/identity/`.
Team lives in `console/kitchen/team/`.

Keep stored CRUD in `firestore/`.
Keep guest-facing route shaping in `public/kitchen/`.
Keep example or seed data outside this selected-Kitchen operations layer.
