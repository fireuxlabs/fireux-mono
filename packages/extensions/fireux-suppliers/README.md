# fireux-suppliers
Authority: Tier2 (Overview; Tier1 contract in `docs/contract.md`)

Owned by `fireux`.

Supplier-domain extension for Drop.

It currently:
- Ensures runtime config buckets under `runtimeConfig.public.fireux.drop`
- Exposes runtime exports under `fireux-suppliers/runtime/*`
- Ships supplier runtime domain surfaces (pages/components/composables/models)

Supplier ingredient records are supplier-owned coverage wrappers around canonical Ingredient identity.
Supplier item records are supplier-owned sale/procurement wrappers around canonical Product identity.
Use `SupplierItem.product_id` to link to `products/{productId}` and optional `ingredient_id` only when a supplier item maps to kitchen stock/use.

Canonical contract:
- `docs/contract.md`

## Quick start

Enable in a Nuxt app:

```ts
export default defineNuxtConfig({
  modules: ['fireux-suppliers'],
})
```

Registry metadata:
- `registry.json`
