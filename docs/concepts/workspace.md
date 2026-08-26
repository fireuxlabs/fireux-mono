# Workspace

Updated: 2026-08-25
Ref: 79efa4a44
Role: map, not canon

## Purpose

Map the shared authorized Workspace system and its domain adapters.

`Workspace` is the product surface and canonical `/workspace/**` route family.
Existing `Workspace*`, `useWorkspace*`, `composables/workspace`, and `/api/workspace/**`
names describe the current internal implementation and transport boundary; they
do not authorize `/workspace/**` product routes or visible Workspace terminology.

## Vertical links

- Parent: app-config.md
- Child: family-workspace-entity.md
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

- `useWorkspace`
- `useWorkspaceAccess`
- `useWorkspaceDemoData`
- `WorkspaceCurrentEntity`
- `WorkspaceEntityCollection`
- `useWorkspaceTeam`

Workspace is a shared surface and current-entity primitive, not an entity
owner. Shared Workspace shells, navigation, current ID, and outcome primitives
remain in the root technical spine. Kitchen, Supplier, Project, and other
entity-specific Workspace adapters belong beneath their entity roots according
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
  then directly composes `UDashboardPanel`, `LayoutsWorkspaceNavbar`, a header
  slot, and a body slot inside it. Do not hide that route shell in a generic
  component.
- Workspace routes disable the global `out-in` page transition so the persistent
  Workspace layout and family runtime remain responsive while route content
  changes.
- The Workspace layout does not key its content boundary by the full route.
  Established Firebase authentication is read synchronously during navigation;
  an auth observer is reserved for initial hydration when no current User is
  available yet.
- In the shared `UDashboardGroup` flex layout, the neutral route wrapper uses
  `flex min-h-full min-w-0 flex-1`; a bare block wrapper can stop
  `UDashboardPanel` from filling the remaining Workspace width.
- The page owns high-level width and spacing. Family indexes may stay full width; simple forms may use `panels-narrow`; named domain components own their internal presentation.
- A Workspace page presents one dominant primary canvas. Supporting Tools and
  contextual AI may share an optional context rail when the route has a real
  focused View; on narrower screens that rail follows the primary canvas. A
  product doorway whose primary job is AI keeps AI in the canvas and places
  only its compact current-Entity/create control above it. Do not stack
  duplicate Entity summaries, account controls, research literature, or
  development diagnostics as peer production surfaces.
- Back navigation and page-level actions stay in the navbar right slot.
- The selected-workspace menu follows one structural order: Overview,
  Identity, the family's top-level Operations, then Team when that family has
  a real collaboration lifecycle. Hand-authored route order does not redefine
  those groups. AI belongs at a product-owned doorway or inside a bounded
  Operation; it is not a generic Workspace navigation family.
- Every Workspace Entity owns its AI capability definition beside its Entity
  models. The ecosystem composes and registers that definition with FireUX AI;
  Core does not depend on the AI extension. Tools and execution remain optional
  named capabilities, so the baseline does not manufacture empty AI routes.
  There is no generic Workspace Agent route.
- Create belongs to the empty current-Entity state. A create route may remain
  as its action target, but it never appears in Workspace navigation.
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
- Create and edit share form behavior. Small primitives such as `WorkspaceFormActions` may standardize Save, Cancel, pending, disabled, and status treatment without owning the page.
- New and adopted route access visibility and selection requirements live at top-level page meta; navigation metadata only describes navigation presentation.
- Authentication and role requirements also live at top-level page meta; `nav` must not become a second access contract.
- Direct Workspace pages require authentication by default. A browse-only route
  may declare `workspaceAccess: 'public-entry'` and `requiresAuth: false` only
  when it also declares `requiresSelection: false`; its anonymous composition
  may mount only reads or commands explicitly authorized for the current
  Firebase identity. An anonymous identity may use a domain command only when
  its trusted server boundary permits that exact operation. The Workspace page
  guard enforces this named exception.
- A route opts into only the surfaces its operation needs. A live Orders board does not imply an Orders edit page.
- Route pages stay thin. Domain components own data, permissions, states, and mutations.
- A Workspace landing or Operation composes three named domain sheets when each
  responsibility exists: `Tools`, contextual `AI`, then the focused domain
  `View`. The route spells out that composition, while one page-provided
  workspace supplies shared target, authority, records, and outcomes to every
  sheet. A sheet with no real job is omitted; empty Views do not manufacture
  dashboard cards merely to occupy space. Development-only diagnostics follow
  the focused View at the bottom and never interrupt the production order:
  `Tools`, `AI`, `View`, then `Dev`.
- Core Workspace navigation exposes a neutral right slot and has no knowledge of
  AI. An AI-enabled Operation may compose FireUX AI presentation into that slot
  or render a bounded contextual AI sheet in its body. FireUX AI owns prompt
  placeholders, tool discovery, suggestions, and execution presentation;
  domain Operations own the capabilities and context supplied to it.
- Overview navigation cards do not initialize child operation workspaces to
  calculate counts. A future count belongs to one bounded overview summary;
  each operation loads its records only when its own route opens.
- Adopted routes can declare `workspaceSurface`; edit routes declare `edit` and live routes declare `live`.
- The workspace-pages guard enforces the real DOM root plus the explicit
  panel/navbar/body contract for visible leaf pages. Redirects, nested routers,
  and live layouts are exempt only from the panel shell; every rendered page
  using the shared transition still needs the real root. Only an explicit,
  justified `pageTransition: false` route is exempt from that root check. The
  guard does not constrain body geometry.
- The workspace-indexes guard enforces each guarded Index contract. Kitchen is
  current-only; older directory-style families retain their selected-target
  contract until they are migrated deliberately.
- Tables remains a Front-of-House boundary. Kitchen Orders may cross that
  boundary, but table layout, seating, tabs, and payment are not Kitchen-owned
  capabilities.

## Allowed domain buckets

- `core`
- `index`
- `overview`
- `identity`
- `team`
- `operations`
- `sundries`

## Source-backed capability map

The visible Workspace tree is the naming authority for entity server and client
slices. `Index` establishes the current Entity and presents Create when none is
available; Create is not a current-workspace peer.

Every Workspace bakes in Index, Overview, Identity, Team, and Notifications.
Permissions govern those capabilities and every Operation; they are authority,
not another navigation page. Notifications belongs to the shared shell rather
than an Entity component bucket.

| Entity    | Operations and reports                                                                                                                                                           |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project   | Apps, Ecosystem                                                                                                                                                                  |
| Kitchen   | Menus, Dishes, Drinks, Recipes, Ingredients; Food Safety, Mise, Orders & Service, Inventory, Purchasing, Receiving, Waste; Stations, Suppliers; Sales, Costs, Waste, Performance |
| Supplier  | Catalogue, Ingredients, Items                                                                                                                                                    |
| Portfolio | Properties, Compliance, Documents, Tasks, Finance                                                                                                                                |
| Property  | Reservations, Calendar                                                                                                                                                           |
| Blank     | —                                                                                                                                                                                |

Ignition is separate Project intake/admin, not a Project Operation. A missing
server folder is valid when a visible capability has no server-owned
behaviour; the map does not require empty symmetry.

## Component bucket shape

- Every Workspace Entity carries Overview, Identity, and Team beside its Index.
  Project and Blank may expose factual read-only Team authority without
  manufacturing domain membership tools.
- A bucket may own an `Index.vue` entry when the folder itself is the component rendered by a page.
- Do not mix an entity's `Workspace/Overview.vue` with `Workspace/Overview/*`; use
  `runtime/<entity>/components/Workspace/Overview/Index.vue`.
- `Team` always sits beside `Operations`; richer membership workflows remain
  optional domain-owned behaviour.
- `Operations` is for selected-target work and may contain domain-specific child folders.
- `Sundries` is a temporary quarantine for parked, loose, or underdeveloped workspace surfaces that are not yet core sheets or confirmed operations.

## Index pattern

- A Workspace is the current Entity context used by its capabilities. It is not
  the User's Entity directory, a Demo catalogue, or a tenant-policy manager.
- The User relationship determines which Entities are available. A Workspace
  may resolve that relationship to establish one current Entity, but it does
  not expose the relationship collection as Workspace state.
- No available Entity produces the create/onboarding state. One available
  Entity becomes current automatically. Switching among multiple available
  Entities is a User action outside the baseline Workspace index.
- `WorkspaceXIndex` renders the current Entity and the request state required to
  establish it. It renders Create only when the authoritative relationship is
  settled and empty.
- `useXWorkspaceIndex` exposes a small contract: `current`, `access`, and
  `actions`. It does not expose target sections, source modes, tenant state,
  Demo state, storage routing, or debug anatomy.
- Domain capability runtimes are added behind the current Entity only when a
  real capability needs their records, write authority, or Firestore path.
  Those concerns must not be pulled back into the index pre-emptively.
- The Kitchen index resolves its current Kitchen from the bounded authenticated
  Team projection. A persisted Kitchen id is only a preference and is accepted
  after the authoritative response proves access. Missing pairs and scope drift
  remain errors, never partial results.
- Demo is Entity data or a separate discovery experience. It is not a Workspace
  source mode and does not change the Workspace index contract.

## Production onboarding

- A Workspace family creates or attaches through its own fixed-runtime
  authenticated server endpoint. The caller cannot choose the App, database,
  collection path, Team id, or authority.
- One Firestore transaction owns the canonical root, any relationship declared
  by that Entity, and the caller's exact `team/{uid}` record. A Team record
  names roles and permissions; no second operator/team array participates in
  access.
- Current App admins remain the explicit administrative override only for
  roots managed by that App; UI `canWrite` still does not replace server or
  Rules enforcement.
- Kitchen has a server-projected live outcome and a separate lazy Demo outcome.
  A Kitchen may be Place-backed or begin as a name-only shell. Supplier,
  Portfolio, and Property retain
  domain-owned root payloads and strict pair readers. Blank is the app-local
  minimal harness. Project deliberately remains a read-only control-plane
  family and has no production onboarding.
- Workspace-capable roots with a management field use `management.mode`:
  `root` has no Workspace host;
  `workspace` uses the ecosystem App by convention; `app` names its
  dedicated Workspace App with `app_id`. Core resolves this vocabulary without
  enumerating domain families. Kitchen is the accepted exception: its canonical
  root has no management field; its Kitchen Team and current identity supply
  authority, and an optional same-ID Place supplies venue identity.

## Operations

- Operations are child surfaces inside a selected workspace target.
- Identity and Team are first-class Workspace peer capabilities, not Operations.
  Overview, Index/Create, dev tooling, and child/detail routes are also not
  Operations. A selected-target report such as Kitchen Finance is an Operation
  when it has its own operational workspace.
- An Entity `models/operations.ts` catalogue contains only entity-specific
  selected-target Operations. Landing, discovery, and operation AI consumers
  may use that list without accidentally publishing baked-in Workspace
  capabilities as Operations.
- Operations must not leak into Firestore entity root folders.
- Operation-AI presentation belongs to FireUX AI. Core supplies only neutral
  Workspace composition slots, while each Entity Operation explicitly decides
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
- Persistent operation settings use the operation-level edit route and `workspaceSurface: 'edit'`; do not hide configuration inside a browse-page dropdown.
- `Read.vue` lists current records and must retain an explicit path to detail
  when the operation owns record identity. A dense browse surface may open a
  read-only quick look first when leaving the operation would interrupt the
  operator's scan; that preview must expose the deliberate detail-route action.
- `Detail.vue` is justified for operations; it can start as a small selected-record surface and grow detail-level read/write children.
- The matching operation composable is `useXWorkspaceOperation`; it owns selected target, child collection path, pending/write permissions, and debug wiring.
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

- All workspace entities need target selection or a selected target.
- Workspace Entities always own Team authority, while a Workspace Team editor is
  exposed only when its lifecycle is implemented.
- All workspace indexes should stay thin.

## Differences

- Domain differences, their reasons, migration debt, and alignment roadmap live
  in `family-workspace-entity.md`.
- A difference in operation children is expected; a difference in Index target
  outcome, selection authority, or error semantics is drift unless guarded and
  explained there.

Demo, test, and simulation:

- Demo is optional local, lazy, and read-only workspace data.
- Test and simulation are separate mutable sources and may use dedicated
  databases. Dev fixtures belong to authenticated dev tooling, not workspaces.
- See `demo-data.md` for ownership and dependency boundaries.

## Alignment roadmap

- Now: prove the current-Entity Kitchen Index without collection, Demo, tenant,
  capability-runtime, or debug concerns.
- Next: align lifecycle sheets through the family delta register while the
  owner-first Team and operations cutover completes.
- Later: guard Overview, Identity, and Team only after their shared jobs are as
  stable as Index.
