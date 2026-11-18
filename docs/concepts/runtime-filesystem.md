# Runtime filesystem ownership

Updated: 2026-11-18
Ref: 2f47a03c2
Role: map, not canon

## Purpose

Map the package runtime filesystem so FireUX has one clear answer for shared
and entity-owned implementation while continuing to use Nuxt's supported
entrypoints and module registration.

This map describes runtime ownership. Declared Entity families use scoped
runtimes. Verify placement and discovery against current package modules,
config-time layers, real consumers and generated Nuxt declarations. The former
runtime ownership and registration guards are removed.

## Links

- Parent: [runtime-package.md](runtime-package.md)
- Framework boundary: [nuxt4.md](nuxt4.md)
- Component ownership: [components.md](components.md)
- Composable ownership: [composables.md](composables.md)
- Server boundary: [server-api.md](server-api.md)
- Entity layers: [lasagne.md](lasagne.md)
- Workspace family: [family-workspace-entity.md](family-workspace-entity.md)

## Shared component registration

The Core native runtime layer registers shared components under the `Fire`
library prefix. Atoms, Molecules and Organisms are internal folder categories,
not public name segments. Role folders below them remain part of the name.
The Core module registers its separate App, User, Ecosystem and Workspace trees
with their existing prefixes. App-local shared-component overrides use their
canonical Fire name. Keep one registration owner per tree and migrate consumers
with registration; do not retain old-name aliases.

Entity operator components follow the accepted `<Entity>Workspace<Capability>*`
direction in the [component surface convention](components.md#domain-component-surfaces).
That convention records current registration adoption separately; it does not
rename Core's shared `Workspace*` components or imply a `Public<Entity>*` cutover.

## Shared HTTP reads

Core's
[`runtime/composables/http/readPages.ts`](../../packages/core/fireux-core/src/runtime/composables/http/readPages.ts)
aggregates requested cursor pages through a supplied fetcher. The supported
mutable API reader is adjacent `useApiRead.ts`; it integrates shared live
connections and overlapping-request ownership with native Nuxt acquisition,
cancellation, hydration and refresh. Entity readers retain scope and
normalization. Server projection declarations and source lifecycles live under
`runtime/server/utils/live-projection*.ts`; the native `/api/live` adapter stays
under `runtime/server/api`. See
[native API read ownership](composables.md#native-api-read-ownership) for the
current lifecycle contract and source-owned checks.

## Ownership invariant

The package root contains Nuxt entrypoints, generic shared mechanisms, and
explicit upper cross-entity composition. A child of an Entity root belongs to
that owner. Shared placement alone does not imply that code is a lower primitive.

The first runtime path segment must answer one of two questions without
historical knowledge:

1. Is this a Nuxt entrypoint or a shared technical role?
2. Which declared Entity or shared Workspace concept owns it?

Named runtime roots are reserved for the package's owned Entities and the
shared Workspace concept. Core owns `app/`, `ecosystem/`, `user/` and
`workspace/`; other packages retain their named Entity roots and may add
`workspace/` for genuine package-wide composition. Workspace owns
shared management presentation and selection, without owning the domain records
being managed. `Detail`, `Directory`, `AI` and other surfaces stay beneath their
actual owner and technical role. Nuxt entrypoints and genuinely shared technical
mechanisms retain their conventional root folders.

```text
src/runtime/
├── components/       # shared across entities
├── composables/      # shared across entities
├── content/          # shared cross-entity product content
├── tools/            # shared capability and primitive definitions
├── types/            # shared runtime coordination contracts
├── utils/            # shared stateless value transformations and validators
├── server/           # Nuxt server boundaries and shared server primitives
│
├── kitchen/
│   ├── components/
│   ├── composables/
│   ├── models/
│   ├── server/
│   ├── tools/
│   └── utils/
│
├── menu/
│   ├── components/
│   ├── composables/
│   ├── models/
│   └── server/
│
└── supplier/
    ├── components/
    ├── composables/
    ├── models/
    └── server/
```

The examples are ownership shapes, not required folder symmetry. An entity
carries only the technical roles it actually owns, chosen from the
FireUX spine: `components`, `composables`, `models`, `server`, `utils`,
and supporting contracts where needed. Runtime `tools` is pending ownership
inspection; removed demo trees are not a supported scaffold. Entity roots use the repository's
canonical entity name and do not become generic domain, feature, capability,
content, AI, asset, or type buckets.

The accepted target keeps first-class Entity roots as siblings at their owning
package runtime. There is no architectural Sub-Entity class and no recursive
Entity spine beneath another Entity. Current nested Entity source is migration
input, not evidence that a data relationship requires source nesting. A complete
cutover must preserve the existing storage and authority unless a separate domain
migration is authorized.

An Entity may own an optional `records/` directory containing its support-record
definitions, such as `kitchen/records/item.ts`. Reader, component,
workflow and command behavior stays in that Entity's existing technical roles;
`records/` does not contain miniature component/composable/server spines.
Embedded shapes remain beside their owning model, record or capability. This
classifies ownership, not Firestore nesting or TypeScript `Record<...>` usage.

An absent role is represented by an absent directory, not an empty placeholder.
Filesystem migrations remove emptied source paths after their consumers move;
otherwise cold readers and AI agents can mistake retired ownership for an
active extension point. Check the moved authored paths for empty residue;
generated, dependency, build and coverage trees are outside that cleanup.

“Substantial” describes ownership, not size. An Entity scope is justified when
the concept has its own canonical identity and authority and owns coherent
behaviour across more than one technical role. File count, package name, or a
Workspace screen is not sufficient evidence. A capability package may extend a
declared Entity beneath the same Entity root without becoming a second owner;
its scope contains only the technical roles and child records required by that
named capability.

Portfolio proves this cross-package form. `fireux-properties` owns Portfolio
identity, presentation, Workspace authority, reads, writes, and server policy.
`fireux-compliance`, `fireux-documents`, and `fireux-tasks` contribute named
Portfolio-scoped operations and child-record models. They consume
`fireux-properties/runtime/portfolio/composables/usePortfolioScope` with an explicit Portfolio ID
and must not declare a competing Portfolio model, authority seam, component
family, or server policy. Verify that boundary through current imports and
consumers, including removal of the retired nested authority path.

The package root may still contain shared roles such as `content`, `tools`,
`types`, and `assets` when they genuinely serve several entities or Nuxt registration.
Inside an Entity, `models/model.ts` defines only that Entity. Supporting
types, catalogues and contracts live beside their owning capability; App media
uses `app/media`. Runtime
copy resolution and stateless helpers belong in `utils`, component-owned
styles belong with `components`, AI orchestration belongs in `composables` or
`server`, and actual operator tools belong in `tools`. This classification
keeps the first level predictable without pretending those jobs do not exist.

The former Blank and Misebox/Kitchen demo systems are retired. Public product
routes use canonical Entity readers; they do not import App-local imitation
records or fall back to fictional scenarios.
`app/simulations` is retired filesystem vocabulary. Package tests live under
`src/test`, outside projected `src/runtime`; static catalogues and presentation
contracts stay with their owning capability, stateless delivery helpers in `utils`, and
runtime CSS in `assets/styles`.

## Nuxt boundary

Nuxt keeps the entrypoints whose location is part of its runtime contract:

```text
src/runtime/pages/
src/runtime/layouts/
src/runtime/middleware/
src/runtime/plugins/
src/runtime/server/api/
src/runtime/server/plugins/
src/runtime/public/
```

Native runtime layers expose these conventional entrypoints at config time.
Package modules retain explicit registration and filtering where needed. The
shared native-layer assertion rejects missing configuration rather than inserting
private layers. See `runtime-package.md#registration-steps` for the verified boundary. Do not register a native-layer surface a second time
merely to satisfy the former module-only convention.

These files are adapters and composition boundaries. A page or Nitro handler
may be entity-specific without making the root directory its domain owner.
Substantial entity behaviour belongs under the entity root; pages and handlers
delegate to it.

Core's Firebase plugins live under `runtime/plugins/firebase/`. Its internal
[Firebase module](../../packages/core/fireux-core/src/config/app/firebase.ts)
registers them explicitly to preserve Auth options and initialization order;
they have no top-level plugin entrypoint for native discovery.

This makes the cold-reading route mechanical: begin at the framework entrypoint,
follow its explicit import or registered component into the owner, then follow
only named lower capabilities. Do not begin at a visual filename and infer its
storage or product owner from the component name.

Package modules register bounded entity component and composable directories
through supported Nuxt Kit helpers. Models, server domain code, types, and
ordinary utilities use explicit imports and need no discovery framework.
A nested `server` folder is an ownership convention, not automatic Nitro
discovery or a security boundary. Verify executable imports, server-only execution,
authorization and the public projection separately.

Registration source is also part of the visible filesystem contract: it names
only directories that currently exist and own authored code. A completed move
removes both the old directory and its registration declaration. Helpers may
remain defensive at runtime, but module source must not advertise an absent
shared or Entity role. Check declarations against existing source directories
and generated imports/components to detect phantom targets.

Core App owns identity, runtime configuration, initialization and App composition
under `runtime/app/{components,composables,models,utils,server}`. The current AppUser implementation
owns `runtime/app/app-user/{components,composables,contracts,models,utils,server}`;
AppUser remains a first-class Entity, and this nested source placement is pending
its own bounded sibling-root cutover rather than a template for new Entities;
`models` contains only `model.ts`, and bounded reader/presentation projections
live in the child's `types.ts`. Native AppUser registration uses the `AppUser`
component prefix and its explicit composable directory. App events remain App-owned;
User-profile navigation and current-App composition do not move into AppUser.
The
Nuxt handlers remain under `runtime/server/api/**/app/` and delegate inward.
Commercial offers, public landing and legal presentation, and public catalogue
pages live in the `fireux-app` runtime layer. Main discovery and child-App
composition live in `fireux-ecosystem`; Core retains neutral shells and controls.
Capability names avoid redundant prefixes, such as `initialization`; the named
child Entity retains its product identity as `app-user`.

## Ordering inside an entity

Entity scope comes first, then technical role, then the real product surface
or capability. For operator components, the accepted shape is Entity, technical
role, Workspace audience, then capability:

```text
src/runtime/kitchen/
├── components/Workspace/Menu/
├── composables/workspace/menu/
├── models/model.ts
├── records/item.ts
└── server/operations/menus/
```

This is an entity-scoped Nuxt runtime, not a capability-owned miniature
application. Do not create `client`, `server`, `components`, and `models`
inside an arbitrary feature root outside the entity scope.

Component directories may contain a bounded static `index.ts` namespace for
an actual parent composition, alongside their Vue components. The
[component namespace convention](components.md#local-component-namespaces) owns
its export-only boundary and substantive-work-only adoption. A separately
admitted [component-private presentation composable](composables.md#component-private-presentation-composables)
may also be explicitly imported beside its component. Domain records, readers,
commands and shared state retain their technical roles; neither local convention
changes public Nuxt registration or creates another acquisition owner.

The current Menu entrance is
[`kitchen/components/Workspace/Menu/Index.vue`](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Index.vue),
with `KitchenWorkspaceMenu*` registration and
[`useKitchenWorkspaceMenu`](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/composables/workspace/menu/index.ts).
Prep uses `components/Workspace/Prep` and `composables/workspace/prep` with the
same Entity/Workspace/capability order. Each group has a bounded scan excluded
from the remaining `WorkspaceKitchen*` integration tree; dynamic navigation names
and Public registration remain unchanged. Other working capabilities and Entity
record/reader locations are not implied migrated by those entrance moves.
The component convention owns scan exclusions; the
[composable lifecycle](composables.md#provided-capability-lifecycle) owns public
entrypoints, private lookup and explicit lower reader/command scopes.

## Workspace

Workspace is a shared surface and runtime, not an entity and not the owner of
Kitchen, Supplier, Project, or their records.

Shared Workspace implementation has one concept owner:

```text
src/runtime/workspace/
├── components/
├── composables/
├── models/
├── server/
├── tools/
└── utils/
```

Nuxt adapters remain under `runtime/layouts/`, `runtime/pages/workspace/`,
`runtime/middleware/` and `runtime/server/api/workspace/`. They consume the
Workspace owner or the appropriate Entity owner. Core explicitly registers
`workspace/components` with the `Workspace` prefix and registers its composables;
its Tailwind source list includes the moved component root. The shared Team and
Test controllers are `useWorkspaceTeam` and `useWorkspaceTest`.

Package-wide Workspace composition belongs to the package that selects and
combines its domain capabilities. Granite proves this at
[`fireux-granite/src/runtime/workspace/components/Portfolio/Overview/Index.vue`](../../packages/ecosystem/fireux-granite/src/runtime/workspace/components/Portfolio/Overview/Index.vue):
it composes the Portfolio overview with Documents, Tasks and Compliance and
registers the existing `WorkspacePortfolioOverview` name explicitly. This is an
upper integration owner, distinct from Core's shared `Workspace*` tree and an
Entity's operator component scan. Its explicit name and imports must move with
the Portfolio family if that registration cuts over; changing a base prefix
alone would leave the override under its former name. Reservations similarly
contributes a Property overview from its
[Property-scoped adapter](../../packages/extensions/fireux-reservations/src/runtime/property/components/Workspace/Overview/Index.vue).
Core does not import those domains, and Properties does not import its upper Ecosystem.
No package-level directory is required for a package containing only one Entity's
Workspace implementation. Entity component placement follows the
[Public/Workspace/lower-domain convention](components.md#domain-component-surfaces);
current registration and consumers establish each completed move.

Entity-specific Workspace implementation lives with the entity:

```text
src/runtime/kitchen/components/Workspace/
src/runtime/kitchen/composables/workspace/
src/runtime/kitchen/server/
```

The Entity's Workspace component group owns complete operator capability screens,
not only coordination, exposing `<Entity>Workspace<Capability>*` as the accepted
operator naming direction. Existing `Workspace<Entity>*` scans and direct-root
capability components remain migration inputs until their bounded registration
and consumer cutovers complete. This does not authorize a blanket rename of
selection/navigation or shared-capability adapters. Public/customer composition has its own scan; neutral
lower children require the admission evidence in
[components](components.md#domain-component-surfaces). Former direct-root
capability placement is pending alignment wherever its consumer cutover is not
complete. Sidebar groups do not create filesystem owners or require empty
folders. Component grouping leaves composables, models, contracts and commands
at their current domain owners; it does not move them under a Surface. Genuine
domain commands and workflows may remain under `server/operations`.

## Other cross-cutting concepts

- Auth, Firestore, Workspace, SEO, UI shells, and other proven cross-entity
  primitives remain in the root technical spine or their owning shared
  package.
- An entity's use of a shared primitive remains under that entity when it adds
  entity authority, policy, projection, or lifecycle.
- AI follows its actual technical role: owner-local types define agent contracts,
  composables coordinate client state, server owns trusted execution, and
  tools owns genuine operator tools. An `ai` Entity-root bucket does not hide
  those different jobs.
- Typed Entity catalogues stay outside Entity models with their capability.
  Shared authored content requires real cross-owner consumers. There is no
  generic `runtime/demo` role.
- A surface such as Workspace, Kiosk, Directory, Detail, or Admin may qualify a
  component or composable path; it does not become the owner of the entity.
- A real entity keeps its own root even when another entity exposes it as an
  operation. Kitchen's Menus operation manages Menu records; it does not absorb
  every Menu route, model, ordering surface, or Kiosk capability.

## Dependency direction

```text
Nuxt entrypoint
      ↓
entity-owned implementation
      ↓
shared package spine
      ↓
Core and external primitives
```

Generic lower mechanisms must not import an Entity to complete their behavior.
Upper cross-Entity composition may import the named capabilities it composes;
keep that responsibility distinct from a generic lower mechanism.
Entity Y may consume Entity X only through X's supported named capability; it
does not reach into X's internal storage or surface folders. Cross-extension
composition still belongs to the nearest package or App that declares both
dependencies.

## Movement contract

The declared Entity families are entity-scoped, and confirmed parent-owned
records and operations sit beneath their parent Entity scope. Apply the same
deliberate, bounded movement contract when a new Entity is declared or a
remaining concept earns an explicit model decision:

1. Reconcile the maintained documentation graph to this one ownership test
   before a new source move; do not operate with two durable filesystem
   contracts.
2. Classify each source as shared, Nuxt entrypoint, or owned by one named
   entity before moving it.
3. Move one complete capability without rewriting its behaviour.
4. Preserve routes, API contracts, composable exports, SSR, reactivity, HMR,
   and data authority. Component names follow the new paths; update every
   consumer and registration rather than retaining an alias.
5. Update direct imports and supported Nuxt module registration in the same
   change.
6. Do not leave proxy files, compatibility barrels, duplicate scans, or a
   second implementation at the old path.
7. Add a focused regression check for an old path only after every consumer in
   that bounded slice has moved and the check prevents a real recurring failure.
8. Keep current-source references truthful until their files actually move;
   label the old placement `migration` rather than documenting the destination
   as already implemented.

Business has its independent `business` scope in `fireux-businesses`. User
profiles, including Agent and Professional in `fireux-jobs`, remain beneath
`user`; Blogs owns its `blog` scope. Compliance, Documents and Tasks contribute
Portfolio-scoped capabilities, while Reservations contributes Property-scoped
capabilities. Follow current models, authority and consumers when classifying
other records; do not infer a new Entity from a folder name. A new
entity-owned capability lands coherently in its scoped runtime with
registration and relevant verification changes; it never starts a parallel
target tree.

## Delta register

| Difference                                                                                                                        | State        | Direction                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| Declared entity implementation lives under `runtime/<entity>/<role>`                                                              | `accepted`   | Preserve the scoped owner; inspect imports and consumers for completed legacy paths                 |
| Scoped component and composable roles require explicit Nuxt registration                                                          | `accepted`   | Use the shared Nuxt Kit helpers; compare populated roles with generated Nuxt declarations           |
| Confirmed parent-owned Records and Operations live beneath the parent Entity                                                      | `accepted`   | Keep their technical roles under the parent scope without promoting them to new root Entities       |
| To-confirm concepts remain on their owning package spine                                                                          | `to-confirm` | Make the model decision before creating an Entity root; do not infer Entity status from a UI folder |
| Nuxt pages, layouts, middleware, plugins, server API handlers, and static public projection remain in their framework directories | `accepted`   | Keep Nuxt discovery explicit and delegate substantial entity work inward                            |
| Entities expose different technical roles and capabilities                                                                        | `accepted`   | Do not create empty folders or artificial symmetry                                                  |
| First-level runtime roots mix unexplained feature names with technical roles and Entity owners                                    | `drift`      | Classify each root, then move one coherent capability without compatibility trees                   |
| Empty local directories remain after a completed tracked migration                                                                | `drift`      | Remove the local residue; empty untracked folders are not architecture or migration compatibility   |

## Verification

For each movement slice, compare generated component and import declarations,
route registration, focused package typechecks/build, relevant source-owned
tests, and SSR or route checks where relevant. Finish with `git diff --check`;
the deleted repository guard suite is not an available check. A successful
filesystem migration changes ownership and discovery paths, not product behaviour.

## Inspected Kitchen route delegation

Kitchen Finance and Tools routes delegate to the registered domain compositions
`KitchenFinance` and `KitchenTools`. Ingredient, Chef and Driver detail
routes own their record reads, read states, SEO and canonical-response behaviour.
Named Detail compositions receive the resolved records and own presentation and
local actions; they do not reacquire those records.
Nested components are registered by the owning module; no local component import
is required. Retired example scenarios are not part of Entity registration.

## Shared utility boundary

Entity `models/` directories contain only `model.ts` for that Entity and its
owned field vocabulary. Child Entities own their own spines. Apply this shape
to new and migrated owners; review legacy entries before moving or removing them.
Generic Core models remain pending that ownership review and receive no new
declarations. Contracts, projections, configuration and executable helpers stay
outside Entity models.

`types/` holds genuine runtime or integration coordination contracts;
`utils/` holds focused stateless behavior. Neither is an alternative home for
canonical records, workflows, reactive state, readers or commands. Concrete
cross-owner contracts and their consumers are mapped in
[Core models](core-models.md#stored-records); one-consumer normalization remains
private beside its [reader](composables.md#names-describe-responsibility).

Core `runtime/utils` contains only shared stateless value contracts: identifiers,
URLs, read outcomes, timestamps, shared palette values and mutation-target validation.
These are admitted responsibilities, not mandatory folders or scaffolds.
Reactive/browser lifecycle lives with the existing composable or plugin owner:
PWA’s controller is beside `composables/pwa/usePwa.ts`; route-auth coordination
is under `composables/navigation`; diagnostic formatting is at `utils/diagnostics/format.ts`, shared explicitly
by diagnostics components and composables. Utility filenames use kebab-case;
exported function names use camelCase. Core User owns onboarding destinations, App owns management policy,
and Entity server owners define mutation targets. FireUX App public platform
literature lives in that App’s `shared/platform-context.ts`.

App theme validation and build-versioned asset URLs live under `app/utils` and
are shared by App head and the runtime manifest. App-owned Chat storage and
session/rate-limit workflows live under `app/models` and `app/server/chat`;
generic Chat HTTP handlers delegate to that owner. Workspace's disposable Test
intent contract lives under `workspace/models`. Neither server workflows nor
Entity-owned contracts become generic utilities because several Apps consume them.

Sitemap publication-filter validation is shared between configuration and runtime
server generation, so its owner is Core `src/utils/sitemap-public-filters.ts`,
not the projected runtime or a server-only folder. Core’s config build emits it
with the other configuration-shared utilities.

Public-slug policy follows the same config/runtime boundary. Core
`src/utils/public-slug-policy.ts` owns fixed root/entity keys and normalization;
`config/module/reserved-route-keys.ts` owns build-time registration. Runtime
`utils/slug/validate-public-slug.ts` is stateless: callers provide their App's
published `reservedRouteKeys` as `runtimeReservedRouteKeys`, plus any domain-local
`reserved` keys. User handles, Kitchen publication, tenant Menu naming and Go QR
document paths use that same input. Validation does not read or initialize the
build registry. Kitchen's pure update parser receives the keys from its server
command; it does not read Nuxt config itself.
Verify normalization, scope, explicit snapshots and availability callbacks with
`src/test/utils/slug/validate-public-slug.test.mjs`, and production dependency
delivery with `src/test/package-artifact.test.mjs`.
Consumer coverage also lives in Kitchens
`src/test/kitchen/slug-validation.test.mjs` and Go QR
`tests/server/utils/go-qr-docs.test.mjs`.
