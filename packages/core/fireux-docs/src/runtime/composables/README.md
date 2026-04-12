# Composables Directory

Authority: Operational
Updated: 2026-04-11
Scope: `packages/*/fireux-*/src/runtime/composables` only.

Learn how `runtime/composables/` is used across FireUX module packages.

## Purpose

`runtime/composables/` contains composables shipped by the package at runtime.

Use this tree for:

- delivered runtime logic
- app-facing hooks used by pages and components
- Firestore reads, writes, and view adapters
- console state and entity state

Do not use this tree for:

- static config that belongs in `config/`
- build tooling
- one-off scripts

## Core Structure

Core canon now uses this top-level split:

```text
runtime/composables/
  dev/
  shared/
  fireux/
    app/
    console/
    firebase/
    firestore/
```

## Top-Level Meaning

### `dev/`

Developer-only helpers.

Use for:

- drift inspection
- raw collection inspection
- developer support utilities

Do not treat `dev/` composables as product/entity canon.

### `shared/`

Truly generic helpers that are not FireUX-domain specific.

Use for:

- generic collection helpers
- generic card/search/view toggles
- composables that could be reused outside a specific FireUX domain

If a helper is clearly about FireUX app, console, Firebase, or Firestore behavior, it does not belong here.

### `fireux/`

FireUX-specific runtime composables.

This is the main product tree.

## `fireux/` Structure

```text
fireux/
  app/
    forms/
    routing/
    ui/
    utils/
  console/
  firebase/
  firestore/
    core/
    operations/
    seo/
    system/
    utils/
```

### `fireux/app/`

Current-app concerns.

Use for:

- app config access
- app routing helpers
- app UI helpers
- app forms
- app utility helpers

Examples:

- `FireUXConfig`
- console route helpers
- auth redirect helpers
- console notification helpers

Page/head SEO belongs with app concerns, not in a separate top-level SEO tree.

### `fireux/console/`

Shared console state.

Use for:

- console selection state
- console mode normalization
- console layout/header/nav state
- shared console types
- demo scenario registry helpers

This is the shared console seam, not entity data loading.

Core examples:

- `useConsoleState.ts`
- `useConsoleSelection.ts`
- `console.normalize.ts`
- `console.types.ts`

### `fireux/firebase/`

Firebase SDK-facing helpers.

Use for:

- auth
- storage
- user requirement guards
- low-level Firebase service access

### `fireux/firestore/`

Firestore reads, writes, entity seams, and view adapters.

Use for:

- collection/document fetch composables
- mutation composables
- Firestore operation helpers
- Firestore utility helpers
- Firestore-backed SEO indexing

Subtree meaning:

- `core/` = core entities such as app, user, profile
- `system/` = system entities such as project, ecosystem, console
- `operations/` = generic Firestore CRUD helpers
- `utils/` = shared Firestore helpers
- `seo/` = Firestore SEO indexing helpers

For ecosystem apps with a registry split:

- system composables may read or write `(default)` for `project` and `ecosystem`
- app composables and operational entity composables should target the named operational database
- keep registry concerns and operational concerns explicit instead of hiding the database choice inside UI code

## Console And Entity Seam Pattern

For console-driven entities, prefer this three-part pattern:

1. selection
2. active entity
3. console adapter

Current naming canon:

- `useProjectSelection`
- `useActiveProject`
- `useProjectConsole`

- `usePortfolioSelection`
- `useActivePortfolio`
- `usePortfolioConsole`

- `useKitchenSelection`
- `useActiveKitchen`
- `useKitchenConsole`

- `useSupplierSelection`
- `useActiveSupplier`
- `useSupplierConsole`

Meaning:

- `useXSelection`
  - remembers which entity is selected
- `useActiveX`
  - resolves the active entity and its runtime data path
- `useXConsole`
  - adapts the active entity into console-facing UI state

The shared console layout should consume only the generic console contract from `fireux/console/`.
It should not know project, portfolio, kitchen, or supplier internals.

## What Belongs Close To The Entity

Keep entity-local helpers close to the entity family when they are not generic enough for core console reuse.

Examples:

- `useRuntimePortfolioPath`
- `useRuntimeKitchenDocument`
- `useRuntimeKitchenData`

These are local entity/runtime helpers, not shared console helpers.

## Current Repo Direction

Aligned:

- core now uses `fireux/console/` instead of nested `fireux/runtime/`
- Firestore SEO indexing lives under `fireux/firestore/seo/`
- project, portfolio, kitchen, and supplier console wrappers now follow the same public naming shape

Still allowed:

- entity-local helper names may still contain `Runtime` where they describe active entity/runtime behavior rather than shared console behavior

## Short Version

Use:

- `dev/` for developer helpers
- `shared/` for truly generic helpers
- `fireux/app/` for current-app helpers
- `fireux/console/` for shared console state
- `fireux/firebase/` for Firebase SDK helpers
- `fireux/firestore/` for Firestore reads, writes, and entity adapters
