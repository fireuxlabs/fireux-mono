# fireux-properties Contract
Authority: Tier1 (Authoritative)
Updated: 2026-03-25
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own portfolio runtime domain, portfolio console behavior, and portfolio-owned operational children.

## 2) Core entities
- `Portfolio`
- portfolio-owned operational children such as property, client, document, task, and compliance records where implemented

## 3) Identity rule
- Portfolio identity is id-based.
- Portfolio console runtime selection is state-based.
- Portfolio relationship or membership signals are not console authority by themselves.

## 4) Collections + paths
- `portfolios/{portfolioId}`
- `apps/{appId}/portfolios/{portfolioId}`
- Treat `Portfolio` as a console-backed entity family with:
  - a root public portfolio entity
  - an app-hosted portfolio console overlay
  - app-owned operational children beneath that overlay

## 5) Routes (public vs internal; slug vs id)
- Current id-based routes:
  - `/portfolios`
  - `/portfolios/[id]`
  - `/console/portfolio/*`

## 6) Surfaces supported
- `Pill`, `Cell`, `Preview`, `Profile` supported where portfolio delivery surfaces exist.

## 7) Runtime dependencies
- Runtime portfolio selection state (`runtimePortfolioId`, `runtimePortfolioMode`).
- Mode-aware loading (`live`, `test`, `read-only`).

## 8) SEO hooks
- If public portfolio pages are indexable/public, provide:
  - `usePortfolioSeo`
  - portfolio JSON-LD helpers when the public contract requires them

## 9) Mutation entrypoints (write composables)
- `usePortfolioCreate`

## 10) Non-goals / prohibited fallbacks
- No silent fallback selection of active portfolio inside console flows.
- No treating a portfolio relationship or member link as console access.
