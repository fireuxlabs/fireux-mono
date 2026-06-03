Authority: fireux-kitchens public kitchen menu layer
Updated: 2026-06-03
Extends: packages/extensions/fireux-kitchens/src/runtime/composables/fireux/public/kitchen/README.md

# Kitchen Public Menu Layer

This directory owns the guest-facing Kitchen Menu route helper.

`useKitchenPublicMenu.ts` exports the public menu index/detail seams and row types for `/kitchens/[slug]/menus/**`.

Keep stored Menu CRUD in `firestore/menu`.
Keep selected operator menu workflows in `console/kitchen/operations`.
Keep Sproochli/language chrome helpers in `public/kitchen/sproochli`.
