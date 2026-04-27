# fireux-properties Contract
Authority: Tier1 (Authoritative)
Updated: 2026-04-27
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own portfolio-domain runtime and portfolio console behavior.

## 2) Core entities
- `Portfolio`
- portfolio-owned operational child records such as:
  - `Property`
  - `Client`
  - finance/incidents/documents children as the family evolves

## 3) Identity rule
- Portfolio identity is id-based (`portfolio.id` is canonical).
- Portfolio console authority is user-based in the app-hosted overlay.
- `owner_label` is presentation only; it is not the console ownership rule.
- If a future operator/team profile is added, it remains a prerequisite or presentation layer over the same overlay governance pattern.

## 4) Collections + paths
- `portfolios/{portfolioId}`
- `apps/{appId}/portfolios/{portfolioId}`
- Root portfolio records carry explicit app relationship metadata:
  - `app_scope_state`
  - `app_scope_app_id`
- Portfolio-owned operational children live under:
  - `apps/{appId}/portfolios/{portfolioId}/{childCollection}/{childId}`

## 5) Routes (public vs internal; slug vs id)
- Current id-based routes:
  - `/portfolios`
  - `/portfolios/[id]`
  - `/console/portfolio/*`
- `/console/portfolio` is the family entry page:
  - `demo`: curated demo portfolios
  - `test`: Firestore-backed test portfolios
  - `live`: my real portfolios for this app
- `test` canon is one personal portfolio per signed-in user:
  - `test-portfolios/{uid}`
  - ensured on entry to `/console/portfolio` in `test` mode
  - not created during auth
- `my real portfolios` means portfolios the current user can operate through the app overlay:
  - `apps/{appId}/portfolios/{portfolioId}`
  - `team_ids` contains the user
- Console selection is runtime-state based, not query-param selection.

## 6) Surfaces supported
- `Pill`, `Cell`, `Preview`, `Profile` supported for portfolio cards/views where appropriate.

## 7) Runtime dependencies
- Runtime portfolio selection state.
- Mode-aware loading for:
  - `live`
  - `demo`
  - `test`
- Runtime mode mapping follows `docs/runtime-contract.md`.

## 8) SEO hooks
- Public/indexable portfolio routes should provide:
  - `usePortfolioSeo`
  - portfolio JSON-LD helpers where canon later requires them

## 9) Mutation entrypoints (write composables)
- `usePortfolioCreate`
- other portfolio-owned mutation seams as the family evolves
- `createPortfolio` = intentional portfolio creation
- `ensurePortfolio` = test/bootstrap/setup-if-missing

## 10) Non-goals / prohibited fallbacks
- No silent fallback selection of active portfolio inside console flows.
- No treating `owner_label`, team naming, or branding context as console permission.
- No implicit switch from public portfolio browsing to console authority.
