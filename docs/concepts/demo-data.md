# Demo World and Demo Data spine map
Updated: 2026-07-26
Ref: 796952bf0
Role: map, not canon

## Purpose

Map the deterministic read-only Demo records and their two named consumers:
Console Demo Data and a project's public Product Demo. Shared canonical roots
remain real data even when a Demo record links to them.

## Vertical links

- Parent: console.md
- Child: firestore-entity.md

## Horizontal links

- entities.md
- debug.md
- runtime-package.md

## Current contract

- Demo World is scenario data, not canonical storage, live public-content
  authority, dev preview content, test data, or simulation data.
- A fixture follows the current real entity/record shapes. Real models and
  adapters are authority; the application must never bend around a fixture.
- Demo aggregation follows the owning domain's operation vocabulary. In
  Kitchens that means Menu, Dish, Recipe, Mise, Ingredient usage links, and
  Kitchen-owned Supplier links. Supplier Ingredient coverage, priced Item
  offers, and `Catalogue` remain Supplier-owned and must not become Kitchen
  fixture or scenario concepts.
- Ingredient identity is never Demo data. Kitchen and Supplier Demo records
  store only stable `ingredient_id` references; names, aliases, taxonomy,
  lifecycle, parents, and images hydrate from the real canonical
  `/ingredients/{ingredientId}` authority through the bounded public
  projection. A Demo fixture must not copy or locally decorate those roots.
- The Kitchen Demo World may prove a production graph ahead of persisted model
  promotion: a Kitchen-scoped Dish Spec consumes measured root Ingredients,
  stable Prep items, or Recipes; a Menu selects the Dish; and dated Mise tasks
  produce the required Prep item or Recipe. Mise is work, not a fourth Dish
  component kind. Menu-item variants and add-ons own their component deltas
  instead of changing the Dish base Spec.
- Demo Menu publication and operational service availability are separate.
  The package-owned pure cascade at
  `runtime/utils/kitchen/demo-menu-cascade.ts` projects Menu provenance through
  Dish Specs, Menu-item deltas, Prep items, Recipes, root Ingredient links, and
  Mise candidates without mutating any record. Shared dependencies remain
  required while at least one in-service Menu uses them. Deanos' owner-local
  summer defaults are Main `on`, Party `order_led`, and Xmas `off`.
- Console Demo and Product Demo may share local route-stable Menu service
  selection through the Kitchen-owned Demo composable. That selection is a
  read-only demonstration control: it filters operational Mise and marks
  inactive-only Dishes, Recipes, and Ingredients for presentation, but it
  never becomes fixture truth, publication state, Firestore, or local storage.
- `KitchenMiseTask.workflow_stage` is the chef-facing work order: Wash & clean,
  Cut & portion, Make, Cook & chill, Set stations, then Final checks. Status,
  priority, station, Menu provenance, and checklist completion remain separate.
  Missing legacy stages stay visible as Unsorted rather than receiving an
  invented default.
- This Demo production graph remains an explicit working seam, not storage
  canon. Promote it only after the model, collection, Rules, adapter, and guard
  contract have been agreed together.
- Reusable fixtures live with their package under `src/runtime/demo`.
- App-only fixtures live with their project under `app/demo`.
- A mature Demo owner keeps shared identity/types under `core/`, operation
  records under `operations/<ExactConsoleOperation>/`, and derived guest or
  showroom projections under optional `presentation/`. Root `scenarios.ts`
  composes and validates those owner-local seams; it does not become a second
  fixture graph.
- Operation folders are capability-shaped, not parity placeholders. Add an
  exact operation folder only when it owns real records; do not create empty
  folders merely to make unrelated owners or scenarios look symmetrical.
- An owning Console composable adapter loads fixtures with a dynamic import and
  `useConsoleDemoData`; inactive Consoles do not import or evaluate them.
- Every Console core that accepts the shared Demo source owns a matching lazy
  Demo adapter. Demo targets use the same selected-target and outcome spine as
  Live targets, and operation records remain scoped to their selected Demo
  parent rather than falling through to an empty or remote collection.
- Selecting Demo deactivates selected Live target and operation providers
  before they can issue a request. The Kitchen Console index may retain its
  bounded authenticated Live target chooser so the user can leave Demo without
  losing sight of their Kitchens; that navigation read does not activate a
  selected Live Kitchen or its operations. The other narrow exception is a
  bounded public projection read required to hydrate a shared canonical root
  explicitly referenced by a Demo operation record, currently Ingredient.
  This is reference hydration, not a Live operation provider or a second Demo
  identity source.
- `useConsoleDemoData` caches a successful local load and exposes
  `idle`, `pending`, `error`, `empty`, or `ready` without remote work.
- A project Product Demo has one named adapter at
  `app/composables/product-demo/use*ProductDemo.ts`. That adapter dynamically
  composes only its project's fixtures and Demo Worlds owned by packages the
  project consumes. It never imports another project's Demo World.
- When a Product Demo promises a complete derived projection for every
  represented fixture, its adapter validates that projection fail-closed at
  composition time. Canonical Demo Dish records use a deterministic
  file-backed collection provider and pass through the same `normalizeDish`
  and collection-state contract as Live Firestore records. The provider swap
  does not create a second Dish model or downstream Console collection shape.
  The still-unpromoted Spec, Prep, Recipe, Mise-requirement, and Finance graph
  remains isolated behind the existing derived adapter until those record
  models are explicitly agreed; it is not canonical Dish storage. Product
  Demo operation-level Mise instead projects the owner-local
  `KitchenMiseTask` records used by the real Console through the Kitchen-owned
  summary projector and exposes them as `console.miseTasks`; it does not
  present that derived requirement graph as a task collection. Menu service
  provenance may be derived from each task's linked Prep item, Recipe, or
  Ingredient and included in the presentation DTO so the consumer can filter
  tasks without rebuilding the production graph.
  Product Demo operation-level Orders projects the selected Console scenario's
  canonical `KitchenOrder` fixtures as `console.orders`, derives board rails
  from the shared lifecycle helper, and remains read-only.
  Stations projects the same ordered `KitchenStation` records. Kitchen
  Suppliers resolves Kitchen-owned usage links through a Kitchen-owned pure
  adapter into Supplier-owned identity and coverage. Tables projects only the
  Kitchen's configured count unless real owner-local Table Tab records are
  explicitly added. A Product Demo may expose the separate Kitchen Finance
  report from its aggregate-only owner-local fixture through the shared
  Kitchen projector. One deterministic daily aggregate series may derive
  reconciled current/prior period totals, item rollups, calendar days, grouped
  trend points, selected-day detail, and sales-only insights, but Finance does
  not enter the operation catalogue or create Sales and FinancialFacts.
  Product
  adapters must not repeat Menu, Spec, Supplier, production, or Finance joins.
  The derived adapter rejects duplicate or incomplete identity coverage,
  unresolved requirements, unsafe minor-unit arithmetic, and incoherent
  percentages through the shared Kitchen estimator. Fictional
  Dish-level sales quantities stay in the Kitchen package's owner-local Dishes
  Demo fixture; Product Demo derives total sales from those quantities and the
  estimator's resolved selling price instead of reading Orders or Sales.
- Public Product Demo pages occupy the reserved `app/pages/demo` route family.
  They remain thin route compositions and consume the named adapter; they do
  not import fixture modules directly or become a second data authority.
- Demo World is read-only. Fixture modules do not depend on Firestore, Storage,
  Firebase Admin, server code, public adapters, or mutation code. Consumer
  adapters may hydrate explicitly linked shared roots through their bounded
  public read projection; arbitrary runtime imports remain forbidden.
- Test and simulation sources remain separate because they are allowed to
  exercise writes. Dev fixtures remain with authenticated dev tooling.

## Authority and refresh

- Entity models, DTOs, and console adapters define current shapes.
- `scripts/guards/demo-data.mjs` enforces location, deferred loading, consumer,
  ownership, and dependency boundaries.
- Refresh fixtures in the same change when a real shape used by Demo changes.

## Verification

- Run the Demo Data guard through `pnpm guard`.
- Typecheck every owning package or app whose fixtures or adapters changed.
- Verify an inactive console reports `idle` and does not invoke its loader.
- Verify a Product Demo's fictional records remain deterministic and perform
  no live operational, test, or simulation storage work. Verify any canonical
  root hydration is bounded to the stable IDs present in those records.
