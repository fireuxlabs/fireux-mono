# Console

Updated: 2026-08-19
Ref: e23268507
Role: map, not canon

## Purpose

Map the shared console system and domain adapters.

## Vertical links

- Parent: app-config.md
- Child: family-console-entity.md
- Child: family-tenant-global.md
- Child: family-like-menu.md

## Horizontal links

- composables.md
- components.md
- pages.md
- debug.md
- demo-data.md
- runtime-filesystem.md

## Shared core

- `useConsole`
- `useConsoleAccess`
- `useConsoleEntityRuntime`
- `useConsoleDemoData`
- `useConsoleTargets`
- `useConsoleTargetRequest`
- `useConsoleFamilyRuntime`
- `useConsoleIndex`
- `ConsoleSelectedTarget`
- `ConsoleTargetCollection`
- `useConsoleOverview`
- `useConsoleSelection`
- `useConsoleTeam`

Console is a shared surface and selected-workspace runtime, not an entity
owner. Shared Console shells, navigation, selection, and outcome primitives
remain in the root technical spine. Kitchen, Supplier, Project, and other
entity-specific Console adapters belong beneath their entity roots according
to `runtime-filesystem.md`. Nuxt pages and API handlers retain their framework
paths and delegate inward.

## Page surface vocabulary

- `browse`: an operation collection or operational summary at `/<operation>`.
- `detail`: one record at `/<operation>/[recordId]`.
- `create`: a form at `/<operation>/create`.
- `edit`: a record form at `/<operation>/[recordId]/edit`, or persistent operation settings at `/<operation>/edit`.
- `workflow`: a resumable process at `/<operation>/workflows/<name>/[runId?]`.
- `live`: a real-time command surface at the operation root; it may use an immersive domain layout.

## Shared page rules

- The page has one real root DOM element for the shared Nuxt page transition,
  then directly composes `UDashboardPanel`, `LayoutsConsoleNavbar`, a header
  slot, and a body slot inside it. Do not hide that route shell in a generic
  component.
- Console routes disable the global `out-in` page transition so the persistent
  Console layout and family runtime remain responsive while route content
  changes.
- The Console layout does not key its content boundary by the full route.
  Established Firebase authentication is read synchronously during navigation;
  an auth observer is reserved for initial hydration when no current User is
  available yet.
- In the shared `UDashboardGroup` flex layout, the neutral route wrapper uses
  `flex min-h-full min-w-0 flex-1`; a bare block wrapper can stop
  `UDashboardPanel` from filling the remaining Console width.
- The page owns high-level width and spacing. Family indexes may stay full width; simple forms may use `panels-narrow`; named domain components own their internal presentation.
- Back navigation and page-level actions stay in the navbar right slot.
- The selected-workspace menu follows one structural order: Overview,
  Identity, the family's top-level Operations, then Team when that family has
  a real collaboration lifecycle. Hand-authored route order does not redefine
  those groups. AI belongs at a product-owned doorway or inside a bounded
  Operation; it is not a generic Console navigation family.
- Every Console Entity owns its AI capability definition beside its Entity
  models. The ecosystem composes and registers that definition with FireUX AI;
  Core does not depend on the AI extension. Tools and execution remain optional
  named capabilities, so the baseline does not manufacture empty AI routes.
  There is no generic Console Agent route.
- Create belongs to the target selector lifecycle at `/console/{family}`. A
  create route may remain as the selector's action target, but it never appears
  in selected-workspace navigation.
- A capability used inside an Operation, such as Menu QR, remains a child tool
  instead of becoming another top-level Operation. Identity-owned QR belongs
  with Identity. Development routes are hidden, unavailable outside a
  development build, and restricted to the configured developer.
- An operation browse page may place one proven primary operation action, such
  as a dedicated create-route doorway, in the secondary
  `UDashboardToolbar` right slot. Scope, filters, views, and board-wide
  controls belong on the toolbar left. Record actions remain with their
  collection row, card, or detail surface.
- Do not render bespoke body cards, generic tool menus, or disabled future
  actions for a single operation doorway. Omit the action until its producer
  and authority contract exist.
- Create and edit share form behavior. Small primitives such as `ConsoleFormActions` may standardize Save, Cancel, pending, disabled, and status treatment without owning the page.
- New and adopted route access visibility and selection requirements live at top-level page meta; navigation metadata only describes navigation presentation.
- Authentication and role requirements also live at top-level page meta; `nav` must not become a second access contract.
- Direct Console pages require authentication by default. A browse-only route
  may declare `consoleAccess: 'public-entry'` and `requiresAuth: false` only
  when it also declares `requiresSelection: false`; its anonymous composition
  must not mount protected entity reads or commands. The Console page guard
  enforces this named exception.
- A route opts into only the surfaces its operation needs. A live Orders board does not imply an Orders edit page.
- Route pages stay thin. Domain components own data, permissions, states, and mutations.
- A Console landing or Operation composes three named domain sheets when each
  responsibility exists: `Tools`, contextual `AI`, then the focused domain
  `View`. The route spells out that composition, while one page-provided
  workspace supplies shared target, authority, records, and outcomes to every
  sheet. A sheet with no real job is omitted; empty Views do not manufacture
  dashboard cards merely to occupy space.
- Core Console navigation exposes a neutral right slot and has no knowledge of
  AI. An AI-enabled Operation may compose FireUX AI presentation into that slot
  or render a bounded contextual AI sheet in its body. FireUX AI owns prompt
  placeholders, tool discovery, suggestions, and execution presentation;
  domain Operations own the capabilities and context supplied to it.
- Overview navigation cards do not initialize child operation workspaces to
  calculate counts. A future count belongs to one bounded overview summary;
  each operation loads its records only when its own route opens.
- Adopted routes can declare `consoleSurface`; edit routes declare `edit` and live routes declare `live`.
- The console-pages guard enforces the real DOM root plus the explicit
  panel/navbar/body contract for visible leaf pages. Redirects, nested routers,
  and live layouts are exempt only from the panel shell; every rendered page
  using the shared transition still needs the real root. Only an explicit,
  justified `pageTransition: false` route is exempt from that root check. The
  guard does not constrain body geometry.
- The console-indexes guard separately enforces the shared selected → targets
  index rhythm, clear wiring, `useConsoleIndex` adapter, and shared selected and
  target-state presentation seams.
- Tables is the first operation-level edit reference: `/console/kitchen/tables` and `/console/kitchen/tables/edit`.

## Allowed domain buckets

- `core`
- `index`
- `overview`
- `identity`
- `team`
- `operations`
- `sundries`

## Source-backed capability map

The visible Console tree is the naming authority for entity server and client
slices. `Index` is the selection and Create doorway; Create is not a selected
workspace peer.

Every Console bakes in Index, Overview, Identity, Team, and Notifications.
Permissions govern those capabilities and every Operation; they are authority,
not another navigation page. Notifications belongs to the shared shell rather
than an Entity component bucket.

| Entity    | Operations                                                                                      |
| --------- | ----------------------------------------------------------------------------------------------- |
| Project   | Apps, Ecosystem                                                                                 |
| Kitchen   | Dishes, Drinks, Ingredients, Menus, Mise, Orders, Recipes, Stations, Suppliers, Tables, Finance |
| Supplier  | Catalogue, Ingredients, Items                                                                   |
| Portfolio | Properties, Compliance, Documents, Tasks, Finance                                               |
| Property  | Reservations, Calendar                                                                          |
| Blank     | —                                                                                               |

Ignition is separate Project intake/admin, not a Project Operation. A missing
server folder is valid when a visible capability has no server-owned
behaviour; the map does not require empty symmetry.

## Component bucket shape

- Every Console Entity carries Overview, Identity, and Team beside its Index.
  Project and Blank may expose factual read-only Team authority without
  manufacturing domain membership tools.
- A bucket may own an `Index.vue` entry when the folder itself is the component rendered by a page.
- Do not mix an entity's `Console/Overview.vue` with `Console/Overview/*`; use
  `runtime/<entity>/components/Console/Overview/Index.vue`.
- `Team` always sits beside `Operations`; richer membership workflows remain
  optional domain-owned behaviour.
- `Operations` is for selected-target work and may contain domain-specific child folders.
- `Sundries` is a temporary quarantine for parked, loose, or underdeveloped console surfaces that are not yet core sheets or confirmed operations.

## Index pattern

- Page renders `ConsoleXIndex`.
- Only the genuine Console Entity Index capability uses the named doorway
  `runtime/<entity>/components/Console/Index.vue`: it owns selection, creation entry, and target-list
  presentation. Supporting selected-target and target-collection components
  may live under the entity's `components/Console/Index/*`. This does not authorize `Index.vue` as a
  generic directory-entry trick for AI, shells, controllers, collections, or
  other capabilities; name those jobs directly. Do not use the opaque repeated
  `Index/Index.vue` entry.
- `ConsoleXIndex` renders selected and targets sections.
- `useXConsoleIndex` adapts domain data into shared `useConsoleIndex`.
- `useXConsole` owns target candidate resolution, the authoritative collection
  outcome, and selection validity. Index and overview composables consume that
  core result; they do not call `useConsoleTargets` again or overlay another
  membership outcome.
- `useXConsole` resolves through `useConsoleFamilyRuntime`, which creates one
  family runtime per Nuxt App request/client instance. Selector, Overview,
  Identity, Team, and Operations consume that same object; repeated composable
  calls must not recreate target reads, selection watchers, or entity runtime.
- Named selected wrappers map domain identity into `ConsoleSelectedTarget`;
  Core owns the selected/empty card anatomy and Clear action presentation, and
  the family index forwards `actions.clear`. A family may project its existing
  entity card through the shared selected-content slot; it must not replace the
  shared empty state or Clear behavior.
- Tenant apps can auto-select a single persisted authorized target.
- Authority-proven single targets are committed inside the family runtime;
  index adapters never add a second auto-selection path.
- Every Live App sources target relationships and operator/team access from
  the owning entity family's persisted App-support records. AppUser does not
  carry Console target IDs.
- Every family loads its authenticated chooser candidates through
  `/api/console/{family}/targets`. Core owns the App-, family-, and User-scoped
  request lifecycle; the family endpoint owns authority and the family core
  maps the returned IDs or projections into domain cards. Project retains its
  private control-plane authority, and Kitchen retains its richer joined
  projection, without forking the request contract.
- Target adapters must pass the collection `outcome` through `useConsoleIndex`;
  it is the sole target-state authority, with no count or pending fallback.
  Named `ConsoleXIndexTargets` wrappers require that outcome and use
  `ConsoleTargetCollection` for pending, error, cards, then settled empty;
  counts are not authoritative while a read is unsettled.
- An `idle` source renders no target chooser; idle is neither loading nor empty.
- Target wrappers must not add an `isMounted`, local pending flag, or direct
  state card in front of that outcome. Multi-source families render one shared
  target presenter per source from the first paint.
- Domain wrappers retain entity-to-card mapping, selection validation, copy,
  card components, and actions. A multi-source family such as Kitchen composes
  one shared target presenter per source rather than flattening source state.
- The Kitchen index keeps its bounded authenticated Live target chooser and
  lazy Demo target chooser available together, even while a Demo Kitchen is
  selected. This is a navigation exception only: selected Live target and
  operation providers remain inactive in Demo mode.
- Persisted selection is validated only against a successful target read.
  Pending or failed target reads must not clear a saved selection.
- Selected-target routes distinguish the persisted selection from the loaded
  target. The persisted family selection ID decides whether a target is selected; the asynchronously
  loaded target object decides whether target content is ready. A missing
  object while an ID exists is a loading state, never a false "select first"
  empty state.
- A Console family has one App-and-family-keyed reactive source state shared by every
  composable instance. Its cookie is persistence, not a second live source
  authority; source changes update both together so source-aware selection
  cannot race between `live`, `demo`, and `test`.
- Global target adapters compose AppUser membership pending/error with the
  collection outcome. Membership failure is `error`, never an empty target list.
- Entity App-support operator/team records bound live reads. Exact
  root and same-id App-support reads must fail the complete outcome on a missing
  half, wrong management host, malformed support authority, or unauthorized indexed
  id; they never leave an unused full-root listener behind client filtering.
- Kitchen live targets use the canonical authenticated
  `/api/console/kitchen/targets`
  projection. The fixed-runtime server derives candidate IDs, exact-loads and
  authorizes every canonical root/App-support/Place join, and the selected live
  Kitchen reuses that projected root instead of starting a second raw browser
  query. Its response is the sole live target outcome: do not overlay a second
  browser AppUser target read, and share the keyed request across selected/index
  consumers. Missing pairs and scope drift remain errors, never partial target
  lists.
- Demo target adapters use `useConsoleDemoData` and a dynamic import. The
  loader stays untouched while inactive, successful local data is cached, and
  its explicit `idle`, `pending`, `error`, `empty`, or `ready` outcome feeds the
  same index contract as a live read.

## Production onboarding

- A root/App-support console family creates or attaches through its own
  fixed-runtime authenticated server endpoint. The caller cannot choose the
  App, database, collection path, or App-support id.
- One Firestore transaction owns root management, same-id complete App support,
  and caller operator/team authority. Missing or conflicting halves fail before a
  partial chooser row can be created.
- `operator_ids` is mutation authority. `team_ids` is target/read membership,
  not write authority. Current App admins remain the explicit administrative
  override; UI `canWrite` still does not replace server or Rules enforcement.
- Kitchen is the Place-backed reference with a server-projected live outcome
  and a separate lazy Demo outcome. Supplier, Portfolio, and Property retain
  domain-owned root payloads and strict pair readers. Blank is the app-local
  minimal harness. Project deliberately remains a read-only control-plane
  family and has no root/App-support onboarding.
- Console-capable roots use `management.mode`: `root` has no Console host;
  `console` uses the ecosystem App by convention; `app` names its
  dedicated Console App with `app_id`. Core resolves this vocabulary without
  enumerating domain families.

## Operations

- Operations are child surfaces inside a selected console target.
- Identity and Team are first-class Console peer capabilities, not Operations.
  Overview, Index/Create, dev tooling, and child/detail routes are also not
  Operations. A selected-target report such as Kitchen Finance is an Operation
  when it has its own operational workspace.
- An Entity `models/operations.ts` catalogue contains only entity-specific
  selected-target Operations. Landing, discovery, and operation AI consumers
  may use that list without accidentally publishing baked-in Console
  capabilities as Operations.
- Operations must not leak into Firestore entity root folders.
- Operation-AI presentation belongs to FireUX AI. Core supplies only neutral
  Console composition slots, while each Entity Operation explicitly decides
  whether and where to compose the AI surface. AI presentation does not belong
  in Core, an Entity domain, or a generic `utils` folder.
- Operation browse families must name their visible jobs rather than relying on
  folder symmetry alone. The `like-menu` family is the records-then-tools
  reference for collection-led operations.
- A `like-menu` browse entry owns create and collection read. Its child detail
  route owns inspect, update, and delete. Self-explanatory lists and the single
  create action may be visually unframed while retaining named semantic
  sections. The domain owns their contents and authority.
- Large creation, review, QR, configuration, and live workflows use dedicated
  routes. A collapsed write lane is only for a genuinely small action on an
  operation that has not adopted the `like-menu` family.
- Persistent operation settings use the operation-level edit route and `consoleSurface: 'edit'`; do not hide configuration inside a browse-page dropdown.
- `Read.vue` lists current records and must retain an explicit path to detail
  when the operation owns record identity. A dense browse surface may open a
  read-only quick look first when leaving the operation would interrupt the
  operator's scan; that preview must expose the deliberate detail-route action.
- `Detail.vue` is justified for operations; it can start as a small selected-record surface and grow detail-level read/write children.
- The matching operation composable is `useXConsoleOperation`; it owns selected target, child collection path, pending/write permissions, and debug wiring.
- A rendered operation mounts that stateful data graph once. Its operation root
  provides a named workspace and descendant list, toolbar, and debug components
  inject the same workspace; descendants must not independently call the
  operation composable and duplicate target, auth, or Firestore lifecycles.
- UI controls may hide or disable writes from `canWrite`, but mutations and
  storage uploads must enforce the same authority themselves. Demo and other
  read-only sources therefore remain non-writing even when invoked directly.
- Use `Index.vue` only when the operation folder itself needs to auto-import as the rendered component.
- Use named workflow folders only when the operator UI has a real workflow step, such as `Menus/Creation`, `Menus/Process`, or `Menus/QR`.
- Do not use root entity buckets like `Create` inside operations unless the visible scoped workflow is actually named creation.
- Do not promote `Sundries` into a permanent product bucket. A sundry should later graduate into `Operations`, move into a core sheet, or be deleted.

## Similarities

- All console entities need target selection or a selected target.
- Console entities expose access/team only when that lifecycle is real.
- All console indexes should stay thin.

## Differences

- Domain differences, their reasons, migration debt, and alignment roadmap live
  in `family-console-entity.md`.
- A difference in operation children is expected; a difference in Index target
  outcome, selection authority, or error semantics is drift unless guarded and
  explained there.

Demo, test, and simulation:

- Demo is optional local, lazy, and read-only console data.
- Test and simulation are separate mutable sources and may use dedicated
  databases. Dev fixtures belong to authenticated dev tooling, not consoles.
- See `demo-data.md` for ownership and dependency boundaries.

## Alignment roadmap

- Now: preserve the guarded selected → targets → debug Index contract and one
  family-owned target outcome.
- Next: align lifecycle sheets through the family delta register, especially
  Property Identity/Create and Kitchen App-support migration.
- Later: guard Overview, Identity, and Team only after their shared jobs are as
  stable as Index.
