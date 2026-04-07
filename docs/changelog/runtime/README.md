# Runtime Changelog
Authority: Tier2 (Operational history)
Updated: 2026-04-05

Tracks meaningful changes in the runtime branch system, especially when behavior shifts across pages, components, composables, models, and server seams.

Use this together with:
- `packages/core/fireux-docs/src/runtime/README.md`
- sibling runtime branch READMEs under `packages/core/fireux-docs/src/runtime/*/README.md`

## 2026-04-05 - Console layout now runs through one generic runtime seam

Previous:
- the console layout depended on a looser sidebar-pill contract
- family pages and child mode components still had to push header state in multiple places
- docs still described `Project` main console pages as core-owned

Now:
- the console layout consumes `useConsoleState()` as its generic shell contract
- the sidebar header uses one simple data shape:
  - `imageUrl`
  - `title`
  - `subtitle`
- each `useRuntimeXConsole()` family adapter projects its own selected entity into that shared contract
- `Project` main console pages are documented as app-owned, while the shared layout/runtime seam stays in core

Why:
- keep the layout generic and small
- stop rebuilding console-shell behavior in every family page
- make ownership read the same way the live repo is actually structured

Affected:
- runtime layout docs
- runtime composables docs
- runtime pages and console-entry docs
- family console adapters and shared console layout code

## 2026-03-28 - Console entry visibility and ownership became explicit

Previous:
- `/console` visibility could drift from real app intent because it was influenced by shared route presence
- main console page ownership for `Project` and `Portfolio` was split across app, ecosystem, and domain layers

Now:
- apps declare visible console families through `consoleFamilies`
- the shared `/console` hub uses app config instead of route discovery as the visibility contract
- `Project` main console pages are core-owned
- `Portfolio` main console pages are extension-owned with Granite acting as delivery shell

Why:
- keep app-level console exposure intentional
- stop cross-app console leakage when shared routes exist
- make main console page ownership match the entity ownership model

Affected:
- app runtime config
- shared console-entry composables
- runtime pages docs
- project and portfolio console page ownership

## 2026-03-28 - Collection-manager dev JSON became a shared runtime inspection seam

Previous:
- collection-manager dev JSON showed the raw loaded docs, but hidden Firestore subcollections stayed invisible
- drift inspection could miss real stored child data unless a page had a custom inspector

Now:
- collection managers use a shared dev snapshot helper
- the shared Firestore read layer attaches dev collection-path metadata to fetched docs
- a dev-only runtime server endpoint resolves direct subcollections for collection-manager inspection

Why:
- make drift discovery repo-wide instead of entity-by-entity
- keep collection-manager dev JSON useful during migrations and schema cleanup
- avoid hiding operational child data just because it is not in the UI card shape

Affected:
- collection-manager components
- shared Firestore read composables
- runtime dev server API

## 2026-03-12 - Runtime Firestore DB selection became explicit

Previous:
- runtime database selection was less explicit in shared flows.

Now:
- runtime uses a clearer named-DB selection model and console discovery pipeline.

Why:
- support multi-app and multi-ecosystem scaling without hidden assumptions

Affected:
- firestore operations
- runtime project and server utilities
- console discovery behavior

## 2026-03-11 - Console routing simplified after Stitch removal

Previous:
- console routing still carried extra branch complexity from Stitch-era surfaces.

Now:
- console routing is simpler and better aligned with the active runtime families.

Why:
- reduce dead-path complexity
- keep current runtime behavior easier to explain and maintain

Affected:
- runtime routing composables
- console layouts
- runtime docs that describe console entry and page ownership

## 2026-03-10 - Runtime project entry became a clearer cross-surface concept

Previous:
- project runtime entry was split across CTAs, route assumptions, and console-specific flow logic.

Now:
- runtime project entry is treated as a clearer shared concept across CTA, create, and console flows.

Why:
- make runtime entry behavior easier to align across pages and composables
- reduce route-first reasoning where behavior is actually cross-cutting

Affected:
- runtime project composables
- CTA families
- console overview flow
