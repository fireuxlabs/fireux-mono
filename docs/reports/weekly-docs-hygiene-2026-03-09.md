# Weekly Docs Hygiene — 2026-03-09
Authority: Tier2 (Operational report)
Updated: 2026-03-09

## Scope
- Monday FireUX docs hygiene pass for `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono`.
- Tier1/Tier2 index alignment audit and refresh:
  - `docs/README.md`
  - `docs/index.md`
  - `docs/copilot-documentation/copilot-00-toc.md`
  - `docs/dev/_manifest.md`
  - `docs/copilot-documentation/package-docs-index.md`
- Local markdown link validation under `docs/**`, excluding Tier3 generated archives (`docs/ai/**`) and prior weekly report archives.

## Snapshot Counts
- Markdown files scanned (repo-wide, excluding `node_modules`): `135`
- Markdown files in `docs/**`: `97`
- `docs/**` with explicit `Updated` header: `94`
- `docs/**` missing explicit `Updated` header: `3`
- `docs/**` with explicit `Authority` header: `77`
- `docs/**` missing explicit `Authority` header: `20`
- `docs/**` stale over 30 days (dated files): `0`
- `docs/**` stale over 90 days (dated files): `0`
- Local markdown link issues in checked set: `0`

## Stale-File Summary
- No dated docs in `docs/**` are older than 30 days.

## Changes Applied
- Refreshed Monday hygiene dates and index alignment in:
  - `docs/README.md`
  - `docs/index.md`
  - `docs/copilot-documentation/copilot-00-toc.md`
  - `docs/dev/_manifest.md`
  - `docs/copilot-documentation/package-docs-index.md`
- Added this week’s report and linked it from `docs/reports/README.md`.
- Added explicit exclusion note for Tier3 generated archives in manifest link-check guidance.
- Confirmed package extension contract map still matches current Tier1 contracts (`8` extension `contract.md` files).

## Open Risks
- Three non-Tier3 docs still lack both `Authority` and `Updated` headers:
  - `docs/handle.md`
  - `docs/reports/collection-manager-report.md`
  - `docs/seo/global-entities-report.md`
- Tier3 markdown remains intentionally mixed-format (17 files in `docs/ai/**` without `Authority`), which is acceptable but increases noise if broad header metrics are interpreted without tier filtering.
