# Kitchen Console Current-State Snapshot (FireUX Kitchens)

Purpose: current-state contract snapshot for Kitchen Console so design/build can proceed without routing/runtime-state drift.

Scope: `fireux-kitchens` runtime layer (pages, runtime kitchen selection, kitchen console data surfaces), plus implementation guidance for a Covin WhatsApp purchase-order composer.

## A) Kitchen Console Contract (current behavior)

### A1. How runtime kitchen is selected today (exact sources of truth)

#### Source of truth: runtime kitchen selection state (cookie + Nuxt state)
- Selection state lives in `useRuntimeKitchenSelection()`:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/state.ts:24`
- It persists:
  - `kitchenId: string`
  - `mode: 'live' | 'test' | 'read-only'`
- Backing storage:
  - Nuxt `useState(...)`
  - cookie key: `fireux_runtime_kitchen`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/state.ts:14`

#### Resolution priority (no hidden fallback)
- `useRuntimeKitchenContext(...)` resolves runtime kitchen from:
  1. explicit params passed to `useRuntimeKitchen(params)`
  2. otherwise `useRuntimeKitchenSelection()` state
- File:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/useRuntimeKitchenContext.ts:10`

#### Runtime kitchen composer
- `useRuntimeKitchen()` returns:
  - `id`
  - `mode`
  - `kitchen`
  - `kitchenCollectionPath`
  - `data`
- File:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/useRuntimeKitchen.ts:19`

#### Mode -> collection path contract
- `live` -> `kitchens`
- `test` -> `test-kitchens`
- `read-only` -> scenario-only (no Firestore runtime data reads/writes)
- File:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/shared.ts`

#### Read-only mode behavior
- Kitchen doc and console data come from `getReadOnlyKitchenScenario(...)`
- Files:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/useRuntimeKitchenDocument.ts`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/useRuntimeKitchenData.ts:40`

### A2. Which pages set `runtimeKitchenId` / `runtimeKitchenMode`

#### Direct page setters
- None. No page file directly calls `setRuntimeKitchen(...)`.

#### Actual setter call (component)
- Setter is called in `KitchenCTA`:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/CTA.vue:231`
  - `setRuntimeKitchen({ mode, kitchenId: resolvedId })` at:
    - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/components/organisms/Kitchen/CTA.vue:235`

#### Where `KitchenCTA` is mounted (page entry)
- `/kitchens` page mounts the selector CTA:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/index.vue:5`

#### Current user flow
- `/kitchens` -> user clicks kitchen/test/read-only in `KitchenCTA` -> runtime selection updated -> redirect to `/console/kitchen`

### A3. Which console pages consume runtime kitchen state (exact composables + usage)

#### Shared kitchen console layout
- File:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/layouts/kitchen-console.vue`
- Uses:
  - `useRuntimeKitchenComputed()`:
    - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/layouts/kitchen-console.vue:83`
  - `useKitchenInterface().pill(...)` to render the runtime kitchen pill in sidebar:
    - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/layouts/kitchen-console.vue:92`

#### Console pages using `useRuntimeKitchen()`
- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/index.vue`
  - reads `runtime.mode`
  - reads counts from `runtime.data.*` (ingredients, mise, recipes, dishes, menus, suppliers, purchases, orders, etc.)

- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/ingredients.vue`
  - reads `runtime.mode`
  - reads `runtime.data.kitchenIngredients`

- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/recipes.vue`
  - reads `runtime.mode`
  - reads `runtime.data.recipes`

- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/dishes.vue`
  - reads `runtime.mode`, `runtime.id`
  - reads `runtime.data.dishes`, `runtime.data.menus`

- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/menu.vue`
  - reads `runtime.data.menus`, `runtime.data.dishes`
  - uses `runtime.id` as kitchen fallback for menu context

- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/suppliers.vue`
  - reads `runtime.mode`, `runtime.kitchen`
  - reads `runtime.data.suppliers`, `runtime.data.supplierIngredients`, `runtime.data.kitchenIngredients`
  - builds “My Suppliers / All Suppliers” and “Buy Lists / Catalogue” UI locally on the page

- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/purchase-orders.vue`
  - reads `runtime.mode`
  - reads `runtime.data.purchases`

- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/orders.vue`
  - reads `runtime.id` to derive kitchen id
  - then uses `useKitchenOrdersFetch(kitchenId)` (incoming orders via `fireux-orders`)

- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/mise.vue`
  - reads `runtime.mode`, `runtime.data.miseTasks`

- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/stations.vue`
  - reads `runtime.mode`, `runtime.data.stations`

- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/team.vue`
  - reads `runtime.mode`, `runtime.data.teamMembers`

- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/training.vue`
  - reads `runtime.mode`, `runtime.data.trainingModules`

- `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/haccp.vue`
  - reads `runtime.mode`, `runtime.data.haccpChecks`

## B) Route inventory (kitchen console)

### Requested routes -> current route files

- `/kitchens`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/index.vue`

- `/console/kitchen`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/index.vue`

- `/console/kitchen/ingredients`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/ingredients.vue`

- `/console/kitchen/recipes`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/recipes.vue`

- `/console/kitchen/dishes`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/dishes.vue`

- `/console/kitchen/menu`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/menu.vue`

- `/console/kitchen/suppliers`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/suppliers.vue`

- `/console/kitchen/purchase-orders`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/purchase-orders.vue`

- `/console/kitchen/supplier/[id]`
  - **No route file exists currently** (no `supplier/[id].vue` or `suppliers/[id].vue` under `console/kitchen`)

## C) Data model inventory (kitchen entities)

Note: not all requested entities currently have dedicated typed models in `fireux-kitchens`. This section distinguishes between typed models and untyped runtime records used today.

### Kitchen
- File:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts`
- Stored model exports:
  - `KitchenCollection`
- Read-time enriched type:
  - `Kitchen` (extends `KitchenCollection` with selected `Place` fields)
- Key fields:
  - `id` (canonical place id / doc id)
  - `is_test_kitchen`
  - `created.at`
  - `updated.at`
  - read-time enrichment may include `name`, `short_name`, `short_address`, `formatted_address`, `lat`, `lng`, `image_url`, `claimed_by`, `slug`

### KitchenIngredient
- File:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/models/ingredient.model.ts`
- Relevant exports:
  - `Ingredient` (`ingredients/{ingredientId}`)
  - `KitchenIngredient` (`kitchens/{kitchenId}/ingredients/{ingredientId}`)
  - `KitchenSupplierIngredient` (`kitchens/{kitchenId}/supplier-ingredients/{id}`)
- Key fields:
  - `KitchenIngredient`: `id`, `ingredient_id`, `created.*`, `updated.*`
  - `KitchenSupplierIngredient`: `id`, `kitchen_id`, `supplier_id`, `ingredient_id`, `created.*`, `updated.*`

### KitchenRecipe
- File:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/models/kitchen-recipe.model.ts`
- Export:
  - `KitchenRecipe`
- Key fields:
  - `id`, `kitchen_id`, `dish_id`
  - `name`, `description`, `status`
  - `yield_qty`, `yield_unit`, `prep_minutes`, `cook_minutes`
  - `ingredient_lines[]`
  - `steps[]`
  - `notes`, `tags[]`
  - `created.*`, `updated.*`

### KitchenDish (export name is `Dish`)
- File:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/models/dish.model.ts`
- Export:
  - `Dish`
- Key fields:
  - `id`, `kitchen_id`
  - `name`, `short_name`, `description`, `image_url`
  - `recipe_ids[]`, `ingredient_ids[]`, `mise_ids[]`
  - `sort_order`, `active`
  - `created.*`, `updated.*`

### KitchenMenu (export name is `Menu`)
- File:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/models/menu.model.ts`
- Export:
  - `Menu`
- Key fields:
  - `id`, `kitchen_id`
  - `name`, `description`, `active`
  - `currency_code`, `defaults`
  - `service_modes`
  - `sections[]` (with `items[]`, each item includes `dish_id`, `price_minor`, etc.)
  - `sort_order`
  - `created.*`, `updated.*`

### Supplier (profile model used by kitchen suppliers UI)
- Supplier profile model is in `fireux-drop`, not `fireux-kitchens`:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-drop/src/runtime/models/profiles/Supplier/Supplier.model.ts`
- Kitchen suppliers page merges kitchen supplier link docs with these canonical supplier profile docs via:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/suppliers/fetch/useKitchenSupplierFetch.ts`
- Key supplier profile fields (current):
  - `supplier_headline`
  - `summary`
  - `supplier_bio`
  - `supplier_image`
  - `supplier_product_categories[]`
  - `supplier_delivery_areas[]`
  - `supplier_organization_name`
  - plus legacy compatibility fields (`title`, `tagline`, etc.)

### KitchenSupplier
- **No dedicated `KitchenSupplier` TS model file currently**
- Current implementation uses untyped link records (`Record<string, unknown>`) in:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/suppliers/fetch/useKitchenSupplierFetch.ts`
- Fields inferred/used today:
  - identity/reference: `id`, `supplier_id`, `source_supplier_id`, `supplier_profile_id`, `profile_id`, `drop_supplier_id`
  - `kitchen_id`
  - optional overlay display fields (e.g. `name`)

### PurchaseOrder
- **No dedicated `PurchaseOrder` model file currently**
- Current `/console/kitchen/purchase-orders` page renders `runtime.data.purchases` as untyped records:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/purchase-orders.vue:64`
- Runtime kitchen data contract currently returns:
  - read-only mode: `scenario.procurementStack.purchases`
  - live mode: `purchases: []` (no Firestore fetch wired yet)
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/useRuntimeKitchenData.ts:72`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/useRuntimeKitchenData.ts:90`

## D) “Where to implement” guidance for a Covin WhatsApp order tool

Target tool requirements:
- show a saved list of items for a supplier (Covin)
- let chef adjust quantities
- generate WhatsApp-ready text + include an order reference link
- later: tick-off items on delivery and mark as received

### D1. Which existing page surface it belongs to (current contract)

#### Primary surface: `/console/kitchen/purchase-orders`
- This is the correct home for the composer because it is already the “Orders Out” page:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/purchase-orders.vue`
- It already consumes `runtime.data.purchases`, which is the intended slot for outgoing procurement orders:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/purchase-orders.vue:64`

#### Supporting surface (selection context): `/console/kitchen/suppliers`
- Existing supplier + buy-list UX is already there:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/suppliers.vue`
- This page already builds:
  - supplier selection (`My Suppliers` / `All Suppliers`)
  - supplier item collections (`Buy Lists` / `Catalogue`)
- This makes it a strong feeder for “Create Covin order from selected buy list”, but the composer itself should live in `purchase-orders` to avoid route drift.

### D2. Which composables should own create/update/read (existing `fireux-kitchens` patterns)

Follow the existing runtime-kitchen subfeature pattern:
- `runtime-kitchen/<feature>/fetch/*`
- `runtime-kitchen/<feature>/mutations/*`

#### Recommended new composables (minimal + consistent)
- Read:
  - `.../runtime-kitchen/purchase-orders/fetch/useKitchenPurchaseOrderFetch.ts`
- Mutations:
  - `.../runtime-kitchen/purchase-orders/mutations/useKitchenPurchaseOrderCreate.ts`
  - `.../runtime-kitchen/purchase-orders/mutations/useKitchenPurchaseOrderUpdate.ts`
  - optionally split status/item actions:
    - `useKitchenPurchaseOrderSetStatus.ts`
    - `useKitchenPurchaseOrderToggleItemReceived.ts`

#### Where to wire the read into runtime kitchen
- Add purchase-order fetch into:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/useRuntimeKitchenData.ts`
- Replace live-mode `purchases: []` with real fetched data.

#### Pattern references (current code)
- Runtime kitchen fetch pattern:
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/orders/fetch/useKitchenOrderFetch.ts`
- Runtime kitchen mutation pattern (incoming/service orders):
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/orders/mutations/useKitchenOrderCreate.ts`
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/orders/mutations/useKitchenOrderToggleItem.ts`
- Supplier link/profile merge fetch (useful for Covin source list):
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/suppliers/fetch/useKitchenSupplierFetch.ts`

### D3. Minimal data shape for PurchaseOrder (draft -> sent -> received + per-item received boolean)

#### Collection path (match existing runtime kitchen rules)
- Live mode:
  - `kitchens/{kitchenId}/purchase-orders/{purchaseOrderId}`
- Test mode:
  - `test-kitchens/{kitchenId}/purchase-orders/{purchaseOrderId}`
- Read-only:
  - scenario only (no Firestore writes)

#### Minimal shape (recommended)
```ts
type KitchenPurchaseOrderStatus = 'draft' | 'sent' | 'received'

type KitchenPurchaseOrderItem = {
  id: string
  ingredient_id: string
  supplier_item_id: string // from supplier-ingredients row when available
  label: string
  quantity: number
  unit: string
  note: string
  received: boolean
}

type KitchenPurchaseOrder = {
  id: string
  kitchen_id: string
  supplier_id: string
  supplier_name: string

  order_number: string // human ref for WhatsApp + UI
  status: KitchenPurchaseOrderStatus

  items: KitchenPurchaseOrderItem[]

  // Optional free text from chef
  note: string

  // Lifecycle
  sent_at?: FirebaseTimestamp
  sent_by?: string
  received_at?: FirebaseTimestamp
  received_by?: string

  created: {
    at: FirebaseTimestamp
    by?: string
    app_id?: string
  }
  updated: {
    at: FirebaseTimestamp
    by?: string
  }
}
```

#### WhatsApp text + order reference link
- V1 can generate message text at runtime (no need to persist rendered text)
- Use `order_number` + `id` as stable references
- Reference link can initially target:
  - `/console/kitchen/purchase-orders`
  - plus query/hash later (no route invention required in this phase)

## Conventions / drift guard (current kitchens extension)

- Do not invent new runtime kitchen selection fallback paths.
- Keep `useRuntimeKitchenSelection()` as the sole persisted runtime selector.
- Keep kitchen console pages file-routed via runtime layer (no custom pages config routing).
  - `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-kitchens/src/config/module/pages-config.ts`
- Keep collection managers generic (pill/cell only) and place large surface previews in dev pages, not manager components.

## Current gaps (explicit, so design can account for them)

- No `/console/kitchen/supplier/[id]` page exists today.
- No typed `KitchenSupplier` model exists in `fireux-kitchens` (supplier links are currently untyped merged records).
- No typed `PurchaseOrder` model or fetch/mutation composables exist yet in `fireux-kitchens`.
- `runtime.data.purchases` is only populated in read-only scenarios; live mode returns `[]` today.

