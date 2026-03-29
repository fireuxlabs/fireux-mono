# fireux-products
Authority: Tier2 (Overview; Tier1 contract in `docs/contract.md`)

Owned by `fireux`.

Products/catalog module for FireUX apps.

---

## What it ships

- **Firestore model**: `FirebaseProduct` (`src/runtime/models/product.model.ts`)
- **Runtime pages**:
  - `/products` (index)
  - `/products/:slug` (public product page)
  - `/admin/products/create` (admin create surface)
  - `/dev/fireux-products` (dev model + drift tooling)
- **UI components**: globally registered as `Product*` (cards, collection, create/write/preview, view)
- **Composables**: fetch/create/update/delete product docs + prices helpers
- **Optional Stripe endpoint**:
  - `POST /api/stripe/create-product` (`src/runtime/server/api/stripe/create-product.post.ts`)

---

## Guardrails (what it is not)

- Not a checkout/payment system
- Not an orders/subscriptions system
- Not a full CMS
- Stripe support is optional and currently focused on *creating* Stripe products/prices

---

## Data shape (typical)

FireUX treats products as root canonical records:
- `products/{productId}`
- `products/{productId}/prices/{priceId}` (if used)

App and ecosystem product pages should filter root products through scope fields such as:
- `source_app_id`
- `source_ecosystem_id`
- `owner_type`
- `owner_id`
- `visibility`

The canonical shape is defined in:
- `src/runtime/models/product.model.ts`

---

## Stripe (optional)

To enable the Stripe server endpoint:
- Install `stripe` in the consuming app (it is a peer dependency).
- Set `STRIPE_SECRET_KEY` in the server environment.

Note:
- The current endpoint includes a placeholder call to `/api/stripe/update-firestore` which does not exist in this repo yet (it is caught and skipped).

---

## Quick start

Enable in a Nuxt app:

```ts
export default defineNuxtConfig({
  modules: ['fireux-products'],
})
```

Registry metadata:
- `registry.json`
