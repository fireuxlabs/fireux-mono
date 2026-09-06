# Workspace entity family

Updated: 2026-09-06
Ref: d9a306e3f
Role: map, not canon

## Purpose

Map the shared Workspace Entity spine, the reasons domains differ, and the work
still needed to remove unexplained drift.

## Links

- Parent: `workspace.md`
- Child: `family-tenant-global.md`
- Horizontal: `entities.md`, `pages.md`, `components.md`, `composables.md`,
  `firestore-entity.md`, `runtime-filesystem.md`,
  `family-workspace-capability-tool.md`
- Executable reference: `scripts/guards/workspace-indexes.mjs`
- Server-shape reference: `scripts/guards/workspace-entity-server.mjs`
- Authority reference: `scripts/guards/workspace-entity-authority.mjs`

## Members and current surface

The exact Workspace surface and Capability lists live once in the source-backed
map in `workspace.md`. The family deltas are:

| Member            | Status and reason                                                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Blank             | `accepted`: App-local development harness; it proves the baked-in Workspace surface with factual read-only Team authority and no Operations, but is not an ecosystem-installed product Workspace |
| Kitchen           | `accepted`: Place-backed or name-only root, root-owned Team, and a large operational domain; Demo is outside the initial Workspace pipeline                                                      |
| Supplier          | `accepted`: root-owned Team plus Supplier-owned Catalogue, Ingredient, and Item operations                                                                                                       |
| Portfolio         | `accepted`: root-owned Team and a private-heavy Property, document, task, compliance, and Finance domain                                                                                         |
| Property          | `accepted`: root-owned Team plus Reservation and Calendar operations                                                                                                                             |
| Project           | `accepted`: FireUX control-plane root with Team authority and trusted empty-shell Create                                                                                                         |
| Marketplace Store | `accepted`: root Workspace ownership is declared now; its Workspace surface remains future product work                                                                                          |

## Selected identity in navigation

Kitchen and Project `Workspace/Navigation.vue` components supply the selected
logo and name both to the sidebar switcher and, through `identityOnly`, to the
shared Workspace navbar. Dropdown choices use entity images without selection
ticks. App landing nav adapters supply page information; they do not build a
second selected-identity projection.

## Workspace arrival language

The Workspace surface exists as soon as a user arrives at `/`. This applies
with or without saved Project or Kitchen records. Use “getting started” for
little or no saved information and describe progress through information added.
Do not tell the user “no workspace yet”. A connected App is a Project-specific
fact, not a universal onboarding stage. These descriptions do not introduce
stored lifecycle fields or change technical `empty`/`ready` read outcomes.
Creation controls still persist domain records through the existing commands;
visible Workspace availability does not grant mutation authority.

## Landing creation allowance

Kitchen and Project selectors use Core `useWorkspaceCreation` to offer creation
or “Upgrade to manage more” linking to `/pricing`. The calculation counts
workspace relationships across the current App membership and uses the App’s
configured subscription capacity. Pending/error membership reads offer neither
action; a settled visitor can start the existing creation flow.
Project's landing omits the zero-record selector alert and selector Create
button: its introduction frames the visitor as already working in a workspace.
The existing CRUD creation doorway remains available; the selector's additional
workspace button appears only when its collection is non-empty.
This is a presentation gate: trusted creation commands still own mutation
authority and currently check their domain relationship counts. It does not
prove a shared billing allowance across separate Apps or an ownership-only
count that excludes invited relationships.

## Shared spine

Every Workspace Entity must share these rules:

- The Entity index owns only `{ collection, outcome, selectedId, select }`.
  The selected Entity entrance owns only `{ data, id, outcome, crud }`, where
  `crud` exposes named `create`, `update`, and `delete` functions. Collection
  choice does not leak into the selected-Entity entrance, and page state,
  presentation, permissions, Demo, refresh, and compatibility aliases do not
  belong to either contract.
  Index `outcome` describes its collection read; entrance `outcome` describes
  its selected document read. A document outcome must never stand in for the
  collection's loading or error result.

- An App supplies the product lens through which a Workspace Entity is viewed:
  FireUX presents Project, Misebox presents Kitchen, and Granite presents its
  property-domain Entities. Workspace supplies the interface; the selected
  Entity owns its data and capabilities. These Entity types are parallel
  members of the Workspace family, not a universal parent-child chain.
- Project's domain is Project-building. A Project may relate to Ecosystems and,
  through them, their Apps and exposed domain Entities. The canonical chain is
  `Project -> Ecosystem -> App`; App has `ecosystem_id` but no Project field.
  Kitchen and other product-domain Entities do not store or understand Project,
  App, or Ecosystem merely because FireUX can discover them from above.

- The universal surface set, optional SaaS catalogue, industry promotion rule,
  Workspace-type ownership, and future generated-App composition contract live
  in `workspace.md`. This family map records implementation evidence and
  differences; it does not create speculative industry packages.

- Concrete Apps declare the Workspace surface and bounded App policy. The
  owning ecosystem installs its extension dependencies and any genuine
  cross-extension entrypoint; Apps do not repeat those module selections.
  Domain implementation and authority remain in the owning extension or Core
  Entity scope. Ecosystems without a proved Workspace do not gain placeholder
  routes, and App-specific adapters may retain their own framing.

### Kitchen and Project proving siblings

Kitchen and Project are the first consumers of the top-down Workspace Entity
contract. The contract is designed before their readers, writers, pages, or
existing consumers are treated as constraints. Those lower layers may be
deleted and rebuilt when they obscure the Workspace spine.

Their material differences remain domain-owned. Project is a private FireUX
control-plane Entity with Apps and Ecosystem relationships. Kitchen is a
food-service Entity with optional same-ID Place identity. Demo sources,
environment policy, and product-specific permissions are later concerns. Those
differences prove that Workspace is a shared product surface rather than a
field on either root or a generic owner of their records.

Their Index introductions also prove the shared `WorkspaceHero` structural
seam. Core owns its Nuxt UI page-header anatomy; each domain or ecosystem
surface owns its copy, actions, and state beneath its actual owner. Kitchen
and Project also share the Core-owned `WorkspaceAI` frame and
`WorkspaceAIComposer` interaction seam. Root, Team, and Test surfaces use the
same soft prompt, footer, submit, and suggestion-chip anatomy. Domains supply
context, connected controls,
messages, commands, and authority; the neutral frame and prompt anatomy must
not fork merely because one family has more mature execution.
Each page AI receives only the CRUD primitives currently available on that
page. Composer-only AI surfaces may present those primitives as contextual
prompts but must not imply execution; a connected agent receives only its
registered action ids and still obeys domain authority and confirmation.
The main page composable owns one factual capability context containing the
subject, primitive availability, record counts, and domain-native paths. CRUD
and the page AI adapt that same context; AI wording, model instructions, and
tool selection do not move into the main composable.
An unavailable command remains visibly unavailable rather than being imitated.
The Project and Kitchen Team plus Project and Kitchen Test proving pages establish the
capability-page CRUD interaction: a selector establishes the current record;
Update and Delete open capability-owned modals; the domain executes the write;
and the reader changes the UI. The reader implementation is replaceable: an
existing listener, API reader, cache, or consumer is not architectural
authority and may be rebuilt after the contract is fixed.
Project Team and Kitchen Team prove one Core-owned Team interaction for stable
member-id selection, collection Read, Update, and Deactivate mechanics. Their
thin Entity adapters retain Create workflow, detail-route prefix, copy, and
trusted commands; Core does not acquire either Entity's Team authority.
Project and Kitchen Test share the Core-owned `useTest` capability and
`Workspace/Test` presentation over the minimal `{ id, value }` packet. Core
owns stable record-id selection, capacity, CRUD coordination, interaction, and
detail routing. Their thin adapters and trusted commands retain domain storage and authority;
array position is never record identity. Test storage and transport remain
domain-owned and may be rebuilt without changing the shared packet or
Workspace contract.
Delete retains domain meaning: Kitchen and Project Team remove a roster entry and Test deletes
its disposable record. Kitchen Index separately proves an on-page update of
Kitchen-owned root fields. Project root Update and Delete and Kitchen root
Delete remain visibly unavailable until ProjectMeta synchronization and each
Entity lifecycle and dependent-data policy are proved. Detail pages do not own
a second mutation implementation while this family is being proved.
Project and Kitchen landing adapters pass the same
`{ state, derived, primitives, natives }` interface through Selector and Main.
Entity-owned command sets may differ only
where domain authority is proved: Kitchen currently adds root Update while
Project does not.
Kitchen owns the live `WorkspaceKitchenSelector`, `WorkspaceKitchen`, creation,
target loading, and collection lifecycle. The Main App supplies its own copy directly to the
shared `WorkspaceHero`, composes the Kitchen Workspace at `/`, and adds only
its App-owned presentation and doorways from
`app/components/Workspace/Kitchen`. Kitchen capability execution remains in
the extension's `Workspace/Capability` family. Kitchen-enabled Apps receive
an authenticated `/workspace/kitchen` route that mounts the direct
Kitchen-owned Workspace and resolves available Kitchens through runtime
authority rather than configured target ids. The shared component does not
receive Entity names, subscription rules, or capability configuration.

Canonical storage follows the Entity boundary. Project owns
`projects/{projectId}/team/{uid}`. Kitchen owns
`kitchens/{kitchenId}/team/{uid}` while its five-field domain model remains
exactly `id`, `identity_source`, `slug`, `status`, and `visibility`. A
Workspace Team projections preserve the Team record's role labels and linked
User id. A linked member resolves its page-facing name and avatar from the
canonical User; an unlinked operational person resolves the explicitly entered
name retained by the Team record. Neither path invents identity when its
authoritative source is absent. A
Place-backed Kitchen uses its same-ID Place for venue identity; a name-only
shell may be enriched later. `identity_source` records `user` or `place`
onboarding and is independent of Place classification.
A Kitchen capability owns its configuration and records beneath the
Kitchen only after that destination and its consumers are proved. Existing
Kitchen root fields and App-nested support are migration preimages, not a
second authority; retain them until the capability-owned reader, writer,
migration verification, and protected Workspace consumer are complete.

- Entity server capabilities under the entity-scoped destination follow the
  Workspace's vertical product slices: `core/`,
  `index/`, `overview/`, `identity/`, `team/`, `capabilities/`, and `ai/`.
  A slice exists only when it owns real server behaviour; empty placeholder
  files and folders are not required.
- `core/` owns entity-wide authority and target resolution. `index/` owns the
  collection and Create/onboarding doorway. `overview/` owns only genuine
  overview-specific reads. `identity/` owns identity projection and mutation.
  `team/` remains a first-class Workspace capability. `capabilities/` owns the
  domain capabilities of that Entity; each capability owns its Tools and
  commands. `ai/` owns the entity's
  AI capability without becoming a generic Workspace navigation peer.
- Technical phases such as `access`, `lifecycle`, `mutation`, `projection`,
  and `presentation` are not entity root slices. Their behaviour stays inside
  the Workspace capability that owns it. HTTP adapters remain under
  `runtime/server/api` and call these entity-owned capabilities.
- Core owns only server primitives proven across entity families. Shared App
  runtime policy, membership validation, bounded Team-authority parsing,
  and capacity enforcement live in
  `packages/core/fireux-core/src/runtime/server/utils/workspace-entity/onboarding-authority.ts`.
  Entity-specific management validation, projections, messages, and
  transactions remain in the owning entity slice.

- Workspace is the shared active-Entity surface, not the entity owner.
  Shared Workspace components and composables remain in the root technical
  spine. Entity-specific Workspace components and composables move to
  `runtime/<entity>/components/Workspace` and
  `runtime/<entity>/composables/workspace`; entity models and server commands do
  not move under Workspace merely because it consumes them.

- `useWorkspace(workspace)` persists only one selected Entity id and exposes
  `selectedId`, `select`, and selection reconciliation. Its internal `clear` remains
  for lifecycle callers and families awaiting this cutover. It owns no reader,
  loading lifecycle, directory,
  authority query, source mode, storage routing, runtime anatomy, or debug
  projection.
- Each domain's `useXWorkspace` bridges those ignorant selection mechanics to
  its Entity reader. It exposes `data`, `id`, `outcome`, and
  `crud: { create, update, delete }`. Index pages use `useXWorkspaceIndex` for
  the collection and selection; they do
  not establish another Entity reader or selection authority.
  Outcomes are `idle`, `pending`, `error`, `empty`, `missing`, or `ready`; read failure
  never becomes an empty authority result.
- Project and Kitchen selectors present their membership-bounded collection.
  Selecting uses the Core App-scoped selection cookie. A settled collection
  preserves a valid selected id, otherwise selects its first available id, and
  clears only when no ids remain. Pending, idle, and failed reads do not clear
  selection. Collection snapshots and component mounts never reapply an AppUser
  primary preference.
  Selection is not a membership grant or an account-primary mutation. Existing
  trusted primary-change commands remain separate account workflows.
- Kitchen and Project own `Workspace/Navigation.vue` components, registered once
  as global `WorkspaceKitchenNavigation` and `WorkspaceProjectNavigation` through
  their packages. The Core layout resolves the current family's component by
  that naming convention; it never imports an extension to read its Entity.
  The selected name/image and available choices come from the domain Index.
  The collection-owning Selector presents confirmed empty state; the selected
  Entity Main never infers an empty collection from a missing active id.
  The same shared footer slot serves desktop and mobile, including direct
  capability entry. A change of Entity remounts page-local interaction state;
  ordinary route navigation does not key the layout by URL. Test selection is
  also scoped by Entity id so repeated record ids cannot cross Workspace roots.
  Supplier, Property, Portfolio, and Blank remain `migration` at this seam until
  their domain navigation and retained `clear` interfaces are cut over and verified.
- Capability runtimes consume `useXWorkspace().id` and load only their
  own records. They do not reconstruct an Entity directory, read
  `primary_<family>` independently, or establish another selection authority.
- Domain Index composables expose named Entity collections and actions
  directly. Core does not own a generic directory-index adapter.
- `team/{uid}` belongs to the Entity's Team surface and names its roles and
  permissions. It is not the user's Workspace Entity index.
- The AppUser model reserves the explicit plural Entity-id array and singular
  `primary_<family>` field used by each implemented family; no generic
  Workspace target field owns those relationships. Kitchen, Project, Portfolio,
  Property, and Supplier now prove the primary-only Index read contract.
  Each persisted pair is optional until its family establishes a relationship;
  if either field is present, both must be present and valid. The current-App
  projection normalizes an absent pair to an empty array and empty primary id,
  so runtime consumers retain a complete stable DTO without pre-seeding storage.
  Portfolio, Property, and Supplier still require separate trusted Create and
  primary-change cutovers before their legacy mutation paths can be retired.
  Blank remains on legacy App-support access until its complete Server-authority
  cutover and migration land.
- Subscription capacity counts the AppUser Entity-id array inside the trusted
  Create transaction. Each App owns its capability-keyed limits; Core owns only
  their runtime shape and resolver. The same transaction creates the Entity
  root, updates the User array and primary id, and may create the initial Team
  record for the separate Team surface. Its Workspace composable and trusted
  command must resolve the same App capability entry.
- Workspace Entity creation has one Core-owned identity decision in
  `runtime/server/utils/workspace-entity/creation-identity.ts`. An explicit
  first shell uses the beneficiary User UID; an explicit existing-source path
  preserves that source id. The Entity family still owns what its authoritative
  source is: Kitchen currently proves same-id Place onboarding, while Project
  proves a source-free first shell. Additional Business shells may use generated
  ids according to the family command's capacity policy. This shared decision
  does not create mutation authority for Property, Supplier, Portfolio, or
  other families whose trusted creation command is not yet proved.
- The AppUser primary field is persistent account preference, separate from
  the currently open Workspace. Its trusted change workflow does not own the
  browser's active Entity id.
- Visible `canWrite` state never replaces server or Rules enforcement.
- Workspace onboarding uses a fixed-runtime family endpoint and one trusted
  transaction for root, the caller's Team authority, and any required parent
  records. Authentication is the default; Kitchen's name-only shell command is
  the accepted bounded exception that may authorize a Firebase anonymous
  identity.
- Workspace-capable roots that declare management share one management ladder:
  `root`, `workspace`, or
  `app`. `workspace` resolves by convention to the ecosystem App
  (`<ecosystem>-app`); no configurable Workspace App id is stored. `app` alone
  stores `app_id`. Kitchen deliberately declares no management field; its
  current identity, optional Place, App policy, and Team evidence remain
  Kitchen-owned. Domain
  packages own their transactions, so Core does not enumerate present or
  future Workspace families.
- Index establishes the active Entity. Its selector owns only selection; the
  main `WorkspaceX` section owns `WorkspaceXCrud` and its Create doorway. Overview,
  Identity, Team, and domain Capabilities remain separate current-workspace concerns;
  Create is never a current-workspace menu peer.
  A family adds only sheets backed by a real lifecycle.
- Calendar is the intended common top-bar time-navigation sheet and opens on
  the current date; it does not consume a permanent sidebar row. Each Entity
  still owns its event sources, authority, actions, and readiness prerequisites.
  Calendar and Notifications appear only for a non-anonymous signed-in user
  with a selected canonical root whose lifecycle status is `active`. The
  authorized family reader already proves that user's Team access. This is
  onboarding lifecycle readiness, not identity completeness, publication, or
  capability setup, and it is derived at runtime rather than stored as a
  generic Workspace `onboarded` field.
  Kitchen, Property, and Project currently prove distinct date-navigation
  implementations. Project truthfully begins empty until an owning capability
  supplies time-bound evidence. Other families do not gain speculative Calendar
  events or placeholder routes merely for visual symmetry.
- A separate Today navigation destination is retired. Focused current-day work
  may move onto an App-owned Workspace landing only after that Entity's
  onboarding prerequisites are explicit and satisfied.
- The shared Workspace header may copy a bounded page-runtime JSON envelope.
  `state.user` contains only authenticated User identity inputs,
  `state.appUser` contains the current AppUser's Entity-id relationship and
  persisted primary Entity id, `state.entity` contains only selected Entity
  inputs read directly, and
  `state.derived` contains values the page computes and consumes from those
  inputs. Family `useXWorkspaceIndex` readers publish the common Workspace state;
  capability pages must explicitly extend or replace it when they require
  narrower capability props. Tokens, Firestore internals, unused root fields,
  and broad debug objects are never part of this contract.

The current Project/Kitchen proving graph is deliberately small:

```text
User
├─ appUser.projects[] + appUser.primary_project
│  └─ project → ActiveProject
│     ├─ project
│     ├─ project.team
│     └─ project.tests
└─ appUser.kitchens[] + appUser.primary_kitchen
   └─ kitchen → ActiveKitchen
      ├─ kitchen
      └─ kitchen.team
```

Each named page publishes only the runtime state directly consumed by that
page-facing capability. Workspace-shell context may still be used internally
for selection, fetching, and authority, but it is not repeated in a capability's
copied JSON unless that capability directly consumes it. Capability pages never
inherit or leave behind another page's copied JSON. For example,
`project.tests` publishes `tests` and `derived`; its internal Project context is
not part of the Test capability's page-facing state.

Project entry Update reuses the Identity editor and its bounded identity update
controller. An App-owned composition may supply a published description/image
projection; those fields then become read-only and Project Update writes only
the workspace name. Unconnected Projects retain manual identity fields. Core
receives the projection, never an App id or endpoint rule. The Identity route owns its page JSON publication;
the reusable controller does not publish into a caller's inspector. This keeps
the entry page's context intact when the same editor is opened from `/`.

The nine proving pages expose one small page-facing `derived` vocabulary:
`status` and `capability`. `status` is the page lifecycle (`idle`, `loading`,
`error`, `empty`, or `ready`); it is not subscription capacity. The capability
context owns the subject, CRUD primitive availability, record counts, creation
limit, native paths, and the resulting available-action list. Selection is
read from the Entity id and records from the owned array; those facts are not
duplicated beside the capability context. CRUD, selectors, AI, and the Info
inspector consume that same object rather than maintaining parallel page
policy. Domain internals may keep narrower names, but page JSON and page
components use this shared vocabulary.

## Accepted deltas

| Delta                                                        | State      | Why it exists                                                                                                                                                                                                                                       | Evidence or owner                                                                                             |
| ------------------------------------------------------------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Place-backed Kitchen identity uses its same-id Place         | `accepted` | A Place-backed Kitchen is the operation at one Place; a name-only Kitchen shell may begin without Place identity, while capability records own operational configuration                                                                            | Current Kitchen and Place models plus package/entity guards                                                   |
| Kitchen Team adds operational roles to shared Team authority | `accepted` | Kitchen and Project share a name, account link and assigned role labels. Removing a roster entry revokes pending invitations; workspace access remains on AppUser. | `useKitchenTeam`, Kitchen Team server commands, and `Workspace/Kitchen/Team`                         |
| Supplier, Portfolio, and Property Team are minimal today     | `accepted` | Their current Team pages expose root-owned Team truth without inventing domain people collections or edit controls                                                                                                                                  | family `useXWorkspaceTeam` adapters and `WorkspaceTeamPanel`                                                  |
| Blank has no child Operations                                | `accepted` | Blank is a structural harness; its baked-in Team sheet projects existing access authority without inventing membership tools                                                                                                                        | `projects/fireux/fireux-blank`                                                                                |
| Project Create produces an inactive empty shell              | `accepted` | The trusted FireUX command creates only the canonical Project and caller's linked Team profile; publication and further product composition remain separate lifecycles                                                                             | Project entity declaration, internal control-plane APIs, and Project Workspace Create                         |
| Active root gates operational top-bar controls               | `accepted` | Calendar and Notifications require signed-in Team access to a selected root that completed its family onboarding lifecycle; presentation and publication readiness stay separate                                                                    | Shared Workspace state/Navbar plus family Workspace readers                                                   |
| Capability families differ by domain                         | `accepted` | Each Workspace Entity exposes only capabilities backed by its own product records and authority                                                                                                                                                     | current source uses direct `components/Workspace/<Capability>` and `composables/workspace/<Capability>` paths |

Accepted deltas change domain content or authority. They do not change the
Index outcome contract.

At the current proving stage, Project landing, Kitchen landing, Project Test,
Kitchen Test, Project Team, Kitchen Team, Kitchen Menus, Kitchen Dishes, and Kitchen Drinks
use this page anatomy in order:

1. Selector
2. Hero
3. AI
4. Main
5. Tools
6. Operations
7. Discovery

Main owns the capability's primitive composition; those primitives are not
page-level siblings. CRUD owns Create, Read, Update, and Delete. The former
client-only Test text transforms were removed because they did not persist and
therefore did not prove a capability. This is a bounded rule for these nine
proving pages, not a universal Workspace page contract. Each enabled
Create doorway composes a domain-owned `Crud/Create.vue` modal when its action
is connected. During the current primitive-building pass, CRUD primitives are
kept visibly aligned even where a domain command is not connected; availability
is not a release claim. Selector plus controls remain conditional on the owning
subscription-capacity decision. A later pass will apply that same condition to
the CRUD primitive with explicit disabled-state presentation.

Within these eight proving capabilities, Read is a two-stage CRUD primitive.
The Read toolbar action opens a domain-owned modal containing that capability's
collection; selecting a record in the modal opens its individual detail route.
The toolbar action must not navigate directly, and refresh alone is not Read
evidence. Project, Kitchen, Project Team, Kitchen Team, and Project Test keep
their own collection labels, record identity, and detail presentation while
sharing this interaction chain.
Team record detail routes use the stable record parameter `memberId` in both
Project and Kitchen families. Display slugs may own labels or document anchors;
they do not replace record identity in Workspace CRUD routing.

Core owns the shared Team presentation with stable record id, userId, name,
avatar, roleIds. Account identity enriches the stored record. Kitchen
and Project persist exactly name, user_id and role_ids; document ids and
account avatars remain reader metadata.

### Universal responsibility and domain meaning

Identity and Team are universal capability responsibilities, not universal
industry schemas. Kitchen and Project prove different Identity shapes: Project
edits its own name, description and image; Kitchen composes Kitchen identity with
its same-id Place. Address, contact, business hours, currency and timezone stay
Place-owned. No shared Identity-field model is required by these consumers.

The shared `Workspace/Team/Crud.vue` editor manages name. Roles are
assigned beside the selected person; Dev and Operator are fixed labels and each
workspace offers authored industry suggestions. Roles do not affect access.
Signed-in AppUser workspace association and subscription are the development
boundary. Every person counts toward subscription capacity. The focused form proof is
`packages/core/fireux-core/src/test/team-dialog-intent.test.mjs`.

Classified boundaries:

- `accepted`: shared selection, capacity and dialog lifecycle; domain-defined
  Identity fields, linked records and access choices.
- `migration`: `fireux-core/src/runtime/project` still owns the Project
  control-plane domain, including its Identity editor and Team policy. A complete
  owner cutover must include entity readers, commands, registrations and all
  consumers; moving only a form would leave a split owner.
- `migration`: `runtime/models/utils/workspace-entity.model.ts` still provides a
  stored Team role enum/default used by Property, Portfolio, Supplier
  and Marketplace Store. Their authority parsers and writers must be audited
  together before replacing it. The presentation pass does not change stored
  authority or claim that Core is fully domain-ignorant.
- `to-confirm`: future industry field and job-title definitions. The Builder may
  propose domain configuration; no generic schema generator or role registry is
  established by these two surfaces.

Persistent Workspace navigation is not owned by any page stage. Core's named
Entity navigation controller owns active identity, alternative Entity choices,
and selection requests so the app-owned navbar remains a thin presentation
adapter and behaves identically on landing and capability routes.

Core's shared Workspace navbar also owns the invariant operational controls:
subscription, page context, bounded page JSON, Calendar, and Notifications.
Pages may supply their title and capability-specific context body, but they do
not hide or reconstruct those controls. A control without current runtime data
remains visible and unavailable rather than changing the navbar anatomy.

Core owns one presentation primitive for each basic record operation:
`WorkspaceCrudCreate`, `WorkspaceCrudRead`, `WorkspaceCrudUpdate`, and
`WorkspaceCrudDelete`. `WorkspaceCrud` owns their fixed toolbar order and the
open/close interaction for four named modal slots. Unavailable actions remain
visible and disabled. Each Entity or Capability supplies only the slots it can
execute and retains its forms, records, validation, commands, authority, and
non-CRUD Tools. Project and Kitchen roots prove available-action differences.
Supplier proves that an Entity may reuse the same controller while truthfully
disabling Create, Update, and Delete until its Workspace authority exists.
Project Test, Project Team, and Kitchen Team prove capability consumers.

## Migration and drift register

| Difference                                                                          | State      | Required direction                                                                                                                   |
| ----------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Supplier readers return canonical Supplier and related Place Entities               | `accepted` | Preserve both canonical records; Workspace consumers must not manufacture replacement Entity DTOs                                    |
| Team presentation does not yet resolve polished people consistently outside Kitchen | `drift`    | Keep raw authority ids factual for now; add one shared bounded people projection only when the privacy and source contract is agreed |
| Kitchen authored route slug differs from stable root identity                       | `accepted` | Resolve the slug through the bounded Kitchen route resolver while Workspace and operation relationships retain the stable root ID    |
| Workspace Entity implementation uses `runtime/<entity>/<technical role>`            | `accepted` | Preserve Nuxt pages/API entrypoints and established component/composable names through explicit scoped registration                  |

## Component and composable naming

Shared source names and their generated entry components:

- `Workspace/Index.vue` → `WorkspaceX`
- `Workspace/Selector.vue` → `WorkspaceXSelector`
- `Workspace/Selector/Choices.vue` → `WorkspaceXSelectorChoices`
- `Workspace/Crud.vue` → `WorkspaceXCrud`
- `Workspace/Active.vue` → `WorkspaceXActive`
- `WorkspaceXOverview`
- `useXWorkspace`
- `useXWorkspaceOverview`

Each `useXWorkspace` exposes `data`, `id`, `outcome`, and
`crud: { create, update, delete }`. Each `useXWorkspaceIndex` exposes
`collection`, its read `outcome`, `selectedId`, `select`, and `clear`.
Entity-specific storage, membership, subscription, and authority decisions
remain inside that bridge. Index-page presentation may derive local props from
the bridge but does not own a second runtime, reader, or selection contract.
Kitchen and Project are the pilot bridges for this exact contract. Demo data,
write policy, storage routing, debug projections, and refresh commands do not
belong in the bridge.
Declaration-build-only types may live beside the composable so they do not
obscure this runtime spine.

Conditional names:

- `WorkspaceXIdentity` and `useXWorkspaceIdentity` when identity editing/reading is
  a real Workspace sheet.
- `WorkspaceXTeam` and `useXWorkspaceTeam` when target authority or domain people are
  exposed.
- `WorkspaceXOperationsY` and `useXWorkspaceY` for active-Entity domain work.

Kitchen may use nested Identity sections because the sheet has Place,
publication, theme, hours, delivery, and payment concerns. That is an accepted
composition delta, not permission to fork the Workspace Index spine.

## Workspace selector presentation

A Workspace index that exposes a bounded selectable set places
`WorkspaceXSelector` directly below its Nav and before its Hero. The selector
uses compact link tabs at the top-left and highlights the selected item. It may
present a conditional Create shortcut, but that shortcut delegates to the same
capability-owned CRUD Create operation and never owns a second implementation.
After Hero and AI,
`WorkspaceX` owns `WorkspaceXCrud`; the Index does not add a second selected-
Entity presentation between AI and CRUD. Tools, Operations, and Discovery
follow in that order.

The current proved sources are `project.test.strings`, `user.kitchens`,
`user.projects`, `kitchen.team.teamMembers`, `project.team.teamMembers`,
`kitchen.menus`, `kitchen.dishes`, and `kitchen.drinks`. This is a shared
presentation rule, not shared
selection persistence: Kitchen and Project persist their current Entity id
through Core's App-scoped cookie, while Test and Team selection is temporary
page focus. Neither selector implicitly changes the account primary.

The selector plus doorway is shown only when the current AppUser has the
Business/unbounded selection entitlement and the domain proves remaining
creation capacity and mutation authority. Each App owns its capability-keyed
Free, Premium, and Business limits; Core owns only the config shape and
resolver. The CRUD Create operation remains visible while its future guard is
unproved; this presentation rule does not bypass the trusted creation command.

## Capability composable evolution

Status: `to-confirm`. This is the working comparison model for evolving
Workspace capability composables. It supports bounded implementation and
review; it is not an established Core spine or permission to create generic
wrappers.

The intended shallow dependency direction is:

```text
App configuration
└─ capability-keyed subscription limits

useWorkspace('<entity>')
└─ useXWorkspace
   └─ useXWorkspaceCapability
      └─ useWorkspaceCapabilityName
```

For the current Team proving siblings:

```text
useProjectWorkspace
├─ useProjectTest
└─ useProjectTeam
   ├─ Project Team records and authority
   └─ useTeam

useKitchenWorkspace
├─ useKitchenTest
└─ useKitchenTeam
   ├─ Kitchen Team records and authority
   └─ useTeam
```

The Entity's `/` page and its capability composables consume `useXWorkspace`.
Project/Kitchen Test and Project/Kitchen Team now use this shallow path. The
temporary Kitchen index adapter only translates the bridge into legacy
component props and must disappear when those components accept the canonical
contract directly.

A named shared capability composable such as `useTeam`,
`useWorkspaceMenus`, or `useWorkspaceStations` may own only behaviour that two
materially different Entity families prove for the same reason. Candidate
mechanics include temporary item selection, defaulting to the first valid
item, count, App-configured capacity, `canCreate`, `capacityReached`, and common
pending/error outcomes. Domain record shapes, readers, persistence, mutation
authority, invitations, and lifecycle rules remain in `useXWorkspaceCapability`.

Do not introduce a generic `useWorkspaceCapability`. If named capability
composables later repeat smaller mechanics, compare them first; only then may a
small Core primitive such as selection or capacity resolution be extracted.

Team page roots pass one domain Team controller to their selector, AI,
interaction, and tool adapters. The Core `useTeam` composable owns member
selection, post-create focus, count, capacity and CRUD availability; workspace access-id projections remain with the
Entity access context. Small leaf components may still receive the few values
they render or mutate directly.

`useKitchenTeam` and `useProjectTeam` each own their domain reads and commands,
compose shared `useTeam`, and return a single context to the Team UI through a
`team` prop. There is no separate TeamData, WorkspaceTeam or provider layer.
Identity reads workspace association directly and does not load Team for access.

Team Create follows one Core-owned interaction: search the current App's
eligible User directory, choose an existing User when found, or create an
unlinked named member when no suitable User exists. Project and Kitchen own
their trusted create commands, duplicate-link checks, records, and authority.
Choosing a User links identity to the Team record; Workspace access remains an
explicit domain onboarding or authority action rather than a UI side effect.

Current evidence and confidence:

| Seam                                                                 | State        | Evidence and next comparison                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entity selection through `useWorkspace('<entity>')`                  | `accepted`   | Kitchen and Project expose the same top-down selection contract. Their current readers are replaceable implementations rather than constraints on Workspace design.                                                                                                     |
| Named `useTest` capability                                           | `accepted`   | Project and Kitchen consume one Core-owned `{ id, value }` packet, selection, CRUD coordination, selector, detail, AI prompt, empty-state, and discovery contract. Storage, transport, and existing consumers may be rebuilt beneath that contract.                     |
| Named `useTeam`                                                      | `to-confirm` | Kitchen and Project Team now share first-member focus, count and capacity. Kitchen empty-state runtime passed; Project and Kitchen tool entrypoints now accept associated AppUsers regardless of Team role during development; the complete sibling comparison is not yet proved |
| `useWorkspaceMenus`, `useWorkspaceStations`, `useWorkspaceSuppliers` | `to-confirm` | Kitchen has named domain capabilities, but a second real Entity family has not yet proved shared mechanics                                                                                                                                                              |
| Generic capability primitives                                        | `to-confirm` | Extract only after at least two named capability composables repeat the same contract for the same reason                                                                                                                                                               |

Promotion requires two working Entity-family siblings, a source comparison,
matching inputs and outputs, preserved authority boundaries, focused runtime
verification, and a guard only for the surviving invariant. If a shared layer
forces domain branches, unused state, duplicate readers, or pass-through
wrappers, move that behaviour back to the named domain composables; callers
remain stable because pages depend on `useXWorkspaceCapability`, not the
provisional lower implementation.

## Workspace Focus List family

A Workspace Focus List is a deliberately small working set inside one active
Workspace Entity. People normally act on one item at a time, so a compact
selector remains useful even when the set contains several items. Selection is
temporary page state: the first loaded item is the default, and choosing another
item does not create primary semantics, mutate the Entity, change the URL, or
write browser storage.

The current Kitchen proving members are Team, Menus, Stations, and Suppliers.
A Focus List may show a create doorway only when the domain already owns a real
Tool and command. Suppliers therefore remain selection-only until a Supplier
connect Tool is implemented. Drinks, Dishes, Ingredients, Orders, and Waste are
catalogue or event collections rather than Focus Lists; they need search,
filtering, pagination, or task-specific views instead of this selector shape.

Focus List is one surface-family classification. Operation, Capability, Tool,
entry-family, Local Tool, and Compound Tool meanings are owned by
[Operation, Capability, and Tool family](family-workspace-capability-tool.md);
this Workspace map owns only their application to active-Entity surfaces.

## Alignment roadmap

### Now

- Preserve the guard-backed six-family Index parity.
- Keep one family-owned target outcome and one outcome-bound active Entity.
- Keep Team as a Workspace peer and the single Workspace membership authority.
  Kitchen-specific operational roles may extend that record without creating
  another access list.

### Next

- Keep the five-field Kitchen root + optional same-id Place + root-owned Team composition
  guarded across Live, Demo, and Test sources. Reject copied Place identity,
  Kitchen media overrides, and redundant `place_id` on the Kitchen root.
- Keep Kitchen live Create on its guarded trusted onboarding endpoint and keep
  root identity and Team creation atomic.
- Preserve canonical Supplier and related Place records in Workspace readers;
  Portfolio remains its canonical readable root with scoped and private work
  owned separately.
- Keep every Entity operation catalogue limited to the Operations listed in
  `workspace.md`; baked-in capabilities never enter operation-only consumers.

### Later

- Add a shared people projection only after a bounded privacy-aware contract is
  proven by more than one family.
- Promote Overview, Identity, or Team details into guards only after their
  lifecycle shapes are as stable as the current Index contract.

### Project and Kitchen Team profiles

Both surfaces consume `models/workspace-team-member.model.ts` and `TeamAIIntent`
directly. Core owns Team Selector, Create and Editor; domain Index components
compose those surfaces with their routes, headings, role controls and invitations.
Domain-named type re-exports and forwarding UI copies are retired. Their data adapters compose Core
`useTeam` for selection, post-create focus, capacity and CRUD availability;
workspace controllers retain their transport and domain-specific invitation actions.
Names for linked people come from their accounts. Role catalogues contain names;
member role_ids refer to fixed or workspace-defined labels. Legacy job titles,
access-role fields and dossier properties are removed from this profile.

### Test capability context

`useKitchenTest` and `useProjectTest` compose Core `useTest` directly, without
Workspace-named forwarding composables. Each publishes one bounded context:
`workspace`, `collection`, `selected`, and `derived`. The shared Test Info
surface renders those sections, both JSON doorways copy the published payload,
and AI requests project from it. Commands remain outside serializable context.
This contract is proved for Test; other capability contexts require their own
bounded adoption rather than whole-record substitution.
