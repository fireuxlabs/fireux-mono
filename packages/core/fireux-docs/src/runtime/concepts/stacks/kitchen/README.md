# Kitchen Stack

Authority: Operational
Updated: 2026-04-19
Scope: FireUX `Kitchen` stack truth across models, composables, components, pages, server seams, and docs.

This page documents the `Kitchen` stack.
It does not replace the `Kitchen` model doc.

Use `packages/core/fireux-docs/src/runtime/models/kitchen/README.md` for model truth.
Use this page for cross-layer stack truth.

## What This Concept Is

The `Kitchen` stack is the expected runtime shape around `Kitchen` in FireUX.

`Kitchen` is one of the clearest current FireUX stacks because it already crosses:

- public identity
- app-hosted console operation
- console entry and selected-target workspace behavior
- kitchen-owned operational child records
- docs surfaces

## Core Rule

The `Kitchen` model doc answers what `Kitchen` is.

The `Kitchen` stack doc answers which runtime surfaces should exist around it.

Keep those two jobs separate.

## Runtime Surfaces Involved

The current `Kitchen` stack expects these surface types:

- model truth
- generic read adapters
- console selection/runtime adapters
- interface seams
- console pages
- kitchen operational child surfaces
- docs surface

## Shared Contract

For the current `Kitchen` stack, the shared contract is:

- `Kitchen` is a root public entity
- the app overlay hosts kitchen console operation
- overlay `operator_ids` is the authority rule for console access
- `Chef` linkage is relationship only
- `useKitchenCollection()` stays the generic public collection seam
- kitchen console visibility/scope belongs in kitchen console seams rather than redefining the generic collection
- `useKitchenInterface` should converge toward the thin projector canon
- richer kitchen presentation belongs in a second layer, not in the base interface seam

## Current Repo Status

Current repo status for the `Kitchen` stack:

- kitchen contract truth exists in the kitchens extension contract
- kitchen is the clearest current console reference implementation
- the interface seam is still richer than the chosen canon and needs alignment

## What Does Not Belong Here

This stack doc should not become:

- the full `Kitchen` model reference
- the full kitchen menu/recipe child map
- a kitchen UX spec
- a migration log

## Short Version

`Kitchen` is a real FireUX stack.

Its model truth lives in `runtime/models/kitchen/README.md`.
Its cross-layer runtime contract lives here.
