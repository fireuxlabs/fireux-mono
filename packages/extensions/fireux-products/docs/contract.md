# fireux-products Contract
Authority: Tier1 (Authoritative)
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own product/catalog domain and product publishing surfaces.

## 2) Core entities
- `Product`
- `ProductPrice` (when pricing is enabled)

## 3) Identity rule
- Public product identity is slug-based; internal docs remain id-addressable where required.
- Default publish rule: for published products, public `slug` equals Firestore product document id (unless Deano overrides to slug->id lookup/index).

## 4) Collections + paths
- `products/{productId}`
- `products/{productId}/prices/{priceId}` (optional)

## 4a) Root scope fields
- `source_app_id`
- `source_ecosystem_id`
- `owner_type`
- `owner_id`
- `visibility`

Product pages should filter root products through these fields rather than creating app-local product storage by default.

## 5) Routes (public vs internal; slug vs id)
- Public/indexable:
  - `/products`
  - `/products/[slug]`
- Internal/admin:
  - `/admin/products/*`
  - `/admin/licenses/*`

## 6) Surfaces supported
- `Pill`, `Cell`, `Preview`, `Profile` supported.
- Treated as a core published entity surface set.

## 7) Runtime dependencies
- Firestore product/pricing docs.
- Optional Stripe server integration for product/price provisioning.

## 8) SEO hooks
- Public product pages must provide:
  - `useProductSeo`
  - `buildProductJsonLd` (`Product`)

## 9) Mutation entrypoints (write composables)
- `useProductCreate`
- `useProductUpdate`
- `useProductDelete`

## 10) Non-goals / prohibited fallbacks
- No silent fallback from missing slug to implicit id route for public product pages.
- No implicit selection/routing defaults for active product identity.
