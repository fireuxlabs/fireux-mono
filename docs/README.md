# FireUX Documentation Hub
Authority: Tier2 (Operational index)
Updated: 2026-03-28

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
- `docs/changelog/README.md` decision-history and change-history system
- `docs/guide/` implementation guides
- `docs/entity-layer-canon.md` layer strategy rules
- `docs/migrations/README.md` migration runbook
- `docs/reports/` weekly and generated audit reports
- `packages/core/fireux-docs/src/runtime/README.md` runtime docs entry
- `packages/core/fireux-docs/src/runtime/*/README.md` runtime branch READMEs
- package/project docs under `packages/**/docs/` and `projects/**/docs/`

Current operational note:
- repo-wide drift inspection now depends on runtime collection-manager dev JSON showing raw docs and direct subcollections where they exist
- the shared behavior is documented in the runtime `components/`, `composables/`, and `server/` branch READMEs
- console visibility is now app-config driven through `consoleFamilies`; the shared `/console` hub no longer discovers families by route scanning

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

## Runtime README Branch System
- `packages/core/fireux-docs/src/runtime/README.md` is the operational entry for runtime structure.
- The sibling README files under `packages/core/fireux-docs/src/runtime/*/README.md` are the branch system for runtime alignment work.
- Start at the runtime root README, then move to the relevant branch:
  - `concepts/README.md` for cross-cutting runtime behaviour
  - `models/README.md` for runtime model/storage rules
  - `pages/README.md` for route ownership
  - `components/README.md` for delivered UI families
  - `composables/README.md` for runtime composable structure

## Changelog Branch System
- `docs/changelog/README.md` is the repo-level entry for decision history.
- Use the branch changelogs under `docs/changelog/*/README.md` to record meaningful shifts from root to app:
  - `core/README.md`
  - `extensions/README.md`
  - `ecosystems/README.md`
  - `apps/README.md`
  - `runtime/README.md`

## Monday Hygiene Cadence
- Refresh Tier1/Tier2 indexes and chapter ToC.
- Run docs freshness scan (updated headers, authority headers, local link health).
- Publish one weekly report in `docs/reports/`.
- Keep Tier3 docs available but non-authoritative and minimal.
