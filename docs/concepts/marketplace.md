# Marketplace

Updated: 2026-08-20
Ref: d1a7d5eec
Role: map, not canon

## Purpose

Map the reusable multi-vendor marketplace family owned by
`packages/extensions/fireux-marketplace`. Current source, server handlers and
Firestore Rules remain authority.

## Classification and storage

Marketplace Store is a root Workspace Entity because it has independent
identity, Team, operations, and a future Dashboard/Console lifecycle. The
current App-nested prototype is migration input, not a compatibility contract.

- `marketplace-stores/{storeId}` owns Store identity and management.
- The Store reader supplies `storeId`; root writers do not duplicate it as a
  stored `id` field.
- `marketplace-stores/{storeId}/team/{memberId}` stores the shared `name`,
  `user_id`, `role_ids` roster. Linked users establish Store association.
- `marketplace-stores/{storeId}/offers/{offerId}` owns Store publication of a
  canonical Supplier Item.
- `marketplace-stores/{storeId}/orders/{orderId}` owns Store fulfilment truth.
- Supplier Items remain at `suppliers/{supplierId}/items/{supplierItemId}`.
- Registered buyers are AppUsers and Orders reference their User uid. Guest
  buyer details remain on the Order.

## Authority

- AppUser governs App membership. Store association requires a linked Team
  user; Team role labels and member status do not authorize actions. Supplier
  access follows its AppUser association. Buyer and seller are surfaces, not
  stored account roles.
- Current App Admin is an explicit override only for Stores managed by that
  App. Offers do not own another seller-membership system.
- Directory browsers consume bounded canonical Store, Supplier, and Item
  records. All
  authoring, moderation and Order reads/writes use trusted fixed-runtime
  endpoints.
- Public Store directory/detail transport contains presentation-safe Store
  fields and may join published Offer children. It never embeds those Offers
  back into the canonical Store root or exposes Store management/audit truth.
- Marketplace directory routes never merge source-authored preview sellers,
  fixtures, or seed records into those projections. The directory renders its
  bounded published projection first. A signed-in current-App admin may then
  request the same bounded directory DTO with unpublished publication states;
  local development uses that all-record projection by default, matching the
  Kitchen directory preview convention. Deployed guests remain published-only,
  and unpublished cards route to administration rather than a directory detail
  route. Canonical Team, moderation, and protected Order fields never enter the
  directory response.
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
the Store continues to own customer baskets, publication, and Orders.
