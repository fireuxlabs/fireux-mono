Collection manager map
Updated: 2026-06-22
Ref: 8e7d03962
Role: map, not canon

Purpose:
Compare all `*/Collection/Manager.vue` files by hydration class.

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
- Hydration: extra reads or API enrichment that add linked truth to a record.
- Interface: `useXInterface()` maps fetched/hydrated records into cards.

Important split:
- Hydration class answers: does this collection need linked truth from elsewhere?
- Source mode answers: is this a root index manager, a scoped surface, or a custom-derived surface?
- These are different axes. A root index manager can require hydration or not require hydration.

Source modes:
- Root index manager: fetches its own public/root entity collection.
- Scoped surface: parent/context-specific surface fetches scoped rows; do not reuse root collection manager as the scoped renderer.
- Custom-derived: renders a shaped collection rather than a boring root entity list.

Root index manager classes:
- Root Simple Collection Manager: fetch root/public collection and render through `useXInterface()` without linked document hydration.
- Root Hydrated Collection Manager: extends Root Simple Collection Manager by adding a hydration/enrichment seam before `useXInterface()`.
- Scoped Surface: not a collection manager class; it owns parent-scoped fetching and may reuse cards/lists underneath.

Root Simple Collection Manager members:
- `App`.
- `Ecosystem`.
- `User`.
- `Place`.
- `Blog`.
- `Product`.
- `Ingredient`, likely, but confirm because local usage records exist.
- `Recipe` is not in this class: current recipe storage/fetch is kitchen-scoped and public recipe projection is deferred.

Root Hydrated Collection Manager members:
- `Kitchen` extends Root Simple Collection Manager with Place hydration.
- `Menu` extends Root Simple Collection Manager with creator/kitchen/app/scoped-menu doorway hydration.
- `Project` extends Root Simple Collection Manager with App/Ecosystem/runtime enrichment.
- `Company` extends Root Simple Collection Manager with Place hydration.
- `Job` extends Root Simple Collection Manager with Kitchen/workplace hydration.
- `Supplier` extends Root Simple Collection Manager with app-scoped overlay and future Company link.
- `Portfolio` extends Root Simple Collection Manager with app-scoped overlay.
- `Property` extends Root Simple Collection Manager with app-scoped overlay.
- `Chef`, `Agent`, and `Professional` extend Root Simple Collection Manager with User/profile hydration.
- `Recipe` may extend Root Simple Collection Manager later if public recipe projection becomes real root truth and needs ingredient/dish enrichment.

Source contract:
- `XCollectionManager` belongs to `/xs` root/public browse surfaces.
- Consumers mount `XCollectionManager` directly with no source params.
- The manager fetches its own public/root collection and may hydrate internally.
- Scoped pages use named scoped surfaces and may reuse smaller `XCards*` pieces.

Card handoff contract:
- `XCollectionManager` maps records through `useXInterface()`.
- `XCollectionManager` computes `linkEnabled = computed(() => props.link !== false)`.
- `XCollectionManager` passes cards into `XCardsPill` and `XCardsCell` with `v-bind="card"` plus `:link="linkEnabled"`.
- `XCardsPill` and `XCardsCell` receive direct card fields, not a wrapped `card` prop.
- `XCardsPill` and `XCardsCell` render real `<NuxtLink>` branches when `link && to`; action-only usage is the local delta.

Debug contract:
- Collection manager debug should separate `objects` from `derived`.
- `objects` means fetched/API/hydrated collection rows as the manager receives them.
- `derived` means interface cards, filters, counts, selected variant, links, and other UI state.
- Do not mix stored/public surface fields with `useXInterface()` card output in one flat JSON array.

Current source-mode snapshot:
- Root index manager today: `App`, `Ecosystem`, `User`, `Project`, `Kitchen`, `Menu`, `Place`, `Portfolio`, `Property`, `Supplier`, `Blog`, `Company`, `Job`, `Product`, `Ingredient`, `Agent`, `Professional`, `Chef`.
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
- Hydration should usually live in `useXCollection()`, a public API endpoint, or a dedicated fetch seam.
- The Vue manager should avoid manual per-row document reads when a composable/API can return a hydrated surface.

Guard-backed lock:
- `scripts/guards/canon.mjs` now blocks new `collection` props on `*/Collection/Manager.vue`.
- Do not add exceptions just to make a local feature pass.
- If a scoped page wants a passed collection, stop and name the missing scoped surface.

Root Simple Collection Managers

| Manager | Hydration source | Direction | Current note |
| --- | --- | --- | --- |
| `App` | None in manager | Self | Root index manager fetches apps. |
| `Ecosystem` | None in manager | Self | Root index manager fetches ecosystems. |
| `User` | None in manager | Self | Root index manager fetches users. |
| `Blog` | None in manager | Self | Root index manager fetches blog posts. |
| `Place` | None in manager | Self | Root index manager fetches places; Place is often the hydration source for others. |
| `Product` | None in manager | Self | Root index manager fetches products; often a hydration source for supplier/kitchen items. |
| `Ingredient` | None in root manager | Self | Root index manager fetches ingredients; often a hydration source for local usage records. |

Root Hydrated Collection Managers

| Manager | Hydration source | Direction | Current note |
| --- | --- | --- | --- |
| `Kitchen` | Place by `place_id` | Up | Implemented in `useKitchenCollection()`. |
| `Menu` | User creator, Kitchen, owner App, scoped Kitchen Menu | Side, up, down | Implemented through public menu API/default collection. |
| `Project` | App/Ecosystem/runtime project surface | Side/overlay | Default collection exists; exact enrichment to confirm. |
| `Company` | Place by id | Up | Implemented in `useCompanyFetch()`. |
| `Job` | Kitchen/workplace by `workplace_id` | Side/up | Implemented in `useJobCollection()`. |
| `Supplier` | App-scoped supplier overlay; future Company link | Overlay/side | Default collection exists. |
| `Portfolio` | App-scoped portfolio overlay | Overlay | Default collection exists. |
| `Property` | App-scoped property overlay | Overlay | Default collection exists. |
| `Chef` | User/profile collection | Side | Root index manager fetches hydrated profile rows. |
| `Agent` | User/profile collection | Side | Root index manager fetches hydrated profile rows. |
| `Professional` | User/profile collection | Side | Root index manager fetches hydrated profile rows. |

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
- Which hydration is too expensive for client-side collection reads?
- Which hydrated labels should be denormalized onto public/root documents instead?
- Should expensive hydration happen through server APIs rather than Firestore client collection managers?
- Does “hydration” need separate names for up, down, side, and overlay reads?
