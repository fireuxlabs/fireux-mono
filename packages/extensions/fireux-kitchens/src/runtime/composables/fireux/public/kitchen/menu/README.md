Authority: fireux-kitchens public kitchen menu layer
Updated: 2026-06-06
Extends: packages/extensions/fireux-kitchens/src/runtime/composables/fireux/public/kitchen/README.md

# Kitchen Public Menu Layer

<!-- docs:public:start -->
This directory owns the guest-facing Kitchen Menu route helper.

`useKitchenPublicMenu.ts` is the entry point for `/kitchens/[slug]/menus/**`.

The menu public seam is split by job:
- `useKitchenPublicMenuScope.ts` finds the public Kitchen and published Menu.
- `useKitchenPublicMenuDetail.ts` composes the detail route data.
- `useKitchenPublicMenuRows.ts` shapes sections, items, and dishes into display rows.
- `useKitchenPublicMenuItems.ts` reads scoped menu items.
- `useKitchenPublicMenuTheme.ts` resolves small public menu theme tokens.
- `types.ts` owns public row types.
- Menu maturity is derived, not stored. The route can render source, structured,
  or orderable presentations without changing the URL.

Menu is a public-rendered scoped entity:
- Kitchen owns the scoped Menu records.
- Public routes may show published Menu records.
- Public routes do not create root Menu truth.
- Public routes do not promote or migrate scoped records.

The menu layer keeps Menu loading and publish truth in Kitchens. Translation/language upgrades should decorate already-loaded Menu data from outside this base seam.
<!-- docs:public:end -->

Keep stored Menu CRUD in `firestore/menu`.
Keep selected operator menu workflows in `console/kitchen/Operations`.
Keep translation/language chrome helpers outside the base Kitchen Menu layer.
