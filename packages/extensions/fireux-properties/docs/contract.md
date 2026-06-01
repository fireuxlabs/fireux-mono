# fireux-properties Contract
Authority: Tier1 (Authoritative)
Updated: 2026-05-18
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own portfolio-domain runtime and portfolio console behavior for Granite.
- Provide shared property models and surfaces that product shells may use without adopting Portfolio as their app role.
- BuenoHost is a standalone property information system:
  - BuenoHost owns public property info under `/properties/{propertySlug}/info`.
  - BuenoHost is not a portfolio management tool.
  - BuenoHost must not expose the Portfolio console family unless a future Property console decision explicitly adds one.
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
- Portfolio console authority is user-based in the app-hosted console record.
- `owner_label` is presentation only; it is not the console ownership rule.
- If a future operator/team profile is added, it remains a prerequisite or presentation layer over the same console governance pattern.
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
- Portfolio document operations are owned by `fireux-documents` and mounted as Portfolio console operations:
  - `apps/{appId}/portfolios/{portfolioId}/documents/{documentId}`
  - `apps/{appId}/portfolios/{portfolioId}/document-links/{linkId}`
  - canonical seams live under `composables/fireux/console/portfolio/operations/documents/**`
  - `Document` and `DocumentLink` are Portfolio-scoped console operation records, not root entities.
- BuenoHost `Property` follows the same root/app console collection canon as other console entities:
  - `properties/{propertyId}`
  - `apps/{appId}/properties/{propertyId}`
- BuenoHost public property information uses a Kitchen-shaped public child pattern:
  - `properties/{propertyId}/info/{infoId}`
  - `properties/{propertyId}/messages/{messageId}`
  - `properties/{propertyId}/maintainers/{maintainerId}`

## 5) Routes (public vs internal; slug vs id)
- Current id-based routes:
  - `/portfolios`
  - `/portfolios/[id]`
  - `/portfolios/[id]/operator`
  - `/console/portfolio/*`
- `/portfolios/[id]/operator` is the public-to-private operator bridge for the id-based Portfolio contract.
- BuenoHost public routes:
  - `/properties/[slug]`
  - `/properties/[slug]/info`
  - `/properties/[slug]/info/[infoId]`
  - `/properties/[slug]/operator`
- `/properties/[slug]/operator` is the public-to-private operator bridge for the slug-based Property contract.
- `companion` is old BuenoHost route language; public property information route canon is `info`.
- BuenoHost console scaffold routes:
  - `/console/property`
  - `/console/property/overview`
  - `/console/property/qr`
  - `/console/property/welcome`
  - `/console/property/check-in`
  - `/console/property/checkout`
  - `/console/property/emergency`
  - `/console/property/house-rules`
  - `/console/property/apartment-guide`
  - `/console/property/rubbish-recycling`
  - `/console/property/parking`
  - `/console/property/local-guide`
  - `/console/property/updates`
- `/console/property` and `/console/property/overview` follow the shared core console index/overview semantics.
- `/console/property` live targets are authority-scoped through:
  - `apps/{appId}/properties/{propertyId}`
  - `operator_ids` contains the user
- Public/unfiltered property lists read root `properties/{propertyId}` records and must not borrow Portfolio authority.
- Property-owned child routes must be added only when their canon is explicit.
- Current Property-owned child routes:
  - `/console/property/qr`
  - `/console/property/welcome`
  - `/console/property/check-in`
  - `/console/property/checkout`
  - `/console/property/emergency`
  - `/console/property/house-rules`
  - `/console/property/apartment-guide`
  - `/console/property/rubbish-recycling`
  - `/console/property/parking`
  - `/console/property/local-guide`
  - `/console/property/updates`
- Property info child routes are flat while they remain simple section editors.
- Property info child pages use a shared key/value editor shape:
  - page key
  - title
  - summary
  - rows of label/value/tone
- If a child concept becomes a collection or detail workflow, it should graduate to a folder route like other console entity children.
- Console family key:
  - `portfolio`
- BuenoHost property console family key:
  - `property`
- Console route segment:
  - `portfolio`
- BuenoHost property console route segment:
  - `property`
- Property console composables follow the shared console entity bucket canon:
  - `composables/fireux/console/property/usePropertyConsole.ts`
  - `composables/fireux/console/property/usePropertyConsoleIndex.ts`
  - `composables/fireux/console/property/usePropertyConsoleOverview.ts`
  - `composables/fireux/console/property/usePropertySelection.ts`
  - property operation helpers live under `composables/fireux/console/property/operations/**`
- `/console/portfolio` is the family entry page:
  - `demo`: curated demo portfolios
  - `test`: Firestore-backed test portfolios
  - `live`: my real portfolios for this app
- `test` canon is one personal portfolio per signed-in user:
  - `test-portfolios/{uid}`
  - ensured on entry to `/console/portfolio` in `test` mode
  - not created during auth
- `my real portfolios` means portfolios the current user can operate through the app console record:
  - `apps/{appId}/portfolios/{portfolioId}`
  - `operator_ids` contains the user
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
- `createPortfolioConsole` = idempotent console portfolio creation

## 10) Non-goals / prohibited fallbacks
- No silent fallback selection of active portfolio inside console flows.
- No treating `owner_label`, team naming, or branding context as console permission.
- No implicit switch from public portfolio browsing to console authority.
- No combining BuenoHost and Granite into one app shell just because they share this engine.
- No adding a `guest guide` bucket between BuenoHost `Property` and its public info.
