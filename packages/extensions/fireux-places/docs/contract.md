# fireux-places Contract
Authority: Tier1 (Authoritative)
Updated: 2026-06-04
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own canonical place domain, search, and place persistence behavior.

## 2) Core entities
- `Place`

## 3) Identity rule
- Place identity is id-based and canonical per persisted place record.
- Place slug is an optional public locator. It may resolve a public route, but writes still use the canonical Place id.

## 4) Collections + paths
- `places/{placeId}`

## 4b) Hours
- Place owns business/place hours: when the venue itself is open.
- Kitchen opening/service hours and Menu availability are separate meanings and must not replace Place hours.
- Operating hours are manual provider lookup, not stored Place truth.
- Public Place surfaces may offer “View operating hours” and fetch the latest Google details on demand.

## 4c) Claims
- Current claim UI is a pre-ship convenience surface only.
- Before shipping, Place claiming needs a real verification flow, not just a one-click `claimed_by` write.
- Firestore rules must enforce Place claim/edit authority before production release.
- Claim/edit writes must only be allowed for verified owners, admins, or trusted server workflows.
- Public slug routing must not weaken claim/edit rules; writes still use canonical `places/{placeId}`.

## 5) Routes (public vs internal; slug vs id)
- Current routes accept canonical id or slug:
  - `/places`
  - `/places/[id-or-slug]`
  - `/places/create`
  - `/places/[id-or-slug]/edit`
- Canonical Place id remains stored truth, usually the provider id.
- Slug is a clean public locator for human URLs. It must be unique when used.
- Claim/edit mutations must resolve slug to the canonical Place id before writing.

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

## 10) Non-goals / prohibited hidden routing
- No route guessing beyond exact canonical id or exact stored slug.
- No implicit route identity substitution when both id and slug are missing.
