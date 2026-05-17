# Project Stack

Authority: Operational
Updated: 2026-04-18
Scope: FireUX `Project` stack truth across models, composables, components, pages, server seams, and docs.

This page documents the `Project` stack.
It does not replace the `Project` model doc.

Use `packages/core/fireux-docs/src/runtime/models/project/README.md` for model truth.
Use this page for cross-layer stack truth.

## What This Concept Is

The `Project` stack is the expected runtime shape around `Project` in FireUX.

`Project` is the first stack because it already crosses:

- infrastructure identity
- linked system objects
- console entry and workspace behavior
- docs surfaces
- draft checking

## Why FireUX Needs It

`Project` is not only a model.

It is also a coordination point for:

- `App`
- `Ecosystem`
- project-facing console surfaces
- project docs and checks

That means `Project` needs a stack doc in addition to a model doc.

## Core Rule

The `Project` model doc answers what `Project` is.

The `Project` stack doc answers which runtime surfaces should exist around it.

Keep those two jobs separate.

## Canon Terms

### Project Model

Stored truth for `Project`.

### Project Stack

The expected runtime surface family around `Project`.

### Linked System Objects

The first linked system objects for the current `Project` stack are:

- `App`
- `Ecosystem`

### Friendly Docs Route

A route such as `/docs/project` that is user-facing but still has to read from canon stored in the correct docs spine branch.

## Runtime Surfaces Involved

The early `Project` stack currently expects these surface types:

- model truth
- linked system object truth
- generic read adapters
- console selection/runtime adapters
- console selection and active-target handling
- console pages
- docs surface
- draft check surface

This is early stack canon.
It is intentionally describing surface categories before freezing a full file matrix.

## Shared Contract

For the current `Project` stack, the shared contract is:

- `Project` has model truth
- `App` and `Ecosystem` link to `Project`
- root `projects/<projectId>` owns project identity and console access
- `operator_ids` and `owner_user_id` belong on the root project, not the app overlay
- `useProjectCollection()` stays generic
- console project selection/scope lives in the console seam rather than redefining the generic collection
- project-facing runtime surfaces should keep infrastructure truth explicit
- docs may expose friendly project routes, but source docs must stay in the correct spine branch
- draft checks may exist to confirm repo truth still matches the declared stack

## Current Repo Status

Current repo status for the `Project` stack:

- the model doc exists
- the friendly docs route exists
- the first draft checker exists
- stack truth is still early and intentionally lightweight

This is enough to make `Project` the first stack pattern without pretending the full repo contract is already frozen.

## What Does Not Belong Here

This stack doc should not become:

- the full `Project` model reference
- a list of every current implementation file
- a giant console spec
- a migration plan

Those belong elsewhere.

## Short Version

`Project` is the first FireUX stack.

Its model truth lives in `runtime/models/project/README.md`.
Its cross-layer runtime contract lives here.
