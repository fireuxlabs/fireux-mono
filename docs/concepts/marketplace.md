# Marketplace

Updated: 2026-07-26
Role: map, not canon

## Purpose

Map the reusable multi-vendor marketplace family owned by
`packages/extensions/fireux-marketplace`. Current source, server handlers and
Firestore Rules remain authority.

## Classification and storage

- `MarketplaceStore` is an App-scoped Entity with a public route and
  independent publication lifecycle. Its App parent owns its authority.
- `MarketplaceOffer` is a Store-owned Record. A fixed CHF minor-unit price is
  required before it can be published.
- `MarketplaceOrder` is a private operational Record owned by a Store and
  references one authenticated buyer.
- Canonical paths are
  `apps/{appId}/marketplace-stores/{storeId}`,
  its `offers/{offerId}` children, and
  `apps/{appId}/marketplace-orders/{orderId}`.

## Authority

- UserApp governs App access only. Buyer and seller are surfaces, not stored
  account roles.
- Store `owner_ids` and `editor_ids` grant Store management. App Admin remains
  the creation, moderation and membership authority. An ordinary App member
  cannot create a Store or grant themselves Store membership.
- An Admin may prepare an unassigned draft. At least one existing App member
  must be assigned as owner before the Store can enter review.
- Public browsers consume bounded published Store/Offer projections. All
  authoring, moderation and Order reads/writes use trusted fixed-runtime
  endpoints.
- Public marketplace routes never merge source-authored preview sellers,
  fixtures, or seed records into those projections. Draft previews remain
  authenticated management views over canonical Store and Offer records.
- Marketplace Orders are requests for offline collection or local delivery.
  They do not reuse KitchenOrder and do not create payment or FinancialFact
  truth.

## Lifecycle

- Store: `draft`, `pending_review`, `published`, `paused`.
- Offer: `draft`, `published`, `unavailable`, `archived`.
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
