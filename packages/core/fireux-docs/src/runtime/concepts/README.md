# Concepts Directory

Authority: Operational
Updated: 2026-03-22
Scope: `packages/core/fireux-docs/src/runtime/concepts/*`.

Learn how cross-cutting runtime concepts are documented when they span pages, components, composables, and models.

## Concepts Directory

`runtime/concepts/` is for runtime behaviour that has outgrown any single technical surface.

Use this directory when a concept spans:
- `pages/`
- `components/`
- `composables/`
- sometimes `models/`

This is not a replacement for the technical directories.
It is a cross-cutting behaviour layer.

## Current Concepts

- `create/`

`create/` is the first real runtime concept because creation now spans:
- route ownership
- create-system orchestration
- behavioural contracts in composables

## What Belongs Here

- cross-cutting runtime behaviour canon
- system rules that apply across multiple runtime layers
- contracts and terminology that should not live only in pages or components

## What Does Not Belong Here

- package-local implementation notes
- per-page route notes
- per-component styling or local UI guidance
- model family canon that already belongs in `runtime/models/`

## Roadmap To Reconciliation

1. Add concept docs only when the behaviour is truly cross-cutting.
2. Keep the technical directories as the primary view of the repo.
3. Use concepts to explain how those technical layers cooperate for one operation.
4. Start with `create/` and add `read/`, `update/`, or `delete/` only when they become real enough to need their own canon.

## Short Version

`runtime/concepts/` is where cross-cutting runtime behaviour gets a home.

Right now, `create/` is the first real concept in that layer.
