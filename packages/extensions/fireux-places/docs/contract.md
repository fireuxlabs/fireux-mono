# fireux-places Contract
Authority: Tier1 (Authoritative)
Updated: 2026-06-03
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own canonical place domain, search, and place persistence behavior.

## 2) Core entities
- `Place`

## 3) Identity rule
- Place identity is id-based and canonical per persisted place record.

## 4) Collections + paths
- `places/{placeId}`

## 4b) Hours
- Place owns business/place hours: when the venue itself is open.
- Kitchen opening/service hours and Menu availability are separate meanings and must not replace Place hours.
- Operating hours are provider-live inspection, not stored Place truth.
- Public Place surfaces may offer “View operating hours” and fetch the latest Google details on demand.

## 5) Routes (public vs internal; slug vs id)
- Current routes are id-based:
  - `/places`
  - `/places/[id]`
  - `/places/create`
  - `/places/[id]/edit`
- Place route identity is id-only. Any stored `slug` field is display/search metadata only and must not be used for public routing.

## 6) Surfaces supported
- `Pill`, `Cell`, `Preview`, `Profile` supported.
- Treated as a core entity surface set.

## 7) Runtime dependencies
- Firestore place collection + provider search integration.
- Server/API helpers for place autocomplete/details/logo integration.
- Canonical family entry seam: `usePlace`.
- Read-many behavior belongs to `usePlaceCollection`; search behavior belongs to `usePlaceSearch`.

## 8) SEO hooks
- If place detail pages are public/indexable, provide:
  - `usePlaceSeo`
  - `buildPlaceJsonLd` (`LocalBusiness`)

## 9) Mutation entrypoints (write composables)
- `usePlaceCreate`
- `usePlaceUpdate`
- `usePlaceDelete`

## 10) Non-goals / prohibited fallbacks
- No silent fallback between provider IDs and canonical place IDs for selection/routing.
- No implicit route identity substitution when place id is missing.
