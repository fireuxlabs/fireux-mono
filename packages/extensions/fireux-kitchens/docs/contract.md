# fireux-kitchens Contract
Authority: Tier1 (Authoritative)
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

## 4) Collections + paths
- Live: `kitchens/{kitchenId}`
- Test: `test-kitchens/{kitchenId}`
- Live kitchen console: `apps/{appId}/kitchens/{kitchenId}`
- Global ingredients: `ingredients/{ingredientId}`
- Kitchen-owned operational children:
  - `apps/{appId}/kitchens/{kitchenId}/ingredients/{ingredientId}`
  - `apps/{appId}/kitchens/{kitchenId}/recipes/{recipeId}`
  - `apps/{appId}/kitchens/{kitchenId}/dishes/{dishId}`
  - `apps/{appId}/kitchens/{kitchenId}/menus/{menuId}`
  - `apps/{appId}/kitchens/{kitchenId}/mise/{taskId}`
  - `apps/{appId}/kitchens/{kitchenId}/orders/{orderId}`
- Test kitchen runtime mode mapping stays path-based under `test-kitchens/{kitchenId}`.
- Runtime kitchen mode mapping follows `docs/runtime-contract.md`.

## 5) Routes (public vs internal; slug vs id)
- Public/internal id-based pages currently include:
  - `/kitchens/[id]`
  - `/kitchens/[id]/menu/[[menuId]]`
  - `/ingredients/[id]`
- Console/internal:
  - `/console/kitchen/*`
- Console selection is runtime-state based, not query-param selection.
- The console hosts operations; it is not the same thing as the public kitchen page.

## 6) Surfaces supported
- `Pill`, `Cell`, `Preview`, `Profile` supported across kitchen operation entities.
- Treated as a core entity surface set.

## 7) Runtime dependencies
- Runtime kitchen selection state (`runtimeKitchenId`, `runtimeKitchenMode`).
- Mode-aware data loading (`live`, `test`, `read-only`).
- Legacy input alias `dummy` may be accepted by normalizers and maps to `read-only`.

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

## 10) Non-goals / prohibited fallbacks
- No silent fallback switching between live/test/read-only.
- No silent fallback selection of active kitchen inside console flows.
