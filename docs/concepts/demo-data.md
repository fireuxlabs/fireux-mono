# Demo World and Demo Data spine map

Updated: 2026-08-22
Ref: da689ed54
Role: map, not canon

## Purpose

Map the deterministic read-only Demo records and their two named consumers:
Workspace Demo Data and a project's Product Demo. Shared canonical roots
remain real data even when a Demo record links to them.

## Vertical links

- Parent: workspace.md
- Child: firestore-entity.md

## Horizontal links

- entities.md
- debug.md
- runtime-package.md

## Current contract

- Demo World is scenario data, not canonical storage, live website-content
  authority, dev preview content, test data, or simulation data.
- A fixture follows the current real entity/record shapes. Real models and
  adapters are authority; the application must never bend around a fixture.
- Demo has no universal `Place` top level. Its top-level target is the entity
  selected by the current Workspace, and every linked root/owned record follows
  that owning family's declaration. Workspace adapters filter scenarios by their
  declared App before projection; a tenant or sibling App never receives
  another App's fixtures.
- Project, Portfolio, and Blank have no direct Place relationship. Kitchen
  requires Place. Supplier reaches location only through
  `Supplier.company_id -> Company`, where Company and its canonical Place have
  the same id. Property directly references a sparse canonical Place through
  `place_id`.
- Every Kitchen Demo target includes root-owned Team fixtures and one linked
  Demo Place. Demo Kitchen roots never duplicate Place media or location
  presentation, and their management relationship names the intended host.
  Each target resolves its linked sparse Place through the
  same canonical `normalizePlace` contract as Live reads. Writable Test Kitchen creation
  atomically creates the equivalent Kitchen, Test Place, and Team authority
  in the simulation database.
- Supplier Demo targets pair the Supplier root with root-owned Team, link an
  independently identified Company through `company_id`, and keep Ingredients,
  Items, and Catalogues Supplier-owned.
  Each linked Company is a stamps-only role root paired with its same-id sparse
  Place; Supplier never gains a duplicate `place_id`. The Supplier owns its
  logo, while the linked Place owns address and location imagery. Demo
  consumers compose the canonical same-id Company/Place relationship at read time:
  a location card prefers the Place image and an avatar prefers the Supplier
  logo, without copying either field across roots. SupplierItem-to-Product
  roots remain unresolved and are not manufactured by Demo.
- Portfolio Demo targets pair a Portfolio root with root-owned Team. Property
  Demo targets pair the Property root with root-owned Team and its linked sparse residential
  Place root; an optional `portfolio_id` must resolve inside the same scenario.
  BuenoHost's standalone Demo Property therefore has no invented Portfolio,
  while Granite's Property resolves its real Demo Portfolio relationship.
  Portfolio has neither a direct Place nor a Company relationship today;
  `owner_label` is not a Company reference.
- Blank Demo is the minimal App-local `Blank` target. It
  has no Place, operations, or Test producer. Project Demo is the control-plane
  exception: `Project`, `App`, and `Ecosystem` are model-shaped roots linked by
  ids, each scenario explicitly names its owning `appId`, and Project Team is
  root-owned.
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
  lifecycle, parents, and images resolve from the real canonical
  `/ingredients/{ingredientId}` authority through the bounded
  projection. A Demo fixture must not copy or locally decorate those roots.
- Firebase Storage is the binary authority for Demo-owned presentation media;
  the media is an immutable HTTPS delivery seam, not domain-record authority.
  The Misebox Demo World stores those objects in
  `misebox-78f9c.appspot.com` under owner-relative
  `demo/misebox-app/{kitchens|suppliers|places}/...` paths. Kitchen and Supplier
  logos stay under their own ids; Place imagery stays under the Place id.
  Fixtures hold fixed HTTPS values and import no Firebase or Storage SDK.
  The explicit-import-only `fireux-demo` extension owns the one cross-domain
  Misebox URL contract; product-specific bucket knowledge does not live in
  FireUX Core or get copied into Kitchen, Supplier, and Company packages.
  Canonical Ingredient images and shared App/brand media never move into this
  Demo prefix merely because a Demo surface displays them. Live-owned media
  stays in its owning Live publication or storage path, never in `demo/`.
- The reviewed Misebox media inventory has 72 unique payload hashes and 78
  owner-relative objects: 62 Kitchen-owned images, three Supplier logos, three
  Supplier-company Place photos, and five Place-owned object identities for
  Deanos presentation fields that reuse reviewed bytes. The repository keeps
  only the exact metadata manifest under the retired operational artifact in Git history:
  72 source descriptors record path, hash, byte count, and MIME type, while 78
  object-to-source mappings preserve each owner identity. It does not mirror
  Demo image binaries. The manual
  the retired operational artifact in Git history workflow audits Storage directly.
  If a reviewed object is absent, its create-only apply reads matching bytes
  from an explicit external directory outside the repository. It is
  replay-safe and rejects any existing object whose bytes, MIME, cache policy,
  checksum metadata, or token differ. It never writes Firestore, overwrites, or
  deletes.
- A Kitchen Demo scenario owns Kitchen-shaped team records with stable member
  IDs. Operator audit stamps and Finance transaction closers reference those
  IDs; Workspace Team and Finance resolve presentation names from the same
  selected-Kitchen scenario rather than copying local operator strings. Demo
  Team access uses root-owned read-only Team fixtures composed into the
  selected-Kitchen surface; those fixtures never create Live membership.
- The Kitchen Demo World may prove a production graph ahead of persisted model
  promotion: a Kitchen-scoped Dish Spec consumes measured root Ingredients,
  stable Prep items, or Recipes; a Menu selects the Dish; and dated Mise tasks
  produce the required Prep item or Recipe. Mise is work, not a fourth Dish
  component kind. Menu-item variants and add-ons own their component deltas
  instead of changing the Dish base Spec.
- Demo Menu publication and operational service availability are separate.
  The Kitchen-owned pure cascade at
  `runtime/kitchen/utils/demo-menu-cascade.ts` projects Menu provenance through
  Dish Specs, Menu-item deltas, Prep items, Recipes, and root Ingredient links
  without mutating any record. Shared dependencies remain
  required while at least one in-service Menu uses them. Deanos' owner-local
  summer defaults are Main `on`, Party `order_led`, and Xmas `off`.
- Workspace Demo and Product Demo may share local route-stable Menu service
  selection through the Kitchen-owned Demo composable. That selection is a
  read-only demonstration control: it marks inactive-only Dishes, Recipes, and
  Ingredients for presentation, but it
  never becomes fixture truth, publication state, Firestore, or local storage.
- This Demo production graph remains an explicit working seam, not storage
  canon. Promote it only after the model, collection, Rules, adapter, and guard
  contract have been agreed together.
- Entity-owned reusable fixtures belong under `src/runtime/<entity>/demo`.
  Kitchen, Supplier, and Project fixtures use that ownership now. Root
  `src/runtime/demo` remains only for genuine cross-entity Demo composition or
  package-owned record families without a declared Entity.
- App-only fixtures live with their project under `app/demo`.
- Within `runtime/<entity>/demo`, a mature Demo owner keeps entity-wide
  identity/types under `core/`, operation records under
  `operations/<ExactWorkspaceOperation>/`, and derived guest or showroom
  projections under optional `presentation/`. Root `scenarios.ts`
  composes and validates those owner-local seams; it does not become a second
  fixture graph.
- Operation folders are capability-shaped, not parity placeholders. Add an
  exact operation folder only when it owns real records; do not create empty
  folders merely to make unrelated owners or scenarios look symmetrical.
- An owning Workspace composable adapter loads fixtures with a dynamic import and
  `useWorkspaceDemoData`; inactive Workspaces do not import or evaluate them.
  Cross-owner fixture loading remains forbidden except for an exact guarded
  relationship already declared by the entity family. Supplier Workspace Demo
  has that narrow exception for its required Company and same-id Place target;
  the shared Supplier projector validates the link before returning a surface.
- Every Workspace core that accepts the shared Demo source owns a matching lazy
  Demo adapter. Demo targets use the same selected-target and outcome spine as
  Live targets, and operation records remain scoped to their selected Demo
  parent rather than falling through to an empty or remote collection.
- Selecting Demo deactivates selected Live target and operation providers
  before they can issue a request. The Kitchen Workspace index may retain its
  bounded authenticated Live target chooser so the user can leave Demo without
  losing sight of their Kitchens; that navigation read does not activate a
  selected Live Kitchen or its operations. The other narrow exception is a
  bounded directory read required to resolve a shared canonical root
  explicitly referenced by a Demo operation record, currently Ingredient.
  This is a bounded reference join, not a Live operation provider or a second Demo
  identity source.
- `useWorkspaceDemoData` caches a successful local load and exposes
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
  does not create a second Dish model or downstream Workspace collection shape.
  The still-unpromoted Spec, Prep, Recipe, and Finance graph
  remains isolated behind the existing derived adapter until those record
  models are explicitly agreed; it is not canonical Dish storage.
  Product Demo operation-level Orders projects the selected Workspace scenario's
  canonical `KitchenOrder` fixtures as `workspace.orders`, derives board rails
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
  before any Workspace or Product Demo consumes it. These rows are not
  `KitchenSale` records, FinancialFacts, Firestore documents, or customer
  history.
  Stations projects the same ordered `KitchenStation` records. Kitchen
  Suppliers resolves Kitchen-owned usage links through a Kitchen-owned pure
  adapter into Supplier-owned identity and coverage. A Demo fixture may retain
  the Kitchen's configured table count as Front-of-House boundary context, but
  Tables is not projected as a Kitchen capability. A Product Demo may expose
  the separate Kitchen Sales report from its completed-Order projection through
  the shared Kitchen
  projector. The dated transaction rows derive reconciled daily aggregates,
  current/prior period totals, item rollups, calendar days, grouped trend
  points, selected-day detail, and sales-only insights. Sales is a Kitchen
  Report, but its projection does not create Sales or
  FinancialFacts. Supplier
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
  network-free for data and may include only owner-local Demo records and pure
  projections; declared immutable HTTPS image requests are presentation
  delivery, not a data join. It cannot resolve canonical Live roots or fall
  back to Live records. Misebox therefore keeps canonical Ingredient resolution
  in its Workspace/showroom Product Demo and excludes Ingredient-dependent Cards
  from the Demo-only orbit. Presentation components must not carry their own
  Deanos Kitchen, Menu, Dish, Recipe, Mise, Supplier, or item fixtures.
- Product Demo pages occupy the reserved `app/pages/demo` route family.
  They remain thin route compositions and consume the named adapter; they do
  not import fixture modules directly or become a second data authority.
- Demo World is read-only. Fixture modules do not depend on Firestore, Firebase
  Admin, Storage SDK/API code, server code, directory adapters, or mutation code.
  A guarded fixed HTTPS Demo media URL may be a normal model field
  value; it does not grant fixtures runtime Storage authority. Consumer
  adapters may resolve explicitly linked shared roots through their bounded
  bounded read response; arbitrary runtime imports remain forbidden.
- Test and simulation sources remain separate because they are allowed to
  exercise writes. Dev fixtures remain with authenticated dev tooling.
- Kitchen is the current source-backed writable Test family. Supplier,
  Portfolio, and Property Test sources fail closed until an atomic
  simulation-database producer exists for each family's canonical root/Team
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

- Entity models, DTOs, and workspace adapters define current shapes.
- the retired operational artifact in Git history enforces location, deferred loading, consumer,
  ownership, and dependency boundaries and executes Kitchen, Company, Supplier,
  Portfolio/Property, Reservation, Blank, and Project scenario composition so
  relationship and arithmetic validators fail closed. Misebox Product Demo
  additionally proves every Supplier Company id resolves to a same-id Company
  and Place projection. The same offline guard executes all image-bearing
  Kitchen, Dish, Supplier, and Place fixtures and requires 75 field occurrences
  to resolve to the exact 73 owner-relative Misebox Demo media objects declared
  by the Storage-authoritative manifest with 68 unique payload hashes. It also
  rejects repository-local Demo image binaries and does not contact Storage
  during normal guards.
- Refresh fixtures in the same change when a real shape used by Demo changes.

## Verification

- Run the Demo Data guard through `pnpm guard`.
- For a remote media audit, run
  `node scripts/publish-misebox-demo-media.mjs --project misebox-78f9c
--database misebox --bucket misebox-78f9c.appspot.com` without `--apply`;
  every reviewed object must plan as exact reuse with no create, blocker, or
  unexpected prefix object. If creates are planned, rerun the read-only audit
  with an absolute external `--source-directory` to validate all required
  source bytes before reviewing any apply hashes.
- Typecheck every owning package or app whose fixtures or adapters changed.
- Verify an inactive workspace reports `idle` and does not invoke its loader.
- Verify a Product Demo's fictional records remain deterministic and perform
  no live operational, test, or simulation storage work. Verify any canonical
  root join is bounded to the stable IDs present in those records.
