# Weekly Docs Hygiene — 2026-03-23
Authority: Tier2 (Operational report)
Updated: 2026-03-23

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
- Markdown files scanned (repo-wide, excluding `node_modules`): `174`
- Markdown files in `docs/**`: `99`
- `docs/**` with explicit `Updated` header: `96`
- `docs/**` missing explicit `Updated` header: `3`
- `docs/**` with explicit `Authority` header: `94`
- `docs/**` missing explicit `Authority` header: `5`
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
- Updated handbook ToC pointer to this week’s hygiene report.
- Added this week’s report and linked it from `docs/reports/README.md`.
- Revalidated Tier1 extension contract coverage in the package map (`8` extension `contract.md` files).

## Open Risks
- Three non-Tier3 docs still lack both `Authority` and `Updated` headers:
  - `docs/handle.md`
  - `docs/reports/collection-manager-report.md`
  - `docs/seo/global-entities-report.md`
- Tier3 generated/history docs remain mixed-format by design and should stay non-authoritative to avoid canon drift.
