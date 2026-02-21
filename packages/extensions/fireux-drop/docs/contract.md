# fireux-drop Contract
Authority: Tier1 (Authoritative)
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own supplier-domain runtime for Drop.

## 2) Core entities
- `Supplier`

## 3) Identity rule
- Supplier identity is id-based (`supplier.id` is canonical).

## 4) Collections + paths
- `suppliers/{supplierId}`
- App-specific overlays may be added by app scope where configured.

## 5) Routes (public vs internal; slug vs id)
- Current id-based routes:
  - `/suppliers`
  - `/suppliers/[id]`
  - `/suppliers/admin/[id]`
  - `/dashboard/supplier/*`

## 6) Surfaces supported
- `Pill`, `Cell`, `Preview`, `Profile` supported for supplier cards/profile views.

## 7) Runtime dependencies
- Firestore profile stack + extension runtime config (`runtimeConfig.public.fireux.drop`).

## 8) SEO hooks
- If supplier pages are marked indexable/public, provide:
  - `useSupplierSeo`
  - `buildSupplierJsonLd` (`Organization`)

## 9) Mutation entrypoints (write composables)
- `useSupplierCreate`
- `useSupplierQuickCreate`
- `useSupplierUpdate`
- `useSupplierDelete`

## 10) Non-goals / prohibited fallbacks
- No silent fallback to alternate supplier ids or legacy owner modules for canonical selection.
- No implicit routing substitution when supplier id is missing.
