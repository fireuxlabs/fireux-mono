# Suppliers

Updated: 2026-08-03
Role: map, not canon

## Purpose

Map the canonical Bringli Supplier product and the boundaries through which
Misebox Kitchens and App-specific marketplaces consume Supplier-owned work. Current source,
server handlers, Firestore Rules, and executable guards remain authority.

## Product boundary

- Bringli is the Supplier product and canonical supply-network host. Its App,
  Firebase binding, membership, public Supplier routes, Supplier Console and
  trusted onboarding form one authority.
- `fireux-suppliers` is the reusable domain package. Owner mode exposes that
  product authority; consumer mode exposes only shared Supplier presentation
  and projection seams. Consumer Apps never acquire Supplier routes, Console,
  onboarding, sitemap, or direct storage authority.
- Misebox is a consumer. Its Kitchen `Suppliers` operation owns Kitchen-side
  selection, preferences, procurement, delivery receipt and cost context while
  resolving Supplier identity and Items from Bringli.
- The retired `suppliers.misebox.app` product doorway permanently redirects to
  Bringli while bookmarks and DNS are migrated.
- `Supplier` is the canonical Console Entity. The root owns identity and its
  Supplier-scoped Ingredient, Item, and Catalogue records.
- `apps/{appId}/suppliers/{supplierId}` is access-only App support. It never
  owns Supplier identity, catalogue data, marketplace copy, or fulfilment.
- Supplier creation and attachment in Bringli use the authenticated fixed-runtime
  onboarding endpoint. New Supplier document ids are normalized organization
  slugs, and that id remains the public route identity.
- Supplier operators work through Bringli `/console/supplier`; the public directory
  and detail routes describe published Supplier identity without granting
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
  second identity or Console.

The unshipped `MarketplaceStore` and `MarketplaceOffer` prototype is not a
compatibility contract. Do not extend it or preserve an adapter for it.
Replace it outright with the Supplier listing projection, verify the new
paths and data, then remove the prototype code and records.

## Current source

- Entity and children:
  `packages/extensions/fireux-suppliers/src/runtime/models/supplier/Supplier.model.ts`
- Atomic onboarding:
  `packages/extensions/fireux-suppliers/src/runtime/server/supplier/onboarding.ts`
- Console core:
  `packages/extensions/fireux-suppliers/src/runtime/composables/fireux/console/supplier/core/useSupplierConsole.ts`
- Operations:
  `packages/extensions/fireux-suppliers/src/runtime/content/operations.ts`
- Retired Misebox doorway redirect:
  `projects/misebox/misebox-app/app/middleware/misebox-suppliers-surface.global.ts`
- Product host: `projects/bringli/bringli-app/nuxt.config.ts`
- Entity and Console guards:
  `scripts/guards/entity-matrix.mjs`,
  `scripts/guards/root-app-support-authority.mjs`, and
  `scripts/guards/console-indexes.mjs`

## Verification

Build `fireux-suppliers` and `misebox-app`, run relevant Supplier and Console
guards while iterating, then run the complete `pnpm guard` before handoff.
Any Firestore Rules change also requires the Misebox Rules render, compile,
and adversarial checks.

## Living maintenance

Update this map when Supplier identity, App-support authority, Console
operations, public projection, or marketplace publication ownership changes.
Temporary migrations, individual supplier data, and tenant launch state do not
belong here.
