# Kitchen Dashboard Contract (FireUX Kitchens)

Status: Active
Updated: 2026-02-26
Scope: runtime behavior and page responsibilities for kitchen dashboard surfaces.

Why this exists:
- Keep one coherent kitchen system instead of ad-hoc flows.
- Ensure runtime kitchen selection is consistent across pages.

Runtime model (single source):
- Resolve the active kitchen through runtime state, not URL query params.
- Core composables:
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/useRuntimeKitchen.ts
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/state.ts
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/shared.ts
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/useRuntimeKitchenData.ts
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/useRuntimeKitchenDocument.ts
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/runtime-kitchen/read-only-scenarios/index.ts

Runtime modes:
- read-only: scenario-resolved demo data
- dummy: dummy/scenario.ts
- test: Firestore test-kitchens/{kitchenId}
- live: Firestore kitchens/{kitchenId}

Collection path rule:
- read-only -> no Firestore collection
- live -> kitchens
- dummy + test -> test-kitchens

Selection rule:
- /kitchens CTA sets runtimeKitchenId and runtimeKitchenMode in state.
- /dashboard/kitchen/* pages consume that state.
- Do not rely on ?mode= or ?id= in dashboard URLs.

Canonical entity graph:
- Kitchen (kitchens/{id} or test-kitchens/{id})
- Ingredient catalog, KitchenIngredient, KitchenRecipe
- KitchenMiseTask, KitchenDish, KitchenMenu
- Chef profile, KitchenTeamMember
- Supplier, KitchenSupplier
- IncomingOrder, PurchaseOrder (prototypes)

Dashboard route map:
- /dashboard/kitchen
- /dashboard/kitchen/ingredients
- /dashboard/kitchen/mise
- /dashboard/kitchen/recipes
- /dashboard/kitchen/dishes
- /dashboard/kitchen/menu
- /dashboard/kitchen/team
- /dashboard/kitchen/stations
- /dashboard/kitchen/training
- /dashboard/kitchen/haccaaap
- /dashboard/kitchen/suppliers
- /dashboard/kitchen/orders
- /dashboard/kitchen/purchase-orders
- /dashboard/kitchen/supplier/[id]

Page contracts:

Kitchen (/dashboard/kitchen)
Purpose: show runtime kitchen identity and debug surface.
Reads: Kitchen.
Writes: none.

Ingredients (/dashboard/kitchen/ingredients)
Purpose: manage kitchen ingredient attachment and visibility.
Reads: Ingredient, KitchenIngredient.
Writes: KitchenIngredient.

Mise (/dashboard/kitchen/mise)
Purpose: manage prep tasks and mise lists.
Reads: KitchenMiseTask, KitchenRecipe.
Writes: KitchenMiseTask.

Recipes (/dashboard/kitchen/recipes)
Purpose: manage recipes and ingredient lines.
Reads: KitchenRecipe, KitchenIngredient.
Writes: KitchenRecipe.

Dishes (/dashboard/kitchen/dishes)
Purpose: manage dish definitions and recipe links.
Reads: KitchenDish, KitchenRecipe.
Writes: KitchenDish.

Menu (/dashboard/kitchen/menu)
Purpose: manage menu groupings and active dishes.
Reads: KitchenMenu, KitchenDish.
Writes: KitchenMenu.

Team (/dashboard/kitchen/team)
Purpose: manage kitchen team assignments.
Reads: Chef, KitchenTeamMember.
Writes: KitchenTeamMember.

Stations (/dashboard/kitchen/stations)
Purpose: track station/service flow status.
Reads: KitchenStation, KitchenMiseTask.
Writes: KitchenStation.

Training (/dashboard/kitchen/training)
Purpose: surface training/checklists.
Reads: KitchenTraining.
Writes: KitchenTraining.

Haccaaap (/dashboard/kitchen/haccaaap)
Purpose: compliance and safety logs.
Reads: KitchenCompliance.
Writes: KitchenCompliance.

Suppliers (/dashboard/kitchen/suppliers)
Purpose: manage supplier links and metadata.
Reads: Supplier, KitchenSupplier.
Writes: KitchenSupplier.

Orders (/dashboard/kitchen/orders)
Purpose: view incoming orders (prototype).
Reads: IncomingOrder.
Writes: none.

Purchase Orders (/dashboard/kitchen/purchase-orders)
Purpose: manage outgoing supplier orders (prototype).
Reads: PurchaseOrder.
Writes: PurchaseOrder.

Supplier detail (/dashboard/kitchen/supplier/[id])
Purpose: detail supplier profile and linked ingredients.
Reads: Supplier, KitchenSupplier, KitchenIngredient.
Writes: KitchenSupplier.

Recent scan (2026-02-20):
- Commit 20b2754f updated kitchen pages config, read-only scenario broth-bloom, runtime kitchen document/fetch helpers, and menu/dishes pages.

#end
