# Composables spine map

Updated: 2026-08-09
Ref: 5b5de1c1c
Role: map, not canon

## Purpose

Map where reusable runtime logic belongs.

## Vertical links

- Parent: nuxt4.md
- Child: firestore-entity.md
- Child: console.md
- Child: server-api.md
- Child: create.md
- Child: lasagne.md

## Horizontal links

- pages.md
- components.md
- runtime-package.md

## Core principle

Composables should name a real seam. Do not create a composable just to hide a messy file.

An entity family is a set of named capabilities, not one all-purpose `useX()`
object. Common names make sibling families predictable; they do not require an
entity to implement capabilities it does not have.

## Common buckets

- `composables/fireux/firestore/<entity>` for stored entity stacks.
- `composables/fireux/console/<entity>` for console workspaces.
- `composables/fireux/<entity>` for normal entity runtime helpers used by
  root routes, tenant routes, and app surfaces when they are not specifically
  Firestore or console seams.
- `composables/fireux/app/*` owns both the App entity's runtime capabilities
  and explicitly named app-shell concerns; storage remains under Firestore.

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
- `useXDetail`: resolve one routable entity through its bounded endpoint. It
  owns `ready`, `pending`, `error`, `refresh`, `statusCode`, `missing`,
  `failed`, and `outcome`, and returns the object under its entity name.
- `useXFetch`: read canonical or operational entity truth for an authorized
  runtime. It must not silently become the public/detail projection.
- `useXCollection`: fetch a list/collection and expose normalized items,
  `count`, `pending`, `error`, and `outcome`. Keep raw read state separate from
  UI search/filter emptiness.
- `useXInterface`: map entity data into UI-ready surfaces.
- `useXCreate`, `useXUpdate`, and `useXDelete`: invoke one named lifecycle
  command through an allowed mutation lane. Transport does not own domain
  policy.
- `useX`: reserve the unqualified name for a genuine active read/view runtime
  aggregate. Keep commands explicitly imported; do not combine detail,
  collection, mutations, computed state, interface, and SEO solely to create a
  nominal entity entrypoint.
- `useYX`: name Y's real adaptation of X. It consumes the narrowest supported X
  capability, keeps X ignorant of Y, and must add a Y-owned decision,
  projection, policy, or lifecycle relationship rather than act as an alias.
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
- generic cross-entity detail readers
- multi-job `useX()` umbrellas

## Delta register

| Difference                                                                          | State       | Reason or alignment trigger                                                                                                            |
| ----------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Core, app, Firestore, console, and domain composables use different buckets         | `accepted`  | Ownership and required context differ; each seam should have one clear authority                                                       |
| Domain `useXOnboarding` adapters contain different drafts and stages                | `accepted`  | Shared onboarding owns mechanics only; domain decisions must remain named and local                                                    |
| Menu uses both `fireux/menu` and `fireux/kitchen/menu`                              | `accepted`  | Root Menu and scoped KitchenMenu are different entities and route contexts                                                             |
| Older vague or multi-job composables remain                                         | `drift`     | Simplify when touched by naming input, process, and output before extracting another helper                                            |
| Detail readers repeat a small outcome state machine                                 | `accepted`  | Keep entity ownership explicit; align the return vocabulary without introducing a cross-entity engine                                  |
| Older `useXInterface`, computed, and permission helpers remain under Firestore      | `migration` | Move them to `composables/fireux/<entity>` only when the entity and all consumers move together; User and App are the proving siblings |
| A proposed composable only shortens a component without creating reuse or authority | `drift`     | Keep the logic with its owner instead of adding a pass-through layer                                                                   |

## Alignment roadmap

- Now: choose the ownership bucket before naming the composable.
- Next: simplify touched multi-job composables and remove pass-through aliases.
- Later: promote a repeated seam to Core only after at least two domains prove
  identical inputs, outcomes, and lifecycle ownership.
