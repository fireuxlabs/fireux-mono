# fireux-compliance Contract
Authority: Tier1 (Authoritative)
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`

## 1) Purpose
- Own compliance item definitions, compliance records, and derived expiry status.

## 2) Core entities
- `ComplianceItemType`
- `ComplianceRecord`

## 3) Identity rule
- Compliance records are id-based and scoped to a selected portfolio.
- Runtime selection comes from `runtimePortfolioId` and is always explicit.

## 4) Collections + paths
- `portfolios/{portfolioId}/compliance-records/{recordId}`

## 5) Routes
- `/console/portfolio/compliance`

## 6) Surfaces
- Compliance board/list with derived statuses (`ok`, `dueSoon`, `overdue`).

## 7) Runtime dependencies
- `fireux-properties` runtime portfolio selection and scenario context.

## 8) Mutation entrypoints
- Phase 1 keeps mutations explicit and opt-in; read-only mode performs no writes.

## 9) Non-goals
- No silent fallback portfolio.
- No automatic selection from query params or first record.
