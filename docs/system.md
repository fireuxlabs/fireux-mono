# Documentation System
Authority: Tier2 (Operational)
Updated: 2026-03-28

## Entry Point
- Agent context loading: `AGENTS.md` is authoritative.
- Agents must follow `AGENTS.md` context loading rules and must not read broad docs by default.
- Documentation navigation starts at `docs/README.md`.
- Tier1 canon remains authoritative when structural rules are involved.

## Structure
### Tier1 (authoritative)
- `docs/fireux-canon.md`
- `docs/runtime-contract.md`
- `docs/seo-canon.md`
- `packages/extensions/fireux-*/docs/contract.md`

### Tier2 (operational)
- `docs/copilot-documentation/**`
- `docs/changelog/**`
- `docs/guide/**`
- `docs/ecosystems/README.md`
- `docs/reports/**`
- `docs/migrations/README.md`
- `packages/core/fireux-docs/src/runtime/README.md`
- `packages/core/fireux-docs/src/runtime/*/README.md`

### Tier3 (non-authoritative)
- `docs/ai/**`
- `.vscode/**`

## Product Documentation Rule
Public app pages are the product source of truth:
- `/` for current offer
- `/about` for system definition
- `/road-map` for direction (when present)

Shared docs should remain app-agnostic and operational.
If content reads like app marketing, app concepts, or app brief material, move it to that app's `/about` (or `/road-map`).

## File Reduction Policy
- Prefer consolidated indexes/maps over per-app duplicates.
- Delete outdated files instead of keeping legacy copies.
- Keep one ecosystem map file (`docs/ecosystems/README.md`) instead of per-ecosystem pages.
- Keep one weekly hygiene report per week in `docs/reports/`.

## Runtime README Branch System
- Treat `packages/core/fireux-docs/src/runtime/README.md` as the runtime docs entry point.
- Treat the sibling `packages/core/fireux-docs/src/runtime/*/README.md` files as the runtime branch system.
- During runtime reconciliation work, follow:
  1. runtime root README
  2. relevant branch README
  3. Tier1 canon when structural rules are involved

## Changelog Branch System
- Treat `docs/changelog/README.md` as the decision-history root.
- Treat the sibling `docs/changelog/*/README.md` files as the branch history system from core down to apps.
- Use changelog branches to capture meaningful direction shifts, reversals, and policy changes.
- If a changelog entry becomes a long-lived architectural decision, promote it into an ADR.

## Monday Workflow
1. Refresh `Updated` on changed Tier1/Tier2 docs.
2. Validate local markdown links under `docs/**`.
3. Update ToC, manifest, package-docs map if drift is detected.
4. Publish one weekly report under `docs/reports/`.
