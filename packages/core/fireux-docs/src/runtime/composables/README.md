# Composables Directory

Authority: Operational
Updated: 2026-04-05
Scope: `packages/*/fireux-*/src/runtime/composables` only.

Learn how `runtime/composables/` is used across FireUX module packages.

## Composables Directory

`composables/` contains runtime composables shipped by the package.

## What Belongs Here

- runtime feature composables
- package-owned logic used by pages, components, and runtime flows
- composables that belong to delivery rather than setup support

## Aligned In Repo

- `runtime/composables/` is one of the strongest shared runtime patterns in the repo
- extensions and ecosystems already use it for delivered logic, hooks, and runtime behavior

## Not Aligned Yet

- grouping still varies by package
- runtime-local types and helpers still need to stay close to the features that own them

## Current Shared Dev Helper

One new repo-wide composable seam is now real:

- `runtime/composables/dev/useDevCollectionJson.ts`

Purpose:

- preserve raw collection-manager dev JSON
- augment each item with direct Firestore subcollections in dev
- give drift inspection one shared behavior across entities

This helper is not an entity read contract.
It is a developer inspection helper.

That means:

- it should stay out of entity interface canon
- it should stay shared only because the behavior is truly repo-wide
- it depends on collection docs carrying collection-path metadata from the shared Firestore read layer

Use:
- `packages/core/fireux-docs/src/runtime/components/README.md`
- `packages/core/fireux-docs/src/runtime/server/README.md`

to understand the full collection-manager dev inspection path.

## Current Shared Console Runtime Seam

One generic console runtime seam is now real:

- `packages/core/fireux-core/src/runtime/composables/fireux/runtime/useRuntimeConsole.ts`

Purpose:

- give the console layout one small shared contract
- keep sidebar/header/nav state generic
- let each `useRuntimeXConsole()` adapt its own domain state into that contract

Shared shape:

- active family
- selected id
- mode
- mode options
- clear selection
- simple header data:
  - `imageUrl`
  - `title`
  - `subtitle`

That means:

- the layout should not know project, kitchen, portfolio, or supplier internals
- family adapters should keep domain loading and title/subtitle shaping local
- root and overview pages should usually opt into header publishing once through their family adapter, not from child mode components

## Roadmap To Reconciliation

1. Keep composables delivery-first.
2. Keep setup support in `config/`, not here.
3. Keep feature-local details close to their composables when that is clearer.

## Short Version

Delivered runtime composables belong here.
