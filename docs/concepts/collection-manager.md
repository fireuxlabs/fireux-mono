# Collection manager family

Updated: 2026-08-27
Ref: d1a7d5eec
Role: map, not canon

## Purpose

Map collection acquisition and presentation ownership by source mode and snapshot shape.

Current collection presentation enters through `Collection/Index.vue`, receives
named canonical records, and owns search, filters, card projection and lists.
Consuming routes or existing surfaces own acquisition and loading/error states.
Ingredient, Product and Blog now follow this boundary without Manager wrappers.
Blog’s existing public Index owns its directory reader, pagination and search
and composes Collection Editorial directly; authoring routes retain the scoped
Blog reader. Source-mode classifications below describe reader responsibilities,
not a requirement for self-fetching presentation components.

## Vertical links

- Parent: components.md
- Parent: entities.md
- Child: family-entity-collection-page.md
- Child: firestore-entity.md

## Horizontal links

- composables.md
- family-menu.md
- family-workspace-entity.md

## Working language

- Collection manager: visual/list/search/card manager for a collection family.
- Default collection: the unqualified canonical Entity collection.
- Default collection manager: collection manager for that unqualified entity
  collection and its index route.
- Scoped collection: a collection bounded by a named parent or context, such
  as Kitchen Menus, Supplier Items, App Users, or Portfolio Properties.
- Default source: the consuming surface acquires its canonical Entity collection.
- Self-contained row: a collection row has every exposed list/card field needed by `useXInterface()`.
- Synced snapshot: denormalized presentation fields copied onto the row from source truth by a migration/sync seam.
- Linked enrichment: extra live reads or API joins that add named linked truth
  to a record. This is not the default collection-manager shape.
- Interface: `useXInterface()` maps fetched collection rows into cards.

## Important split

- Snapshot class answers: does this collection row already carry the list/card truth it needs?
- Source mode answers: is this a default collection manager, a scoped surface, or a custom-derived surface?
- These are different axes. A root index manager can carry authored fields, synced snapshot fields, or a server-safe projection.

## Source modes

- Default collection source: the consuming surface reads the unqualified Entity collection.
- Scoped surface: parent/context-specific surface fetches scoped rows; do not reuse root collection manager as the scoped renderer.
- Custom-derived: renders a shaped collection rather than a boring root entity list.

## Root index manager classes

- Root Simple Collection: acquire the default collection at the consuming surface and render through `useXInterface()` with authored row fields.
- Root Synced Snapshot Collection Manager: fetch a default collection whose list/card fields are deliberately copied from source truth by an explicit sync seam.
- Root Joined Collection Manager: fetch canonical Entities plus named related
  records when list presentation requires an explicit server-owned join.
- Scoped Surface: not a collection manager class; it owns parent-scoped fetching and may reuse cards/lists underneath.

## Root Simple Collection Manager members

- `Menu`.
- `Place`.
- `Product`.
- `Recipe` is not in this class: current recipe storage/fetch is Kitchen-scoped and a directory response is deferred.

## Focused Product records

`fireux-products` owns `useProductRecord` for a single ID-or-slug locator and
optional Product type. It uses a bounded live query, rejects ambiguous matches,
and subscribes only to the selected Product's prices. The collection and focused
reader share the existing `productReadConstraints` policy: public/active discovery,
App scoping for tenant/standalone Apps, and the acting App's admin/developer-owned
products. FireUX's Module route passes `productType: 'module'`; it does not
hydrate prices for every Product. Checkout behavior stays with its existing
owner. Verify with `fireux-products/src/test/product-record.test.mjs`.

## Root Joined Collection Manager members

- `Company` resolves its stamps-only same-id role marker to the canonical Place;
  its remaining prefixed transport names are migration debt.
- `Kitchen` receives bounded canonical Kitchen and Place records. Raw Kitchen
  rows stay sparse and no longer copy shared Place fields. Only published,
  non-test Kitchens with a slug and an existing same-ID Place enter the
  directory; invalid Kitchen or Place identity fails closed.
- `App` receives one named controller: owning Ecosystem projection or FireUX
  platform directory projection.
- `Ecosystem` receives the FireUX platform directory controller.
- `User` uses a bounded users API so protected User support never becomes directory data.
  Public handle details use `useUserDirectoryDetail` and the existing live User
  API: global Apps retain global directory eligibility; tenant Apps require the
  target User's valid current App membership. Both server and canonical browser
  handle resolution reject duplicate matches. The admin membership editor retains
  `useUserByHandle`, since canonical identity lookup is separate from directory
  eligibility and the editor may inspect a User without current App membership.
  Public Profile uid aliases remain owned by the Profile resolver; User handle
  routes do not gain a uid fallback. See `user-directory-detail.test.mjs` and
  `user-read-lifecycle.test.mjs`.
- `Chef`, `Driver`, `Agent`, and `Professional` use domain-owned APIs
  that join their allowlisted profile fields to canonical User identity by uid.
- `Job` uses its bounded API to exact-validate open/published roots and join
  safe Company and canonical work-Place display truth.
- `Ingredient` consumes `/api/ingredients`. The API exposes only the canonical
  culinary identity needed by directory browse and exact Kitchen/Supplier
  joins; raw root documents and curator writes remain server-only.
- Blog's public `BlogDirectory` consumes `/api/blogs`,
  which applies publication and ecosystem scope, exposes a bounded index-card
  DTO, and owns cursor pagination. The authenticated/dev
  Blog authoring routes retain the scoped root collection so drafts remain
  operable without exposing that source to the directory route.
- `Customer` is App membership/profile context and is not a root collection-manager member.

## Snapshot ownership rule

- Generic source entities stay ignorant of consumers. `Place` does not know who copies it.
- Company roots stay stamps-only; Company list and detail reads join the
  same-id Place through the bounded server projection.
- `Place` index transport pages canonical `Place[]`. Live and Demo roots use the
  same `normalizePlace` utility to complete sparse stored truth without
  manufacturing another Place type.
- Domain parents may cascade into their domain children. Job roots do not copy
  Company or Place display snapshots; their directory response owns the joins.
- `User` is the only stored person identity. Profile writes and sync scripts
  must not copy it into `users/{uid}/profiles/{kind}` or `app-state/{appId}`.
- Profile collection presentation receives the profile and canonical User
  as separate DTO members from a server-side uid join. Exact detail reads remain
  separate until those pages complete their endpoint-first cutover.
- Collection managers consume the row/projection they receive; they do not make per-row linked reads.

## Source contract

- `XCollectionManager` belongs to the unqualified `/xs` collection surface.
- Boring self-owned managers mount directly. Authority-sensitive App and
  Ecosystem pages pass one named controller, never a raw collection prop.
- The manager fetches its own default collection and should not join linked
  records internally.
- A route-policy controller is a narrow accepted delta when the route must use
  the same bounded request to choose an HTTP outcome before rendering. The
  Menu Directory passes `useMenuDirectory` explicitly for tenant redirect versus
  list policy; it does not pass a raw `collection`, and the controller remains
  the sole fetch/pagination owner.
- If list/card truth lives elsewhere, use an explicit sync seam or a bounded
  Directory view according to the family's declared index class.
- Scoped pages use named scoped surfaces and may reuse smaller `XCards*` pieces.

## Data-state contract

- A manager consumes the collection composable/controller outcome; rendered
  card count must never decide whether the source is loading or failed.
- Primary branch order is `pending` -> `error` -> list -> filtered empty ->
  settled collection empty.
- `empty` is valid only after a successful settled read. Pending, offline,
  permission, and other read failures must not collapse into empty copy.
- Counts are shown only for settled `ready` or `empty` outcomes. Search-empty
  copy is local presentation and remains distinct from an empty source.
- Use `MoleculesStateCard` for conventional manager states. Ordinary Entity
  Collection managers select its `collection` surface for the established
  dashed directory treatment. Domain-branded presentation may choose another
  surface while keeping the same ordering and live-region semantics.
- Do not expose raw backend errors on directory surfaces. A retained valid page may
  show a non-fatal pagination error without replacing the existing list.

## Card handoff contract

- `XCollectionManager` maps records through `useXInterface()`.
- Two-variant managers delegate pill/cell selection, cell-overlay merging, and
  invalid-card removal to `useCollectionVariantCards`. A full cell factory may
  explicitly replace rather than overlay the base card; data authority, search,
  copy, filters, actions, list components, and rendering remain domain-owned.
- `XCollectionManager` computes `linkEnabled = computed(() => props.link !== false)`.
- `XCollectionManager` passes cards into `XCardsPill` and `XCardsCell` with `v-bind="card"` plus `:link="linkEnabled"`.
- `XCardsPill` and `XCardsCell` receive direct card fields, not a wrapped `card` prop.
- `XCardsPill` and `XCardsCell` render real `<NuxtLink>` branches when `link && to`; action-only usage is the local delta.

## Visual convergence status

- The Kitchen directory established the warmer, clearer root-manager
  hierarchy now shared with Menu and User through core
  `CollectionHeader`, `MoleculesStateCard`, and the small
  `entity-collection*` layout contract.
- Root/global discovery pages may share Core `CollectionPage`; this is page
  presentation only and does not move domain collection ownership into core.
- Domain card content, actions, data source, and genuine scoped behavior remain
  accepted deltas; visual convergence must not flatten domain meaning.
- Converge additional root managers deliberately through these small seams;
  do not copy Kitchen/Menu markup and CSS into each manager.

## Debug contract

- Collection manager debug should separate `objects` from `derived`.
- `objects` means fetched/API collection rows as the manager receives them.
- `derived` means interface cards, filters, counts, selected variant, links, and other UI state.
- Do not mix stored/directory surface fields with `useXInterface()` card output in one flat JSON array.
- A manager using `useDiagnosticsCollectionJson` loads its snapshot only when `DiagnosticsDebugPanel`
  opens and unloads it when the panel closes; closed debug panels do no work.

## Current source-mode snapshot

- Root index manager today: `App`, `Ecosystem`, `User`, `Kitchen`, `Menu`, `Place`, `Portfolio`, `Property`, `Supplier`, `Blog`, `Company`, `Job`, `Product`, `Ingredient`, `Chef`, `Driver`, `Agent`, `Professional`.
- Project has a bounded directory collection of active identity and presentation;
  selection, access, and operations remain private FireUX Workspace concerns.
- Scoped surfaces today: `Dish`, `Recipe`, `Station`, `Kitchen.Supplier`, `Team`, `Supplier.Catalogue`, `Supplier.Ingredient`, `Supplier.Item`, `Orders`.
- Custom-derived surfaces today: `Blank`, `Workspace.Kitchen.Operations.Mise`, `Workspace.Portfolio.Operations.Clients`.

## Linked-read directions

- Up: scoped/local record reads a higher/root entity.
- Down: root doorway reads scoped child detail.
- Side: record reads sibling/root references.
- Team: a Workspace root resolves exact Team authority and canonical User presentation.

## Working rule

- Unqualified entity collection managers fetch the default collection or its
  bounded collection response. Directory visibility is a publication/access
  policy, not a collection classification.
- Scoped operation surfaces should not blindly fetch; they need parent scope and a named scoped surface.
- Default collection managers consume self-contained rows or bounded server
  projections; they do not batch-load linked identities in the browser.
- Deliberately stored downstream snapshots must be propagated by an explicit
  sync seam. The current the retired operational artifact in Git history
  operation updates Menu display snapshots from their Kitchen/Place source; it
  must never write Company roots.
- Its supported command is `pnpm sync:misebox-directory-card-snapshots`; it is
  dry-run-first and requires an explicit project/database, target-bound
  confirmation, protected preimage, unchanged source versions, and post-write
  verification before an apply is accepted.
- Hydration belongs on detail or named scoped/secure surfaces, not default collection managers.
- A bounded API is used when authority, publication, or server-only work makes
  a raw collection the wrong directory source.
- The Vue manager should avoid manual per-row document reads.

## Guard-backed lock

- The former `scripts/guards/canon.mjs` is retired; it does not enforce the current collection boundary.
- The same guard requires the open/load and close/unload lifecycle whenever a
  collection manager uses `useDiagnosticsCollectionJson`.
- Do not add exceptions just to make a local feature pass.
- If a scoped page wants a passed collection, stop and name the missing scoped surface.

Root Simple Collection Managers

| Manager     | Snapshot source                     | Direction | Current note                                                                                                                                 |
| ----------- | ----------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `Menu`      | Route-owned `/api/menus` controller | Self      | Root index manager renders bounded root doorway pages; the same controller owns tenant index policy, cursor pagination, and no detail joins. |
| `Place`     | None in manager                     | Self      | Root index manager fetches places; Place can be source truth for synced snapshots elsewhere.                                                 |
| `Product`   | None in manager                     | Self      | Root index manager fetches products; Product can be source truth for synced snapshots elsewhere.                                             |
| `Supplier`  | None for root browse                | Self/Team | Root browse fetches Suppliers. Workspace flows resolve exact root-owned Team records.                                                        |
| `Portfolio` | None for root browse                | Self/Team | Root browse fetches Portfolios. Workspace flows resolve exact root-owned Team records.                                                       |
| `Property`  | None for root browse                | Self/Team | Root browse fetches Properties. Workspace flows resolve exact root-owned Team records.                                                       |

Root Projected Collection Managers

| Manager        | Projection source                      | Direction                 | Current note                                                                                                                                      |
| -------------- | -------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Kitchen`      | `/api/kitchens`                        | Server Place join         | Bounded Kitchen pages return canonical Kitchen roots enriched with same-ID Place; Workspace Team authority remains outside the public response.   |
| `Ingredient`   | `/api/ingredients`                     | Server projection         | Active roots power browse; bounded exact-id requests resolve Kitchen and Supplier links without exposing raw root documents.                      |
| `App`          | `/api/apps` or FireUX `/api/directory` | Owner/platform projection | Same cards and manager; page chooses the authority-explicit controller.                                                                           |
| `Ecosystem`    | FireUX `/api/directory`                | Platform projection       | App counts derive from active App projections, never `ecosystem.apps[]`.                                                                          |
| `User`         | `/api/users`                           | Server projection         | Users index gets a bounded response, then maps canonical Users through `useUserView()`.                                                      |
| `Blog`         | `/api/blogs`                           | Server projection         | The editorial manager uses a content-free index shape and endpoint-owned cursor pagination; admin/dev retain their scoped root manager.           |
| `Chef`         | `/api/chefs`                           | Server profile/User join  | Kitchen-owned allowlist joins canonical User by matching uid.                                                                                     |
| `Driver`       | `/api/drivers`                         | Server profile/User join  | Kitchen-owned allowlist excludes App-specific contact, tender, and Kitchen grant state.                                                           |
| `Agent`        | `/api/agents`                          | Server profile/User join  | Jobs-owned allowlist includes deliberately published business contacts only.                                                                      |
| `Professional` | `/api/professionals`                   | Server profile/User join  | Jobs-owned allowlist keeps resume data explicit and bounded.                                                                                      |
| `Job`          | `/api/jobs`                            | Server Company/Place join | The paginated Directory joins bounded employer and work-location display truth; exact detail returns the canonical Job and named related records. |
| `Company`      | `/api/companies`                       | Server Place join         | Exact stamps-only Company roots join the same-id canonical Place; Place display fields are never copied onto Company.                             |

Scoped/provided collection surfaces

| Surface               | Source                                                    | Direction   | Current note                                                  |
| --------------------- | --------------------------------------------------------- | ----------- | ------------------------------------------------------------- |
| `Dish`                | Kitchen-scoped rows                                       | Scoped      | No root index today.                                          |
| `Recipe`              | Kitchen-scoped rows                                       | Scoped      | Directory response deferred; keep as Kitchen Recipes for now. |
| `Station`             | Kitchen-scoped rows                                       | Scoped      | No root index today.                                          |
| `Team`                | Kitchen/workspace-scoped rows                             | Scoped/side | May resolve bounded User presentation later.                  |
| `Kitchen.Supplier`    | Kitchen-scoped supplier entries                           | Scoped/side | Local kitchen supplier surface.                               |
| `Supplier.Item`       | Supplier-scoped item rows with Product reference          | Scoped/side | No root index today.                                          |
| `Supplier.Ingredient` | Supplier-scoped ingredient rows with Ingredient reference | Scoped/side | No root index today.                                          |
| `Supplier.Catalogue`  | Supplier-scoped catalogue rows                            | Scoped/down | No root index today.                                          |

Custom-derived surfaces

| Surface                                  | Source                             | Direction     | Current note                   |
| ---------------------------------------- | ---------------------------------- | ------------- | ------------------------------ |
| `Blank`                                  | Explicit blank target collection   | Custom        | Intentional minimal mirror.    |
| `Orders`                                 | Kitchen/menu/user/dish shaped rows | Custom/side   | Needs future order spine pass. |
| `Workspace.Kitchen.Operations.Mise`      | Kitchen-scoped mise rows           | Custom/scoped | Operation surface.             |
| `Workspace.Portfolio.Operations.Clients` | Portfolio/client/property rows     | Custom/scoped | Operation surface.             |

## Delta register

| Difference                                                                                     | State        | Reason or direction                                                                                                                  |
| ---------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Root Simple, Synced Snapshot, and Projected managers fetch differently                         | `accepted`   | Privacy and read-model authority differ; every manager still owns one bounded source outcome                                         |
| Scoped operations do not use `XCollectionManager`                                              | `accepted`   | Parent scope is required input, so they need named scoped surfaces rather than a root-manager override prop                          |
| App and Ecosystem managers receive named controllers                                           | `accepted`   | The page must choose ecosystem/platform authority explicitly                                                                         |
| Kitchen/Menu/User established shared directory header/state presentation before older managers | `migration`  | Converge other root managers through the small core seams when touched                                                               |
| Blog has separate editorial and authenticated-root managers                                    | `accepted`   | Directory browse and draft administration have different authority; both remain Blogs-extension-owned and share the interface mapper |
| Orders and some Workspace operation lists are custom-derived                                   | `to-confirm` | Keep named domain surfaces until a repeated collection contract is proved                                                            |
| Client-side search is hidden before all bounded pages are loaded                               | `accepted`   | It must not claim absence from an incomplete catalogue; large search becomes server-owned                                            |
| Snapshot propagation is currently a guarded manual script                                      | `to-confirm` | Move a snapshot to a trigger only after write volume, failure recovery, and source ownership justify continuous sync                 |
| Some authority-sensitive roots use bounded APIs while simple roots read collections            | `accepted`   | Authority, publication, and server-only joins determine transport; the manager still consumes one bounded source outcome             |
| Workspace reads resolve Team while simple roots do not                                         | `accepted`   | Team is root-owned authority used only by selected-target and authenticated management surfaces                                      |

## Alignment roadmap

### Now

- Keep source, outcome, interface mapping, and debug authority inside the
  manager.

### Next

- Converge older root managers through shared directory header/state and
  variant-card seams without moving domain copy or fetching into Core.

### Later

- Promote custom-derived surfaces only when several domains prove the
  same input and outcome contract.
- Replace a manual snapshot sync with a trigger only for a measured,
  recoverable propagation requirement.
