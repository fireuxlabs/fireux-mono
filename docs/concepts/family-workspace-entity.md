# Workspace entity family

Updated: 2026-08-28
Ref: 74e1e9eef
Role: map, not canon

## Purpose

Map the shared Workspace Entity spine, the reasons domains differ, and the work
still needed to remove unexplained drift.

## Links

- Parent: `workspace.md`
- Child: `family-tenant-global.md`
- Horizontal: `entities.md`, `pages.md`, `components.md`, `composables.md`,
  `firestore-entity.md`, `runtime-filesystem.md`
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
owns `WorkspaceKitchenHero` and the live `WorkspaceKitchen` selection,
creation, target loading, and collection lifecycle. The Main App composes
those directly at `/` and adds only its App-owned presentation and doorways
from `app/components/Workspace/Kitchen`. Kitchen capability execution remains
in the extension's `Workspace/Capability` family. Kitchen-enabled Apps receive
an authenticated `/workspace/kitchen` route that mounts the direct
Kitchen-owned Workspace and resolves available Kitchens through runtime
authority rather than configured target ids. The shared component does not
receive Entity names, subscription rules, or capability configuration.

Canonical storage follows the Entity boundary. Project owns
`projects/{projectId}/team/{uid}`. Kitchen owns
`kitchens/{kitchenId}/team/{uid}` while its five-field root remains exactly
`id`, `name`, `slug`, `status`, and `visibility`. A Place-backed Kitchen uses
its same-ID Place for venue identity; a name-only shell may be enriched later.
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
  activate/clear actions. It owns no directory, authority query, source mode,
  storage routing, runtime anatomy, or debug projection.
- Each domain's `useXWorkspaceIndex` proves access through its authoritative
  relationship, reads at most the active Entity, and exposes `active`,
  `access`, and bounded `actions`. Outcomes are `idle`, `pending`, `error`,
  `empty`, or `ready`; read failure never becomes an empty authority result.
- No available Entity produces the Create state. One accessible Entity may
  become current automatically. Choosing among several is a User relationship
  action outside the baseline Workspace index.
- Capability runtimes receive the established active Entity id and load only
  their own records. They do not reconstruct an Entity directory or another
  active-Entity authority.
- Domain Index composables expose named Entity collections and actions
  directly. Core does not own a generic directory-index adapter.
- `team/{uid}` grants Workspace membership and names its roles and permissions.
  Current App admins are the explicit override only for roots managed by that
  App.
- Subscription capacity counts only active `team/{uid}` records whose role is
  `owner`. Free and Professional allow one owned Entity in the family;
  Business allows multiple. Operator, member, and other invited access does
  not consume ownership capacity. The trusted Create transaction reads that
  canonical owner relationship before creating the root and owner Team record,
  so a convenience User target or client-side count never becomes authority.
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
- Index establishes the active Entity and owns its Create doorway. Overview,
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
  inputs. Family `useXWorkspace` readers publish the common Workspace state;
  capability pages must explicitly extend or replace it when they require
  narrower capability props. Tokens, Firestore internals, unused root fields,
  and broad debug objects are never part of this contract.

## Accepted deltas

| Delta                                                        | State      | Why it exists                                                                                                                                                                    | Evidence or owner                                                                                             |
| ------------------------------------------------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Place-backed Kitchen identity uses its same-id Place         | `accepted` | A Place-backed Kitchen is the operation at one Place; a name-only Kitchen shell may begin without Place identity, while capability records own operational configuration         | Kitchen and Place models plus `scripts/guards/kitchen-entity.mjs`                                             |
| Kitchen Team adds operational roles to shared Team authority | `accepted` | Kitchen uses the same access-granting Team record and adds kitchen-specific people/role fields without another authority list                                                    | `useKitchenWorkspaceTeam` and `Workspace/Kitchen/Team`                                                        |
| Supplier, Portfolio, and Property Team are minimal today     | `accepted` | Their current Team pages expose root-owned Team truth without inventing domain people collections or edit controls                                                               | family `useXWorkspaceTeam` adapters and `WorkspaceTeamPanel`                                                  |
| Blank has no child Operations                                | `accepted` | Blank is a structural harness; its baked-in Team sheet projects existing access authority without inventing membership tools                                                     | `projects/fireux/fireux-blank`                                                                                |
| Project Create produces an inactive empty shell              | `accepted` | The trusted FireUX command creates only the canonical Project and caller's owner Team authority; publication and further product composition remain separate lifecycles          | Project entity declaration, internal control-plane APIs, and Project Workspace Create                         |
| Active root gates operational top-bar controls               | `accepted` | Calendar and Notifications require signed-in Team access to a selected root that completed its family onboarding lifecycle; presentation and publication readiness stay separate | Shared Workspace state/Navbar plus family Workspace readers                                                   |
| Capability families differ by domain                         | `accepted` | Each Workspace Entity exposes only capabilities backed by its own product records and authority                                                                                  | current source uses direct `components/Workspace/<Capability>` and `composables/workspace/<Capability>` paths |

Accepted deltas change domain content or authority. They do not change the
Index outcome contract.

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
- `WorkspaceXIndexActive`
- `WorkspaceXIndexTargets`
- `WorkspaceXOverview`
- `useXWorkspace`
- `useXWorkspaceIndex`
- `useXWorkspaceOverview`

Conditional names:

- `WorkspaceXIdentity` and `useXWorkspaceIdentity` when identity editing/reading is
  a real Workspace sheet.
- `WorkspaceXTeam` and `useXWorkspaceTeam` when target authority or domain people are
  exposed.
- `WorkspaceXOperationsY` and `useXWorkspaceY` for active-Entity domain work.

Kitchen may use nested Identity sections because the sheet has Place,
publication, theme, hours, delivery, and payment concerns. That is an accepted
composition delta, not permission to fork the Workspace Index spine.

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
