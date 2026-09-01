# Workspace entity family

Updated: 2026-08-31
Ref: 6a9f64e67
Role: map, not canon

## Purpose

Map the shared Workspace Entity spine, the reasons domains differ, and the work
still needed to remove unexplained drift.

## Links

- Parent: `workspace.md`
- Child: `family-tenant-global.md`
- Horizontal: `entities.md`, `pages.md`, `components.md`, `composables.md`,
  `firestore-entity.md`, `runtime-filesystem.md`,
  `family-operation-capability-tool.md`
- Executable reference: `scripts/guards/workspace-indexes.mjs`
- Server-shape reference: `scripts/guards/workspace-entity-server.mjs`
- Authority reference: `scripts/guards/workspace-entity-authority.mjs`

## Members and current surface

The exact peer and Operation lists live once in the source-backed capability
map in `workspace.md`. The family deltas are:

| Member            | Status and reason                                                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Blank             | `accepted`: App-local development harness; it proves the baked-in Workspace surface with factual read-only Team authority and no Operations, but is not an ecosystem-installed product Workspace |
| Kitchen           | `accepted`: Place-backed or name-only root, dual Live/Demo targets, root-owned Team, and a large operational domain                                                                              |
| Supplier          | `accepted`: root-owned Team plus Supplier-owned Catalogue, Ingredient, and Item operations                                                                                                       |
| Portfolio         | `accepted`: root-owned Team and a private-heavy Property, document, task, compliance, and Finance domain                                                                                         |
| Property          | `accepted`: root-owned Team plus Reservation and Calendar operations                                                                                                                             |
| Project           | `accepted`: FireUX control-plane root with Team authority and trusted empty-shell Create                                                                                                         |
| Marketplace Store | `accepted`: root Workspace ownership is declared now; its Workspace surface remains future product work                                                                                          |

## Shared spine

Every Workspace Entity must share these rules:

- Concrete Apps declare the Workspace surface and bounded App policy. The
  owning ecosystem installs its extension dependencies and any genuine
  cross-extension entrypoint; Apps do not repeat those module selections.
  Domain implementation and authority remain in the owning extension or Core
  Entity scope. Ecosystems without a proved Workspace do not gain placeholder
  routes, and App-specific adapters may retain their own framing.

### Kitchen and Project proving siblings

Kitchen and Project prove the Workspace Entity family beyond their shared
Index anatomy. Both use the canonical `/workspace/{family}` route, one
request-scoped `useXWorkspace` runtime, outcome-bound active Entity, root-owned
Team authority, the shared shell and navigation groups, and entity-owned
Overview, Identity, Team, named capability, and debug adapters.

Their material differences remain domain-owned. Project is a private FireUX
control-plane Entity with Apps and Ecosystem capabilities and a trusted
root-plus-owner-Team empty-shell command. Kitchen is a domain-database Entity
with Live and Demo sources, trusted onboarding, food-service capabilities, and
optional same-ID Place identity. Those
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
An unavailable command remains visibly unavailable rather than being imitated.
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
  `index/`, `overview/`, `identity/`, `team/`, `operations/`, and `ai/`.
  A slice exists only when it owns real server behaviour; empty placeholder
  files and folders are not required.
- `core/` owns entity-wide authority and target resolution. `index/` owns the
  collection and Create/onboarding doorway. `overview/` owns only genuine
  overview-specific reads. `identity/` owns identity projection and mutation.
  `team/` remains a first-class Workspace capability. `operations/` owns all
  operations performed by or for that entity; for example,
  `kitchen/operations/` owns all Kitchen operations. `ai/` owns the entity's
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

- `useWorkspace(workspace)` persists only one active Entity id and exposes
  activate/clear actions. It begins unresolved and those actions resolve the
  shared Workspace presentation, so direct capability routes inherit the same
  loading contract without page-owned pending flags. Core defers presentation
  publication until client hydration completes. It owns no directory,
  authority query, source mode, storage routing, runtime anatomy, or debug
  projection.
- Each domain's `useXWorkspaceIndex` proves access through its authoritative
  AppUser relationship, reuses the current App context for the explicit Entity
  id array and `primary_<family>` id, and reads at most that primary Entity.
  It exposes only the page's bounded state, derived values, and actions.
  Outcomes are `idle`, `pending`, `error`, `empty`, or `ready`; read failure
  never becomes an empty authority result.
- No available Entity produces the Create state. One accessible Entity may
  become current automatically. Choosing among several is a User relationship
  action outside the baseline Workspace index. A Business selector may load
  the bounded Entity choice projection when it renders. Free and Professional
  load choices only for the exceptional case where their AppUser relationship
  already contains several Entity ids, so they can request an administrator to
  change the primary Entity without changing browser selection state.
- Capability runtimes receive the established active Entity id and load only
  their own records. They do not reconstruct an Entity directory or another
  active-Entity authority.
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
- Primary selection is persistent AppUser state. Business users may change it
  directly among their available Entity ids. Free and Professional users with
  several legacy ids submit an administrator-notified change request; the
  Workspace does not pretend the requested Entity became primary.
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
  Identity, Team, and Operations remain separate current-workspace concerns;
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
  `state.user` contains only user inputs read directly by the page,
  `state.entity` contains only selected Entity inputs read directly, and
  `state.derived` contains values the page computes and consumes from those
  inputs. Family `useXWorkspaceIndex` readers publish the common Workspace state;
  capability pages must explicitly extend or replace it when they require
  narrower capability props. Tokens, Firestore internals, unused root fields,
  and broad debug objects are never part of this contract.

## Accepted deltas

| Delta                                                        | State      | Why it exists                                                                                                                                                                                                                                       | Evidence or owner                                                                                             |
| ------------------------------------------------------------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Place-backed Kitchen identity uses its same-id Place         | `accepted` | A Place-backed Kitchen is the operation at one Place; a name-only Kitchen shell may begin without Place identity, while capability records own operational configuration                                                                            | Kitchen and Place models plus `scripts/guards/kitchen-entity.mjs`                                             |
| Kitchen Team adds operational roles to shared Team authority | `accepted` | Kitchen uses the same access-granting Team record and adds kitchen-specific people/role fields without another authority list. Deactivation revokes invitations and linked access while preserving the operational member record and audit history. | `useKitchenWorkspaceTeam`, Kitchen Team server commands, and `Workspace/Kitchen/Team`                         |
| Supplier, Portfolio, and Property Team are minimal today     | `accepted` | Their current Team pages expose root-owned Team truth without inventing domain people collections or edit controls                                                                                                                                  | family `useXWorkspaceTeam` adapters and `WorkspaceTeamPanel`                                                  |
| Blank has no child Operations                                | `accepted` | Blank is a structural harness; its baked-in Team sheet projects existing access authority without inventing membership tools                                                                                                                        | `projects/fireux/fireux-blank`                                                                                |
| Project Create produces an inactive empty shell              | `accepted` | The trusted FireUX command creates only the canonical Project and caller's owner Team authority; publication and further product composition remain separate lifecycles                                                                             | Project entity declaration, internal control-plane APIs, and Project Workspace Create                         |
| Active root gates operational top-bar controls               | `accepted` | Calendar and Notifications require signed-in Team access to a selected root that completed its family onboarding lifecycle; presentation and publication readiness stay separate                                                                    | Shared Workspace state/Navbar plus family Workspace readers                                                   |
| Capability families differ by domain                         | `accepted` | Each Workspace Entity exposes only capabilities backed by its own product records and authority                                                                                                                                                     | current source uses direct `components/Workspace/<Capability>` and `composables/workspace/<Capability>` paths |

Accepted deltas change domain content or authority. They do not change the
Index outcome contract.

Core owns one presentation primitive for each basic record operation:
`WorkspaceCrudCreate`, `WorkspaceCrudRead`, `WorkspaceCrudUpdate`, and
`WorkspaceCrudDelete`. `WorkspaceCrudToolbar` only composes those four in the
fixed CRUD order; it is not the primitive boundary. Unavailable operations
remain visible and disabled. The owning capability still decides availability,
commands, modal content, authority, and any non-CRUD Tools. Project Test,
Project Team, and Kitchen Team are the guarded proving consumers.

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
- `useXWorkspaceIndex`
- `useXWorkspaceOverview`

Each `useXWorkspace` exposes its domain-owned targets, selection, runtime and
actions directly, plus only supporting branches proved by its consumers, such
as current-user subscription capability. Entity-specific names belong inside
those branches. Index-page presentation and derived values belong to
`useXWorkspaceIndex`, which returns `{ state, derived }`; the lower Workspace
runtime does not retain a second page-state or debug bag. `runtime` begins with
the shared App, source, data type, root collection, demo, read-only, and write
facts; a family may append proved storage, tenant, or creation facts without
renaming the shared contract.
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
uses compact link tabs at the top-left and highlights the selected item; it
does not own Create or other record operations. After Hero and AI,
`WorkspaceX` owns `WorkspaceXCrud`; the Index does not add a second selected-
Entity presentation between AI and CRUD. Tools, Operations, and Discovery
follow in that order.

The current proved sources are `project.test.strings`, `user.kitchens`,
`user.projects`, `kitchen.team.teamMembers`, and
`project.team.teamMembers`. This is a shared presentation rule, not shared
selection authority: Kitchen and Project selection may update the User's
primary Entity through their trusted command, while Test and Team selection is
temporary page focus.

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
├─ useXWorkspaceIndex
└─ useXWorkspace
   └─ useXWorkspaceCapability
      └─ useWorkspaceCapabilityName
```

For the current Team proving siblings:

```text
useWorkspace('project')
├─ useProjectWorkspaceIndex
├─ useProjectWorkspaceTest
└─ useProjectWorkspaceTeam
   ├─ Project Team records and authority
   └─ useWorkspaceTeam

useWorkspace('kitchen')
├─ useKitchenWorkspaceIndex
└─ useKitchenWorkspaceTeam
   ├─ Kitchen Team records and authority
   └─ useWorkspaceTeam
```

`useXWorkspaceIndex` belongs only to that Entity's `/` page. A capability
composable composes `useWorkspace('<entity>')`, the AppUser's canonical primary
Entity id, and the domain's bounded current-Entity reader directly rather than
using the Index or collection-backed `useXWorkspace` as a parent. Project Test
and Project/Kitchen Team prove this shallow path. Other capability runtimes
that still instantiate collection-backed `useXWorkspace` remain migration
candidates and are not aligned by this proof.

A named shared capability composable such as `useWorkspaceTeam`,
`useWorkspaceMenus`, or `useWorkspaceStations` may own only behaviour that two
materially different Entity families prove for the same reason. Candidate
mechanics include temporary item selection, defaulting to the first valid
item, count, App-configured capacity, `canCreate`, `capacityReached`, and common
pending/error outcomes. Domain record shapes, readers, persistence, mutation
authority, invitations, and lifecycle rules remain in `useXWorkspaceCapability`.

Do not introduce a generic `useWorkspaceCapability`. If named capability
composables later repeat smaller mechanics, compare them first; only then may a
small Core primitive such as selection or capacity resolution be extracted.
Shared state is passed through refs and returned derived state, not stored in a
generic registry.

Current evidence and confidence:

| Seam                                                                 | State        | Evidence and next comparison                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entity selection through `useWorkspace('<entity>')`                  | `accepted`   | Kitchen and Project domain readers now prime it from the canonical primary Entity, so Index and capability pages share one active selection without depending on one another                                                                                            |
| Project Test local scaffold                                          | `accepted`   | Its Project identity, App-configured capacity, temporary first-item focus, CRUD and string transforms run without importing the Project Index; it proves only local in-memory Test objects                                                                              |
| Named `useWorkspaceTeam`                                             | `to-confirm` | Kitchen and Project Team now share first-member focus, count and capacity. Kitchen empty-state runtime passed; Project Team remains blocked by its existing owner/operator Team authority for the current Project, so the complete sibling comparison is not yet proved |
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
[Operation, Capability, and Tool family](family-operation-capability-tool.md);
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
