# fireux-companies Contract
Authority: Tier1 (Authoritative)
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own company profile/domain behavior and company-facing entity surfaces.

## 2) Core entities
- `Company`

## 3) Identity rule
- Company identity is id-based (`company.id` is the canonical key).

## 4) Collections + paths
- `companies/{companyId}`
- Place hydration/read references may use `places/{placeId}` when linked.

## 5) Routes (public vs internal; slug vs id)
- Current routes are id-based:
  - `/companies`
  - `/companies/[id]`
  - `/companies/create`
  - `/companies/edit/[id]`
- Public slug routes are not canonical for companies yet.

## 6) Surfaces supported
- `Pill`, `Cell`, `Preview`, `Profile` supported.
- Treated as a core entity surface set.

## 7) Runtime dependencies
- Firestore company docs.
- Optional place-linked hydration read path.
- Canonical family entry seam: `useCompany`.
- `useCompanies` is a legacy compatibility alias only; read-many behavior belongs to `useCompanyCollection`.

## 8) SEO hooks
- When company pages are publicly indexed, provide:
  - `useCompanySeo`
  - `buildCompanyJsonLd` (`Organization` or `LocalBusiness` by profile type)

## 9) Mutation entrypoints (write composables)
- `useCompanyCreate`
- `useCompanyUpdate`
- `useCompanyDelete`

## 10) Non-goals / prohibited fallbacks
- No silent fallback selection between company ids.
- No undocumented fallback chains for identity/routing decisions.
