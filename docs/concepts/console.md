# Console
Updated: 2026-07-26
Ref: 796952bf0
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

## Shared core

- `useConsole`
- `useConsoleAccess`
- `useConsoleEntityRuntime`
- `useConsoleDemoData`
- `useConsoleTargets`
- `useConsoleIndex`
- `ConsoleSelectedTarget`
- `ConsoleTargetCollection`
- `useConsoleOverview`
- `useConsoleSelection`
- `useConsoleTeam`

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
- In the shared `UDashboardGroup` flex layout, the neutral route wrapper uses
  `flex min-h-full min-w-0 flex-1`; a bare block wrapper can stop
  `UDashboardPanel` from filling the remaining Console width.
- The page owns high-level width and spacing. Family indexes may stay full width; simple forms may use `panels-narrow`; named domain components own their internal presentation.
- Back navigation and page actions stay in the navbar right slot.
- Create and edit share form behavior. Small primitives such as `ConsoleFormActions` may standardize Save, Cancel, pending, disabled, and status treatment without owning the page.
- New and adopted route access visibility and selection requirements live at top-level page meta; navigation metadata only describes navigation presentation.
- Authentication and role requirements also live at top-level page meta; `nav` must not become a second access contract.
- A route opts into only the surfaces its operation needs. A live Orders board does not imply an Orders edit page.
- Route pages stay thin. Domain components own data, permissions, states, and mutations.
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

## Component bucket shape

- Console families carry only the peer buckets their real lifecycle needs.
  `Team` is not mandatory; Project deliberately has none today.
- A bucket may own an `Index.vue` entry when the folder itself is the component rendered by a page.
- Do not mix `Console/X/Overview.vue` with `Console/X/Overview/*`; use `Console/X/Overview/Index.vue`.
- `Team` sits beside `Operations` only when the entity has a real collaboration lifecycle.
- `Operations` is for selected-target work and may contain domain-specific child folders.
- `Sundries` is a temporary quarantine for parked, loose, or underdeveloped console surfaces that are not yet core sheets or confirmed operations.

## Index pattern

- Page renders `ConsoleXIndex`.
- `ConsoleXIndex` renders selected and targets sections.
- `useXConsoleIndex` adapts domain data into shared `useConsoleIndex`.
- `useXConsole` owns target candidate resolution, the authoritative collection
  outcome, and selection validity. Index and overview composables consume that
  core result; they do not call `useConsoleTargets` again or overlay another
  membership outcome.
- Named selected wrappers map domain identity into `ConsoleSelectedTarget`;
  Core owns the selected/empty card anatomy and Clear action presentation, and
  the family index forwards `actions.clear`. A family may project its existing
  entity card through the shared selected-content slot; it must not replace the
  shared empty state or Clear behavior.
- Tenant apps can auto-select single configured targets.
- Global apps usually source target IDs from user/app data.
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
- Persisted selection is validated only against a successful target read.
  Pending or failed target reads must not clear a saved selection.
- Selected-target routes distinguish persistence from hydration. The persisted
  family selection ID decides whether a target is selected; the asynchronously
  loaded target object decides whether target content is ready. A missing
  object while an ID exists is a loading state, never a false "select first"
  empty state.
- A Console family has one family-keyed reactive source state shared by every
  composable instance. Its cookie is persistence, not a second live source
  authority; source changes update both together so source-aware selection
  cannot race between `live`, `demo`, and `test`.
- Global target adapters compose UserApp membership pending/error with the
  collection outcome. Membership failure is `error`, never an empty target list.
- Global UserApp target IDs and tenant-configured IDs bound live reads. Exact
  root and same-id App-support reads must fail the complete outcome on a missing
  half, wrong App scope, malformed support authority, or unauthorized indexed
  id; they never leave an unused full-root listener behind client filtering.
- Kitchen live targets use the authenticated `/api/console/kitchen/targets`
  projection. The fixed-runtime server derives candidate IDs, exact-loads and
  authorizes every canonical root/App-support/Place join, and the selected live
  Kitchen reuses that projected root instead of starting a second raw browser
  query. Its response is the sole live target outcome: do not overlay a second
  browser UserApp read, and share the keyed request across selected/index
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
- One Firestore transaction owns the root scope, same-id complete App support,
  and caller UserApp target index. Missing or conflicting halves fail before a
  partial chooser row can be created.
- `operator_ids` is mutation authority. `team_ids` is target/read membership,
  not write authority. Current App admins remain the explicit administrative
  override; UI `canWrite` still does not replace server or Rules enforcement.
- Kitchen is the Place-backed reference with a server-projected live outcome
  and a separate lazy Demo outcome. Supplier, Portfolio, and Property retain
  domain-owned root payloads and strict pair readers. Blank is the app-local
  minimal harness. Project deliberately remains a read-only control-plane
  family and has no root/App-support onboarding.

## Operations

- Operations are child surfaces inside a selected console target.
- Operations must not leak into Firestore entity root folders.
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
