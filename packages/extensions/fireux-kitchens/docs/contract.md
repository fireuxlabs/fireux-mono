# fireux-kitchens Contract
Authority: Tier1 (Authoritative)
Updated: 2026-05-27
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
- Live kitchen stored identity is place-backed and id-based; console runtime selection is state-based.
- Public kitchen route identity is slug-based:
  - `kitchen.id` remains the Firestore document/root identity.
  - `kitchen.slug` is required before a kitchen is ready for public URL publishing.
  - public `/kitchens/**` URLs must use slug, not id.
  - `slug_aliases` are not canon yet; future alias/redirect support needs an explicit SEO route decision.
- Chef association (`chef.kitchen_ids`) and workplace/profile links are relationship signals only.
- Kitchen console authority is user-based:
  - a user can operate a kitchen when their uid is in the scoped kitchen `operator_ids`
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
  - `kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}`
  - `kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{itemId}`
  - `kitchens/{kitchenId}/dishes/{dishId}`
- App-scoped operational kitchen children:
  - `apps/{appId}/kitchens/{kitchenId}/ingredients/{ingredientId}`
  - `apps/{appId}/kitchens/{kitchenId}/recipes/{recipeId}`
  - `apps/{appId}/kitchens/{kitchenId}/mise/{taskId}`
  - `apps/{appId}/kitchens/{kitchenId}/orders/{orderId}`
  - `apps/{appId}/kitchens/{kitchenId}/team/{memberId}`
  - `apps/{appId}/kitchens/{kitchenId}/stations/{stationId}`
  - `apps/{appId}/kitchens/{kitchenId}/suppliers/{supplierId}`
  - `apps/{appId}/kitchens/{kitchenId}/costs/{costId}`
- Kitchen console mode mapping follows `docs/runtime-contract.md`.

Recipe composable stack canon:
- `Recipe` is a kitchen-scoped publishable child and authored kitchen content.
- Canonical operational truth is selected-kitchen/app-scoped:
  - `apps/{appId}/kitchens/{kitchenId}/recipes/{recipeId}`
- Public `/recipes` and `/recipes/[slug]` are projection/search surfaces only.
- There is no root `recipes/{recipeId}` canon yet.
- `firestore/recipe/useRecipe.ts` is the singular Recipe family entry seam.
- `firestore/recipe/fetch/useRecipeFetch.ts` owns read-one kitchen Recipe reads.
- `firestore/recipe/fetch/useRecipeCollection.ts` owns read-many kitchen Recipe reads.
- `firestore/recipe/mutations/useRecipeCreate.ts` owns kitchen Recipe creates.
- `firestore/recipe/mutations/useRecipeUpdate.ts` owns kitchen Recipe updates.
- `firestore/recipe/mutations/useRecipeDelete.ts` owns kitchen Recipe deletes/removals.
- `firestore/recipe/utils/view/useRecipeComputed.ts` owns derived Recipe facts.
- `firestore/recipe/utils/view/useRecipeInterface.ts` owns Recipe UI projections.

Menu composable stack canon:
- `Menu` is the public presentation record for menu surfaces.
- Root `menus/{menuId}` is allowed for public-first or anonymous menu records, such as a quick QR menu upload.
- Kitchen-scoped menus remain valid when the menu belongs to or is operated inside a kitchen:
  - `kitchens/{kitchenId}/menus/{menuId}` for root kitchen menu records
  - `apps/{appId}/kitchens/{kitchenId}/menus/{menuId}` for app-scoped kitchen menu records
- Published menu routes render eligible menu records; `public` is route/publication terminology, not a Firestore storage-location family.
- `firestore/menu/useMenu.ts` is the singular Menu family entry seam.
- `firestore/menu/fetch/useMenuFetch.ts` owns read-one root Menu reads.
- `firestore/menu/fetch/useMenuCollection.ts` owns read-many root Menu reads by default and kitchen-scoped reads through explicit `scope: 'kitchen'`.
- `firestore/menu/fetch/useMenuSectionCollection.ts` and `useMenuItemCollection.ts` own Menu child reads.
- `firestore/menu/mutations/useMenuCreate.ts` owns root Menu creates by default and kitchen-scoped creates through explicit `scope: 'kitchen'`.
- `firestore/menu/mutations/useMenuUpdate.ts` owns root Menu updates by default and kitchen-scoped updates through explicit `scope: 'kitchen'`.
- `firestore/menu/mutations/useMenuDelete.ts` owns root Menu deletes by default and kitchen-scoped deletes through explicit `scope: 'kitchen'`.
- `firestore/menu/mutations/useMenuSectionMutations.ts` and `useMenuItemMutations.ts` own Menu child writes.
- `firestore/menu/utils/view/useMenuComputed.ts` owns derived Menu facts.
- `firestore/menu/utils/view/useMenuInterface.ts` owns Menu UI projections.
- Dish is the food entity. MenuItem is only a Menu placement/link to a Dish with light placement state such as section, order, status, and price override.
- Recipe is Kitchen-scoped by default. Future public recipes should use an explicit publish seam/state, not a separate Recipe entity.

Ingredient composable stack canon:
- `firestore/ingredient/useIngredient.ts` is the singular Ingredient family entry seam.
- `firestore/ingredient/fetch/useIngredientFetch.ts` owns read-one root Ingredient reads.
- `firestore/ingredient/fetch/useIngredientCollection.ts` owns read-many root Ingredient reads.
- `firestore/ingredient/mutations/useIngredientCreate.ts` owns root Ingredient creates.
- `firestore/ingredient/mutations/useIngredientUpdate.ts` owns root Ingredient updates.
- `firestore/ingredient/mutations/useIngredientDelete.ts` owns root Ingredient deletes/removals.
- `firestore/ingredient/utils/view/useIngredientComputed.ts` owns derived root Ingredient facts.
- `firestore/ingredient/utils/view/useIngredientInterface.ts` owns Ingredient UI projections.
- `KitchenIngredient` and `KitchenSupplierIngredient` remain scoped usage/link records.
- Selected kitchen ingredient operations live under `console/kitchen/operations/ingredients`.

## 4b) Public menu publishing
- Published menu routes use eligible root kitchen menu records and their child records:
  - `kitchens/{kitchenId}/menus/{menuId}`
  - `kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}`
  - `kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{itemId}`
  - `kitchens/{kitchenId}/dishes/{dishId}`
- Kitchen runs the operation.
- `Dish` describes guest-facing food.
- `Menu` presents selected dishes.
- QR points guests to the exact published menu URL.
- Menu items require a valid `dish_id`; published menu routes read dish name and description from `Dish`.
- Menu owns presentation-only fields: name, description, status, service modes, sort order, simple design, section order, item order, and item price.
- Public menu routes render published menus only.
- Missing, unpublished, or invalid menus must show an explicit unavailable state.
- There is no automatic first-menu, active-menu, slug-fallback, translation-engine, ordering, or demo-prototype canon in V1.
- Kitchen/Menu runtime files must stay below 400 lines.
- Future nutrition or production support may let `Dish` reference ingredients, mise, or recipes.
- Those references are operational/data-enrichment links, not the public menu translation source.

Public menu copy packs:
- Menu content remains Kitchen-owned data.
- Reusable public menu chrome, such as `chooseMenu`, `loadingMenu`, and `menuNotFound`, is resolved from editable copy packs in the owning runtime database.
- Ecosystem defaults live at `copy_packs/public-menu/locales/{language}`.
- App/tenant overrides live at `apps/{appId}/copy_packs/public-menu/locales/{language}`.
- Resolution order is app/tenant override, then ecosystem pack, then package fallback.
- Sproochli may help manage or generate copy packs, but it does not own Kitchen menu truth.

## 5) Routes (public vs internal; slug vs id)
- Public slug-based pages currently include:
  - `/kitchens/[slug]`
  - `/kitchens/[slug]/menus`
  - `/kitchens/[slug]/menus/[menuId]`
  - `/kitchens/[slug]/operator`
  - `/ingredients/[id]`
- `/kitchens/[slug]/operator` is the public-to-private operator bridge.
- The operator bridge may show sign-in, request-access, or console-entry state, but it must not edit the kitchen directly.
- The active public kitchen route family is `/kitchens/**`; singular `/kitchen/**` is stale.
- Stored kitchen identity remains `kitchens/{kitchenId}` even when the public URL uses slug.
- Console/internal:
  - `/console/kitchen/*`
- Console selection is runtime-state based, not query-param selection.
- The console hosts operations; it is not the same thing as the public kitchen page.
- `/console/kitchen` is the family entry page:
  - `demo`: curated demo kitchens
  - `test`: Firestore-backed test kitchens
  - `live`: my real kitchens for this app
- Kitchen data-source canon:
  - live kitchens are the authority target shape
  - test kitchens are writable proof of the intended live shape
  - demo kitchens are read-only aids and must not define canon by themselves
  - Deano Smash / Deanos is the current rich demo aid
  - Daniel's test kitchen is the writable proof target for the same kitchen concept
  - future real kitchens, such as Smash City, should drive final shape decisions
- `test` canon is one personal kitchen per signed-in user:
  - `misebox-simulation/kitchens/{uid}`
  - ensured on entry to `/console/kitchen` in `test` mode
  - not created during auth
- `my real kitchens` means kitchens the current user can operate through the app overlay:
  - `apps/{appId}/kitchens/{kitchenId}`
  - `operator_ids` contains the user
- Chef linkage, workplace history, or profile association may support prerequisites or presentation, but they are not the console-access rule.

## 6) Surfaces supported
- `Pill`, `Cell`, `Preview`, `Profile` supported across kitchen operation entities.
- Treated as a core entity surface set.

## 7) Runtime dependencies
- Kitchen console selection state (`selectedId`, `mode`).
- Mode-aware data loading (`live`, `demo`).

## 7b) Interface seam
- `useKitchenInterface` is canonically a thin interface seam.
- Its job is:
  - already-read kitchen/place/overlay shapes in
  - composed kitchen surface out
  - small stable UI-ready projections out
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
- `useKitchenCreate`, `useKitchenUpdate`, `useKitchenDelete`
- `useIngredientCreate`, `useIngredientDelete`
- `useKitchenMiseCreate`
- `useKitchenOrderCreate`
- `useChefCreate`, `useChefUpdate`, `useChefDelete`
- `createKitchen` = intentional kitchen creation
- `createKitchenConsole` = idempotent console kitchen creation
- `updateKitchen` = root kitchen patch
- `publishKitchen` = root kitchen publication
- `deleteKitchen` = root kitchen hard delete

## 10) Non-goals / prohibited fallbacks
- No silent fallback switching between live/demo.
- No silent fallback selection of active kitchen inside console flows.
- No treating profile linkage or workplace history as console permission.
- No treating slug as stored Kitchen identity.
- No using `slug || id` for public kitchen URLs; missing slug means not public-ready.
