# Entity Directory family

Updated: 2026-08-19
Ref: e23268507
Role: map, not canon

## Purpose

Map ordinary Entity Directory routes such as `/places`, `/jobs`, `/menus`,
and their siblings. Separate the shared Directory anatomy from data authority,
domain capability, and intentionally App-owned branded presentation.

## Links

- Parent: `pages.md`
- Children: `family-public-detail.md`, `family-menu.md`
- Horizontal: `collection-manager.md`, `components.md`, `composables.md`,
  `entities.md`, `runtime-filesystem.md`

## Ordinary Directory spine

An ordinary Entity Directory uses this composition:

```text
DirectorySurface
├── Entity collection manager
│   ├── CollectionDirectoryHeader
│   ├── CollectionDirectoryState
│   ├── Entity Collection/List
│   └── Entity Cards/*
└── optional entity doorway
```

The route owns metadata, route policy, and major named composition. The Entity
owns its reader/controller, outcome mapping, filters, interface projection,
cards, and doorway. Core owns the shell, semantic tokens, responsive rhythm,
header/state primitives, and collection layout mechanics.

Place is the visual proving reference. Job and Menu are differentiated
siblings: Job adds an editorial promise and author actions; Menu adds route
scope, bounded redirect policy, and a preview variant. Those differences do
not create new page engines.

## Required outcomes

Every ordinary Directory keeps these states truthful and visibly distinct:

- loading;
- unavailable, with retry when its reader supports refresh;
- empty;
- ready;
- incremental-read failure when pagination is supported.

An unavailable read never becomes an empty Directory. Existing results remain
visible when only an incremental read fails.

## Data authority

An Entity chooses the smallest honest read boundary:

- A bounded server projection is required when privacy, publication, joins,
  cross-database authority, or server credentials matter.
- A live client collection is valid when Rules already expose the intended
  canonical rows and immediate reactivity is the product contract.
- A controller is required when the same Entity has multiple real scopes, such
  as Ecosystem Apps versus platform Apps.
- Scoped children use named scoped surfaces; they do not masquerade as a root
  collection manager.

The visual family does not dictate transport. Server projection and live
Firestore collection members still share the same outcome anatomy.

## Current members

| Member                                | Classification           | Deliberate delta                                              |
| ------------------------------------- | ------------------------ | ------------------------------------------------------------- |
| Place                                 | reference                | Entity-family filters, bounded pagination, operator doorway   |
| Job                                   | differentiated sibling   | editorial hero, publication gate, author actions, pagination  |
| Menu                                  | differentiated sibling   | tenant/Kitchen route scope, redirect policy, preview cards    |
| User                                  | ordinary sibling         | bounded identity projection and current-user reconciliation   |
| App                                   | controller-owned sibling | Ecosystem and platform controllers, current-user App section  |
| Ecosystem                             | controller-owned sibling | platform scope and aggregate App count                        |
| Ingredient                            | utility sibling          | vocabulary filters and no Directory creation doorway          |
| Product                               | ordinary default sibling | live tenant-scoped collection and optional management doorway |
| Kitchen and named profile Directories | ordinary siblings        | domain cards, filters and doorway copy                        |

## App-owned branded families

Yellow Velo Product and Interlaken Marketplace are intentionally not ordinary
Entity Directory presentations. They may own their shell, typography,
artwork, merchandising hierarchy, filters, card composition, and App-local
CSS.

They inherit lower contracts where sensible:

- Entity readers and bounded projections;
- truthful loading, unavailable, empty, and ready semantics;
- accessibility and responsive fundamentals;
- Core semantic tokens and Nuxt UI primitives.

Do not route these branded surfaces through `DirectorySurface` merely to make
their templates resemble ordinary Directories. Do not move their aesthetic
into Core. Their branded presentation is an accepted product-family boundary,
not drift.

## Component ownership

- `DirectorySurface` is shared Core composition, not an Entity engine.
- `XCollectionManager` is the default root doorway and owns its default source.
- `XCollectionList` and `XCards/*` remain Entity-owned.
- `XCTA` is present only when an operator, onboarding, authoring, or management
  doorway is real.
- Pages do not accept generic configuration objects for cards, states, or CTA
  behavior.
- Dev JSON stays inside the Entity collection surface unless the route owns
  genuinely route-level derived state.

## Naming

Use Directory for the browse surface. Use `published` only where publication
is a real eligibility contract and `protected` where access is restricted.
Do not use `Public` merely to mean a normal website route or unauthenticated
page. Existing endpoint, DTO, Rules, and projection identifiers retain that
term only where they encode a genuine privacy or publication boundary.

## Verification

When this family changes:

1. inspect Place plus the nearest differentiated sibling;
2. verify the affected entity route, manager, reader, cards, and outcome states;
3. confirm App-owned branded routes retain their own presentation;
4. run focused package checks; and
5. run `pnpm guard` before handoff.

## Current decisions

- Ordinary Entity Directories share `DirectorySurface`.
- Entity filters, actions, card facts, read authority, and route policy remain
  legitimate domain deltas.
- Yellow Velo and Interlaken aesthetic families remain App-owned.
- Supplier, Portfolio, Property, Company, and editorial Blog presentation are
  outside this completed proving pass; align them only after comparing their
  actual product jobs with the proven family.
