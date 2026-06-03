Authority: fireux-kitchens public kitchen menu layer
Updated: 2026-06-03
Extends: packages/extensions/fireux-kitchens/src/runtime/composables/fireux/public/kitchen/README.md

# Kitchen Public Menu Layer

<!-- docs:public:start -->
This directory owns the guest-facing Kitchen Menu route helper.

`useKitchenPublicMenu.ts` exports the public menu index/detail seams and row types for `/kitchens/[slug]/menus/**`.

Menu is a public-rendered scoped entity:
- Kitchen owns the scoped Menu records.
- Public routes may show published Menu records.
- Public routes do not create root Menu truth.
- Public routes do not promote or migrate scoped records.

The menu layer is intentionally ignorant of Sproochli/language. Language helpers may decorate public menu routes from `public/kitchen/sproochli`, but Menu loading and publish truth do not depend on that layer.
<!-- docs:public:end -->

Keep stored Menu CRUD in `firestore/menu`.
Keep selected operator menu workflows in `console/kitchen/operations`.
Keep Sproochli/language chrome helpers in `public/kitchen/sproochli`.
