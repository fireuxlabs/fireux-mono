# Composables spine map
Updated: 2026-07-21
Ref: 796952bf0
Role: map, not canon

## Purpose
Map where reusable runtime logic belongs.

## Vertical links
- Parent: nuxt4.md
- Child: firestore-entity.md
- Child: console.md
- Child: server-api.md
- Child: create.md

## Horizontal links
- pages.md
- components.md
- runtime-package.md

## Core principle
Composables should name a real seam. Do not create a composable just to hide a messy file.

## Common buckets
- `composables/fireux/firestore/<entity>` for stored entity stacks.
- `composables/fireux/console/<entity>` for console workspaces.
- `composables/fireux/<entity>` for normal entity runtime helpers used by
  root routes, tenant routes, and app surfaces when they are not specifically
  Firestore or console seams.
- `composables/fireux/app/*` for app-level shared runtime concerns.

## Naming note
- Avoid adding new `composables/fireux/public/<entity>` buckets by default.
  Root/public-facing routes are usually the normal entity doorway; use explicit
  `console` or `firestore` buckets only when the seam really is scoped to that
  system. The former Menu public bucket has already collapsed into
  `composables/fireux/menu` and `composables/fireux/kitchen/menu`; do not
  recreate it.

## Naming notes
- `useOnboarding`: domain-free staged-flow mechanics only. It must not own an
  entity draft, provider call, persistence, copy, or completion route.
- `useXOnboarding`: named domain adapter over `useOnboarding`; owns its draft,
  hydration, validation, and completion result. It calls `useXCreate` for
  preview and completion transport instead of owning a second mutation client.
- `useXCreate`: create an entity/record through a client runtime seam when the
  work is mostly Firestore data. See create.md before using it for upload or
  provider transactions.
- `useXFetch`: fetch one entity or route-selected entity.
- `useXCollection`: fetch a list/collection and expose normalized items,
  `count`, `pending`, `error`, and `outcome`. Keep raw read state separate from
  UI search/filter emptiness.
- `useXInterface`: map entity data into UI-ready surfaces.
- `useXConsole`: selected console runtime for a domain.
- `useXConsoleIndex`: index page adapter over shared `useConsoleIndex`.

## Reactive ownership
- A composable that exposes a live collection or document read constructs that
  binding once during setup and passes reactive source inputs into it.
- Static fetch factories are setup-time conveniences only. Do not invoke them
  from `computed`, templates, or render-time helpers; that creates subscriptions
  without a stable owner.
- A reconciliation watcher may own a dynamic keyed cache only when it reuses
  surviving bindings, stops removed bindings, disposes the complete cache with
  its scope, and keeps derived/computed mapping constructor-free.

## Avoid
- `facade`
- `stack`
- `manager`
- `processor`
- `handler`
- `resolver`
- `runtime-*`

## Delta register

| Difference | State | Reason or alignment trigger |
| --- | --- | --- |
| Core, app, Firestore, console, and domain composables use different buckets | `accepted` | Ownership and required context differ; each seam should have one clear authority |
| Domain `useXOnboarding` adapters contain different drafts and stages | `accepted` | Shared onboarding owns mechanics only; domain decisions must remain named and local |
| Menu uses both `fireux/menu` and `fireux/kitchen/menu` | `accepted` | Root Menu and scoped KitchenMenu are different entities and route contexts |
| Older vague or multi-job composables remain | `drift` | Simplify when touched by naming input, process, and output before extracting another helper |
| A proposed composable only shortens a component without creating reuse or authority | `drift` | Keep the logic with its owner instead of adding a pass-through layer |

## Alignment roadmap

- Now: choose the ownership bucket before naming the composable.
- Next: simplify touched multi-job composables and remove pass-through aliases.
- Later: promote a repeated seam to Core only after at least two domains prove
  identical inputs, outcomes, and lifecycle ownership.
