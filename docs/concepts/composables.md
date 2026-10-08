# Composables spine map

Updated: 2026-10-04
Ref: e5d8cf8d5
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

## Entity file contract

This is a responsibility contract, not a scaffold or a required file count.
An Entity implements only supported, consumed responsibilities. Keep one owner
per responsibility; the same Entity appearing in another App or Workspace does
not justify another adapter.

| Role | Conventional file | Admission condition |
| --- | --- | --- |
| Canonical data | `models/x.model.ts` | A distinct domain shape is consumed |
| Live collection | `composables/useXCollection.ts` | Consumers need a scoped list |
| Direct live record | `composables/useXRead.ts` | Consumers need canonical document binding |
| Routable live record | `composables/useXDetail.ts` | Route resolution, server scope or joins add a real responsibility |
| Lifecycle command | `useXCreate.ts`, `useXUpdate.ts`, `useXDelete.ts` | The operation is supported and the client adapter is consumed |
| Trusted implementation | Entity-owned server readers/commands | Server execution or authority is required |
| Presentation | Entity-owned Collection/Detail components | A real surface consumes them |
| Route | App or registered package `pages` entrypoint | The product exposes that route |

Read and Detail are alternatives when they perform the same job. Keep both only
when their inputs, authority or returned domain information differ. Do not put
one behind another merely to complete the table. Command wrappers likewise
must bind a real domain contract; a lifecycle operation can be composed by an
existing trusted command without a redundant primitive Create file.

Interface projection, assets, permissions, Workspace selection and named
capabilities are additions only when current consumers require them. A delta
must identify its responsibility, owner, real consumer and why an existing
contract cannot satisfy it. Record durable deltas in the relevant family map;
do not create per-Entity manifests or empty extension points.

Before adding or retaining a file, check those four facts against source. If it
only forwards, renames or repeats an existing owner, remove it and move callers
to that owner. Move registration and imports together; leave no forwarding alias.
File count alone proves neither alignment nor complexity.

### Verification boundary

Core owns transport and read-state behavior. Entity tests prove database/path
selection, identity, domain normalization and authority differences. UI checks
prove pending, failure, empty/missing and live changes in the actual surface.
Do not add tests that merely demand every Entity has the same filenames.

Current focused evidence lives in Core `src/test/foundation-read-contract.test.mjs`,
`read-outcome.test.mjs`, `collection-contract.test.mjs`, and the live client/server
read tests. These prove their named scope, not repository-wide conformance.

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
  returns the object under its entity name plus `pending`, `error`, and
  `outcome`. Async route setup may use `ready`; retain `refresh` only where
  needed. Do not require redundant status booleans or HTTP fields. Shared
  `read-outcome.ts` owns state precedence; the Entity supplies identity and
  presence, and hides stale or failed detail data.
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

## App composable responsibilities

App keeps its canonical reader, public detail reader, bounded collection,
session, developer access and reactive presentation directly under
`app/composables`. A native stored reader, a public HTTP detail reader and a
paged directory have different consumers, authority and lifetimes; they are
not duplicate settings or membership responsibilities.

Consumed responsibilities use meaningful groups:

| Group | Responsibility |
| --- | --- |
| `identity` | `useAppIdentityUpdate` edits the configured App's name, copy and social links through the authenticated settings command |
| `featured` | `useAppFeaturedContent` reads and curates featured slugs in `settings/public`; it does not edit App identity |
| `membership` | AppUser reads, subject membership controls, access projections, subscriptions, admin lists, joining policy, join requests and current-App filtering |
| `initialization` | Developer environment diagnostics and the configured App's initialization/media workflow |
| `brand` | Reactive browser checks for required local App artwork |
| `config` | Request-aware runtime configuration normalization through `useFireUXConfig` |
| `pricing` | Reactive presentation of the App's declared pricing profiles and tiers |

Membership functions retain their distinct inputs and lifecycles. Subscriptions
are part of the AppUser relationship, but their command and presentation
responsibility is separate from membership creation and access projection.
Grouping does not require one umbrella controller or a fixed number of files.

Keep nonreactive work outside `composables`:

- `app/models/app-media.ts`, `app-media-requirements.ts` and
  `app-environment-check.ts` own shared contracts and catalogues. Client and
  server use the same environment-check response shape.
- `app/utils/app-media.ts` owns pure validation and image-source resolution.
- `app/utils/initialize-configured-app.ts`, `sync-app-media.ts` and
  `runAppUserCommand.ts` are explicit client command functions. Trusted
  implementations remain under `app/server`.
- Fixed asset paths use Core's immutable `GLOBAL_BRAND_ASSETS` in
  `src/utils/brandAssets.ts`; they need no `useAssets` wrapper. Brand image
  components own actual load-failure fallback. The obsolete placeholder flag
  based on fixed paths is retired; missing local assets retain their real check.

Unused AppUser Create/Update/Delete wrappers, command facade and the old
formatting/validation/default-social helper chain are retired. Keep consumed
behavior, not CRUD symmetry or compatibility exports at retired paths.

App initialization captures one account/App/User intent across initialize,
media sync and refresh. Scope change or disposal stops later stages and obsolete
UI completion; a committed server result remains truthful. Environment
checks are client-only, keyed by App/account, pass cancellation to the request,
and hide pending, failed or unauthorized diagnostics. Capture credentials and
reject obsolete responses, including change-away-and-back.

Core explicitly registers the root and these seven composable directories in
`src/module.ts`. Models and ordinary command functions are not auto-imported.
Verify generated consumer imports alongside App reader, settings, media,
membership and `src/test/app-initialization-scope.test.mjs` lifecycle tests.
This is App's actual responsibility map, not a required capability list for
every Entity.

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

## User composable responsibilities

User uses the same responsibility contract as App, with its own identity and
private-account boundaries. Canonical document, collection, exact-ID hydration,
handle lookup, public detail and reactive presentation remain directly under
`user/composables`. Public detail follows the server's App visibility policy;
a canonical identity reader is not a substitute for that projection.

| Group | Consumed responsibility |
| --- | --- |
| `account` | Owner-only private account reading; anonymous accounts are excluded |
| `connections` | Explicitly imported optional command mechanics; linking authority stays with the hub and participant services |
| `directory` | `useUserDirectory` applies eligibility and current-User presentation to the paged canonical collection |
| `identity` | Explicit User bootstrap and the profile editing workflow, including handle and avatar commands |
| `session` | `useUserSession` composes Auth, canonical User and AppUser; `useUserSessionState` projects their independent outcomes and App access |
| `notifications` | Private live notification feed and the named mark-read command |
| `profile` | Existing bounded User/domain-profile pair detail and directory readers |

`useUserBootstrap` captures one account/App intent before credentials and retains
it through identity provisioning, membership reads, current join policy, the
App-owned `ensure-self` command and event publication. Component scopes also
invalidate that intent on disposal; calls outside a component release their
own temporary watcher. `useAuth` supplies its current-User ref directly to
bootstrap, avoiding recursive Auth construction. Other setup callers reuse the
lower VueFire current-User ref. Ordinary sign-in does not invoke bootstrap.
Core `UserCreateSystem` also captures its account, App and route intent around
setup completion. A committed result remains real, but obsolete completion does
not navigate a different account or overwrite its setup feedback/consent. Its
sign-in fallback retains the validated destination. Core's full profile editor
and FireUX's minimal account presentation share the User-owned avatar editor;
profile field editing and AppUser membership remain separate responsibilities.

Nonreactive functions use explicit imports from `user/utils`: public handle
normalization/validation, immutable consumed field-formatting contracts,
`updateUserHandle`, `provisionUserIdentity`, `provisionSignedInUserAvatar` and
`provisionSignedInUserAccount`. Provisioning input/result contracts live in
`user/models/user-provisioning.ts`; they are not another User Entity. Handle,
avatar and identity provisioning accept the originating owner's current-intent
predicate. This checks client continuation only; trusted server commands retain
their existing self-only authority and committed results remain truthful.

Unused membership admin/removal wrappers and unused email/avatar formatting
contracts are retired. Membership execution belongs to App's `runAppUserCommand`.
The shared `useAuthRedirect` lives with generic Firebase Auth composables and
is imported directly; it does not depend on the User record or its fields.
The base User composable groups are registered explicitly. Optional connection
mechanics are directly imported by their real consumers. Utilities and models
are not auto-import directories, and retired paths have no compatibility files.

The `profile` group's existing four-family vocabulary remains a bounded legacy
contract used by real domain routes. This pass preserves those domain consumers;
it does not establish that a fixed Core profile catalogue is the extension model
for future industries. Optional cross-ecosystem account linking is a separate hub/participant service
with its own UX and private authority store. It does not become another
responsibility of these local readers or AppUser access.
See [identity roadmap](../roadmaps/identity-and-workspaces.md#optional-cross-ecosystem-identity).

## Kitchen presentation placement

`useKitchenRead` returns the canonical Kitchen and optional same-ID Place as
separate records through Core's exact live document reader. It owns their read
state, not a `KitchenSurface`. Access-only callers disable Place hydration; an
explicit empty collection path disables the read. Display consumers compose
these records through the existing `useKitchenInterface().surface` function.
No additional presentation-reader wrapper is required.

Kitchen presentation is independent of its Firestore adapters. The single
`kitchen/composables/useKitchenInterface.ts` implementation and adjacent
`useKitchenComputed.ts` serve domain consumers directly. Presentation types live
in `kitchen/models/kitchen-interface.model.ts`; pure projection helpers live in
`kitchen/utils/kitchen-interface-projection.ts`. There is no forwarding entrypoint
or nested Firestore view directory. Project's direct `useProjectInterface.ts`
is the placement comparison; its fields remain Project-owned. Other domains'
older view directories require their own consumer audit before movement.

## Consumed Entity entrypoints

Supplier, Portfolio and Property expose their consumed readers, creation and
named updates directly from their owning composables. Their unused multi-job
`firestore/useSupplier`, `usePortfolio` and `useProperty` umbrellas are retired;
Supplier Card consumers import the actual interface type owner directly.
Property's unconsumed root/manual browser update adapter is retired. This does
not invent a Property editor or remove its consumed onboarding/manual creation
workflow. A public package wildcard is not evidence that an unused adapter has
an action consumer.

User notification mark-read is a named command adapter at
`user/composables/notifications/useUserNotificationMarkRead.ts`; the live feed
remains owned separately by `useUserNotifications`. Notification read-state
mutation is not a document reader.

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
| Detail readers independently repeat outcome precedence | `drift` | Use Core `read-outcome.ts`; retain entity identity, authority and projection with the entity |
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

## App and Ecosystem collection readers

App and Ecosystem collection readers live directly in their owning
`runtime/<entity>/composables` directory beside their single-record readers.
They consume Core Firestore collection primitives through explicit imports;
`firestore/fetch` does not add a separate owner. Their domain-named return
values and existing collection-path inputs remain distinct.

## Collection reader contract

Entity collection readers live directly under their existing owner's
`composables` role; parent-owned records keep their proved parent owner.
Shared Firestore infrastructure and development tools retain their shared
technical roles. `useMenuOrderPickup` means customer pickup and belongs
to the order lifecycle, not this record-reader contract.

Collection readers expose a record list plus `count`, `pending`, `error`, and
`outcome`. Domain-specific list names and related projections retain their
meaning. Loading comes from the source's pending state, never from guessing
whether records are undefined. Filtered list counts and outcomes describe
the returned list. Reactive Firestore paths are passed to one reader rather
than creating replacement readers inside watchers. Database selection,
permission filtering, pagination and domain normalization stay with their
existing owners. Menu navigation policy is exposed separately as
`directoryOutcome`; collection `outcome` describes loading/data state.

Behavioral checks: `packages/core/fireux-core/src/test/collection-contract.test.mjs`.

The legacy App/Storage/Kitchen development collection readers are retired.
Their Core Dev Overview/Apps/Images pages and Portfolio/Kitchen inspectors
retain inert retirement messages and do not fetch entity collections.
Unused Portfolio Unit/Client, Kitchen Prep Item/Supplier Ingredient and
Translation collection readers are removed; Nuxt discovery alone does not
justify retaining an unconsumed reader.

## Kitchen–Menu reader responsibilities

KitchenMenu is a Kitchen-scoped record implemented by the Menu domain.
`menu/composables/useKitchenMenuCollection.ts` reads one Kitchen's menus;
`useMenuDirectory.ts` reads their public directory projection.
`useMenuSectionCollection.ts` reads one menu's sections and
`useMenuSectionItemCollection.ts` reads one section's items.
`menu/composables/order/useMenuOrderPickup.ts` owns pickup fulfillment,
not record collection reading. Storage ownership does not require repeating
the entire database path as source-code folders. Public Browse, Order and QR
consume `menu/composables/useMenu.ts` directly. Card presentation and service-hour
display use `useMenuCardPresentation` and `useMenuOfferingComputed`; they do not
import the mutation adapters. The unused aggregate reader, direct fetcher and
forwarding detail wrapper are retired.

Kitchen's stateless path builders live in `kitchen/utils/kitchen-collection-path.ts`.
`useKitchenChildCollection.ts` owns only reactive child-collection reading.
An omitted collection-path override uses the canonical Kitchen root; an explicit
empty override disables the read. Callers must preserve that distinction.

## Editable field completion

Core `useEditableStringField` owns generic string-field state. Its local epoch
covers the draft, editing session, source value, disabled state and supplied
context sources. SimpleField, ArrayOfStrings, ListActions and ImagePicker use
the shared `useCommandScope` mechanism for account/App/membership and disposal.
Domains may pass their existing intent capture to a field; parent notifications
consume its optional current-surface predicate. This controls presentation after
an asynchronous update and grants no domain authority. Current source proof is
`fireux-core/src/test/editable-completion-scope.test.mjs`.
