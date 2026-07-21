Collection manager map

<!-- Concurrent edit — 2026-07-20 14:18 CEST — User identity boundary: profile collections join canonical Users instead of storing identity snapshots. -->
<!-- Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: move identity joins behind bounded domain APIs. -->
<!-- Concurrent edit — 2026-07-20 22:07 CEST — Repo Efficiency Pass 4 of 6: map the guarded public-card snapshot sync. -->
<!-- Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: move Kitchen browse to a fail-closed bounded Place projection. -->
<!-- Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: name access-record joins separately from presentation overlays. -->

Updated: 2026-07-20
Ref: 4c0a1c7ad
Role: map, not canon

Purpose:
Compare all `*/Collection/Manager.vue` files by source mode and snapshot shape.

Vertical links:

- Parent: components.md
- Parent: entities.md
- Child: family-public-index.md
- Child: firestore-entity.md

Horizontal links:

- composables.md
- family-menu.md
- family-console-entity.md

Working language:

- Collection manager: visual/list/search/card manager for a collection family.
- Root index manager: collection manager for a public/root entity index route.
- Default source: collection manager fetches its own root/public collection.
- Self-contained row: a collection row has every public list/card field needed by `useXInterface()`.
- Synced snapshot: denormalized public fields copied onto the row from source truth by a migration/sync seam.
- Hydration: extra live reads or API enrichment that add linked truth to a record. This is not the default collection-manager shape.
- Interface: `useXInterface()` maps fetched collection rows into cards.

Important split:

- Snapshot class answers: does this collection row already carry the list/card truth it needs?
- Source mode answers: is this a root index manager, a scoped surface, or a custom-derived surface?
- These are different axes. A root index manager can carry authored fields, synced snapshot fields, or a server-safe projection.

Source modes:

- Root index manager: fetches its own public/root entity collection.
- Scoped surface: parent/context-specific surface fetches scoped rows; do not reuse root collection manager as the scoped renderer.
- Custom-derived: renders a shaped collection rather than a boring root entity list.

Root index manager classes:

- Root Simple Collection Manager: fetch root/public collection and render through `useXInterface()` with authored row fields.
- Root Synced Snapshot Collection Manager: fetch root/public collection whose list/card fields are copied from source truth by `scripts/sync-self-contained-collection-rows.mjs`.
- Root Projected Collection Manager: fetch a safe server projection because the raw root collection contains fields that should not power public browse UI.
- Scoped Surface: not a collection manager class; it owns parent-scoped fetching and may reuse cards/lists underneath.

Root Simple Collection Manager members:

- `Menu`.
- `Place`.
- `Blog`.
- `Product`.
- `Ingredient`.
- `Recipe` is not in this class: current recipe storage/fetch is kitchen-scoped and public recipe projection is deferred.

Root Synced Snapshot Collection Manager members:

- `Company` carries public Place snapshot fields copied onto the Company row.
- `Job` carries public workplace snapshot fields copied onto the Job row.
- `Recipe` may extend Root Simple Collection Manager later if public recipe projection becomes real root truth and needs ingredient/dish enrichment.

Root Projected Collection Manager members:

- `Kitchen` receives a bounded public Kitchen/Place projection. Raw Kitchen
  rows stay sparse and no longer copy shared Place fields. Only published,
  non-test Kitchens with a slug and an existing explicit Place reference enter
  the projection; invalid App scope never selects an App support record.
- `App` receives one named controller: owning Ecosystem projection or FireUX
  platform directory projection.
- `Ecosystem` receives the FireUX platform directory controller.
- `User` uses a public users API so raw identity/private user fields do not become public browse data.
- `Chef`, `Driver`, `Agent`, and `Professional` use domain-owned public APIs
  that join their allowlisted profile fields to canonical User identity by uid.
- `Customer` is app-private and is not a root public collection-manager member.

Snapshot ownership rule:

- Generic source entities stay ignorant of consumers. `Place` does not know who copies it.
- Domain parents may cascade into their domain children. Workplace/job sync belongs to the jobs domain.
- `User` is the only stored public identity. Profile writes and sync scripts must not copy it into root or app profile rows.
- Public profile collection presentation receives the profile and canonical User
  as separate DTO members from a server-side uid join. Exact detail reads remain
  separate until those pages complete their endpoint-first cutover.
- Collection managers consume the row/projection they receive; they do not make per-row hydration calls.

Source contract:

- `XCollectionManager` belongs to `/xs` root/public browse surfaces.
- Boring self-owned managers mount directly. Authority-sensitive App and
  Ecosystem pages pass one named controller, never a raw collection prop.
- The manager fetches its own public/root collection and should not hydrate internally.
- A route-policy controller is a narrow accepted delta when the route must use
  the same bounded request to choose an HTTP outcome before rendering. The
  Menu index passes `usePublicMenuIndex` explicitly for tenant redirect versus
  list policy; it does not pass a raw `collection`, and the controller remains
  the sole fetch/pagination owner.
- If list/card truth lives elsewhere, use an explicit sync seam or a bounded
  public projection according to the family's declared index class.
- Scoped pages use named scoped surfaces and may reuse smaller `XCards*` pieces.

Data-state contract:

- A manager consumes the collection composable/controller outcome; rendered
  card count must never decide whether the source is loading or failed.
- Primary branch order is `pending` -> `error` -> list -> filtered empty ->
  settled collection empty.
- `empty` is valid only after a successful settled read. Pending, offline,
  permission, and other read failures must not collapse into empty copy.
- Counts are shown only for settled `ready` or `empty` outcomes. Search-empty
  copy is local presentation and remains distinct from an empty source.
- Use the shared bare `MoleculesStateCard` for conventional manager states.
  Domain directory presentations may use their established state component but
  keep the same ordering and live-region semantics.
- Do not expose raw backend errors on public surfaces. A retained valid page may
  show a non-fatal pagination error without replacing the existing list.

Card handoff contract:

<!-- Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: close the shared card and deferred-debug contracts. -->

- `XCollectionManager` maps records through `useXInterface()`.
- Two-variant managers delegate pill/cell selection, cell-overlay merging, and
  invalid-card removal to `useCollectionVariantCards`. A full cell factory may
  explicitly replace rather than overlay the base card; data authority, search,
  copy, filters, actions, list components, and rendering remain domain-owned.
- `XCollectionManager` computes `linkEnabled = computed(() => props.link !== false)`.
- `XCollectionManager` passes cards into `XCardsPill` and `XCardsCell` with `v-bind="card"` plus `:link="linkEnabled"`.
- `XCardsPill` and `XCardsCell` receive direct card fields, not a wrapped `card` prop.
- `XCardsPill` and `XCardsCell` render real `<NuxtLink>` branches when `link && to`; action-only usage is the local delta.

Visual convergence status:

- The public Kitchen directory established the warmer, clearer root-manager
  hierarchy now shared with Menu and User through core
  `CollectionDirectoryHeader`, `CollectionDirectoryState`, and the small
  `collection-directory*` layout contract.
- Root/global discovery pages may share core `PublicIndexSurface`; this is page
  presentation only and does not move domain collection ownership into core.
- Domain card content, actions, data source, and genuine scoped behavior remain
  accepted deltas; visual convergence must not flatten domain meaning.
- Converge additional root managers deliberately through these small seams;
  do not copy Kitchen/Menu markup and CSS into each manager.

Debug contract:

- Collection manager debug should separate `objects` from `derived`.
- `objects` means fetched/API collection rows as the manager receives them.
- `derived` means interface cards, filters, counts, selected variant, links, and other UI state.
- Do not mix stored/public surface fields with `useXInterface()` card output in one flat JSON array.
- A manager using `useDevCollectionJson` loads its snapshot only when `DevJson`
  opens and unloads it when the panel closes; closed debug panels do no work.

Current source-mode snapshot:

- Root index manager today: `App`, `Ecosystem`, `User`, `Kitchen`, `Menu`, `Place`, `Portfolio`, `Property`, `Supplier`, `Blog`, `Company`, `Job`, `Product`, `Ingredient`, `Chef`, `Driver`, `Agent`, `Professional`.
- Project is a private FireUX console target, not a public collection manager.
- Scoped surfaces today: `Dish`, `Recipe`, `Station`, `Kitchen.Supplier`, `Team`, `Supplier.Catalogue`, `Supplier.Ingredient`, `Supplier.Item`, `Orders`.
- Custom-derived surfaces today: `Blank`, `Console.Kitchen.Operations.Mise`, `Console.Portfolio.Operations.Clients`.

Hydration directions:

- Up: scoped/local record reads a higher/root entity.
- Down: public/root doorway reads scoped child detail.
- Side: record reads sibling/root references.
- App support: a root record combines with an allowlisted App support delta.

Working rule:

- Root/public entity collection managers fetch a default public/root collection.
- Scoped operation surfaces should not blindly fetch; they need parent scope and a named scoped surface.
- Root/public collection managers consume self-contained rows or bounded server
  projections; they do not batch-load linked identities in the browser.
- Source truth changes must be propagated by an explicit sync seam, currently `scripts/sync-self-contained-collection-rows.mjs`.
- Its supported command is `pnpm sync:misebox-public-card-snapshots`; it is
  dry-run-first and requires an explicit project/database, target-bound
  confirmation, protected preimage, unchanged source versions, and post-write
  verification before an apply is accepted.
- Hydration belongs on detail or named scoped/secure surfaces, not default collection managers.
- Public API projection is used when privacy, authority, publication, or
  server-only work makes a raw collection the wrong public source.
- The Vue manager should avoid manual per-row document reads.

Guard-backed lock:

- `scripts/guards/canon.mjs` now blocks new `collection` props on `*/Collection/Manager.vue`.
- The same guard requires the open/load and close/unload lifecycle whenever a
  collection manager uses `useDevCollectionJson`.
- Do not add exceptions just to make a local feature pass.
- If a scoped page wants a passed collection, stop and name the missing scoped surface.

Root Simple Collection Managers

| Manager      | Snapshot source                     | Direction         | Current note                                                                                                                                            |
| ------------ | ----------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Menu`       | Route-owned `/api/menus` controller | Self              | Root index manager renders bounded public root doorway pages; the same controller owns tenant index policy, cursor pagination, and no detail hydration. |
| `Blog`       | None in manager                     | Self              | Root index manager fetches blog posts.                                                                                                                  |
| `Place`      | None in manager                     | Self              | Root index manager fetches places; Place can be source truth for synced snapshots elsewhere.                                                            |
| `Product`    | None in manager                     | Self              | Root index manager fetches products; Product can be source truth for synced snapshots elsewhere.                                                        |
| `Ingredient` | None in root manager                | Self              | Root index manager fetches ingredients; Ingredient can be source truth for synced snapshots elsewhere.                                                  |
| `Supplier`   | None for root browse                | Self/App support  | Root browse fetches Suppliers. Operator-filtered console/access flows may join same-id App support records.                                             |
| `Portfolio`  | None for root browse                | Self/App support  | Root browse fetches Portfolios. Operator-filtered console/access flows may join same-id App support records.                                            |
| `Property`   | None for root browse                | Self/App support  | Root browse fetches Properties. The `root-with-app-support` read shape is explicit via options.                                                         |

Root Projected Collection Managers

| Manager        | Projection source                                    | Direction                 | Current note                                                                                                                |
| -------------- | ---------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `Kitchen`      | `/api/kitchens`                                      | Server Place/App join     | Cursor-bounded Kitchen pages join explicit `place_id` and canonical App scope without copied snapshots or client N+1 reads. |
| `App`          | `/api/public/apps` or FireUX `/api/public/directory` | Owner/platform projection | Same cards and manager; page chooses the authority-explicit controller.                                                     |
| `Ecosystem`    | FireUX `/api/public/directory`                       | Platform projection       | App counts derive from active App projections, never `ecosystem.apps[]`.                                                    |
| `User`         | `/api/public/users`                                  | Server projection         | Public users index gets safe user DTOs, then maps them through `useUserInterface()`.                                        |
| `Chef`         | `/api/public/chefs`                                  | Server profile/User join  | Kitchen-owned allowlist joins canonical User by matching uid.                                                               |
| `Driver`       | `/api/public/drivers`                                | Server profile/User join  | Kitchen-owned allowlist excludes AppDriver contact, tender, and Kitchen grant state.                                        |
| `Agent`        | `/api/public/agents`                                 | Server profile/User join  | Jobs-owned allowlist includes deliberate public business contacts only.                                                     |
| `Professional` | `/api/public/professionals`                          | Server profile/User join  | Jobs-owned allowlist keeps resume data explicit and bounded.                                                                |

Root Synced Snapshot Collection Managers

| Manager   | Snapshot source                     | Direction | Current note                                                |
| --------- | ----------------------------------- | --------- | ----------------------------------------------------------- |
| `Company` | Place by same id                    | Up        | Public Place card fields are copied onto root Company rows. |
| `Job`     | Kitchen/workplace by `workplace_id` | Side/up   | Public workplace card fields are copied onto root Job rows. |

Scoped/provided collection surfaces

| Surface               | Source                                                    | Direction   | Current note                                                 |
| --------------------- | --------------------------------------------------------- | ----------- | ------------------------------------------------------------ |
| `Dish`                | Kitchen-scoped rows                                       | Scoped      | No root index today.                                         |
| `Recipe`              | Kitchen-scoped rows                                       | Scoped      | Public projection deferred; keep as Kitchen Recipes for now. |
| `Station`             | Kitchen-scoped rows                                       | Scoped      | No root index today.                                         |
| `Team`                | Kitchen/console-scoped rows                               | Scoped/side | May hydrate user records later.                              |
| `Kitchen.Supplier`    | Kitchen-scoped supplier entries                           | Scoped/side | Local kitchen supplier surface.                              |
| `Supplier.Item`       | Supplier-scoped item rows with Product reference          | Scoped/side | No root index today.                                         |
| `Supplier.Ingredient` | Supplier-scoped ingredient rows with Ingredient reference | Scoped/side | No root index today.                                         |
| `Supplier.Catalogue`  | Supplier-scoped catalogue rows                            | Scoped/down | No root index today.                                         |

Custom-derived surfaces

| Surface                                | Source                             | Direction     | Current note                   |
| -------------------------------------- | ---------------------------------- | ------------- | ------------------------------ |
| `Blank`                                | Explicit blank target collection   | Custom        | Intentional minimal mirror.    |
| `Orders`                               | Kitchen/menu/user/dish shaped rows | Custom/side   | Needs future order spine pass. |
| `Console.Kitchen.Operations.Mise`      | Kitchen-scoped mise rows           | Custom/scoped | Operation surface.             |
| `Console.Portfolio.Operations.Clients` | Portfolio/client/property rows     | Custom/scoped | Operation surface.             |

Open questions:

- Which synced snapshots should become Cloud Function triggers rather than manual scripts?
- Which secure projections need APIs because raw rows should not power public browse UI?
- Which App support joins should graduate into their own named scoped surfaces?
