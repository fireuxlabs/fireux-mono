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
- `useKitchenPublicMenuTranslations.ts` reads cached public translations.
- `useKitchenPublicMenuLanguagePrepare.ts` requests missing Sproochli cache rows.
- `types.ts` owns public row types.

The route-triggered language prepare path is split outside this composable layer:
- `server/api/kitchens/public-menu/prepare-language.post.ts` owns the HTTP route.
- `server/utils/kitchens/publicMenuLanguageFields.ts` adapts Kitchen/Menu/Dish truth into translatable fields.
- `server/utils/kitchens/publicMenuTranslationCache.ts` reads and writes the Kitchen-owned translation cache.
- `fireux-sproochli` owns supported languages, provider URLs, and Menu translation provider contracts.

Menu is a public-rendered scoped entity:
- Kitchen owns the scoped Menu records.
- Public routes may show published Menu records.
- Public routes do not create root Menu truth.
- Public routes do not promote or migrate scoped records.

The menu layer keeps Menu loading and publish truth in Kitchens. Sproochli owns language UI/helpers; Kitchen menu routes may call those helpers to decorate already-loaded public menu data.
<!-- docs:public:end -->

Keep stored Menu CRUD in `firestore/menu`.
Keep selected operator menu workflows in `console/kitchen/operations`.
Keep Sproochli/language chrome helpers in `fireux-sproochli`.
