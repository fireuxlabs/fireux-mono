# Runtime filesystem ownership

Updated: 2026-08-18
Ref: e23268507
Role: map, not canon

## Purpose

Map the package runtime filesystem so FireUX has one clear answer for shared
and entity-owned implementation while continuing to use Nuxt's supported
entrypoints and module registration.

This map defines the implemented ownership shape. Declared Entity families use
scoped runtimes; completed legacy placements are rejected by
`scripts/guards/runtime-ownership.mjs`. Scoped component and composable
registration is protected by `scripts/guards/runtime-registration.mjs`.

## Links

- Parent: [runtime-package.md](runtime-package.md)
- Framework boundary: [nuxt4.md](nuxt4.md)
- Component ownership: [components.md](components.md)
- Composable ownership: [composables.md](composables.md)
- Server boundary: [server-api.md](server-api.md)
- Entity layers: [lasagne.md](lasagne.md)
- Console family: [family-console-entity.md](family-console-entity.md)

## Ownership invariant

The package root technical spine is shared. A child of an entity root is owned
by that entity.

```text
src/runtime/
├── components/       # shared across entities
├── composables/      # shared across entities
├── models/           # shared across entities
├── content/          # shared cross-entity product content
├── demo/             # shared cross-entity Demo composition
├── types/            # shared runtime coordination contracts
├── utils/            # shared runtime behaviour
├── server/           # Nuxt server boundaries and shared server primitives
│
├── kitchen/
│   ├── components/
│   ├── composables/
│   ├── models/
│   ├── server/
│   ├── content/
│   ├── demo/
│   ├── ai/
│   ├── tools/
│   ├── types/
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
carries only the technical roles and product capabilities it actually owns.
Entity roots use the repository's canonical entity name and do not become
generic domain, feature, or module buckets.

The role list is open to honest technical jobs such as `content`, `demo`,
`ai`, `tools`, `types`, and `utils`; it is not limited to components,
composables, models, and server code. The same ownership test applies: root
`runtime/content`, `runtime/demo`, `runtime/types`, and `runtime/utils` are
cross-entity shared, while Kitchen-only catalogues, fixtures, contracts, and
helpers belong under `runtime/kitchen/<role>`.

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

These files are adapters and composition boundaries. A page or Nitro handler
may be entity-specific without making the root directory its domain owner.
Substantial entity behaviour belongs under the entity root; pages and handlers
delegate to it.

Package modules register bounded entity component and composable directories
through supported Nuxt Kit helpers. Models, server domain code, types, and
ordinary utilities use explicit imports and need no discovery framework.

## Ordering inside an entity

Entity scope comes first, then technical role, then the real product surface
or capability:

```text
src/runtime/kitchen/
├── components/Console/Operations/Menus/
├── composables/console/operations/menus/
├── models/menu/
└── server/operations/menus/
```

This is an entity-scoped Nuxt runtime, not a capability-owned miniature
application. Do not create `client`, `server`, `components`, and `models`
inside an arbitrary feature root outside the entity scope.

## Console

Console is a shared surface and runtime, not an entity and not the owner of
Kitchen, Supplier, Project, or their records.

Shared Console mechanics remain in the root spine:

```text
src/runtime/components/Console/
src/runtime/composables/fireux/console/
src/runtime/layouts/
src/runtime/pages/console/
src/runtime/server/api/console/
```

Entity-specific Console implementation lives with the entity:

```text
src/runtime/kitchen/components/Console/
src/runtime/kitchen/composables/console/
src/runtime/kitchen/server/
```

The module registration may preserve established component names such as
`ConsoleKitchenOperationsTables`; a filesystem move does not require a public
component or composable rename. Kitchen domain models and commands do not move
under Console merely because Console consumes them.

## Other cross-cutting concepts

- Auth, Firestore, Console, SEO, UI shells, and other proven cross-entity
  primitives remain in the root technical spine or their owning shared
  package.
- An entity's use of a shared primitive remains under that entity when it adds
  entity authority, policy, projection, or lifecycle.
- AI and Tools live under the owning entity's `ai` and `tools` roles, with
  operation children only when the operation owns the product capability.
  Only proven cross-entity mechanics remain shared.
- Entity-owned product catalogues and Demo Worlds live under that entity's
  `content` and `demo` roles. Root `runtime/content` and `runtime/demo` remain
  available only for real cross-entity composition.
- A surface such as Console, Kiosk, Directory, Detail, or Admin may qualify a
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

The shared spine must not import an entity to complete generic behaviour.
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
4. Preserve routes, API contracts, generated component names, composable
   exports, SSR, reactivity, HMR, and data authority.
5. Update direct imports and supported Nuxt module registration in the same
   change.
6. Do not leave proxy files, compatibility barrels, duplicate scans, or a
   second implementation at the old path.
7. Guard an old path only after every consumer in that bounded slice has moved.
8. Keep current-source references truthful until their files actually move;
   label the old placement `migration` rather than documenting the destination
   as already implemented.

Confirmed records such as Company, Chef, Driver, and Customer, and confirmed
operations such as Compliance, Documents, Tasks, and Reservations, use their
Place, User, Portfolio, or Property parent scope. To-confirm concepts such as
Agent, Professional, and Blog remain on their owning package spine. Do not turn
a record or unresolved concept into a filesystem Entity by guessing. A new
entity-owned capability lands coherently in its scoped runtime with
registration and guard changes; it never starts a parallel target tree.

## Delta register

| Difference                                                                                                                        | State        | Direction                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| Declared entity implementation lives under `runtime/<entity>/<role>`                                                              | `accepted`   | Preserve the scoped owner and reject completed legacy paths through the runtime ownership guard     |
| Scoped component and composable roles require explicit Nuxt registration                                                          | `accepted`   | Use the shared Nuxt Kit helpers; the runtime registration guard checks every populated scoped role  |
| Confirmed parent-owned Records and Operations live beneath the parent Entity                                                      | `accepted`   | Keep their technical roles under the parent scope without promoting them to new root Entities       |
| To-confirm concepts remain on their owning package spine                                                                          | `to-confirm` | Make the model decision before creating an Entity root; do not infer Entity status from a UI folder |
| Nuxt pages, layouts, middleware, plugins, server API handlers, and static public projection remain in their framework directories | `accepted`   | Keep Nuxt discovery explicit and delegate substantial entity work inward                            |
| Entities expose different technical roles and capabilities                                                                        | `accepted`   | Do not create empty folders or artificial symmetry                                                  |

## Verification

For each movement slice, compare generated component and import declarations,
route registration, focused package build, SSR or route smoke where relevant,
and the full repository guard. A successful filesystem migration changes
ownership and discovery paths, not product behaviour.
