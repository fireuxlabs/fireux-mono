# Kitchen Folders Report

Generated: 2026-02-19
Workspace root: `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono`

## Scope

This report includes kitchen-related files from:

- `packages/extensions/fireux-kitchens/**` (entire kitchen extension)
- `scripts/*kitchen*`
- `docs/kitchen-creation.md`

`node_modules` entries are excluded.

## Folder Organization Snapshot

### Main extension package

- `packages/extensions/fireux-kitchens/src/config/module/`
- `packages/extensions/fireux-kitchens/src/runtime/components/`
- `packages/extensions/fireux-kitchens/src/runtime/composables/`
- `packages/extensions/fireux-kitchens/src/runtime/layouts/`
- `packages/extensions/fireux-kitchens/src/runtime/models/`
- `packages/extensions/fireux-kitchens/src/runtime/pages/`

### Firestore composables (current + transitional)

- Legacy domain paths:
  - `.../firestore/kitchen/`
  - `.../firestore/ingredient/`
  - `.../firestore/menu/`
  - `.../firestore/mise/`
  - `.../firestore/dish/`
  - `.../firestore/supplier/`
  - `.../firestore/profiles/`
- New runtime-kitchen wrappers:
  - `.../firestore/runtime-kitchen/kitchen/`
  - `.../firestore/runtime-kitchen/ingredients/`
  - `.../firestore/runtime-kitchen/stack/`
  - `.../firestore/runtime-kitchen/orders/`
  - `.../firestore/runtime-kitchen/suppliers/`

### Kitchen Canon (locked)

- Global kitchen (`kitchens/{id}`): identity + metadata only.
- Runtime kitchen (`kitchens/{id}/*` subcollections): operational stack only.
- Boundary rule:
  - Global layer never reads subcollections.
  - Runtime layer never mutates root kitchen metadata.

## Full Kitchen-Related Filepaths (180)

```text
docs/kitchen-creation.md
packages/extensions/fireux-kitchens/README.md
packages/extensions/fireux-kitchens/package.json
packages/extensions/fireux-kitchens/registry.json
packages/extensions/fireux-kitchens/src/config/module/components-config.ts
packages/extensions/fireux-kitchens/src/config/module/composables-config.ts
packages/extensions/fireux-kitchens/src/config/module/layouts-config.ts
packages/extensions/fireux-kitchens/src/config/module/models-config.ts
packages/extensions/fireux-kitchens/src/config/module/pages-config.ts
packages/extensions/fireux-kitchens/src/config/module/plugins-config.ts
packages/extensions/fireux-kitchens/src/config/module/runtime-config.ts
packages/extensions/fireux-kitchens/src/config/module/server-config.ts
packages/extensions/fireux-kitchens/src/module.ts
packages/extensions/fireux-kitchens/src/runtime/components/dev/Chef/Dummy.vue
packages/extensions/fireux-kitchens/src/runtime/components/dev/Chef/System.vue
packages/extensions/fireux-kitchens/src/runtime/components/dev/Console/System.vue
packages/extensions/fireux-kitchens/src/runtime/components/dev/Ingredient/Dummy.vue
packages/extensions/fireux-kitchens/src/runtime/components/dev/Ingredient/System.vue
packages/extensions/fireux-kitchens/src/runtime/components/dev/Kitchen/Dummy.vue
packages/extensions/fireux-kitchens/src/runtime/components/dev/Kitchen/System.vue
packages/extensions/fireux-kitchens/src/runtime/components/dev/Kitchen/TestSystem.vue
packages/extensions/fireux-kitchens/src/runtime/components/dev/Menu/System.vue
packages/extensions/fireux-kitchens/src/runtime/components/dev/Supplier/System.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Dish/Cards/Cell.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Dish/Cards/Pill.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Dish/Cards/Preview.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Dish/Collection/List.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Dish/Collection/Manager.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Ingredient/CTA.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Ingredient/Cards/Cell.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Ingredient/Cards/Pill.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Ingredient/Cards/Preview.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Ingredient/Cards/Profile.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Ingredient/Collection/List.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Ingredient/Collection/Manager.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Ingredient/Create/Preview.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Ingredient/Create/System.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Ingredient/Create/Write.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Ingredient/Create/types.ts
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Ingredient/Edit.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/CTA.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Cards/Cell.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Cards/Pill.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Cards/Preview.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Cards/Profile.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Collection/List.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Collection/Manager.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Create/System.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Edit.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Ingredients/Create/System.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Ingredients/Create/Write.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/Ingredients/Create/types.ts
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/MyKitchensCTA.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Menu/Cards/Cell.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Menu/Cards/Pill.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Menu/Cards/Preview.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Menu/Collection/List.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Menu/Collection/Manager.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Mise/Cards/Cell.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Mise/Cards/Pill.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Mise/Cards/Preview.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Mise/Cards/Profile.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Mise/Collection/List.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Mise/Collection/Manager.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Supplier/Cards/Cell.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Supplier/Cards/Pill.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Supplier/Collection/List.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/Supplier/Collection/Manager.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/CTA.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/Cards/Cell.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/Cards/Pill.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/Cards/Preview.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/Cards/Profile.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/Collection/List.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/Collection/Manager.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/Create/Preview.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/Create/System.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/Create/Write.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/Edit/App.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/Edit/Core.vue
packages/extensions/fireux-kitchens/src/runtime/components/organisms/profiles/Chef/Edit/PreviewPanel.vue
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/routing/useKitchenConsoleNav.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/read-only-scenarios/_shared/builders.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/read-only-scenarios/_shared/kitchen.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/read-only-scenarios/_shared/packs/suppliers.pack.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/read-only-scenarios/_shared/types.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/read-only-scenarios/broth-bloom/index.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/read-only-scenarios/index.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/read-only-scenarios/stack-sizzle/index.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/read-only-scenarios/takumi-ramen/index.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/shared.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/state.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/useRuntimeKitchen.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/useRuntimeKitchenContext.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/useRuntimeKitchenData.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/useRuntimeKitchenDocument.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/dish/utils/view/useDishInterface.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/fetch/useIngredientFetch.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/fetch/useKitchenIngredientFetch.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/mutations/useIngredientCreate.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/mutations/useIngredientDelete.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/useIngredient.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/utils/view/useIngredientInterface.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenFetch.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenMenuStackFetch.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenOrderFetch.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/fetch/useKitchenSupplierFetch.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenCreate.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenIngredientAdd.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenIngredientRemove.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenMenuStackCreate.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenOrderCreate.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenUpdate.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/utils/view/useKitchenInterface.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/menu/utils/view/useMenuInterface.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/mise/mutations/useKitchenMiseCreate.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/mise/utils/view/useMiseEnPlaceInterface.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefCollection.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefComputed.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefCreate.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefDelete.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefFetch.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefUpdate.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/useChef.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/utils.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/ingredients/fetch/useKitchenIngredientFetch.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/kitchen/fetch/useKitchenFetch.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/orders/fetch/useKitchenOrderFetch.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/orders/mutations/useKitchenOrderCreate.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/orders/mutations/useKitchenOrderToggleItem.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/stack/fetch/useKitchenMenuStackFetch.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/stack/mutations/useKitchenMenuStackCreate.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/suppliers/fetch/useKitchenSupplierFetch.ts
packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierInterface.ts
packages/extensions/fireux-kitchens/src/runtime/layouts/kitchen-console.vue
packages/extensions/fireux-kitchens/src/runtime/models/dish.model.ts
packages/extensions/fireux-kitchens/src/runtime/models/ingredient.model.ts
packages/extensions/fireux-kitchens/src/runtime/models/kitchen-cost.model.ts
packages/extensions/fireux-kitchens/src/runtime/models/kitchen-mise.model.ts
packages/extensions/fireux-kitchens/src/runtime/models/kitchen-recipe.model.ts
packages/extensions/fireux-kitchens/src/runtime/models/kitchen-team.model.ts
packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts
packages/extensions/fireux-kitchens/src/runtime/models/menu.model.ts
packages/extensions/fireux-kitchens/src/runtime/models/order.model.ts
packages/extensions/fireux-kitchens/src/runtime/models/profiles/Chef/Chef.model.ts
packages/extensions/fireux-kitchens/src/runtime/models/profiles/Chef/supporting.ts
packages/extensions/fireux-kitchens/src/runtime/pages/chefs/[id].vue
packages/extensions/fireux-kitchens/src/runtime/pages/chefs/admin/[id].vue
packages/extensions/fireux-kitchens/src/runtime/pages/chefs/index.vue
packages/extensions/fireux-kitchens/src/runtime/pages/chefs/learn-more.vue
packages/extensions/fireux-kitchens/src/runtime/pages/console/chef/index.vue
packages/extensions/fireux-kitchens/src/runtime/pages/console/chef/my-recipes.vue
packages/extensions/fireux-kitchens/src/runtime/pages/console/chef/profile.vue
packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/dishes.vue
packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/haccp.vue
packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/index.vue
packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/ingredients.vue
packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/menu.vue
packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/mise.vue
packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/orders.vue
packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/purchase-orders.vue
packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/recipes.vue
packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/stations.vue
packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/suppliers.vue
packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/team.vue
packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/training.vue
packages/extensions/fireux-kitchens/src/runtime/pages/dev/fireux-kitchens.vue
packages/extensions/fireux-kitchens/src/runtime/pages/ingredients/[id].vue
packages/extensions/fireux-kitchens/src/runtime/pages/ingredients/index.vue
packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[id].vue
packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[id]/menu.vue
packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/create.vue
packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/edit/[id].vue
packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/index.vue
packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/learn-more.vue
packages/extensions/fireux-kitchens/tsconfig.json
scripts/migrate-chef-kitchen-ids.mjs
scripts/migrate-kitchen-thin-overlay.mjs
scripts/migrate-test-kitchens.ts
```
