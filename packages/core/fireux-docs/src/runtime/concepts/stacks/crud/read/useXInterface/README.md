---
title: useXInterface
description: Shared FireUX canon for the useXInterface read seam and its implementation families.
---

# useXInterface

Authority: Operational
Updated: 2026-04-18
Scope: FireUX `useXInterface` read canon across stacks that expose UI-facing interface seams.

This page documents the shared `useXInterface` seam.

It does not replace the main read concept.
Use `packages/core/fireux-docs/src/runtime/concepts/stacks/crud/read/README.md` for overall read canon.
Use this page when the question is specifically about interface shaping.

## What This Seam Is

`useXInterface` is the FireUX read-to-UI seam.

Its job is to take fetched or already-resolved truth and expose a stable UI-facing contract.

That contract currently means:

- `interface`
- `pill`
- `cell`
- `preview`
- `profile`

## Core Rule

All `useXInterface` files should expose the same top-level API.

They do not all need the same internal richness.

That is why `useXInterface` has implementation families.

## Shared Contract

Every canonical `useXInterface` seam should:

- accept already-fetched or already-resolved truth
- normalize that truth for UI use
- expose the same top-level seams
- stay read-only
- avoid becoming a hidden mutation or selection seam

## Canon Families

There are currently three canonical implementation families:

- [Family 1](/docs/concepts/stacks/crud/read/useXInterface/family-1)
  single-shape mapper
- [Family 2](/docs/concepts/stacks/crud/read/useXInterface/family-2)
  joined mapper
- [Family 3](/docs/concepts/stacks/crud/read/useXInterface/family-3)
  rich projection mapper

These families describe implementation shape, not business importance.

## What Does Not Belong Here

This seam should not absorb:

- fetching
- collection querying
- mutation logic
- selection state
- routing authority
- richer dedicated profile view-model shaping when that work only exists for
  `Profile.vue`

Those belong in other seams.

If a profile surface needs more than the thin shared interface contract should
carry, prefer a second-layer seam such as `useXProfileView` instead of making
`useXInterface` richer again.

## Short Version

`useXInterface` is the shared FireUX read-to-UI seam.

The API stays the same everywhere.
The implementation may vary by family.
