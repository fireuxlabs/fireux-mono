# fireux-suppliers Contract
Authority: Tier1 (Authoritative)
Updated: 2026-04-26
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own supplier-domain runtime for Drop.

## 2) Core entities
- `Supplier`
- `SupplierProduct` (supplier-owned sale/procurement wrapper over canonical `Product`)

## 3) Identity rule
- Supplier identity is id-based (`supplier.id` is canonical).
- Supplier relationship or operator linkage is not console authority by itself.

## 4) Collections + paths
- `suppliers/{supplierId}`
- `apps/{appId}/suppliers/{supplierId}`
- `suppliers/{supplierId}/products/{supplierProductId}`
- `suppliers/{supplierId}/catalogue/{catalogueItemId}` (allowed catalogue label for supplier product records)
- Treat `Supplier` as a console/business entity family with:
  - a public canonical supplier record
  - an app-scoped supplier console overlay
- Legacy profile-style supplier paths are compatibility debt, not target design.
- Supplier console governance belongs to `apps/{appId}/suppliers/{supplierId}`.
- Supplier-owned catalogue/product records belong to `suppliers/{supplierId}/products/{supplierProductId}` or the allowed catalogue label.
- Supplier catalogue/product records must link to canonical Product identity through `product_id`.
- Ingredient linkage is optional through `ingredient_id`; it is not supplier product identity.

## 5) Routes (public vs internal; slug vs id)
- Current id-based routes:
  - `/suppliers`
  - `/suppliers/[id]`
  - `/console/supplier/*`
  - `/suppliers/admin/[id]`
  - `/dashboard/supplier/*`
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
  - `admin_ids` contains the user and `console_enabled` is not false
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
- `ensureSupplier` = test/bootstrap/setup-if-missing

## 10) Non-goals / prohibited fallbacks
- No silent fallback to alternate supplier ids or legacy owner modules for canonical selection.
- No implicit routing substitution when supplier id is missing.
- No treating supplier relationship or operator linkage as console permission.
