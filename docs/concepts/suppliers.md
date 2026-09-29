# Suppliers

Updated: 2026-08-20
Ref: d1a7d5eec
Role: map, not canon

## Purpose

Map the canonical Bringli Supplier product and the boundaries through which
Misebox Kitchens and App-specific marketplaces consume Supplier-owned work. Current source,
server handlers, Firestore Rules, and executable guards remain authority.

## Product boundary

- Bringli is the Supplier product and canonical supply-network host. Its App,
  Firebase binding, membership, Supplier directory routes, Supplier Workspace and
  trusted onboarding form one authority.
- `fireux-suppliers` is the reusable domain package. Owner mode exposes that
  product authority; consumer mode exposes only shared Supplier presentation
  and projection seams. Consumer Apps never acquire Supplier routes, Workspace,
  onboarding, sitemap, or direct storage authority.
- Misebox is a consumer. Its Kitchen `Suppliers` operation owns Kitchen-side
  selection, preferences, procurement, delivery receipt and cost context while
  resolving Supplier identity and Items from Bringli.
- The retired `suppliers.misebox.app` product doorway permanently redirects to
  Bringli while bookmarks and DNS are migrated.
- `Supplier` is the canonical Workspace Entity. The root owns identity and its
  Supplier-scoped Ingredient, Item, and Catalogue records.
- `suppliers/{supplierId}` owns Supplier identity, `team/{uid}`, Team requests,
  Catalogue, Ingredient, and Item operations. No App-nested Supplier access
  record participates in authority.
- Supplier creation and attachment in Bringli use the authenticated fixed-runtime
  onboarding endpoint. New Supplier document ids are normalized organization
  slugs, and that id remains the directory route identity.
- Supplier operators work through Bringli `/workspace/supplier`; the directory
  and detail routes describe Supplier identity without granting
  mutation authority.

## Marketplace boundary

A marketplace is a publication and customer-order channel, not Supplier
authority.

- Supplier owns organization identity, media, Items, pack terms, availability,
  lead times, and minimum quantities.
- A marketplace-owned listing references one `supplier_id` and selects which
  Supplier Items it publishes. It may add App-local sections, editorial copy,
  publication state, and supported customer fulfilment choices.
- Customer baskets and Orders remain marketplace-owned and are partitioned by
  Supplier. They reference `supplier_id` and `supplier_item_id`; they do not
  copy Supplier or Item authority.
- A Supplier may be listed in more than one marketplace without acquiring a
  second identity or Workspace.

Marketplace Store is a separate root Workspace Entity. It owns Store Team,
offers, customer baskets, and marketplace Orders beneath
`marketplace-stores/{storeId}`. A Store may reference Suppliers and Supplier
Items for publication without becoming their authority. The App-nested Store
prototype is migration input only; do not preserve it through a compatibility
adapter.

## Current source

- Entity and children:
  `packages/extensions/fireux-suppliers/src/runtime/supplier/models/Supplier.model.ts`
- Atomic onboarding:
  `packages/extensions/fireux-suppliers/src/runtime/supplier/server/index/onboarding.ts`
- Workspace core:
  `packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/core/useSupplierWorkspace.ts`
- Workspace capability model:
  `packages/extensions/fireux-suppliers/src/runtime/supplier/models/operations.ts`
- Retired Misebox doorway redirect:
  `projects/misebox/misebox-app/app/middleware/misebox-suppliers-surface.global.ts`
- Product host: `projects/bringli/bringli-app/nuxt.config.ts`
- Live Supplier detail projection:
  `supplier/composables/useSupplierDetail.ts` consumes the existing live
  `/api/suppliers/[id]` projection for Supplier, Company and Place. It hides old
  scope values and failed/missing data; no secondary raw browser listeners or
  last-good identity cache participate. The route uses `SupplierDetailState`
  for pending, missing and failed outcomes.
- Public eligibility remains owned by `supplier/server/identity/read.ts`.
  Directory filtering and direct detail addressability are different current
  contracts; visibility is not inferred to be a detail permission here.

## Verification

Run focused `src/test/supplier-detail.test.mjs`, Supplier onboarding and Team
checks for their respective changes. Use the owning Bringli App typecheck and
route checks for runtime changes. The former guard suite is removed. Rules
changes require separately authorized target-specific verification; browser
projection tests do not prove deployed Rules or production readiness.

## Living maintenance

Update this map when Supplier identity, Team authority, Workspace operations,
directory projection, or marketplace publication ownership changes.
Temporary migrations, individual supplier data, and tenant launch state do not
belong here.
