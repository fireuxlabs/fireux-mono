# Weekly Docs Hygiene — 2026-03-02
Authority: Tier2 (Operational report)
Updated: 2026-03-02
## Scope
- Repo markdown audit focused on `docs/**`, plus top-level tier placement checks.
- Goal: prepare a clean weekly documentation update set.

## Snapshot
- Markdown files scanned (repo-wide, excluding `node_modules`): `288`
- Markdown files in `docs/**`: `74`
- `docs/**` with explicit `Updated` date: `74`
- `docs/**` missing explicit `Updated` date: `0`
- `docs/**` with explicit `Authority` header: `74`
- `docs/**` stale over 30 days (dated files): `1`
- `docs/**` stale over 90 days (dated files): `1`
- Local markdown link issues in `docs/**` (excluding Tier3 archive `docs/git-tree.md`): `0`

## Hygiene Changes Applied This Week
- Rebuilt top-level docs navigation and chaptering:
  - `docs/README.md`
  - `docs/index.md`
  - `docs/copilot-documentation/copilot-00-toc.md`
- Refreshed authority + cadence manifest:
  - `docs/dev/_manifest.md`
  - `docs/copilot-documentation/package-docs-index.md`
- Added reporting indexes:
  - `docs/reports/README.md`
  - `docs/canon/README.md`
  - `docs/seo/README.md`
- Added explicit freshness metadata on handbook chapters (`copilot-01` to `copilot-08`).
- Normalized `Updated` + `Authority` metadata across all `docs/**` files.
- Fixed a real broken local link:
  - `docs/migrations/README.md` (`../scripts/` -> `../../scripts/`)
- Removed one invalid temporary report citation link (`sediment://...`) in:
  - `docs/copilot-documentation/temporary-reports/dashboard-console.md`

## Freshness Risks (Open)
- `docs/git-tree.md` remains intentionally stale as Tier3 historical archive.
- Newly created report/index docs are currently untracked and should be explicitly included or excluded before publish:
  - `docs/canon/README.md`
  - `docs/canon/server-projection-v1.md`
  - `docs/seo/README.md`
  - `docs/seo/global-entities-report.md`
  - `docs/reports/README.md`
  - `docs/reports/collection-manager-report.md`
  - `docs/reports/weekly-docs-hygiene-2026-03-02.md`
  - `docs/handle.md`

## Monday Baseline Going Forward
1. Update weekly report in `docs/reports/`.
2. Keep ToC + package map + manifest in sync with real folder layout.
3. Keep Tier1 docs reviewed whenever structural rules change.
4. Track unresolved gaps explicitly (do not hide drift).
