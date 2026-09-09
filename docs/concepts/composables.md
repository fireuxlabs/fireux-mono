# Composables spine map

Updated: 2026-08-23
Ref: e23268507
Role: map, not canon

## Purpose

Map where reusable runtime logic belongs.

## Vertical links

- Parent: nuxt4.md
- Child: firestore-entity.md
- Child: workspace.md
- Child: server-api.md
- Child: create.md
- Child: lasagne.md

## Horizontal links

- pages.md
- components.md
- runtime-package.md
- runtime-filesystem.md

## Core principle

Composables should name a real seam. Do not create a composable just to hide a messy file.

An entity family is a set of named capabilities, not one all-purpose `useX()`
object. Common names make sibling families predictable; they do not require an
entity to implement capabilities it does not have.

## Common buckets

- `runtime/composables` is the cross-entity shared composable spine.
- `runtime/<entity>/composables/firestore` owns that entity's stored adapters.
- `runtime/<entity>/composables/workspace` owns that entity's Workspace workspace
  adapters.
- `runtime/<entity>/composables` owns its normal runtime capabilities used by
  detail, directory, tenant, App, or other named surfaces.
- Shared app-shell concerns remain in the root spine. App entity capabilities
  move under the App entity only when their owner is the canonical App rather
  than the Nuxt application shell.

Declared Entity adapters now use these scoped roles. Completed
`composables/fireux/firestore/<entity>`,
`composables/fireux/workspace/<entity>`, and `composables/fireux/<entity>`
placements are guarded against returning. Root profile/record adapters remain
package-shared only while their underlying concept is `to-confirm`; confirmed
records and operations use their parent Entity's composable scope.

## Naming note

- Avoid adding a `public` bucket beneath an entity's composables by default.
  Root visitor-facing routes are usually the normal entity doorway; use
  explicit `workspace` or `firestore` buckets only when the seam really is scoped
  to that system. Menu now uses `runtime/menu/composables`, with Kitchen-owned
  Menu operations under `runtime/kitchen/composables`; do not recreate a
  generic `public` composable bucket.

## Naming notes

- `useOnboarding`: domain-free staged-flow mechanics only. It must not own an
  entity draft, provider call, persistence, copy, or completion route.
- `useXOnboarding`: named domain adapter over `useOnboarding`; owns its draft,
  provider/domain enrichment, validation, and completion result. It calls `useXCreate` for
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
- `useXUpdate(options?)` configures stable runtime dependencies. Its ordinary
  entity command accepts one typed `input` object containing explicitly named
  identity fields and `changes`; root entities use `{ xId, changes }`, while
  an unbound child uses `{ parentId, xId, changes }`. A child whose parent is
  already fixed by the composable runtime omits that parent from the command.
  Transport, authorization, reactive binding, and response shape may differ
  without changing this grammar.
- Do not disguise a transition or specialist capability as an ordinary entity
  update. Status transitions, media replacement, membership changes, and
  relationship commands keep outcome-specific names and typed inputs. A bound
  record such as User or App may receive its stable entity ref at setup and
  accept only `{ changes }` or a narrower capability input.
- `useX`: reserve the unqualified name for a genuine active read/view runtime
  aggregate. Keep commands explicitly imported; do not combine detail,
  collection, mutations, computed state, interface, and SEO solely to create a
  nominal entity entrypoint.
- `useYX`: name Y's real adaptation of X. It consumes the narrowest supported X
  capability, keeps X ignorant of Y, and must add a Y-owned decision,
  projection, policy, or lifecycle relationship rather than act as an alias.
- `useXWorkspace`: capability runtime for an established current domain Entity;
  do not use it to turn the Workspace Index into a collection manager.
- `useWorkspace`: persists only the current Entity id for a named Workspace
  and exposes set/clear actions. It does not load a
  collection, infer authority, or expose source modes.
- `useXWorkspaceIndex`: uses `useWorkspace` to resolve the current domain
  Entity and exposes its named Entity collection, outcome, selection actions,
  and Index debug directly. Core does not repackage those values as generic
  targets, sections, counts, or runtime state.

## Kitchen composables organization

Kitchen uses one folder per meaningful responsibility. Root Kitchen stored
adapters live directly in `kitchen/composables/firestore`; their function names
identify reads and commands without additional `fetch`, `mutations`, or
`utils/paths` folders. Kitchen-owned Dish, Recipe and Prep Item composables live
together under `dish`, `recipe` and `prep-item`, including their stored adapters.
This narrows the older storage-first placement rule for these parent-owned
responsibilities; it changes no storage paths or authority.

Workspace-only controllers live under `composables/workspace/<capability>` with
lowercase capability folders. Workspace selection and shared page mechanics sit
directly under `workspace`; there is no extra `core` folder. Injected Dishes,
Ingredients, Menus, Orders and Recipes page state uses explicit `Context` names;
these providers own scope and are not aliases for their data controllers.

Ordering funnel controllers live directly under `order/funnel`, including the
Collection, Delivery and PreOrder variants. Their model and pure input helpers
live in Kitchen `models/order-funnel.model.ts` and `utils/order-input.ts`.
Kitchen menu row types live in `models/kitchen-menu-rows.model.ts`.
No forwarding files retain the previous paths. Other entities keep their current
placement until their own complete consumer cutover; Kitchen's capability list
is not a required template for them.

## Kitchen presentation placement

Kitchen presentation is independent of its Firestore adapters. The single
`kitchen/composables/useKitchenInterface.ts` implementation and adjacent
`useKitchenComputed.ts` serve domain consumers directly. Presentation types live
in `kitchen/models/kitchen-interface.model.ts`; pure projection helpers live in
`kitchen/utils/kitchen-interface-projection.ts`. There is no forwarding entrypoint
or nested Firestore view directory. Project's direct `useProjectInterface.ts`
is the placement comparison; its fields remain Project-owned. Other domains'
older view directories require their own consumer audit before movement.

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

| Difference                                                                          | State       | Reason or alignment trigger                                                                                                           |
| ----------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Core, app, Firestore, workspace, and domain composables use different buckets       | `accepted`  | Ownership and required context differ; each seam should have one clear authority                                                      |
| Domain `useXOnboarding` adapters contain different drafts and stages                | `accepted`  | Shared onboarding owns mechanics only; domain decisions must remain named and local                                                   |
| Menu uses both `fireux/menu` and `fireux/kitchen/menu`                              | `accepted`  | Root Menu and scoped KitchenMenu are different entities and route contexts                                                            |
| Older vague or multi-job composables remain                                         | `drift`     | Simplify when touched by naming input, process, and output before extracting another helper                                           |
| Bound-record and specialist update composables use narrower inputs                  | `accepted`  | Their entity identity or workflow is fixed at setup; align ordinary entity commands without erasing genuine capability boundaries     |
| Detail readers repeat a small outcome state machine                                 | `accepted`  | Keep entity ownership explicit; align the return vocabulary without introducing a cross-entity engine                                 |
| Older `useXInterface`, computed, and permission helpers remain under Firestore      | `migration` | Move them to `runtime/<entity>/composables` only when the entity and all consumers move together; User and App are proving siblings   |
| Entity composables remain beneath root spine buckets                                | `migration` | Move them to `runtime/<entity>/composables` one bounded capability at a time; preserve exports and do not leave compatibility aliases |
| A proposed composable only shortens a component without creating reuse or authority | `drift`     | Keep the logic with its owner instead of adding a pass-through layer                                                                  |

## Alignment roadmap

- Now: choose the ownership bucket before naming the composable.
- Next: simplify touched multi-job composables and remove pass-through aliases.
- Later: promote a repeated seam to Core only after at least two domains prove
  identical inputs, outcomes, and lifecycle ownership.

## Publication execution lifecycle

Core `runtime/composables/fireux/publishing/usePublish.ts` owns pending state,
error state, and duplicate-submit prevention. It receives an asynchronous
domain command; it does not choose a collection, publication fields, or
authority. Product and Blog retain their existing domain writes, while Job
retains its author API. Their domain composables consume the shared lifecycle.
This shared execution contract does not establish preview parity or a universal
publication model. See `packages/core/fireux-core/src/test/publishing.test.mjs`
for the three transport-preservation checks.
