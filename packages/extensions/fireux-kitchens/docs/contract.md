# fireux-kitchens Contract
Authority: Tier1 (Authoritative)
Updated: 2026-04-04
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own kitchen runtime domain, kitchen operations entities, and kitchen console behavior.
- Kitchen is split into:
  - a root public kitchen entity
  - an app-hosted kitchen console for operations

## 2) Core entities
- `Kitchen`
- `Ingredient` / `KitchenIngredient`
- `KitchenMiseTask`
- `Dish`
- `Menu`
- `Chef`

## 3) Identity rule
- Live kitchen identity is place-backed and id-based; console runtime selection is state-based.
- Chef association (`chef.kitchen_ids`) and workplace/profile links are relationship signals only.
- Kitchen console authority comes from user-based console governance (`admin_ids`, `console_enabled`) or allowed canonical claim rules, not from profile association alone.
- `Chef` is currently a live-operation prerequisite and presentation layer, not a separate stored console ownership model.

## 4) Collections + paths
- Live: `kitchens/{kitchenId}`
- Live kitchen console: `apps/{appId}/kitchens/{kitchenId}`
- Global ingredients: `ingredients/{ingredientId}`
- Kitchen-owned operational children:
  - `apps/{appId}/kitchens/{kitchenId}/ingredients/{ingredientId}`
  - `apps/{appId}/kitchens/{kitchenId}/recipes/{recipeId}`
  - `apps/{appId}/kitchens/{kitchenId}/dishes/{dishId}`
  - `apps/{appId}/kitchens/{kitchenId}/menus/{menuId}`
  - `apps/{appId}/kitchens/{kitchenId}/mise/{taskId}`
  - `apps/{appId}/kitchens/{kitchenId}/orders/{orderId}`
- Runtime kitchen mode mapping follows `docs/runtime-contract.md`.

## 5) Routes (public vs internal; slug vs id)
- Public/internal id-based pages currently include:
  - `/kitchens/[id]`
  - `/kitchens/[id]/menu`
  - `/kitchens/[id]/menu/[menuId]`
  - `/ingredients/[id]`
- Console/internal:
  - `/console/kitchen/*`
- Console selection is runtime-state based, not query-param selection.
- The console hosts operations; it is not the same thing as the public kitchen page.
- `/console/kitchen` is the family entry page:
  - `demo`: curated demo kitchens
  - `test`: Firestore-backed test kitchens
  - `live`: my real kitchens for this app
- `test` canon is one personal kitchen per signed-in user:
  - `test-kitchens/{uid}`
  - ensured on entry to `/console/kitchen` in `test` mode
  - not created during auth
- `my real kitchens` means kitchens the current user can operate through the app overlay:
  - `apps/{appId}/kitchens/{kitchenId}`
  - `admin_ids` contains the user and `console_enabled` is not false
  - or a family-specific canonical claim rule allows entry
- Chef linkage, workplace history, or profile association may support prerequisites or presentation, but they are not the console-access rule.

## 6) Surfaces supported
- `Pill`, `Cell`, `Preview`, `Profile` supported across kitchen operation entities.
- Treated as a core entity surface set.

## 7) Runtime dependencies
- Runtime kitchen selection state (`runtimeKitchenId`, `runtimeKitchenMode`).
- Mode-aware data loading (`live`, `demo`).

## 8) SEO hooks
- Public kitchen/menu pages should provide:
  - `useKitchenSeo`
  - `buildKitchenJsonLd` (`LocalBusiness` where applicable)

## 9) Mutation entrypoints (write composables)
- `useKitchenCreate`, `useKitchenUpdate`
- `useIngredientCreate`, `useIngredientDelete`
- `useKitchenMiseCreate`
- `useKitchenMenuStackCreate`
- `useKitchenOrderCreate`
- `useChefCreate`, `useChefUpdate`, `useChefDelete`
- `createKitchen` = intentional kitchen creation
- `ensureKitchen` = test/bootstrap/setup-if-missing

## 10) Non-goals / prohibited fallbacks
- No silent fallback switching between live/demo.
- No silent fallback selection of active kitchen inside console flows.
- No treating profile linkage or workplace history as console permission.
