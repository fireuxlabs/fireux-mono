# Composables Directory

Authority: Operational
Updated: 2026-04-17
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
