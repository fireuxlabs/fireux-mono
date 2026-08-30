# Entity Collection Page family

Updated: 2026-08-30
Ref: d1a7d5eec
Role: map, not canon

## Purpose

Map ordinary Entity Collection Page routes such as `/places`, `/jobs`, `/menus`,
and their siblings. Separate the shared Collection Page anatomy from data authority,
domain capability, and intentionally App-owned branded presentation.

## Links

- Parent: `pages.md`
- Children: `family-entity-detail.md`, `family-menu.md`
- Horizontal: `collection-manager.md`, `components.md`, `composables.md`,
  `entities.md`, `runtime-filesystem.md`

## FireUX composed lasagne

The accepted flat index-page arrangement is **fireux-composed-lasagne**:

```text
route
├── acquire canonical Entity collection
├── EntityHero
├── EntityCurrent      # only when a real current Entity exists
├── EntityCreate       # only when creation is a real action
└── EntityCollection   # receives the named plural Entity prop
```

The route owns metadata, route policy, acquisition, and visible composition.
Each layer is a flat Entity-owned component at
`runtime/<entity>/components/{Hero,Current,Create,Collection}.vue`. The
Collection receives canonical records through a named prop such as `apps`,
`users`, `ecosystems`, `projects`, `places`, or `kitchens`; it may own filters,
interface projection, lists, and cards, but it does not fetch that primary
collection again.

Hero introduces the index. Current presents the singular Entity relevant to the
current session. Create owns the concrete creation doorway. Collection presents
the acquired records. Omit a layer when its responsibility is not real; do not
replace an omission with a placeholder component.

This arrangement has no generic Entity shell, `CollectionPage`, page slots,
configuration object, `CollectionManager`, outcome framework, debug contract,
or HTTP-status contract. Deeper `Collection/List` and `Cards/*` components may
remain because they are implementation owned by the Collection layer, not page
composition layers.

Place is the visual proving reference. Job and Menu are differentiated
siblings: Job adds an editorial promise and author actions; Menu adds route
scope, bounded redirect policy, and a preview variant. Those differences do
not create new page engines.

## Data authority

An Entity chooses the smallest honest read boundary:

- A root Entity reader returns the canonical Entity type. A server reader is
  required when joins, cross-database authority, server credentials, or SSR
  status matter; it composes named records instead of inventing `PublicX`.
- A live client collection is valid when Rules already expose the intended
  canonical rows and immediate reactivity is the product contract.
- A named `XDirectoryEntry` may reduce payload for a large collection, but it
  is a Collection Page view rather than a second Entity or privacy filter.
- A controller is required when the same Entity has multiple real scopes, such
  as Ecosystem Apps versus platform Apps.
- Scoped children use named scoped surfaces; they do not masquerade as the root
  Entity Collection.

The visual family does not dictate transport. Loading, unavailable, missing,
refreshing, debug, and HTTP-status presentation are deliberately outside this
composition contract.

## Current members

| Member                                     | Classification           | Deliberate delta                                              |
| ------------------------------------------ | ------------------------ | ------------------------------------------------------------- |
| Place                                      | reference                | Entity-family filters, bounded pagination, operator doorway   |
| Job                                        | differentiated sibling   | editorial hero, publication gate, author actions, pagination  |
| Menu                                       | differentiated sibling   | tenant/Kitchen route scope, redirect policy, preview cards    |
| User                                       | ordinary sibling         | canonical identity and current-user reconciliation            |
| App                                        | controller-owned sibling | Ecosystem and platform controllers, current-user App section  |
| Ecosystem                                  | controller-owned sibling | platform scope and aggregate App count                        |
| Ingredient                                 | utility sibling          | vocabulary filters and no Collection Page creation doorway    |
| Product                                    | ordinary default sibling | live tenant-scoped collection and optional management doorway |
| Kitchen and named profile Collection Pages | ordinary siblings        | domain cards, filters and doorway copy                        |
| Supplier                                   | ordinary sibling         | supplier identity, catalogue facts and management doorway     |
| Portfolio                                  | ordinary sibling         | property-group identity and management doorway                |
| Property                                   | paginated sibling        | bounded pagination and intentionally unlinked cards today     |
| Company                                    | joined sibling           | complete Company/Place pairs and bounded pagination           |

## App-owned branded families

Yellow Velo Product and Interlaken Marketplace are intentionally not ordinary
Entity Collection Page presentations. They may own their shell, typography,
artwork, merchandising hierarchy, filters, card composition, and App-local
CSS.

They inherit lower contracts where sensible:

- Entity readers and named Collection Page views;
- truthful loading, unavailable, empty, and ready semantics;
- accessibility and responsive fundamentals;
- Core semantic tokens and Nuxt UI primitives.

Do not route these branded surfaces through `CollectionPage` merely to make
their templates resemble ordinary Entity Collection Pages. Do not move their aesthetic
into Core. Their branded presentation is an accepted product-family boundary,
not drift.

## Component ownership

- `XHero`, optional `XCurrent`, optional `XCreate`, and `XCollection` are owned
  by the Entity package.
- The App owns the route and visibly composes the available layers in that order.
- `XCollection` receives its canonical collection from the route.
- `XCollectionList` and `XCards/*` remain Entity-owned.
- `XCreate` is present only when creation is real. Generic `XCTA` does not name
  an index-page responsibility.
- Pages do not accept generic configuration objects for cards, states, or CTA
  behavior.
- Debug presentation is outside the current composition pass.

## Naming

Use Entity Collection Page for the route family and Collection for its owned children. Use `published` only where publication
is a real eligibility contract and `protected` where access is restricted.
Do not use `Public` to name a normal website route, Entity, endpoint, DTO, or
component. Duplicate `PublicX` root identifiers are migration debt. Standard
protocol terms such as the HTTP `Cache-Control: public` directive retain their
defined meaning; they do not name FireUX Entities or surfaces.

## Verification

When this family changes:

1. inspect Place plus the nearest differentiated sibling;
2. verify the affected entity route, named layers, reader, and cards;
3. confirm App-owned branded routes retain their own presentation;
4. run focused package checks; and
5. run `pnpm guard` before handoff.

## Current decisions

- App, User, Ecosystem, Project, Place, and Kitchen prove
  fireux-composed-lasagne in current source and the executable family guard.
- These six Entity index families use visible flat composition rather than a
  shared `CollectionPage` shell. Other index families remain unaudited by this
  pass and are not silently claimed as aligned.
- Entity filters, actions, card facts, read authority, and route policy remain
  legitimate domain deltas.
- Yellow Velo and Interlaken aesthetic families remain App-owned.
- Supplier, Portfolio, Property, and Company are aligned ordinary Entity Collection Page
  siblings. Their collection authority and management doorways remain
  Entity-owned.
- Portfolio public index transport pages canonical `Portfolio[]`; the reader
  supplies document ids and does not create a second directory-entry model.
- Place index transport pages canonical `Place[]`; it no longer maintains a
  second Place projection model.
- Kitchen index transport returns canonical `Kitchen[]` values enriched with
  each same-ID canonical Place. It does not introduce a directory-entry model;
  management surfaces authorize against root-owned Team separately.
- App, User, Ecosystem, Project, Place, and Kitchen routes acquire their
  collections once and pass named Entity props into their collection components.
- Supplier Collection Page reads canonical `Supplier[]` through its live root
  collection. Its different transport does not change the shared outcome
  anatomy.
- Menu uses `MenuDirectoryEntry` and `MenuDirectoryPage` because its cards
  resolve bounded Kitchen identity, service hours, route contexts, and source
  identity. `useMenuCollection` owns client outcomes and pagination while
  `readMenuDirectoryPage` owns the server read for all Menu Collection Page scopes.
- Job uses `JobDirectoryEntry` and `JobDirectoryPage` because its paginated
  cards join Company/Place display facts and JSON-safe schedule values.
  `readJobDirectoryPage` owns the shared JSON and sitemap read; exact detail
  returns the canonical Job plus its named related records.
- Editorial Blog presentation remains outside this completed proving pass;
  compare its authored-content job before deciding whether it shares the
  ordinary Entity Collection Page shell.
