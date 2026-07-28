# Demo World and Demo Data spine map
Updated: 2026-07-28
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
- Demo has no universal `Place` top level. Its top-level target is the entity
  selected by the current Console, and every linked root/support record follows
  that owning family's declaration. Console adapters filter scenarios by their
  declared App before projection; a tenant or sibling App never receives
  another App's fixtures.
- Project, Portfolio, and Blank have no direct Place relationship. Kitchen
  requires Place. Supplier reaches location only through
  `Supplier.company_id -> Company`, where Company and its canonical Place have
  the same id. Property directly references a sparse canonical Place through
  `place_id`.
- Every Kitchen Demo target includes one same-id access-only AppKitchen fixture
  and one linked Demo Place. Demo Kitchen roots never duplicate Place media or
  location presentation, and their App scope names the same parent App as that
  support fixture. Each target also derives the same exact bounded
  `PublicPlaceProjection` key set as the Live Place collection without
  flattening its full Demo Place root. Writable Test Kitchen creation
  atomically creates the equivalent Kitchen, Test Place, and App support pair
  in the simulation database.
- Supplier Demo targets pair the Supplier root with same-id access-only
  `AppSupplier` support, link an independently identified Company through
  `company_id`, and keep Ingredients, Items, and Catalogues Supplier-owned.
  Each linked Company is a stamps-only role root paired with its same-id sparse
  Place; Supplier never gains a duplicate `place_id`. SupplierItem-to-Product
  roots remain unresolved and are not manufactured by Demo.
- Portfolio Demo targets pair a Portfolio root with same-id access-only
  `AppPortfolio` support. Property Demo targets pair the Property root with
  same-id access-only `AppProperty` support and its linked sparse residential
  Place root; an optional `portfolio_id` must resolve inside the same scenario.
  BuenoHost's standalone Demo Property therefore has no invented Portfolio,
  while Granite's Property resolves its real Demo Portfolio relationship.
  Portfolio has neither a direct Place nor a Company relationship today;
  `owner_label` is not a Company reference.
- Blank Demo is the minimal same-id `Blank` + access-only `AppBlank` pair. It
  has no Place, operations, or Test producer. Project Demo is the control-plane
  exception: `Project`, `App`, and `Ecosystem` are model-shaped roots linked by
  ids, and Project has no App-support entity.
- Reservation Demo records are Property-scoped and must reconcile their parent
  Property id, App stamp, dates, status, currency, and non-overlapping stay
  lifecycle. They do not turn Property estimated values into rent or Finance
  events.
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
- A Kitchen Demo scenario owns Kitchen-shaped team records with stable member
  IDs. Operator audit stamps and Finance transaction closers reference those
  IDs; Console Team and Finance resolve presentation names from the same
  selected-Kitchen scenario rather than copying local operator strings. Demo
  team/operator access uses a separate read-only `AppKitchen`-shaped support
  fixture composed into the selected-Kitchen surface; those ids do not leak
  onto the canonical Kitchen root or create Live membership.
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
- Each independently loaded project Product Demo surface has one named adapter
  at `app/composables/product-demo/use*ProductDemo.ts`. The adapter declares a
  unique `productDemoSurface` and `productDemoDataSource = 'demo'`, dynamically
  composes only its project's fixtures and Demo Worlds owned by packages the
  project consumes, and never imports another project's Demo World.
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
  Deanos historical completed Orders live under dated Kitchen-owned Services
  in `operations/Orders/history.ts`. Every Order keeps stable source identity,
  a service-local sequence and operator-facing number, placed/completed
  timestamps in `Europe/Zurich`, canonical Menu-item pricing, item detail, and
  the stable Team-member id that closed it. The Orders operation exposes the
  three most recent completed rows from that same source; their ids, numbers,
  channels, items, pricing, service identity, and Team closers are not copied.
  Finance projects one incoming transaction per completed Order and preserves
  its source id, service, placed/occurred timestamps, signed CHF minor amount,
  counterparty, summary, status, closer, and inspectable line detail.
  Composition validates the one-to-one relationship and exact arithmetic
  before any Console or Product Demo consumes it. These rows are not
  `KitchenSale` records, FinancialFacts, Firestore documents, or customer
  history.
  Stations projects the same ordered `KitchenStation` records. Kitchen
  Suppliers resolves Kitchen-owned usage links through a Kitchen-owned pure
  adapter into Supplier-owned identity and coverage. Tables projects only the
  Kitchen's configured count unless real owner-local Table Tab records are
  explicitly added. A Product Demo may expose the separate Kitchen Finance
  report from its completed-Order projection through the shared Kitchen
  projector. The dated transaction rows derive reconciled daily aggregates,
  current/prior period totals, item rollups, calendar days, grouped trend
  points, selected-day detail, and sales-only insights, but Finance does not
  enter the operation catalogue or create Sales or FinancialFacts. Supplier
  deliveries/invoices, staff pay, recurring rent, refunds, expenses, wages,
  VAT, labour, cashflow, profit, and P&L remain absent until their owning
  domains expose real dated producers.
  Product
  adapters must not repeat Menu, Spec, Supplier, production, or Finance joins.
  The derived adapter rejects duplicate or incomplete identity coverage,
  unresolved requirements, unsafe minor-unit arithmetic, and incoherent
  percentages through the shared Kitchen estimator. Dish-level sold quantities
  are derived from the same completed Orders and stay sparse for Dishes with no
  completed sales. Product Demo derives any displayed Dish sales total from
  that quantity and the estimator's resolved selling price; it does not create
  a second local sales fixture or read Live Orders or Sales.
- Product Demo proof such as Misebox PowerCards receives one typed,
  discriminated projection from its named surface adapter. A Demo orbit is
  network-free and may include only owner-local Demo records and pure
  projections; it cannot hydrate canonical Live roots or fall back to Live
  records. Misebox therefore keeps canonical Ingredient hydration in its
  Console/showroom Product Demo and excludes Ingredient-dependent Cards from
  the Demo-only orbit. Presentation components must not carry their own Deanos
  Kitchen, Menu, Dish, Recipe, Mise, Supplier, or item fixtures.
- Public Product Demo pages occupy the reserved `app/pages/demo` route family.
  They remain thin route compositions and consume the named adapter; they do
  not import fixture modules directly or become a second data authority.
- Demo World is read-only. Fixture modules do not depend on Firestore, Storage,
  Firebase Admin, server code, public adapters, or mutation code. Consumer
  adapters may hydrate explicitly linked shared roots through their bounded
  public read projection; arbitrary runtime imports remain forbidden.
- Test and simulation sources remain separate because they are allowed to
  exercise writes. Dev fixtures remain with authenticated dev tooling.
- Kitchen is the current source-backed writable Test family. Supplier,
  Portfolio, and Property Test sources fail closed until an atomic
  simulation-database producer exists for each family's canonical root/support
  contract; the retired default-database `test-*` collections are not valid
  Test authority. Project's dev-only Test read is unseeded, and Blank declares
  no Test mode.
- Tasks, Compliance, Documents, and DocumentLinks currently have no owner-local
  Demo records. Their Portfolio operation adapters still contain disconnected
  scenario-field compatibility shims and must not be described as Demo
  capability; remove those shims or add full owner-local model fixtures in a
  separately owned change.
- Company Demo roots exist only where another Demo relationship needs them.
  They remain stamps-only same-id roles over sparse canonical Place roots and
  never copy Place identity. Current Supplier Demo uses that relationship;
  Portfolio does not.

## Authority and refresh

- Entity models, DTOs, and console adapters define current shapes.
- `scripts/guards/demo-data.mjs` enforces location, deferred loading, consumer,
  ownership, and dependency boundaries and executes Kitchen, Company, Supplier,
  Portfolio/Property, Reservation, Blank, and Project scenario composition so
  relationship and arithmetic validators fail closed. Misebox Product Demo
  additionally proves every Supplier Company id resolves to a same-id Company
  and Place pair.
- Refresh fixtures in the same change when a real shape used by Demo changes.

## Verification

- Run the Demo Data guard through `pnpm guard`.
- Typecheck every owning package or app whose fixtures or adapters changed.
- Verify an inactive console reports `idle` and does not invoke its loader.
- Verify a Product Demo's fictional records remain deterministic and perform
  no live operational, test, or simulation storage work. Verify any canonical
  root hydration is bounded to the stable IDs present in those records.
