# Docs Dissolve Inventory

Authority: Tier2 (Operational report)
Updated: 2026-03-20

## Purpose

This is the first dissolve pass for older documentation that overlaps with the new FireUX directory-structure system under `packages/core/fireux-docs`.

This pass is only about duplicate structural authority.

It does not dissolve:
- Tier1 canon
- package contracts
- reports
- migration runbooks
- unique domain documentation

## New Structural Authority

The new structural authority now lives in:
- `packages/core/fireux-docs/README.md`
- `packages/core/fireux-docs/src/README.md`
- `packages/core/fireux-docs/src/runtime/README.md`
- `packages/core/fireux-docs/src/config/README.md`
- `packages/core/fireux-docs/src/types/README.md`
- the child README files under `packages/core/fireux-docs/src/runtime/*`
- the child README files under `packages/core/fireux-docs/src/config/*`

Rule:
- one topic
- one home
- one authority

## Covered By New System

These items now have their structural guidance covered by the new README hierarchy and should stop acting as structural authorities.

Package README structure sections:
- `packages/core/fireux-core/README.md`
  Reason: `## Structure` duplicates package-root guidance now covered by `packages/core/fireux-docs/README.md`.
- `packages/extensions/fireux-jobs/README.md`
  Reason: `## Structure` duplicates package-root guidance now covered by `packages/core/fireux-docs/README.md`.
- `packages/extensions/fireux-places/README.md`
  Reason: `## Structure` duplicates package-root guidance now covered by `packages/core/fireux-docs/README.md`.
- `packages/ecosystem/fireux-bringli/README.md`
  Reason: `## Structure` duplicates package-root guidance now covered by `packages/core/fireux-docs/README.md`.
- `packages/ecosystem/fireux-cleanbox/README.md`
  Reason: `## Structure` duplicates package-root guidance now covered by `packages/core/fireux-docs/README.md`.
- `packages/ecosystem/fireux-fireux/README.md`
  Reason: `## Structure` duplicates package-root guidance now covered by `packages/core/fireux-docs/README.md`.
- `packages/ecosystem/fireux-misebox/README.md`
  Reason: `## Structure` duplicates package-root guidance now covered by `packages/core/fireux-docs/README.md`.

General structural rules now covered by the new system:
- package-root structure
- `src/` structure
- `runtime/` directory purpose
- `config/` directory purpose
- `types/` directory purpose

## Partially Covered, Migrate Useful Content

These files overlap with the new system in some areas, but still contain useful content that should be migrated or retained selectively.

Docs indexes and system maps:
- `docs/README.md`
  Overlap: documentation system map and authority map overlap with newer structural authority and `AGENTS.md`.
  Keep: repo-wide docs landing role.
  Migrate: any duplicated structure-language should be reduced.
- `docs/index.md`
  Overlap: general docs landing and policy overlap with `docs/README.md`.
  Keep: external-facing docs index role if still needed.
  Migrate: duplicate operational index language.
- `docs/system.md`
  Overlap: authority model and file-reduction policy overlap with `AGENTS.md`, `docs/README.md`, and `docs/dev/_manifest.md`.
  Keep: concise documentation policy if still needed.
  Migrate: duplicate index and policy language.
- `docs/dev/_manifest.md`
  Overlap: authority model and weekly hygiene policy overlap with `docs/README.md`, `docs/system.md`, and `AGENTS.md`.
  Keep: manifest role if it remains the live operational source.
  Migrate: duplicate authority lists and overlapping policy text.

Architecture docs:
- `docs/architecture/index.md`
  Overlap: high-level structure framing overlaps with the new directory-structure system.
  Keep: architecture index role.
  Migrate: structure language that now belongs in `fireux-docs`.
- `docs/architecture/core.md`
  Overlap: runtime-boundary framing partially overlaps with newer module-structure docs.
  Keep: identity, tenancy, composables, and data-shape guidance.
  Migrate: any low-level structure phrasing that duplicates the new system.
- `docs/architecture/canon.md`
  Overlap: runtime folder shape guidance overlaps with the new directory pages.
  Keep: entity classes, page-mode guidance, and organism canon until those get a clearer permanent home.
  Migrate: folder-shape explanations that are now covered by `packages/core/fireux-docs/src/runtime/README.md`.

Package READMEs with mixed content:
- `packages/core/fireux-core/README.md`
  Overlap: package structure section.
  Keep: package-specific purpose, notes, and SEO baseline.
- `packages/extensions/fireux-blogs/README.md`
  Overlap: package/runtime shape is now better handled by the new structure system.
  Keep: what it ships, guardrails, quick start.
- `packages/extensions/fireux-products/README.md`
  Overlap: package/runtime shape is now better handled by the new structure system.
  Keep: what it ships, data shape, Stripe notes, quick start.
- `packages/extensions/fireux-suppliers/README.md`
  Overlap: runtime/config surface summary overlaps with the new structure system.
  Keep: package-specific contract and quick start.

## Still Unique, Keep For Now

These files should not be dissolved in this pass.

Tier1 canon:
- `docs/fireux-canon.md`
- `docs/runtime-contract.md`
- `docs/seo-canon.md`

Package contracts:
- `packages/extensions/fireux-*/docs/contract.md`

Operational reports and runbooks:
- `docs/reports/**`
- `docs/migration.md`
- `docs/migrations/README.md`

Package READMEs that are currently mostly package-specific:
- `packages/core/fireux-ecosystem-controller/README.md`
- `packages/core/fireux-nuxtfire/README.md`
- `packages/extensions/fireux-companies/README.md`
- `packages/extensions/fireux-kitchens/README.md`
- `packages/extensions/fireux-orders/README.md`
- `packages/ecosystem/fireux-granite/README.md`

## Current Risk

The new structure docs are ahead of the rendered docs system.

Current repo reality:
- `packages/core/fireux-docs` now contains the best structural documentation
- `packages/ecosystem/fireux-fireux/src/runtime/pages/docs/*` already renders `/docs`
- `packages/core/fireux-core/src/runtime/layouts/docs.vue` already provides a docs layout
- the `fireuxDocs` content source is queried by the `/docs` pages but is not yet clearly registered in checked-in config
- `projects/fireux/fireux-app/server/api/docs-manifest.get.ts` still points at `docs/_manifest.md`, while the live manifest file is `docs/dev/_manifest.md`

Because of that, older docs should not be removed aggressively until the new docs source path is real.

## Recommended Next Actions

1. Wire `packages/core/fireux-docs` into the live `/docs` rendering path as the canonical content source.
2. Repoint or replace the old manifest usage in `projects/fireux/fireux-app/server/api/docs-manifest.get.ts`.
3. Remove duplicate `## Structure` sections from the covered package READMEs.
4. Reduce duplicate authority among `docs/README.md`, `docs/index.md`, `docs/system.md`, and `docs/dev/_manifest.md`.
5. Do a second dissolve pass on `docs/architecture/*` after the rendered docs system is real.

## Short Version

The new `fireux-docs` README hierarchy now owns structure guidance.

The next dissolve pass should remove duplicate structure authority first, then reconcile the older docs indexes, and only then touch broader architecture prose.
