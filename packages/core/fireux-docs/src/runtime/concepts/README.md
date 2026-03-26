# Concepts Directory

Authority: Operational
Updated: 2026-03-25
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

- `console-entry/`
- `create/`
- `connect/`
- `read/`
- `update/`

`console-entry/` is now a real runtime concept because console-backed family entry spans:
- app-level hub routing
- family-specific chooser pages
- public versus console shells
- mode selection
- public create versus console create

`create/` is a real runtime concept because creation spans:
- route ownership
- create-system orchestration
- behavioural contracts in composables

`read/` is now also a real runtime concept because reading spans:
- route ownership
- fetch versus collection versus resolved view seams
- truth-layer distinction between public entity, overlay, scoped child, identity, and system reads
- hydrated convenience data versus stored truth

`update/` is now also a real runtime concept because editing spans:
- route ownership
- edit-family boundaries
- stored-truth decisions in composables
- public entity versus overlay versus scoped write targets

`connect/` is now also a real runtime concept because relationship and authority spans:
- public entity versus console overlay versus relationship link
- profile and membership surfaces
- permission meaning across pages, components, composables, and models

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
4. Start with the concepts that are real enough to need their own canon, and add new ones only when they become equally cross-cutting.

## Short Version

`runtime/concepts/` is where cross-cutting runtime behaviour gets a home.

Right now, `console-entry/`, `create/`, `connect/`, `read/`, and `update/` are the real concepts in that layer.
