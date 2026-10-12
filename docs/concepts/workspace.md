# Workspace

Updated: 2026-10-12
Ref: b2a986b6b
Role: map, not canon

## Purpose

Map the shared authorized Workspace system and its domain adapters.

The product hierarchy is Workspace → Capability → Tool → authorized command.
Identity, Team and domain work use the same capability grammar; reports and
navigation groups add no hierarchy layer. Follow
`family-workspace-capability-tool.md` and `product-language.md` for these meanings.
Legacy Operation names in routes, transport types or older component paths do
not define another product layer or require new code to adopt those names.

`Workspace` is the product surface and canonical `/workspace/**` route family.
`Workspace*`, `useWorkspace*`, `composables/workspace`, and `/api/workspace/**`
name its presentation, coordination, and transport boundaries.

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
- runtime-filesystem.md

## Shared core

- `useWorkspace`
- `useWorkspaceAccess`
- `WorkspaceActiveEntity`
- `WorkspaceEntityCollection`
- `useTeam`

Workspace is a shared surface and active-Entity primitive, not an entity
owner. Shared Workspace shells, navigation, active ID, and outcome primitives
remain in the root technical spine. Kitchen, Supplier, Project, and other
entity-specific Workspace adapters belong beneath their entity roots according
to `runtime-filesystem.md`. Nuxt pages and API handlers retain their framework
paths and delegate inward.

## Landing boundary

Landing gets a person into a Workspace; Workspace lets them work inside the
selected Entity. They are two presentations over one domain pipe, not two data
systems.

```text
Landing   -> choices, select, create, enter
Workspace -> data, outcome, update, delete, operate
```

Landing uses `useXWorkspaceIndex()` for the collection and selection, and
`useXWorkspace().crud.create` for creation. The selected Workspace uses
`useXWorkspace()`. Landing never owns another Entity reader,
selection store, Create pipeline, or Demo selection patch. A marketing preview
may render projected example data, but its `Open Workspace` doorway only enters
the canonical `/workspace/{type}` route; it does not mutate live Workspace
selection. The Workspace route resolves and operates its current Entity through
the same domain pipe.

The inspected industry Main Apps keep their public Directory at `/` and their
working entrance at `/workspace/{type}`. FireUX is the accepted exception: its
root opens Project Workspace, with secondary Project discovery. Tenant Apps keep
their branded customer root and reuse the domain-owned Workspace entrance. Core
`runtime/pages/workspace/index.vue` resolves `/workspace` through the configured
Workspace route; it does not assume that `/` is always the working surface.
Individual capability routes retain their own access requirements. See
`family-workspace-entity.md#public-and-workspace-entry-points` and the consuming
App routes rather than inferring behavior from the global/tenant role alone.

## Page surface vocabulary

- `browse`: a capability collection or operational summary at `/<capability>`.
- `detail`: one record at `/<capability>/[recordId]`.
- `create`: a form at `/<capability>/create`.
- `edit`: a record form at `/<capability>/[recordId]/edit`, or persistent capability settings at `/<capability>/edit`.
- `workflow`: a resumable process at `/<capability>/workflows/<name>/[runId?]`.
- `live`: a real-time command surface at the capability root; it may use an immersive domain layout.

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
- The active-Workspace menu follows one structural order: Overview,
  Identity, the family's domain capabilities, then Team when that family has
  a real collaboration lifecycle. Hand-authored route order does not redefine
  those groups. AI belongs at a product-owned doorway or inside a bounded
  Capability; it is not a generic Workspace navigation family.
- Every Workspace Entity owns its AI capability definition beside its Entity
  models. The ecosystem composes and registers that definition with FireUX AI;
  Core does not depend on the AI extension. Tools and execution remain optional
  named capabilities, so the baseline does not manufacture empty AI routes.
  There is no generic Workspace Agent route.
- Create belongs to the empty current-Entity state. A create route may remain
  as its action target, but it never appears in Workspace navigation.
- An action within a Capability, such as Menu QR generation, remains a Tool
  instead of becoming another top-level Capability. Identity-owned QR belongs
  with Identity. Development routes are hidden, unavailable outside a
  development build, and restricted to the configured developer.
- A capability browse page may place one proven primary Tool, such
  as a dedicated create-route doorway, in the secondary
  `UDashboardToolbar` right slot. Scope, filters, views, and board-wide
  controls belong on the toolbar left. Record actions remain with their
  collection row, card, or detail surface.
- Do not render bespoke body cards, generic tool menus, or disabled future
  actions for a single capability doorway. Omit the action until its producer
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
- A route opts into only the surfaces its capability needs. A live Orders board does not imply an Orders edit page.
- Route pages stay thin. Domain components own data, permissions, states, and mutations.
- A Workspace landing or Capability composes three named domain sheets when each
  responsibility exists: `Tools`, contextual `AI`, then the focused domain
  `View`. The route spells out that composition, while one page-provided
  workspace supplies shared target, authority, records, and outcomes to every
  sheet. A sheet with no real job is omitted; empty Views do not manufacture
  dashboard cards merely to occupy space. Development-only diagnostics follow
  the focused View at the bottom and never interrupt the production order:
  `Tools`, `AI`, `View`, then `Dev`.
- Core Workspace navigation exposes a neutral right slot and has no knowledge of
  AI. An AI-enabled Capability may compose FireUX AI presentation into that slot
  or render a bounded contextual AI sheet in its body. FireUX AI owns prompt
  placeholders, tool discovery, suggestions, and execution presentation;
  domain capabilities own the Tools and context supplied to it.
- Overview navigation cards do not initialize child capability controllers to
  calculate counts. A future count belongs to one bounded overview summary;
  each capability loads its records only when its own route opens.
- Adopted routes can declare `workspaceSurface`; edit routes declare `edit` and live routes declare `live`.
- The former `workspace-pages` and `workspace-indexes` guards are retired.
  The real DOM root and explicit panel/navbar/body composition remain source
  review expectations for ordinary rendered leaf pages. Redirects, nested routers
  and live layouts have their own justified composition. An explicit
  `pageTransition: false` is the existing transition exception. Verify current
  registration, generated App output and source-owned checks; do not claim
  automatic enforcement by removed scripts.
- Each maintained family resolves one active Entity through its domain-owned
  access and selection readers. Entry collections expose only targets that the
  acting account may activate; a stored preference alone never grants access.
- Tables remains a Front-of-House boundary. Kitchen Orders may cross that
  boundary, but table layout, seating, tabs, and payment are not Kitchen-owned
  capabilities.

## Workspace presentation placement

Entity Workspace components use direct capability directories. `Home` owns
entry-only presentation; named Navigation, Selector and Dashboard components
serve their real cross-page entry points. Sidebar group labels do not create
`Operations` or `Capabilities` filesystem containers. There is no Supporting
or Sundries bucket. Shared controls live with their specific domain concern or,
when product-neutral and proved, in Core. The maintained component contract is
`components.md#workspace-component-folders`.

Notifications remains User-owned shared presentation rather than a copied
Entity capability. Domain commands and data stay outside component folders.

## Growth and generated composition

FireUX builds Workspace-based, industry-specific SaaS from three compositional
layers. This is an ownership model, not a requirement to create a package for
every possible layer:

```text
Universal Workspace foundation
  -> optional reusable SaaS capabilities
    -> proved industry capabilities
      -> concrete Workspace type
        -> one Workspace Entity instance
```

The universal foundation is the only layer every Workspace receives:

| Surface | Universal responsibility |
| --- | --- |
| Overview | Summarise the selected Workspace Entity and its current useful information. |
| Identity | Read and edit the root Entity information that identifies the Workspace. |
| Team | Represent the people responsible for operating the Workspace. |
| Test | Prove the smallest record pipeline with an intentionally simple packet. |
| Calendar | Present time-based records belonging to or projected into the Workspace. |
| Notifications | Present matters from the Workspace that require a person's attention. |

`Index` remains the entry and current-Entity resolution surface; it is not a
seventh user-facing capability. Create is the empty Index action, not a peer
navigation surface.

Common SaaS concerns such as Customers, Tasks, Documents, Communications,
Finance, Reporting, Integrations, and Settings are an optional capability
catalogue. Their recurrence across industries does not make them universal.
Each keeps one owning extension and is composed only where the product needs
it.

An industry layer is justified only when at least two materially different
Workspace types need the same behaviour for the same industry reason. For
example, a future Hospitality layer might share Guests, Bookings, Service,
Orders, or Payments across Kitchen, Restaurant, Venue, and Hotel Workspace
types. Until that evidence exists, the behaviour stays with its current domain
owner; FireUX does not create an empty `fireux-hospitality` package in
anticipation.

A Workspace type owns what remains specific. Kitchen may own Menus, Dishes,
Recipes, Ingredients, Stations, and Waste. Project may own Apps, Ecosystem,
Releases, or Environments. `Interlaken Pizza` is an instance of Kitchen;
`Granite` is an instance of Project. Instances contain data and never become
package layers.

Package dependencies follow repository law:

```text
App -> Ecosystem -> Workspace-type or industry Extension
  -> lower reusable Extensions -> Core
```

Upper layers compose lower owners. They do not copy their implementation.
Existing pages, readers, listeners, writers, fixtures, and consumers are not
constraints on a top-down Workspace contract and may be deleted or rebuilt.
Demo data, environment policy, permissions, and Firestore Rules are later
implementation concerns; they do not shape the initial Workspace pipeline.

### Future generated-App builder

A Lovable-style FireUX builder composes from these layers instead of generating
an unstructured App. From a human request it must:

1. include the six universal surfaces;
2. recommend relevant reusable SaaS and proved industry capabilities;
3. identify the proposed Workspace type and its specific capabilities;
4. show what it selected, excluded, renamed, and assumed;
5. distinguish mature implementations from missing capabilities;
6. ask for confirmation where product intent is unresolved; and
7. report each new capability's intended owner before generating it.

The builder may fill a local gap, but it does not promote that implementation
upward automatically. Promotion follows evidence:

```text
Workspace-specific implementation
  -> repeated named domain pattern
    -> proved industry capability
      -> proved cross-industry reusable capability
```

Humans may accept, remove, or rename recommendations. The builder records gaps
so the catalogue can grow, but a recommendation is not evidence of a shared
package or Core abstraction.

## Workspace surface map

The visible Workspace tree is the naming authority for entity server and client
slices. `Index` establishes the active Entity and presents Create when none is
available; Create is not a current-workspace peer.

The accepted foundation gives every Workspace Index plus Overview, Identity,
Team, Test, Calendar, and Notifications. Kitchen and Project are the first
implementation pilots; the roadmap below records that full source alignment is
not yet claimed.
Permissions govern capabilities and their Tools; they are authority,
not another navigation page. Notifications belongs to the shared shell rather
than an Entity component bucket.

| Entity    | Domain capabilities and report presentations                                                                                                                                                           |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project   | Apps, Ecosystem                                                                                                                                                                  |
| Kitchen   | Menus, Dishes, Drinks, Recipes, Ingredients; Food Safety, Mise, Orders & Service, Inventory, Purchasing, Receiving, Waste; Stations, Suppliers; Sales, Costs, Waste, Performance |
| Supplier  | Catalogue, Ingredients, Items                                                                                                                                                    |
| Portfolio | Properties, Compliance, Documents, Tasks, Finance                                                                                                                                |
| Property  | Reservations                                                                                                                                                                     |
| Blank     | —                                                                                                                                                                                |

Ignition requests are FireUX App intake/admin, not a Project Workspace capability. The reusable build process is owned by `fireux-ignite`. A missing
server folder is valid when a visible capability has no server-owned
behaviour; the map does not require empty symmetry.

## Component bucket shape

- Every Workspace Entity carries Overview, Identity, Team, Test, and Calendar
  beside its Index.
  Project and Blank may expose factual read-only Team authority without
  manufacturing domain membership tools.
- A bucket may own an `Index.vue` entry when the folder itself is the component rendered by a page.
- Do not mix an entity's `Workspace/Overview.vue` with `Workspace/Overview/*`; use
  `runtime/<entity>/components/Workspace/Overview/Index.vue`.
- Named capability components retain their domain owners; richer workflows
  remain optional domain-owned behavior. Existing `Operations` folders are
  legacy source paths, not a required parent for new capability components.
- Unfinished surfaces remain with their named owner; do not introduce `Sundries` or another catch-all capability bucket.

## Index pattern

- A Workspace is the active Entity context used by its capabilities. It is not
  the User's Entity directory, a Demo catalogue, or a tenant-policy manager.
- The User relationship determines which Entities are available. A Workspace
  may resolve that relationship to establish one active Entity, but it does
  not expose the relationship collection as Workspace state.
- No available Entity produces the create/onboarding state. One available
  Entity becomes current automatically. With several available Entities, retain
  a valid previous choice or select the first available. The persistent
  bottom-left control shows the selected identity and offers explicit switching.
  Loading and failed reads never masquerade as an empty relationship.
- The domain Selector owns collection loading, error, and confirmed empty
  presentation. Main renders the selected Entity read outcome and its domain
  CRUD doorway. Creation can also be offered for additional Entities where
  the domain permits it; a loading or failed read never implies onboarding.
- `useXWorkspaceIndex` exposes `collection`, its read `outcome`, `selectedId`,
  and `select`. Project, Kitchen, Supplier, Portfolio, Property and Blank expose no user
  clear action; only a settled empty authorized collection clears selection.
  `useXWorkspace` exposes `data`, `id`, its document
  `outcome`, and `crud: { create, update, delete }`. The index delegates to the
  Entity collection reader and Core selection primitive; it owns no mutations and
  it does not expose source modes, tenant state, Demo state, storage routing,
  or debug anatomy.
- Domain capability runtimes are added behind the active Entity only when a
  real capability needs their records, write authority, or Firestore path.
  Those concerns must not be pulled back into the index pre-emptively.
- The maintained domain indexes read their membership-bound domain access
  records through their domain collection readers. AppUser stores no Entity-id arrays. The persisted active id is a local
  preference reconciled against that bounded collection. Team authority and
  account-primary mutations remain separate domain responsibilities.
- Demo is Entity data or a separate discovery experience. It is not a Workspace
  source mode and does not change the Workspace index contract.

## Production onboarding

- A Workspace family creates or attaches through its own fixed-runtime
  authenticated server endpoint. The caller cannot choose the App, database,
  collection path, Team id, or authority.
- The owning creation command establishes the canonical root and required
  membership-bound domain access relationship transactionally, with an initial roster record
  where that domain requires one. Team labels are not the access relationship.
- Current development access requires sign-in, current App membership and the
  explicit domain access record bound to the current App membership. Do not infer a bypass from App-admin
  status or Team labels. Subscription limits remain enforced; individual Team
  role restrictions are deferred. UI `canWrite` never replaces the owning
  server checks, and development-open Rules remain a separate limitation.
  Future production role policy must be accepted and verified separately.
- A Kitchen may be Place-backed or begin as a name-only shell. Supplier,
  Portfolio, and Property retain
  domain-owned root payloads and strict pair readers. Blank is the app-local
  minimal harness. Project has trusted empty-shell creation through
  `/api/internal/control/projects`; root Update and Delete remain unavailable
  until their domain lifecycle is proved.
- Workspace-capable roots with a management field use `management.mode`:
  `root` has no Workspace host;
  `workspace` uses the ecosystem App by convention; `app` names its
  dedicated Workspace App with `app_id`. Core resolves this vocabulary without
  enumerating domain families. Kitchen is the accepted exception: its canonical
  root has no management field; current App membership and AppUser Kitchen
  association supply development access, while same-ID Place supplies venue
  identity. Team remains a separate roster capability.

## Capability behavior

- Capabilities are areas of responsibility inside a Workspace. Identity, Team,
  Test and domain work share that grammar. Reports classify their presentation;
  Overview is a summary, and Calendar/Notifications are shared controls where
  supported. Routes and controls do not create extra hierarchy levels.
- Kitchen's `models/capabilities.ts` describes its domain capability catalogue.
  Older `models/operations.ts` catalogues and public `/operations` discovery
  still have real consumers. Inspect those consumers before changing their
  contents or names; a legacy subset is not the universal Workspace contract.
- Capability presentation does not change Entity storage ownership.
- Capability AI presentation belongs to FireUX AI. Core supplies only neutral
  Workspace composition slots, while each Entity Capability explicitly decides
  whether and where to compose the AI surface. AI presentation does not belong
  in Core, an Entity domain, or a generic `utils` folder.
- Capability browse families must name their visible jobs rather than relying on
  folder symmetry alone. The `like-menu` family is the records-then-tools
  reference for collection-led capabilities.
- A `like-menu` browse entry owns create and collection read. Its child detail
  route owns inspect, update, and delete. Self-explanatory lists and the single
  create action may be visually unframed while retaining named semantic
  sections. The domain owns their contents and authority.
- Large creation, review, QR, configuration, and live workflows use dedicated
  routes. A collapsed write lane is only for a genuinely small action on a
  capability that has not adopted the `like-menu` family.
- Persistent capability settings use the capability-level edit route and `workspaceSurface: 'edit'`; do not hide configuration inside a browse-page dropdown.
- `Read.vue` lists current records and must retain an explicit path to detail
  when the capability owns record identity. A dense browse surface may open a
  read-only quick look first when leaving the capability would interrupt the
  operator's scan; that preview must expose the deliberate detail-route action.
- `Detail.vue` is justified for capabilities; it can start as a small selected-record surface and grow detail-level read/write children.
- Use the owning capability's current named controller where it has a real
  job; do not require a `useXWorkspaceOperation` wrapper from the old naming
  convention. Domain authority and data lifecycles remain with their owners.
- A rendered capability mounts that stateful data graph once. Its capability root
  provides a named workspace and descendant list, toolbar, and debug components
  inject the same workspace; descendants must not independently call the
  capability composable and duplicate target, auth, or Firestore lifecycles.
- Write authority belongs to the eventual owning implementation and transport;
  it is not part of the initial universal Workspace pipe.
- Use `Index.vue` only when the capability folder itself needs to auto-import as the rendered component.
- Use named workflow folders only when the operator UI has a real workflow step, such as `Menus/Creation`, `Menus/Process`, or `Menus/QR`.
- Do not use root entity buckets like `Create` inside capabilities unless the visible scoped workflow is actually named creation.
- Named capability ownership applies to unfinished surfaces too; retire unused source rather than parking it in a catch-all bucket.

## Similarities

- Every Workspace has one active Entity or an explicit no-active-Entity state.
- Workspace Entities own their Team records; richer Team lifecycle behaviour
  remains domain-owned.
- All workspace indexes should stay thin.

## Differences

- Domain differences, their reasons, migration debt, and alignment roadmap live
  in `family-workspace-entity.md`.
- A difference in capability children is expected; a difference in Index target
  outcome, active-Entity authority, or error semantics is drift unless guarded and
  explained there.

## Alignment roadmap

- Now: prove the separate collection Index and selected-Entity entrance in
  Kitchen and Project, without Demo, tenant policy, capability-runtime, or
  debug concerns in either contract.
- Next: align lifecycle sheets through the family delta register while the
  owner-first Team and capability cutover completes.
- Later: align the six universal surfaces in the Kitchen and Project pilots,
  then guard only the shared jobs proved by both.

### Landing AI composition

FireUX and Misebox own their Home AI composition beside their App routes at
`projects/fireux/fireux-app/app/pages/workspace/project/index.vue` and
`projects/misebox/misebox-app/app/pages/workspace/kitchen/index.vue`. These routes
compose their named Home AI controls with the existing domain entry surface.
Supported action handlers determine availability; a prompt box is not evidence
of a working action. Domain commands retain authority. The former landing anatomy
guard is retired. Keep the bounded composition and action proof in
`family-workspace-entity.md` rather than preserving old disabled-composer claims.

### Universal page presentation

Kitchen and Project Landing, Team, and Test use the main page contract. Team
and Test stay focused on their own records and do not append the workspace’s
domain capability catalogue. Identity uses a form-focused variation; Calendar
uses a visual date-based variation without a required on-page suggestion block.
AI suggestion definitions may exist independently of that presentation. Overview
is a minimal state-driven summary that can evolve with proved setup needs.
Notifications retains its shared feed/panel presentation. These variations
change page composition, not the ownership of records or commands.

The Test info panel and AI suggestions share `useTestAI` and its capability
description. The public description explains purpose, record shape, tool meaning,
and boundaries; runtime availability is derived from `useTest`, not duplicated
in the presentation. Test’s page header opens this capability information rather
than general Kitchen or Project information.

Test treats Create and Read as collection actions, and Update and Delete as
selected-record actions. Its Read modal changes local focus on the current page;
selection does not navigate or create another collection reader. Like the landing
selector, Test reconciles focus only against settled ready/empty data, preserving
selection through pending and error states.

Team also separates collection actions from selected-member actions. Its Read
modal changes focus in place, and selection waits for the member collection to
settle. Kitchen Team creation focuses the returned member once its live row
arrives, provided the Kitchen selection has not changed. Its info panel projects
the existing Team tool context, including deactivation rather than record erasure. Kitchen Team presentation does not wait for unrelated Place hydration;
write permission remains a separate domain decision. Kitchen and Project Team rows select in
place; the selected-member card provides the explicit detail link. Its info
panel includes live record count, status, and primitive availability. AI prepares
the same human dialogs and discards responses after workspace or focus changes.
Kitchen Team uses basic person controls and a separate invitation-link action.
The dossier-import and bundled enrolment workflows are retired. Kitchen and
Project Team AI prepare their existing human CRUD controls; neither action
preparation nor copying an invitation sends a message.

After proving a capability's human primitives/natives and AI handoff, review
useful compound tools within it and alongside other implemented capabilities.
Test remains a record-pipeline proof without invented compound workflows.

The Core `Workspace/CalendarSurface.vue` supplies the month grid and date
selection to Kitchen and Project. Neither currently connects an event collection
or event writer. Overview shows the selected identity and setup needs rather
than a second workspace collection. The shared Notifications panel filters the
signed-in User feed by All/Unread and exposes its scope through the info control.
Project Identity reads and edits its name, description and HTTPS image URL through
its existing Project update command. Its editor uses the Project management-access
check, captures the selected id, and rejects a changed workspace before saving.
The page publishes only its bounded identity fields and current update availability.
FireUX-owned AI composition prepares this same editor with null fields meaning
unchanged and explicit empty strings meaning clear. Identity, Team and Test use
`fireux-fireux/src/runtime/project/server/intent.ts` through its registered
Project intent handler. It receives bounded page context, validates output and
availability, and performs no mutations. The client rejects stale responses after
workspace or selection changes. Development uses the existing Codex transport;
production retains the configured provider.

### Layer zero on the main-contract pages

Kitchen and Project Landing, Team, and Test begin with the current-record selector, then
the Free upgrade section when applicable, introduction, AI composer, and record
controls. Selection establishes the current focus before all page content. The hero and info panel
share the same introductory wording. `WorkspaceIntroInfo` renders and copies
only that bounded introduction; Test retains its richer tool information using
the same purpose/data/boundaries/AI structure. Copy and metadata are page-owned;
Core owns the repeated presentation. This layer-zero pass does not claim CRUD,
native actions, compound operations, or the visual variants are fully aligned.

The Kitchen and Project universal page routes include a `WorkspaceFreemium`
section: Free at the top, Premium at the bottom, and none for Business. Its
copy comes from current App subscription capacity. Team/Test use their own
limits; other universal pages explain workspace capacity. The upgrade link
points to pricing and skips a tier when it offers the same capacity. This
is presentation over existing entitlements, not a new billing authority.
