# Core Changelog
Authority: Tier2 (Operational history)
Updated: 2026-03-28

Tracks meaningful changes in shared core platform behavior, repo-wide documentation structure, and cross-cutting system rules.

## 2026-03-28 - Project canonical-shape migration path added

Previous:
- project root data and project app overlays were being normalized by hand during alignment work
- the repo did not have one repeatable script for project shape cleanup

Now:
- `scripts/migrate-projects-canonical-shape.mjs` provides a repeatable path for project stamp normalization and overlay ensuring

Why:
- keep project migration work repeatable
- reduce one-off data repair during control-plane cleanup
- support dry-run-first migration discipline

Affected:
- project migration workflow
- migration runbook

## 2026-03-12 - FireUX ecosystem switched to named Firestore DB

Previous:
- Firestore access assumptions were more ecosystem-default and less explicit in runtime selection.

Now:
- FireUX ecosystem runtime is aligned around named Firestore DB selection.
- Shared create, read, update, and console flows follow that selection model.

Why:
- make database selection explicit and scalable across apps and consoles
- reduce hidden environment coupling

Affected:
- core firestore operations
- runtime config
- console and project meta server utilities

## 2026-03-12 - Console database discovery pipeline added

Previous:
- console database awareness was implicit and distributed across app and server seams.

Now:
- console database discovery is handled through an explicit discovery pipeline.

Why:
- centralize console environment understanding
- reduce app-local divergence

Affected:
- core console server utilities
- project app console endpoints

## 2026-03-02 - Documentation system consolidated under `docs/`

Previous:
- documentation authority was spread across root docs, imported docs, AI context files, `.specify`, and prompt scaffolding.

Now:
- the repo documentation system is centered on `docs/`.
- Tier1 canon, Tier2 operational docs, and Tier3 AI context are explicitly separated.
- `docs/ai/**` is the Tier3 location for AI memory and bundles.

Why:
- reduce authority drift
- make the doc system reviewable and versioned
- remove duplicate roots of truth

Affected:
- `docs/README.md`
- `docs/system.md`
- `AGENTS.md`
