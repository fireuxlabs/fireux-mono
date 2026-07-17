Collection manager map
Updated: 2026-07-17
Ref: f882d8a82
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
- `App`.
- `Ecosystem`.
- `Project`.
- `Menu`.
- `Place`.
- `Blog`.
- `Product`.
- `Ingredient`.
- `Recipe` is not in this class: current recipe storage/fetch is kitchen-scoped and public recipe projection is deferred.

Root Synced Snapshot Collection Manager members:
- `Kitchen` carries public Place snapshot fields copied onto the Kitchen row.
- `Company` carries public Place snapshot fields copied onto the Company row.
- `Job` carries public workplace snapshot fields copied onto the Job row.
- `Chef`, `Customer`, `Driver`, `Agent`, and `Professional` carry public User summary snapshots copied onto the profile row; profile collection fetches do not hydrate users.
- `Recipe` may extend Root Simple Collection Manager later if public recipe projection becomes real root truth and needs ingredient/dish enrichment.

Root Projected Collection Manager members:
- `User` uses a public users API so raw identity/private user fields do not become public browse data.

Snapshot ownership rule:
- Generic source entities stay ignorant of consumers. `Place` does not know who copies it.
- Domain parents may cascade into their domain children. Workplace/job sync belongs to the jobs domain.
- `User` may cascade safe public identity into attached profile rows because profiles are part of the identity family.
- User profile snapshots are maintained by `useCoreUserUpdate`, `useProfileCreate`, and the backfill/sync script.
- Collection managers consume the row/projection they receive; they do not make per-row hydration calls.

Source contract:
- `XCollectionManager` belongs to `/xs` root/public browse surfaces.
- Consumers mount `XCollectionManager` directly with no source params.
- The manager fetches its own public/root collection and should not hydrate internally.
- A route-policy controller is a narrow accepted delta when the route must use
  the same bounded request to choose an HTTP outcome before rendering. The
  Menu index passes `usePublicMenuIndex` explicitly for tenant redirect versus
  list policy; it does not pass a raw `collection`, and the controller remains
  the sole fetch/pagination owner.
- If list/card truth lives elsewhere, copy a public snapshot onto the row through a sync seam.
- Scoped pages use named scoped surfaces and may reuse smaller `XCards*` pieces.

Card handoff contract:
- `XCollectionManager` maps records through `useXInterface()`.
- `XCollectionManager` computes `linkEnabled = computed(() => props.link !== false)`.
- `XCollectionManager` passes cards into `XCardsPill` and `XCardsCell` with `v-bind="card"` plus `:link="linkEnabled"`.
- `XCardsPill` and `XCardsCell` receive direct card fields, not a wrapped `card` prop.
- `XCardsPill` and `XCardsCell` render real `<NuxtLink>` branches when `link && to`; action-only usage is the local delta.

Debug contract:
- Collection manager debug should separate `objects` from `derived`.
- `objects` means fetched/API collection rows as the manager receives them.
- `derived` means interface cards, filters, counts, selected variant, links, and other UI state.
- Do not mix stored/public surface fields with `useXInterface()` card output in one flat JSON array.

Current source-mode snapshot:
- Root index manager today: `App`, `Ecosystem`, `User`, `Project`, `Kitchen`, `Menu`, `Place`, `Portfolio`, `Property`, `Supplier`, `Blog`, `Company`, `Job`, `Product`, `Ingredient`, `Chef`, `Customer`, `Driver`, `Agent`, `Professional`.
- Scoped surfaces today: `Dish`, `Recipe`, `Station`, `Kitchen.Supplier`, `Team`, `Supplier.Catalogue`, `Supplier.Ingredient`, `Supplier.Item`, `Orders`.
- Custom-derived surfaces today: `Blank`, `Console.Kitchen.Operations.Mise`, `Console.Portfolio.Operations.Clients`.

Hydration directions:
- Up: scoped/local record reads a higher/root entity.
- Down: public/root doorway reads scoped child detail.
- Side: record reads sibling/root references.
- Overlay: root record combines with app-scoped operational state.

Working rule:
- Root/public entity collection managers fetch a default public/root collection.
- Scoped operation surfaces should not blindly fetch; they need parent scope and a named scoped surface.
- Root/public collection rows are self-contained for list/card display.
- Source truth changes must be propagated by an explicit sync seam, currently `scripts/sync-self-contained-collection-rows.mjs`.
- Hydration belongs on detail or named scoped/secure surfaces, not default collection managers.
- Public API projection is reserved for privacy/security or server-only work, not as the default collection-manager source.
- The Vue manager should avoid manual per-row document reads.

Guard-backed lock:
- `scripts/guards/canon.mjs` now blocks new `collection` props on `*/Collection/Manager.vue`.
- Do not add exceptions just to make a local feature pass.
- If a scoped page wants a passed collection, stop and name the missing scoped surface.

Root Simple Collection Managers

| Manager | Snapshot source | Direction | Current note |
| --- | --- | --- | --- |
| `App` | None in manager | Self | Root index manager fetches apps. |
| `Ecosystem` | None in manager | Self | Root index manager fetches ecosystems. |
| `Project` | None in manager | Self/filter | Root index manager fetches projects and can apply operator/team filters. |
| `Menu` | Route-owned `/api/menus` controller | Self | Root index manager renders bounded public root doorway pages; the same controller owns tenant index policy, cursor pagination, and no detail hydration. |
| `Blog` | None in manager | Self | Root index manager fetches blog posts. |
| `Place` | None in manager | Self | Root index manager fetches places; Place can be source truth for synced snapshots elsewhere. |
| `Product` | None in manager | Self | Root index manager fetches products; Product can be source truth for synced snapshots elsewhere. |
| `Ingredient` | None in root manager | Self | Root index manager fetches ingredients; Ingredient can be source truth for synced snapshots elsewhere. |
| `Supplier` | None for root browse | Self/scoped delta | Root browse fetches suppliers. Operator-filtered console/access flows may join app overlays. |
| `Portfolio` | None for root browse | Self/scoped delta | Root browse fetches portfolios. Operator-filtered console/access flows may join app overlays. |
| `Property` | None for root browse | Self/scoped delta | Root browse fetches properties. Scoped overlay shape is explicit via options. |

Root Projected Collection Managers

| Manager | Projection source | Direction | Current note |
| --- | --- | --- | --- |
| `User` | `/api/public/users` | Server projection | Public users index gets safe user DTOs, then maps them through `useUserInterface()`. |

Root Synced Snapshot Collection Managers

| Manager | Snapshot source | Direction | Current note |
| --- | --- | --- | --- |
| `Kitchen` | Place by `place_id` or same id | Up | Public Place card fields are copied onto root Kitchen rows. |
| `Company` | Place by same id | Up | Public Place card fields are copied onto root Company rows. |
| `Job` | Kitchen/workplace by `workplace_id` | Side/up | Public workplace card fields are copied onto root Job rows. |
| `Chef` | User by profile id | Side | Public User summary is copied onto profile rows. |
| `Customer` | User by profile id | Side | Public User summary is copied onto profile rows. |
| `Driver` | User by profile id | Side | Public User summary is copied onto profile rows. |
| `Agent` | User by profile id | Side | Public User summary is copied onto profile rows. |
| `Professional` | User by profile id | Side | Public User summary is copied onto profile rows. |

Scoped/provided collection surfaces

| Surface | Source | Direction | Current note |
| --- | --- | --- | --- |
| `Dish` | Kitchen-scoped rows | Scoped | No root index today. |
| `Recipe` | Kitchen-scoped rows | Scoped | Public projection deferred; keep as Kitchen Recipes for now. |
| `Station` | Kitchen-scoped rows | Scoped | No root index today. |
| `Team` | Kitchen/console-scoped rows | Scoped/side | May hydrate user records later. |
| `Kitchen.Supplier` | Kitchen-scoped supplier entries | Scoped/side | Local kitchen supplier surface. |
| `Supplier.Item` | Supplier-scoped item rows with Product reference | Scoped/side | No root index today. |
| `Supplier.Ingredient` | Supplier-scoped ingredient rows with Ingredient reference | Scoped/side | No root index today. |
| `Supplier.Catalogue` | Supplier-scoped catalogue rows | Scoped/down | No root index today. |

Custom-derived surfaces

| Surface | Source | Direction | Current note |
| --- | --- | --- | --- |
| `Blank` | Explicit blank target collection | Custom | Intentional minimal mirror. |
| `Orders` | Kitchen/menu/user/dish shaped rows | Custom/side | Needs future order spine pass. |
| `Console.Kitchen.Operations.Mise` | Kitchen-scoped mise rows | Custom/scoped | Operation surface. |
| `Console.Portfolio.Operations.Clients` | Portfolio/client/property rows | Custom/scoped | Operation surface. |

Open questions:
- Which synced snapshots should become Cloud Function triggers rather than manual scripts?
- Which secure projections need APIs because raw rows should not power public browse UI?
- Which scoped overlay joins should graduate into their own named scoped surfaces?
