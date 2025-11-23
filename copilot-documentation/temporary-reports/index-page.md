---
title: Index Page Inventory
status: draft
created: 2025-10-16
---

# Index Page Inventory

This report captures every `index.vue` currently tracked in the monorepo. Paths are relative to the repo root. Groupings reflect how the FireUX team wants to manage entry points going forward.

## TODO

- [ ] Update `packages/core/fireux-core/src/runtime/components/organisms/Profile/Root.vue` to consume the shared pill/cell helpers (`use*Interface`) before refitting profile index pages.

## Group 1 — App Entry Indexes

Stay put: these are the live Nuxt app home pages under `projects/**/app/pages/index.vue`.

- projects/fireux/fireux-app/app/pages/index.vue
- projects/misebox/misebox-app/app/pages/index.vue
- projects/misebox/niederhorn/app/pages/index.vue
- projects/cleanbox/cleanbox-app/app/pages/index.vue
- projects/cleanbox/richies-reinigung/app/pages/index.vue
- projects/fireux/tennant/app/pages/index.vue

> Next step (optional): align hero/summary layout across apps.

## Group 2 — App-Specific Working Pages

Keep these specialised entry points for designers and developers.

- projects/fireux/fireux-app/app/pages/design/index.vue
- projects/fireux/fireux-app/app/pages/developer/index.vue

## Group 3 — Runtime Dev Pages

Each tenant runtime keeps one `/dev` page for sandboxing. Retain one per tenant.

- packages/core/fireux-core/src/runtime/pages/dev/index.vue
- packages/ecosystem/fireux-misebox/src/runtime/pages/dev/index.vue

> Optional: rename to `_dev` later to hide from production navigation.

## Group 4 — Runtime Object Indexes

Data-driven list pages that should follow the shared Index Page pattern (consistent container classes, `mode="cell"`, etc.).

**Core package**

- packages/core/fireux-core/src/runtime/pages/apps/index.vue
- packages/core/fireux-core/src/runtime/pages/blog/index.vue
- packages/core/fireux-core/src/runtime/pages/dashboard/index.vue
- packages/core/fireux-core/src/runtime/pages/dashboard/settings/index.vue
- packages/core/fireux-core/src/runtime/pages/products/index.vue
- packages/core/fireux-core/src/runtime/pages/users/index.vue

**Tenant misebox runtime**

- packages/ecosystem/fireux-misebox/src/runtime/pages/chefs/index.vue
- packages/ecosystem/fireux-misebox/src/runtime/pages/ingredients/index.vue
- packages/ecosystem/fireux-misebox/src/runtime/pages/kitchens/index.vue
- packages/ecosystem/fireux-misebox/src/runtime/pages/misebox-apps/index.vue
- packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/index.vue
- packages/ecosystem/fireux-misebox/src/runtime/pages/suppliers/index.vue

**Extensions**

- packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue
- packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue
- packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue
- packages/extensions/fireux-places/src/runtime/pages/places/index.vue

## Dist Folder Copies (Ignore)

Compiled artefacts under `**/dist/runtime/pages/**` are excluded from this inventory. Treat them as build output only (never edit). Add or confirm ignore rules if needed.

## Summary Table

| Group       | Type                   | Keep/Delete            | Purpose                                        |
| ----------- | ---------------------- | ---------------------- | ---------------------------------------------- |
| 1           | Project App Index      | ✅ Keep                | Real Nuxt app homepages                        |
| 2           | App Working Pages      | ✅ Keep                | Specialised work/dev pages                     |
| 3           | Tenant Dev Pages       | ✅ Keep (1 per tenant) | Runtime sandbox/testing                        |
| 4           | Runtime Object Indexes | ✅ Keep                | Data-driven lists following the shared pattern |
| Dist Copies | Build Output           | 🚫 Ignore              | Compiled artefacts, never edited               |

Future iterations can enrich this report with layout metadata, nav keys, or ownership once consolidation tasks begin.
