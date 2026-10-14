# Entity Collection Page family

Updated: 2026-09-15
Ref: 61105afdf
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
├── definePageMeta and useSeo
├── acquire canonical Entity collection
└── UPage
    └── UPageBody
        ├── EntityHero
        ├── EntityCurrent      # only when a real current Entity exists
        ├── EntityCreate
        ├── EntityCollection   # receives the named plural Entity prop
        ├── CollectionPagination? # route-owned acquisition control
        └── DiagnosticsDebugPanel      # dev-only acquisition diagnostics
```

The route owns metadata, SEO, route policy, acquisition, and visible
composition. Kitchen and Menu browsing place their compact Create actions in
the Hero’s links slot so discovery controls and records remain near the top.
It uses Nuxt UI's `UPage` and `UPageBody`; the layout already owns
the semantic `main` and `UContainer`, so an index route does not repeat a
`main`, maximum width, padding, or spacing utility shell.
Each layer is a flat Entity-owned component at
`runtime/<entity>/components/{Hero,Current,Create,Collection}.vue`. The
Collection receives canonical records through a named prop such as `apps`,
`users`, `ecosystems`, `projects`, `places`, or `kitchens`; it may own filters,
interface projection, lists, and cards, but it does not fetch that primary
collection again.

The public Collection contract is exactly `XCollection :xs="xs"`. App alone
also receives `scope="ecosystem" | "platform"` because the same App family has
two real acquisition scopes. Titles, descriptions, links, search, filters,
counts, variants, and record-derived badges are internal presentation choices.
Related collections, authority, loading flags, refresh functions, and
pagination functions are not Collection props.

Inside an audited Entity, the physical presentation chain is
`XCollection → XCollectionList → presentation cell`. Collection derives search,
filters, counts, and interface projection; List owns responsive layout and
passes one resolved object to its presentation cell. Core's
`CollectionCellData` and `<CollectionCell :cell="cell" />` are the ordinary shared
boundary. Kitchen browsing retains the same List-owned projection but uses Nuxt UI
`UPageCard` directly. Menu groups reuse `KitchenCollectionList`; standalone
Menu records use compact Nuxt UI cards. Its stable semantic fields are title, description, image, meta,
badges, action, and destination. Entity-owned Lists project their resolved
interfaces into that object. Identity-led Apps select avatar media; physical
Places and Kitchens select cover media. Those media treatments remain a
presentation choice inside the one shared cell rather than parallel Entity
cell systems.

The dev-only debug trail follows that ownership. The route launcher shows the
fetched canonical collection plus acquisition-critical derived values such as
count, scope, current-Entity choice, and pagination state. The List launcher
shows its passed interface records and the exact final
`CollectionCellData[]` projection. Neither panel changes the public Collection
prop contract or moves presentation decisions into the route.

The neutral baseline uses the Entity's available identity media and a
small amount of useful discovery context without adding Entity-specific card
chrome. A missing image, description, fact, or badge stays absent; the shared
cell never manufactures one. Other real consumers may retain Entity-owned
Cell, Pill, and Preview components without changing this index contract.

Index presentation evolves from the shared out-of-the-box Nuxt UI baseline,
then one evidence-backed Entity delta at a time, and only then shared or
Entity-owned chroma. The FL Hero component uses compact `UPageHeader`, Create
uses a concise horizontal doorway, and Collection keeps useful records in the
first viewport through `UPageGrid`; these are shared information-design
choices, not bespoke chroma. Ordinary Create children use a compact horizontal
`UPageCard`; Kitchen and Menu browsing use compact action buttons within their
page headers.

Hero introduces the index. Current presents the singular Entity relevant to the
current session. Create owns the concrete creation doorway. Collection presents
the acquired records. Hero, Create, and Collection are required in the audited
FL index family. Current is optional. User deliberately renders Current or
Create because one User identity is allowed; every other audited member renders
Create directly. Pagination follows Collection and remains route-owned. The
shared `CollectionPagination` is an acquisition control, not an Entity
Collection child or page shell; it is rendered only where the reader currently
supports pagination.

This arrangement has no generic Entity shell, `CollectionPage`, page slots,
configuration object, `CollectionManager`, outcome framework, bespoke debug
framework, or HTTP-status contract. It reuses Core's one `DiagnosticsDebugPanel`.
Deeper `Collection/List` and `Cards/*` components may remain because they are
implementation owned by the Collection layer, not page composition layers.

Place is the original visual proving reference. Job and Menu keep their
directory transports and domain-specific creation doorways without retaining
a second page engine.

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
refreshing, and HTTP-status presentation remain outside this composition
contract. Dev diagnostics use the bounded shared debug trail above and do not
become public outcome presentation.

## Current members

| Member                                     | Classification           | Deliberate delta                                             |
| ------------------------------------------ | ------------------------ | ------------------------------------------------------------ |
| Place                                      | reference                | Entity-family filters, bounded pagination, operator doorway  |
| Job                                        | paginated sibling        | directory transport and author doorway                       |
| Menu                                       | paginated sibling        | tenant/Kitchen-aware directory transport                     |
| User                                       | ordinary sibling         | canonical identity and current-user reconciliation           |
| App                                        | controller-owned sibling | Ecosystem and platform controllers, current-user App section |
| Ecosystem                                  | controller-owned sibling | platform scope and aggregate App count                       |
| Ingredient                                 | utility sibling          | vocabulary filters and no Collection Page creation doorway   |
| Product                                    | ordinary default sibling | live App-scoped collection and optional management doorway   |
| Kitchen and named profile Collection Pages | ordinary siblings        | domain cards, filters and doorway copy                       |
| Supplier                                   | ordinary sibling         | supplier identity, catalogue facts and management doorway    |
| Portfolio                                  | ordinary sibling         | property-group identity and management doorway               |
| Property                                   | paginated sibling        | bounded pagination and intentionally unlinked cards today    |
| Company                                    | joined sibling           | complete Company/Place pairs and bounded pagination          |

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

- `XHero`, optional `XCurrent`, `XCreate`, and `XCollection` are owned
  by the Entity package.
- The App owns the route and visibly composes the available layers in that order.
- `XCollection` receives its canonical collection from the route.
- `XCollectionList` remains Entity-owned and passes one resolved interface
  object into either Core's neutral `CollectionCell` or a proved Entity-owned
  Collection Cell. The latter owns presentation only; it does not fetch or
  change collection authority.
- The route owns fetched-object/acquisition debug. `XCollectionList` owns the
  passed-interface/final-cell debug. Both use launcher-backed `DiagnosticsDebugPanel`
  and render only in development.
- `XCreate` is required in the audited FL index family and owns the real
  creation doorway. Generic `XCTA` does not name an index-page responsibility.
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

- App, User, Ecosystem, Project, Place, Kitchen, Job, Menu, Supplier,
  Portfolio, and Property prove
  fireux-composed-lasagne in current source and the executable family guard.
- These eleven declared root Entity index families use visible flat composition
  rather than a shared `CollectionPage` shell. Marketplace Store is the one
  declared root Entity without a comparable root index; this pass does not
  invent one.
- Company, Ingredient, Product, profile directories, Blog, parent-scoped
  Entities, and App-branded routes are not silently promoted into this audited
  root-Entity family. Their existing surfaces remain separate pending their own
  classification or product decision.
- Entity filters, actions, card facts, read authority, and route policy remain
  legitimate domain deltas.
- Yellow Velo and Interlaken aesthetic families remain App-owned.
- Supplier, Portfolio, and Property are aligned FL siblings. Their collection
  authority and management doorways remain Entity-owned. Company remains a
  Place-owned Record and is not claimed as a root Entity sibling.
- Portfolio public index transport pages canonical `Portfolio[]`; the reader
  supplies document ids and does not create a second directory-entry model.
- Place index transport pages canonical `Place[]`; it no longer maintains a
  second Place projection model.
- Kitchen index transport returns canonical `Kitchen[]` values enriched with
  each same-ID canonical Place. It does not introduce a directory-entry model;
  management surfaces authorize against root-owned Team separately.
- Every audited route acquires its collection once and passes the named plural
  Entity prop into its Collection component.
- Every audited route except parked Property exposes its fetched collection and
  acquisition derivations through the shared dev-only launcher. Its List
  exposes the passed interface records and exact final cells. App's platform
  and ecosystem routes both retain their real scope delta.
- App, User, Ecosystem, Project, Place, Kitchen, Job, Supplier, and Portfolio
  use compact Nuxt UI `UPageHeader`; these indexes do not spend their first
  viewport on a marketing-scale hero.
- Those nine rich-baseline Lists present resolved cells in `UPageGrid`. The
  ordinary baseline crosses the shared Core boundary through one `cell` object
  rather than repeated scalar props. App and Place prove the rich shared cell:
  App uses identity-led avatar media and Place uses venue-discovery cover media.
  Kitchen browsing uses Nuxt UI `UPageCard` directly for compact photographic
  cards. Menu groups reuse that exact `KitchenCollectionList` with canonical
  visible Kitchen/Place records, filtered to Kitchens represented in the Menu
  results. Standalone Menus retain a separate section.
  These are bounded discovery presentation deltas; acquisition and domain
  ownership remain unchanged.
- Supplier Collection Page reads canonical `Supplier[]` through its live root
  collection. Its different transport does not change the shared outcome
  anatomy.
- Menu uses `MenuDirectoryEntry` and `MenuDirectoryPage` because its cards
  resolve bounded Kitchen identity, service hours, route contexts, and source
  identity. `useMenuDirectory` owns client outcomes and pagination while
  `readMenuDirectoryPage` owns the server read for all Menu Collection Page scopes.
- Job uses `JobDirectoryEntry` and `JobDirectoryPage` because its paginated
  cards join Company/Place display facts and JSON-safe schedule values.
  `readJobDirectoryPage` owns the shared JSON and sitemap read; exact detail
  returns the canonical Job plus its named related records.
- Editorial Blog presentation remains outside this completed proving pass;
  compare its authored-content job before deciding whether it shares the
  ordinary Entity Collection Page shell.
