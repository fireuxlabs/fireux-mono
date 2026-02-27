# fireux-properties Contract
Authority: Tier1 (Authoritative)
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own Granite portfolio, property, and unit domain behavior.

## 2) Core entities
- `Portfolio`
- `Property`
- `Unit`

## 3) Identity rule
- Portfolio and property identity are id-based.
- Runtime console context is portfolio-state based via `runtimePortfolioId`.

## 4) Collections + paths
- `portfolios/{portfolioId}`
- `portfolios/{portfolioId}/properties/{propertyId}`
- `portfolios/{portfolioId}/properties/{propertyId}/units/{unitId}`

## 5) Routes (public vs internal; slug vs id)
- Selector surface:
  - `/portfolios`
- Console/internal:
  - `/console/portfolio/properties`
- Routes are id/state based in Phase 1.

## 6) Surfaces supported
- Portfolio: `Pill`, `Card` style view adapters.
- Property list/detail placeholders for console panels.

## 7) Runtime dependencies
- Runtime portfolio selection state composables.
- Firestore portfolio/property/unit collections.
- Read-only scenario pack for demo mode.

## 8) SEO hooks
- No public indexable slug routes in Phase 1.

## 9) Mutation entrypoints (write composables)
- `usePortfolioCreate` (later)
- `usePropertyCreate` (later)
- `useUnitCreate` (later)

## 10) Non-goals / prohibited fallbacks
- No silent fallback portfolio selection.
- No implicit first-portfolio auto-pick for console context.
