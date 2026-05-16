# fireux-properties Contract
Authority: Tier1 (Authoritative)
Updated: 2026-05-16
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own portfolio-domain runtime and portfolio console behavior for Granite.
- Provide shared property models and surfaces that product shells may use without adopting Portfolio as their app role.
- BuenoHost is a standalone property information system:
  - BuenoHost owns public property info under `/properties/{propertySlug}/info`.
  - BuenoHost is not a portfolio management tool.
  - BuenoHost must not expose the Portfolio console family unless a future property-console decision explicitly adds one.
- Granite owns estate, portfolio, and investment management surfaces.
- Properties may later be compatible with Granite portfolios, but Portfolio remains the Granite management grouping, not the required BuenoHost app shape.

## 2) Core entities
- `Portfolio`
- portfolio-owned operational child records such as:
  - `Property`
  - `Client`
  - finance/incidents/documents children as the family evolves
- BuenoHost may use `Property` as a root/public information entity without creating a Portfolio.

## 3) Identity rule
- Portfolio identity is id-based (`portfolio.id` is canonical).
- Portfolio console authority is user-based in the app-hosted overlay.
- `owner_label` is presentation only; it is not the console ownership rule.
- If a future operator/team profile is added, it remains a prerequisite or presentation layer over the same overlay governance pattern.
- Decision note: current implementation drift creates some portfolios with `id = slug`.
  Keep this contract id-based until a future portfolio identity pass explicitly chooses
  between id-based identity and slug-id public routing.

## 4) Collections + paths
- `portfolios/{portfolioId}`
- `apps/{appId}/portfolios/{portfolioId}`
- Root portfolio records carry explicit app relationship metadata:
  - `app_scope_state`
  - `app_scope_app_id`
- Portfolio-owned operational children live under:
  - `apps/{appId}/portfolios/{portfolioId}/{childCollection}/{childId}`
- BuenoHost public property information uses a Kitchen-shaped public child pattern:
  - `properties/{propertyId}`
  - `properties/{propertyId}/info/{infoId}`
  - `properties/{propertyId}/messages/{messageId}`
  - `properties/{propertyId}/maintainers/{maintainerId}`

## 5) Routes (public vs internal; slug vs id)
- Current id-based routes:
  - `/portfolios`
  - `/portfolios/[id]`
  - `/console/portfolio/*`
- BuenoHost public routes:
  - `/properties/[slug]`
  - `/properties/[slug]/info`
  - `/properties/[slug]/info/[infoId]`
- BuenoHost console scaffold routes:
  - `/console/property`
  - `/console/property/overview`
  - `/console/property/qr`
- `/console/property` and `/console/property/overview` follow the shared core console index/overview semantics.
- Property-owned child routes must be added only when their canon is explicit.
- Current Property-owned child route:
  - `/console/property/qr`
- Console family key:
  - `portfolio`
- BuenoHost property console family key:
  - `property`
- Console route segment:
  - `portfolio`
- BuenoHost property console route segment:
  - `property`
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
- No combining BuenoHost and Granite into one app shell just because they share this engine.
- No adding a `guest guide` bucket between BuenoHost `Property` and its public info.
