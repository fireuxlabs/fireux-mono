# fireux-suppliers Contract
Authority: Tier1 (Authoritative)
Updated: 2026-05-17
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own supplier-domain runtime for Drop.

## 2) Core entities
- `Supplier`
- `SupplierProduct` (supplier-owned sale/procurement wrapper over canonical `Product`)
- `SupplierCatalogue` (future supplier-owned presentation/grouping surface for supplier offers)

## 3) Identity rule
- Supplier identity is id-based (`supplier.id` is canonical).
- Supplier relationship or operator linkage is not console authority by itself.

## 4) Collections + paths
- `suppliers/{supplierId}`
- `apps/{appId}/suppliers/{supplierId}`
- `suppliers/{supplierId}/products/{supplierProductId}`
- `suppliers/{supplierId}/catalogues/{catalogueId}` (presentation/grouping, not product sale terms)
- Treat `Supplier` as a console/business entity family with:
  - a public canonical supplier record
  - an app-scoped supplier console overlay
- Root supplier records carry explicit app relationship metadata:
  - `app_scope_state`
  - `app_scope_app_id`
- Profile-style supplier paths are not target design.
- Supplier console governance belongs to `apps/{appId}/suppliers/{supplierId}`.
- Supplier-owned product offers belong to `suppliers/{supplierId}/products/{supplierProductId}`.
- SupplierProduct records must link to canonical Product identity through `product_id`.
- SupplierCatalogue records present/group SupplierProduct records; they do not own sale terms.
- Ingredient linkage is optional through `ingredient_id`; it is not supplier product identity.

## 5) Routes (public vs internal; slug vs id)
- Current id-based routes:
  - `/suppliers`
  - `/suppliers/[id]`
  - `/suppliers/[id]/operator`
  - `/console/supplier/*`
  - `/dashboard/supplier/*`
- `/suppliers/[id]/operator` is the public-to-private operator bridge.
- Public `admin` route language is prohibited because app/platform admin is not the same thing as operating one supplier target.
- `/console/supplier` is the family entry page:
  - `demo`: curated demo suppliers
  - `test`: Firestore-backed test suppliers
  - `live`: my real suppliers for this app
- `test` canon is one personal supplier per signed-in user:
  - `test-suppliers/{uid}`
  - ensured on entry to `/console/supplier` in `test` mode
  - not created during auth
- `my real suppliers` means suppliers the current user can operate through the app overlay:
  - `apps/{appId}/suppliers/{supplierId}`
  - `operator_ids` contains the user
- Supplier relationship or operator linkage may inform onboarding or claiming, but it is not the access rule by itself.

## 6) Surfaces supported
- `Pill`, `Cell`, `Preview`, `Profile` supported for supplier cards/profile views.

## 7) Runtime dependencies
- Firestore supplier stack + extension runtime config (`runtimeConfig.public.fireux.drop`).

## 8) SEO hooks
- If supplier pages are marked indexable/public, provide:
  - `useSupplierSeo`
  - `buildSupplierJsonLd` (`Organization`)

## 9) Mutation entrypoints (write composables)
- `useSupplierCreate`
- `useSupplierQuickCreate`
- `useSupplierUpdate`
- `useSupplierDelete`
- `createSupplier` = intentional supplier creation
- `createSupplierConsole` = idempotent console supplier creation

## 10) Non-goals / prohibited fallbacks
- No silent fallback to alternate supplier ids or old owner modules for canonical selection.
- No implicit routing substitution when supplier id is missing.
- No treating supplier relationship or operator linkage as console permission.
