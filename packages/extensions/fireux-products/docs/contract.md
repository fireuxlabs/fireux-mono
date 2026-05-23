# fireux-products Contract
Authority: Tier1 (Authoritative)
Updated: 2026-05-18
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own product/catalog domain and product publishing surfaces.

## 2) Core entities
- `Product`
- `ProductPrice` (when pricing is enabled)

## 3) Identity rule
- Public product identity is slug-based; internal docs remain id-addressable where required.
- Default publish rule: for published products, public `slug` equals Firestore product document id.

## 4) Collections + paths
- `products/{productId}`
- `products/{productId}/prices/{priceId}` (optional)

Composable stack canon:
- `firestore/product/useProduct.ts` is the singular Product family entry seam.
- `firestore/product/fetch` owns root Product reads.
- `firestore/product/mutations` owns root Product writes.
- `firestore/product/utils` owns root Product helpers, validation, and view/interface utilities.
- `firestore/product/price/fetch` is the only allowed ProductPrice child reader exception because it reads `products/{productId}/prices/{priceId}`.
- `product/create` owns Product create draft, price draft, preview payload, and submit authoring helpers.
- Product create/edit/publish draft state belongs to the Product family first.
- Product lifecycle state, such as draft, published, paused, or archived, belongs to the Product model and Product Firestore helpers.
- Product authoring UI belongs under Product create/edit components or Product-owned composables.
- Use `app/` only when a Product flow coordinates whole-app setup or multiple entity families; do not use `app/` as the default bucket for normal Product authoring state.

SupplierProduct records should wrap canonical `Product` identity rather than replace it. Supplier-specific sale/procurement fields belong in supplier-owned records at `suppliers/{supplierId}/products/{supplierProductId}` with a `product_id` link. SupplierCatalogue records are presentation/grouping surfaces for those supplier product offers.

`ProductPrice` owns pricing terms. Product identity should not be split into fake products for naming variants such as `Pro` or `Enterprise` when the real commercial product is one product with multiple prices or terms.

Product creation follows the standard `useXCreate` pattern. For saleable products, creation may also provision transaction-provider records such as Stripe products and prices. Firestore remains canonical for FireUX product identity. Provider ids are stored as integration metadata and on `ProductPrice` records.

## 3a) Product vs pricing pages
- `Product` is stored commerce truth: a buyable, subscribable, claimable, or commercially packaged thing.
- `ProductPrice` owns the price/term records for a `Product`.
- A `/pricing` page is app-local marketing or explanation copy. It is not the commerce model and must not replace Product/ProductPrice records.
- Apps may expose both:
  - `/products` and `/products/{slug}` for real published products
  - `/pricing` for tier comparison, package explanation, or buying context
- Product-capable ecosystem and standalone apps should expose both products and pricing.
- Pricing pages must point at, explain, or prepare buyers for real products or packages.
- Ecosystem main apps need products for premium subscriptions, tenant-app purchase/setup, hosting, and ecosystem services.
- Tenant apps may have products for tenant-owned commerce such as memberships, merch, tickets, vouchers, or app-specific services, but usually do not need a pricing page.
- Standalone apps intended to make money should use products for monetization and app-local pricing for buyer explanation.

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
