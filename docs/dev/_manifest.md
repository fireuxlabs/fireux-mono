# Documentation Manifest
Authority: Tier2 (Operational index)
Updated: 2026-03-23
## Authority Model
- Tier1 (authoritative): canon + contracts.
- Tier2 (operational): runbooks, guides, migration notes, weekly reports.
- Tier3 (non-authoritative): tooling prompts, AI memory, imported historical context.

## Tier1 Locations
- `docs/fireux-canon.md`
- `docs/runtime-contract.md`
- `docs/seo-canon.md`
- `packages/extensions/fireux-*/docs/contract.md`

## Tier2 Locations
- `docs/**` (except explicit Tier3 folders/files)
- `packages/**/docs/**`
- `projects/**/docs/**`
- root operational docs (`README.md`, `AGENTS.md`)

## Branch History System
- Repo-level decision history lives under `docs/changelog/**`.
- Runtime branch history is paired with `packages/core/fireux-docs/src/runtime/*/README.md`.
- Use changelog branches for meaningful reversals and direction shifts, not audit snapshots.

## Tier3 Locations
- `docs/ai/**`
- `.vscode/**`

## Weekly Hygiene Standard (Monday)
- Refresh `Updated:` fields for changed Tier1/Tier2 index docs.
- Validate local markdown links in `docs/**` (excluding Tier3 generated archives).
- Confirm ToC and package map still match real file layout.
- Generate one weekly report under `docs/reports/`.
- Record unresolved conflicts/unknowns explicitly in the report.

## Freshness Targets
- Tier1 docs: review weekly, update in same PR as rule changes.
- Tier2 indexes (ToC/manifest/package map): review weekly.
- Tier3: optional refresh; never authoritative.

## Rule of Resolution
- If Tier2/Tier3 conflicts with Tier1, Tier1 wins.
