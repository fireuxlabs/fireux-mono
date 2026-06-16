# fireux-suppliers Contract
Authority: Tier1 (Authoritative)
Updated: 2026-06-02
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own supplier-domain runtime for Drop.

## 2) Core entities
- `Supplier`
- `Ingredient link` (supplier-owned coverage wrapper over canonical `Ingredient`)
- `Item` (supplier-owned sale/procurement wrapper over canonical `Product`)
- `Catalogue` (supplier-owned presentation/grouping surface for supplier item offers)

## 3) Identity rule
- Supplier storage identity is id-based (`supplier.id` is canonical for writes and operator authority).
- Supplier public identity is slug-based (`supplier.slug` drives public supplier routes).
- Supplier relationship or operator linkage is not console authority by itself.

## 4) Collections + paths
- `suppliers/{supplierId}`
- `apps/{appId}/suppliers/{supplierId}`
- `suppliers/{supplierId}/ingredients/{ingredientId}`
- `suppliers/{supplierId}/items/{supplierItemId}`
- `suppliers/{supplierId}/catalogues/{catalogueId}` (presentation/grouping, not item sale terms)
- Treat `Supplier` as a console/business entity family with:
  - a public canonical supplier record
  - an app-scoped supplier console record
- Root supplier records carry explicit app relationship metadata:
  - `app_scope_state`
  - `app_scope_app_id`
- Profile-style supplier paths are not target design.
- Supplier console governance belongs to `apps/{appId}/suppliers/{supplierId}`.
- Supplier-owned ingredient coverage belongs to `suppliers/{supplierId}/ingredients/{ingredientId}`.
- Supplier ingredient-link records must link to canonical Ingredient identity through `ingredient_id`.
- Supplier-owned item offers belong to `suppliers/{supplierId}/items/{supplierItemId}`.
- Supplier item records must link to canonical Product identity through `product_id`.
- Supplier catalogue records present/group Item records; they do not own sale terms.
- Ingredient linkage is optional through `ingredient_id`; it is not supplier item identity.
- `console/supplier/operations` is a selected Supplier code bucket, not a Firestore collection. Use it for operator work that depends on the selected Supplier; keep stored CRUD in the relevant `firestore/*` stack and guest-facing shaping in `public/supplier/*`.

## 5) Routes (public vs internal; slug vs id)
- Public slug routes:
  - `/suppliers`
  - `/suppliers/[slug]`
  - `/console/supplier/*`
  - `/dashboard/supplier/*`
- `/console/supplier/ingredients` shows selected supplier ingredient coverage.
- `/console/supplier/items` shows concrete supplier item offers.
- `/console/supplier/catalogue` presents/groups supplier item offers.
- Public `admin` route language is prohibited because app/platform admin is not the same thing as operating one supplier target.
- `/console/supplier` is the family entry page:
  - `demo`: curated demo suppliers
  - `test`: Firestore-backed test suppliers
  - `live`: my real suppliers for this app
- `test` canon is one personal supplier per signed-in user:
  - `test-suppliers/{uid}`
  - ensured on entry to `/console/supplier` in `test` mode
  - not created during auth
- `my real suppliers` means suppliers the current user can see/select through the app console record:
  - `apps/{appId}/suppliers/{supplierId}`
  - `team_ids` or `operator_ids` contains the user
- Supplier mutations still require operator authority:
  - `operator_ids` contains the user
- `/console/supplier/team` is the selected Supplier team/membership surface.
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
- No implicit routing substitution when supplier slug is missing.
- No treating supplier relationship or operator linkage as console permission.
