# Documentation System
Authority: Tier2 (Operational)
Updated: 2026-03-02

## Entry Point
1. `AGENTS.md`
2. `docs/README.md`
3. Tier1 canon files

## Structure
### Tier1 (authoritative)
- `docs/fireux-canon.md`
- `docs/runtime-contract.md`
- `docs/seo-canon.md`
- `packages/extensions/fireux-*/docs/contract.md`

### Tier2 (operational)
- `docs/copilot-documentation/**`
- `docs/guide/**`
- `docs/ecosystems/README.md`
- `docs/reports/**`
- `docs/migrations/README.md`

### Tier3 (non-authoritative)
- `docs/ai/**`
- `.vscode/**`

## File Reduction Policy
- Prefer consolidated indexes/maps over per-app duplicates.
- Delete outdated files instead of keeping legacy copies.
- Keep one ecosystem map file (`docs/ecosystems/README.md`) instead of per-ecosystem pages.
- Keep one weekly hygiene report per week in `docs/reports/`.

## Monday Workflow
1. Refresh `Updated` on changed Tier1/Tier2 docs.
2. Validate local markdown links under `docs/**`.
3. Update ToC, manifest, package-docs map if drift is detected.
4. Publish one weekly report under `docs/reports/`.
