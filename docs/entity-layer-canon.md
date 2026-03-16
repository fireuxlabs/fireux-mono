# Entity Layer Canon
Authority: Tier2 (Operational alignment)
Updated: 2026-03-16

Purpose: keep entity modeling aligned so FireUX models read like one system, not per-package inventions.

Primary operational contract:
- `docs/contracts/entity-classes.md`

This file remains the short alignment index for entity modeling. The detailed class contracts, naming rules, stamp rules, and migration lock now live in `docs/contracts/entity-classes.md`.

## Core Rule
Every FireUX entity must belong to exactly one class:
- `Root`
- `Runtime Child`
- `Dual-Layer`

## Alignment Checks
Before changing a model:
1. Confirm the entity class.
2. Confirm the canonical Firestore path story.
3. Confirm the exported object naming matches the class.
4. Confirm stamps use nested `created` and `updated`.
5. Confirm enriched read models are explicitly non-persisted.

## Drift Rule
If a model changes class or storage contract, update:
1. `docs/contracts/entity-classes.md`
2. this file
3. the relevant extension contract when the domain contract changes
