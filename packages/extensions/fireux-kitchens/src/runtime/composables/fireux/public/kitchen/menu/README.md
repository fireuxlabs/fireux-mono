Authority: fireux-kitchens public kitchen menu layer
Updated: 2026-06-03
Extends: packages/extensions/fireux-kitchens/src/runtime/composables/fireux/public/kitchen/README.md

# Kitchen Public Menu Layer

This directory owns guest-facing Kitchen Menu route helpers.

Use it for `/kitchens/[slug]/menus/**` shaping that combines Kitchen, Menu, Section, Item, Dish, publish state, and unavailable states.

Keep stored Menu CRUD in `firestore/menu`.
Keep selected operator menu workflows in `console/kitchen/operations`.
Keep Sproochli/language chrome helpers in `public/kitchen/sproochli`.
