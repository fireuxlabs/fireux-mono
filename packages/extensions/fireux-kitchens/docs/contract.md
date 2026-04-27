# fireux-kitchens Contract
Authority: Tier1 (Authoritative)
Updated: 2026-04-27
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
- Kitchen console authority is user-based:
  - a user can operate a kitchen when their uid is in the scoped kitchen `team_ids`
  - profile association alone does not grant console access
- `Chef` is a kitchen-domain profile extension of `User`, not a separate console owner.

## 4) Collections + paths
- Live: `kitchens/{kitchenId}`
- Live kitchen console: `apps/{appId}/kitchens/{kitchenId}`
- Root kitchen records carry explicit app relationship metadata:
  - `app_scope_state`
  - `app_scope_app_id`
- Global ingredients: `ingredients/{ingredientId}`
- Root public kitchen children:
  - `kitchens/{kitchenId}/menus/{menuId}`
  - `kitchens/{kitchenId}/dishes/{dishId}`
- App-scoped operational kitchen children:
  - `apps/{appId}/kitchens/{kitchenId}/ingredients/{ingredientId}`
  - `apps/{appId}/kitchens/{kitchenId}/supplier-ingredients/{ingredientId}`
  - `apps/{appId}/kitchens/{kitchenId}/recipes/{recipeId}`
  - `apps/{appId}/kitchens/{kitchenId}/mise/{taskId}`
  - `apps/{appId}/kitchens/{kitchenId}/orders/{orderId}`
  - `apps/{appId}/kitchens/{kitchenId}/team/{memberId}`
  - `apps/{appId}/kitchens/{kitchenId}/costs/{costId}`
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
  - `team_ids` contains the user
- Chef linkage, workplace history, or profile association may support prerequisites or presentation, but they are not the console-access rule.

## 6) Surfaces supported
- `Pill`, `Cell`, `Preview`, `Profile` supported across kitchen operation entities.
- Treated as a core entity surface set.

## 7) Runtime dependencies
- Runtime kitchen selection state (`selectedId`, `mode`).
- Mode-aware data loading (`live`, `demo`).

## 7b) Interface seam
- `useKitchenInterface` is canonically a thin interface seam.
- Its job is:
  - kitchen entity in
  - small stable UI-ready projection out
- It must not become:
  - a fetch seam
  - a hidden hydration seam
  - a console-specific behavior seam
  - a rich kitchen presenter
- If kitchen needs richer profile, menu, or console presentation, that belongs in a second layer such as a presenter/view seam rather than in `useKitchenInterface`.

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
