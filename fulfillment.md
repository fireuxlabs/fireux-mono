# fulfillment.md

## A) Current flow map (facts only)

### 1) Public menu adds items to basket
1. Public kitchen menu page is `/kitchens/[id]/menu/[[menuId]].vue` in `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[id]/menu/[[menuId]].vue`.
2. It uses `useBasket()` from `fireux-orders` (`useBasket` is auto-imported).
3. `handleAddToBasket(...)` calls `addLine({ kitchen_id, dish_id, label, price_minor, currency_code, qty })`.
4. Basket state is stored in `useState` and persisted to `localStorage` key `fireux-orders:basket:v1` in `packages/extensions/fireux-orders/src/runtime/composables/useBasket.ts`.
5. Basket is single-kitchen scoped today: adding a different `kitchen_id` resets the basket and starts a new one.

### 2) Basket display locations
1. Basket is shown on the public menu page itself in `/kitchens/[id]/menu/[[menuId]].vue`.
2. Basket is also shown on checkout page `/orders/checkout` via `OrderCheckoutSystem` in `packages/extensions/fireux-orders/src/runtime/components/organisms/Order/Checkout/System.vue`.
3. Checkout page is a thin mount in `packages/extensions/fireux-orders/src/runtime/pages/orders/checkout.vue`.

### 3) Checkout submit flow and payload
1. Checkout state lives in `packages/extensions/fireux-orders/src/runtime/composables/useOrderCheckoutState.ts`.
2. `submitCheckout()` resolves kitchen context from basket or query, validates lines, then calls `createOrder(...)`.
3. `createOrder(...)` is in `packages/extensions/fireux-orders/src/runtime/composables/useOrderCreate.ts`.
4. Write target is top-level Firestore collection `orders` (not nested under kitchen).
5. Payload shape follows `packages/extensions/fireux-orders/src/runtime/models/order.model.ts`:
   - `id`, `kitchen_id`, `place_id`, `status`, `channel`
   - `service: { mode, table_label, notes }`
   - `customer`
   - `lines`
   - `totals: { subtotal_minor, currency_code }`

### 4) Kitchen dashboard Orders In read flow
1. Dashboard page is `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/orders.vue`.
2. It uses `useOrdersForKitchenFetch(kitchenId)` from `fireux-orders`.
3. `useOrdersForKitchenFetch` queries top-level `orders` with `where('kitchen_id', '==', kitchenId)` in `packages/extensions/fireux-orders/src/runtime/composables/useOrdersForKitchenFetch.ts`.
4. Tickets are transformed for kitchen display (table/service label, scheduled label, aggregated lines) in that dashboard page.

### Query params currently expected
1. Public menu builds checkout link query in `/kitchens/[id]/menu/[[menuId]].vue`:
   - `kitchen`
   - `kitchenName`
   - `mode`
   - `table`
   - `cover`
   - `returnTo`
2. Checkout state reads in `useOrderCheckoutState.ts`:
   - `kitchen`
   - `kitchenName` or `kitchen_name`
   - `mode`
   - `table`
   - `returnTo`
3. `cover` is passed from menu page today but not consumed by checkout state.

### Documents fetched today and why
1. Public menu page fetches:
   - `kitchens` collection (via `useKitchenFetch`) to resolve kitchen by id/slug.
   - `places` collection indirectly via kitchen hydration in `useKitchenFetch`.
   - `kitchens/{kitchenId}/menus` for menu rendering.
2. Checkout page (`fireux-orders`) currently fetches no kitchen/place docs.
3. Kitchen dashboard Orders page fetches top-level `orders` filtered by `kitchen_id`.
4. Legacy note: `useKitchenOrderCreate` writes `kitchens/{kitchenId}/orders`, but it is currently unused.

## B) Domain leak report

### Kitchen/menu-specific logic currently inside `fireux-orders`

1. `OrderServiceMode = 'dine_in' | 'collection' | 'delivery'` in `packages/extensions/fireux-orders/src/runtime/models/order.model.ts`.
   - SHOULD LIVE IN: `fireux-kitchens` policy layer.
   - Why: these are hospitality service semantics, not universal order semantics.

2. `service.table_label` in order model + create flow.
   - SHOULD LIVE IN: `fireux-kitchens`.
   - Why: table context is dine-in specific.

3. `kitchen_id` as required field in `useOrderCreate`.
   - SHOULD LIVE IN: `fireux-orders` only if modeled generically as scope/owner id.
   - Why: hardcoded kitchen identity blocks products/other domains.

4. `useBasket` requires `kitchen_id` and enforces single-kitchen basket replacement.
   - SHOULD LIVE IN: `fireux-kitchens` as an adapter rule, or `fireux-orders` as configurable basket scope strategy.
   - Why: “one kitchen at a time” is a domain rule, not an engine rule.

5. Checkout query contract in `useOrderCheckoutState` (`mode/table/kitchen/kitchenName/returnTo`).
   - SHOULD LIVE IN: `fireux-kitchens`.
   - Why: this is a kitchen menu routing contract.

6. Checkout UI copy in `Order/Checkout/System.vue` references “menu” and “Back to menu”.
   - SHOULD LIVE IN: `fireux-kitchens`.
   - Why: this is kitchen customer journey language.

7. `KitchenPill.vue` component under `fireux-orders` checkout organism.
   - SHOULD LIVE IN: `fireux-kitchens`.
   - Why: kitchen identity display is domain-specific presentation.

### What belongs in `fireux-orders` engine
1. Line normalization, totals calculation, order id creation, persistence to canonical orders collection.
2. Basket arithmetic and persistence primitives.
3. Generic status transitions and fetch utilities, provided they are owner/scope-based, not kitchen-hardcoded.

## C) Recommended architecture (minimal and canonical)

### Canon rule
1. `fireux-orders` is the order engine: storage, lifecycle, totals, basket primitives, query primitives.
2. `fireux-kitchens` owns hospitality checkout experience: menu context, mode/table/cover rules, kitchen identity and routing.
3. `fireux-products` owns product commerce experience: product/cart UX, shipping/billing/payment-specific requirements.
4. Domain modules adapt into orders engine input; orders engine does not import domain modules.

### Folder structure proposal

#### `fireux-orders` (engine)
1. `packages/extensions/fireux-orders/src/runtime/models/order.model.ts`
2. `packages/extensions/fireux-orders/src/runtime/composables/useOrderBasket.ts` (engine primitive; rename from `useBasket` or alias)
3. `packages/extensions/fireux-orders/src/runtime/composables/useOrderCreate.ts`
4. `packages/extensions/fireux-orders/src/runtime/composables/useOrdersFetchByScope.ts` (generic; replaces kitchen-specific fetch)
5. Optional minimal presentation primitives only:
   - `packages/extensions/fireux-orders/src/runtime/components/organisms/Order/LinesCard.vue`
   - `packages/extensions/fireux-orders/src/runtime/components/organisms/Order/TotalsRow.vue`

#### `fireux-kitchens` (domain adapter + UX)
1. `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/checkout/useKitchenCheckoutContext.ts`
2. `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/checkout/useKitchenCheckoutState.ts`
3. `packages/extensions/fireux-kitchens/src/runtime/components/organisms/Order/Checkout/System.vue`
4. `packages/extensions/fireux-kitchens/src/runtime/components/organisms/Order/Checkout/BasketCard.vue`
5. `packages/extensions/fireux-kitchens/src/runtime/components/organisms/Order/Checkout/CheckoutCard.vue`
6. `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[id]/checkout.vue` (or `[[menuId]]` sibling route)

#### `fireux-products` (domain adapter + UX)
1. Keep Stripe flow where it is now.
2. Add order-engine integration only when product checkout needs post-payment operational orders.

## D) Concrete refactor plan

### Step 1: Move kitchen checkout orchestration out of orders
1. Move `packages/extensions/fireux-orders/src/runtime/composables/useOrderCheckoutState.ts` to `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/checkout/useKitchenCheckoutState.ts`.
2. Move checkout organism files from `packages/extensions/fireux-orders/src/runtime/components/organisms/Order/Checkout/*` to `packages/extensions/fireux-kitchens/src/runtime/components/organisms/Order/Checkout/*`.
3. Replace `packages/extensions/fireux-orders/src/runtime/pages/orders/checkout.vue` with either:
   - a redirect stub, or
   - removal if no longer used.

### Step 2: Move route ownership to kitchens
1. Create `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[id]/checkout.vue`.
2. Update `checkoutRoute` in `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[id]/menu/[[menuId]].vue` from `/orders/checkout` to `/kitchens/:id/checkout`.
3. Keep query parsing in kitchens composable (`mode/table/cover/returnTo`) and consume `cover` there.

### Step 3: Keep orders as engine primitives
1. Keep `packages/extensions/fireux-orders/src/runtime/composables/useBasket.ts` and `useOrderCreate.ts`.
2. Make basket scope configurable:
   - either add `scope_id` support in `useBasket`,
   - or keep current API and add kitchen adapter wrapper in kitchens (`useKitchenBasket`).
3. Replace `useOrdersForKitchenFetch.ts` with generic `useOrdersFetchByScope.ts` in orders engine.
4. Add kitchen wrapper in kitchens:
   - `packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/orders/fetch/useKitchenOrdersFetch.ts`
   - internally calls orders engine fetch by scope/filter.

### Step 4: Model cleanup (no legacy constraint)
1. In `packages/extensions/fireux-orders/src/runtime/models/order.model.ts`, replace hardcoded kitchen-centric identity with scope fields:
   - `scope_type` (e.g. `kitchen`, `product`)
   - `scope_id`
2. Move hospitality-only fields from strict model to `service.meta`:
   - table, cover, slot, postcode.
3. Keep `service.mode` as string code, validated by domain adapter.

### Step 5: Dashboard read alignment
1. Update kitchen orders page to read by scope wrapper composable.
2. Keep existing ticket rendering in `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/orders.vue`.

## E) Optional: fireux-products compatibility

Yes, products checkout can reuse the orders engine.

### Reusable from `fireux-orders`
1. Basket primitives (`useBasket`/`useOrderBasket`) for line aggregation and persistence.
2. Order creation (`useOrderCreate`) for normalized line write + totals.
3. Order status model and query/fetch primitives.

### Not shared (domain-owned in products)
1. Product catalog selection and pricing strategy.
2. Payment provider flow (currently Stripe checkout session endpoints).
3. Shipping/billing address, tax, fulfillment method, license entitlements.
4. Product-specific confirmation and post-payment UX.

### Practical compatibility stance
1. Keep products payment flow independent.
2. Use orders engine only when products needs operational order tracking beyond payment session records.
