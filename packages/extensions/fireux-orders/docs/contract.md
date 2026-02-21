# fireux-orders Contract
Authority: Tier1 (Authoritative)
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own order checkout and order state transition behavior.

## 2) Core entities
- `Order`

## 3) Identity rule
- Order identity is id-based; scope identity is explicit (`scope_type` + `scope_id`).

## 4) Collections + paths
- `orders/{orderId}`

## 5) Routes (public vs internal; slug vs id)
- Checkout route:
  - `/orders/checkout`
- No public slug-based order pages are canonical.
- Order management is internal id-based behavior.

## 6) Surfaces supported
- Checkout-focused surfaces (basket/checkout panels).
- `Pill`/`Cell`/`Preview`/`Profile` are not required for this extension.

## 7) Runtime dependencies
- Basket + checkout state composables.
- Scope-aware route/context inputs for checkout flows.

## 8) SEO hooks
- Checkout/auth/order management pages are non-indexable by policy (`noindex`).

## 9) Mutation entrypoints (write composables)
- `useOrderCreate`
- `useOrderUpdateStatus`

## 10) Non-goals / prohibited fallbacks
- No silent fallback scope selection for order creation.
- No implicit status transition bypasses outside the defined status map.
