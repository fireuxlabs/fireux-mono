Authority: fireux-kitchens public kitchen layer
Updated: 2026-06-03
Extends: packages/core/fireux-core/src/runtime/composables/fireux/public/README.md

# Kitchen Public Layer

This directory owns guest-facing Kitchen route helpers.

Current active surface:
- `/kitchens/[slug]/menus`
- `/kitchens/[slug]/menus/[menuId]`

Kitchen public helpers are needed because public menus combine Kitchen, Menu, Section, Item, Dish, publish state, language/chrome state, and unavailable states.

Keep stored CRUD in `firestore/`.
Keep selected operator workspace behavior in `console/kitchen`.
Keep fake scenario data in `demo/kitchen`.
