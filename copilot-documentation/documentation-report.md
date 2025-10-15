---
title: Documentation Status — 2025-10-15
status: active
updated: 2025-10-15
---

[← Back to ToC](./copilot-00-toc.md)

# Documentation Status — 2025-10-15

## Purpose

- Track the current source-of-truth docs after the October 2025 pruning pass.
- Record which deep-dive notes were archived or relocated so future cleanups stay incremental.

## Changes in this pass

- Removed stale root-level Markdown (`images.md`, `prune.md`) and the legacy `docs/` aggregates (`allconfigs.md`, `allmodules.md`, `layouts-and-packages.md`, `layouts-and-routes.md`, `package-map.md`).
- Updated [copilot-02-structure.md](./copilot-02-structure.md) and [copilot-03-config.md](./copilot-03-config.md) with the verified install graph and current Nuxt/TS examples (`projects/misebox/misebox-app`).
- Migrated Places documentation into `packages/extensions/fireux-places/docs/` (see new `places-overview.md`) and dropped snapshot-style copies (`places-stack.md`, `places-search-report.md`, `places-avatar-resolution.md`, `places-deltas-scope.md`).

## Doc inventory (after cleanup)

- Handbook core (`copilot-00` → `copilot-07`): 8 files.
- Appendices (`copilot-appendices/`): 7 active references.
- ADRs (`copilot-adr/`): 3 decisions + README.
- Package docs: `fireux-places/docs/places-overview.md` (new). Additional package notes should follow this pattern.

## Follow-ups

- Audit jobs/professional experience docs (`experience-stack.md`, `professional-experience-place-selection.md`) and relocate into `packages/extensions/fireux-jobs/docs/`.
- Fold navigation notes (`nav.md`, `navigation-map.md`, `navigation-report.md`) into a single, concise appendix that matches the current menu config.
- Add an automated lint step (see `scripts/structure-maintenance.sh`) to flag Markdown stragglers outside allowed directories.
