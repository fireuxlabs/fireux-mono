# FireUX Documentation Hub
Authority: Tier2 (Operational index)
Updated: 2026-03-23

This is the docs landing map for weekly maintenance and day-to-day navigation.
System definition: `docs/system.md`.

## Product Source of Truth (Public Pages)
App-specific product narrative lives in each ecosystem app, not in shared docs.

Target page trio per ecosystem app:
- `/` = current product snapshot (what we offer now)
- `/about` = system definition (concepts, entities, relationships)
- `/road-map` = development direction (what is next, when present)

Shared docs under `docs/**` should stay app-agnostic unless a Tier1 canon file explicitly requires app-specific references.

## Tier 1 (Authoritative Canon)
- `docs/fireux-canon.md`
- `docs/runtime-contract.md`
- `docs/seo-canon.md`
- `packages/extensions/fireux-*/docs/contract.md`

Only the Tier1 files above are authoritative canon. Folder names like `docs/canon/` are report namespaces, not additional canon sources.

## Tier 2 (Operational)
- `docs/copilot-documentation/` handbook chapters and appendices
- `docs/guide/` implementation guides
- `docs/entity-layer-canon.md` layer strategy rules
- `docs/migrations/README.md` migration runbook
- `docs/reports/` weekly and generated audit reports
- package/project docs under `packages/**/docs/` and `projects/**/docs/`

## Tier 3 (Tooling/History, non-authoritative)
- `docs/ai/**`
- `.vscode/**`

## Chapter Map
1. `docs/copilot-documentation/copilot-01-orientation.md`
2. `docs/copilot-documentation/copilot-02-architecture.md`
3. `docs/copilot-documentation/copilot-03-configuration.md`
4. `docs/copilot-documentation/copilot-04-platform-services.md`
5. `docs/copilot-documentation/copilot-05-development-workflow.md`
6. `docs/copilot-documentation/copilot-06-ci-cd.md`
7. `docs/copilot-documentation/copilot-07-ux-conventions.md`
8. `docs/copilot-documentation/copilot-08-operations.md`

## Monday Hygiene Cadence
- Refresh Tier1/Tier2 indexes and chapter ToC.
- Run docs freshness scan (updated headers, authority headers, local link health).
- Publish one weekly report in `docs/reports/`.
- Keep Tier3 docs available but non-authoritative and minimal.
