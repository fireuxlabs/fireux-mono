# Marketplace

Updated: 2026-08-04
Ref: d232cc731
Role: map, not canon

## Purpose

Map the reusable multi-vendor marketplace family owned by
`packages/extensions/fireux-marketplace`. Current source, server handlers and
Firestore Rules remain authority.

## Classification and storage

The current Store/Offer implementation is an unshipped prototype, not a
legacy contract. Supplier identity and saleable item truth belong to
`fireux-suppliers`; the prototype will be replaced outright rather than kept
behind compatibility routes or adapters.

- `MarketplaceListing` is App-scoped publication configuration for one
  canonical Supplier. Its document id and `supplier_id` are the Supplier id.
- A Listing selects canonical Supplier Items and owns only channel-specific
  sections, editorial copy, fulfilment choices, and publication state.
- `MarketplaceOrder` is a private App-scoped operational Record partitioned
  by Supplier and references one authenticated buyer.
- Canonical marketplace paths are
  `apps/{appId}/marketplace-listings/{supplierId}` and
  `apps/{appId}/marketplace-orders/{orderId}`. Supplier Items remain at
  `suppliers/{supplierId}/items/{supplierItemId}`.

## Authority

- AppUser governs App access only. Buyer and seller are surfaces, not stored
  account roles.
- Supplier App-support operators grant Supplier management. App Admin remains
  the marketplace publication and moderation authority; Listings do not own a
  second seller-membership system.
- Public browsers consume a bounded joined Supplier/Listing/Item projection. All
  authoring, moderation and Order reads/writes use trusted fixed-runtime
  endpoints.
- Public marketplace routes never merge source-authored preview sellers,
  fixtures, or seed records into those projections. Draft previews remain
  authenticated management views over canonical Store and Offer records.
- Marketplace Orders are requests for offline collection or local delivery.
  They do not reuse KitchenOrder and do not create payment or FinancialFact
  truth.

## Lifecycle

- Listing: `draft`, `pending_review`, `published`, `paused`.
- Item availability remains Supplier-owned.
- Order: `requested`, `accepted`, `ready`, `completed`, with `rejected` and
  `cancelled` terminal exits.

## Verification

Start with the marketplace package build and Interlaken Essen build. When
Rules change, render the Misebox artifact, run the official compile/adversarial
checks, and apply the Security Rules auditor before any deployment.

## Boundaries

The first implementation deliberately excludes online payment, commission,
stock automation, delivery pricing/routing, reviews, chat and global catalogue
identity. `fireux-products`, Supplier and KitchenOrder remain separate
families.

The boundary is mapped in `docs/concepts/suppliers.md`: a marketplace
listing references one canonical Supplier and selected Supplier Items, while
the marketplace continues to own customer baskets, publication, and Orders.
