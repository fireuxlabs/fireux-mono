# Composables Directory

Authority: Operational
Updated: 2026-05-08
Scope: `packages/*/fireux-*/src/runtime/composables` only.

This page documents FireUX rules for `runtime/composables/`.
It does not explain general Nuxt composable behavior.

For Nuxt mechanics, use Nuxt documentation.
This page is only for FireUX composable structure and canon seams.

## FireUX Rule

`runtime/composables/` is where FireUX runtime state, reads, writes, adapters, and helpers live.

The main FireUX concern is not “what a composable is.”
It is “which seam belongs where.”

## FireUX Top-Level Split

Core FireUX composable structure is:

```text
runtime/composables/
  dev/
  shared/
  fireux/
```

Read that split like this:

- `dev/`
  developer-only helpers and inspection tools
- `shared/`
  truly generic helpers
- `fireux/`
  actual FireUX product/runtime seams

Loose top-level composable files should not live beside `dev/`, `shared/`,
and `fireux/`.

## Runtime Composables Placement

Current placement canon:

```text
src/runtime/composables/
  dev/
  fireux/
  shared/
```

Meaning:

- `dev/` is for dev tooling, debug, inspection, drift, mock, and test helpers.
- `fireux/` is for FireUX product, runtime, data, entity, and console composables.
- `shared/` is for neutral reusable composables usable by both `dev/` and `fireux/`.

Current audit verdict:

- `dev/` is clean enough to leave alone.
- `shared/` is mostly clean.
- There is no blocker before moving into `composables/fireux/` canonisation.

Known follow-ups:

- `shared/useCollectionRouteContext.ts` is FireUX-aware-ish because it understands `/console` route semantics. Later, consider moving it under a FireUX app, console, or navigation helper path after checking imports.
- `shared/useInterfaceUtils.ts` can stay for now. Later, review whether profile/entity formatting should split from neutral string and array helpers.

Roadmap:

1. Leave `dev/` and `shared/` alone for now.
2. Start repo-wide audit inside `composables/fireux/`.
3. Canonise normal Firestore entity composables as the usual root entity stack:

```text
composables/fireux/firestore/<entity>/fetch/
composables/fireux/firestore/<entity>/mutations/
composables/fireux/firestore/<entity>/utils/
```

4. Put console-backed entity operation data in a separate console stack:

```text
composables/fireux/console/<entity>/
```

5. Keep app/runtime composables as adapters:

```text
composables/fireux/app/<context>-runtime/
composables/fireux/app/<context>-console/
```

6. Only after `fireux/` is stable, revisit the small `shared/` follow-ups.

## FireUX Canon Seams

Important FireUX seams include:

- `useXFetch`
  read one entity or one read seam
- `useXCollection`
  read collections
- `useXInterface`
  adapt read truth into UI surfaces
- `useXSelection`
  remember selected console target
- `useActiveX`
  resolve active target/runtime path
- `useXConsole`
  adapt active target into console-facing state

The important FireUX rule is:

- stored truth belongs in models
- read and write behavior belongs in composables
- UI shaping belongs in interface seams
- UI rendering belongs in components

## FireUX Override

FireUX adds structure on top of ordinary composable usage:

- console state gets explicit seams rather than ad hoc page logic
- Firestore reads and writes stay explicit under `fireux/firestore/`
- usual Firestore entity stacks stay boring: `fetch/`, `mutations/`, `utils/`
- console operation records live under `fireux/console/<entity>/`, not as child buckets under `fireux/firestore/<entity>/`
- FireUX app/runtime helpers stay explicit under `fireux/app/`
- generic helpers should not quietly absorb FireUX-specific behavior

## What This README Should Answer

Use this branch README when the question is:

- should this logic live in a composable at all
- is this helper generic, FireUX-specific, or developer-only
- which FireUX seam owns this read, write, selection, or console behavior

If the question is only about `ref`, `computed`, or normal composable syntax, that belongs to Nuxt or Vue docs instead.

## Short Version

`runtime/composables/` is where FireUX runtime logic lives.

The FireUX job here is seam ownership, not general composable education.
