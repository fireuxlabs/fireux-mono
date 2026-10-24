# Workspace entity family

Updated: 2026-10-24
Ref: d05ded3fd
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
- Current checks: source-owned tests under `packages/core/fireux-core/src/test`
  and each domain package, generated Nuxt component declarations and App
  typechecks. The former `scripts/guards` suite is removed.

## Members and current surface

The exact Workspace surface and Capability lists live once in the source-backed
map in `workspace.md`. The family deltas are:

| Member            | Status and reason                                                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blank             | `accepted`: App-local development harness; it proves the baked-in Workspace surface with the shared Team controls and no domain capabilities, but is not an ecosystem-installed product Workspace |
| Kitchen           | `accepted`: Place-backed or name-only root, root-owned Team, and a large operational domain; Demo is outside the initial Workspace pipeline                                                       |
| Supplier          | `accepted`: root-owned Team plus Supplier-owned Catalogue, Ingredient, and Item operations                                                                                                        |
| Portfolio         | `accepted`: root-owned Team and a private-heavy Property, document, task, compliance, and Finance domain                                                                                          |
| Property          | `accepted`: root-owned Team plus Reservation and Calendar operations                                                                                                                              |
| Project           | `accepted`: FireUX control-plane root with Team authority and trusted empty-shell Create                                                                                                          |
| Marketplace Store | `accepted`: root Workspace ownership is declared now; its Workspace surface remains future product work                                                                                           |

## Team edits and the selected Entity

Blank, Project, Kitchen, Supplier, Property and Portfolio Team actions copy the
selected Entity ID and submitted fields before awaiting credentials, then send
that exact target to their existing trusted server commands. No selected ID or
signed-in actor means no dispatch. An account change during credential acquisition
is rejected; server authority still validates current membership on the target.
Switching Entity does not cancel or redirect an action already submitted.

Core `Workspace/Team/Editor.vue` keys its editing subtree with the controller's
`workspaceId`. Switching Entity disposes old drafts and dialogs. Member forms are
also keyed by member ID, and closing a dialog disposes its form. Forms own local
busy/error state and suppress completion after disposal; they do not acquire Auth,
App membership or selection-epoch watchers. Domain controllers use the live roster
and apply post-create selection only if its original Entity remains selected.
The six `use*Team` owners and Core's `useWorkspaceTeam.ts` define this bounded contract;
other capability preparation flows remain outside this cutover.

## Workspace ownership levels

Core's `runtime/workspace` owns shared selection and presentation. Granite's
`runtime/workspace` owns the cross-package Portfolio overview composition;
Project, Kitchen, Supplier, Property and Portfolio retain Entity-specific
surfaces beneath their Entity technical roles. Nuxt route and API adapters stay
in native entrypoint folders and delegate to these owners. Main Apps retain
host routing, brand and App-specific entry composition.

All active Entity selection consumers use Core `useWorkspace(family)` directly;
Entity index controllers still reconcile the permitted collection and own any
navigation needed when switching. There is no second `useXWorkspaceSelection`
forwarding API. Core routing normalizes the supplied family without a domain
alias table; Apps and route metadata provide canonical family names.

## Selected identity in navigation

Kitchen and Project `Workspace/Navigation.vue` components supply the selected
logo and name both to the sidebar switcher and, through `identityOnly`, to the
shared Workspace navbar. When an identity component is available, identity stays
on the left and the page title appears immediately before the subscription
control on the right at medium and wider breakpoints. Compact mobile headers
omit that secondary title. Dropdown choices use entity images without selection
ticks. App landing nav adapters supply page information; they do not build a
second selected-identity projection. The shared EntitySwitcher accepts an explicit
`to` destination. Kitchen supplies its App-aware Kitchen entry path; the
existing default remains `/` for other consumers.

The selected Entity is restored from an App/family-scoped cookie on the current
host, with a one-year lifetime. A browser reload or server restart preserves a
valid selection. Reconciliation may replace it only after the available list is
settled; a restored ID never grants read or write authority. Kitchen's collection
propagates unresolved access and idle Kitchen/Place reads instead of reporting an
empty list during startup. Checks: Core `workspace-selection.test.mjs` and Kitchen
`workspace-readiness.test.mjs`. This is last-selection memory, not an account
primary-Entity preference. Kitchen prioritises an authorised explicit link, then a
valid remembered selection, then the first available Kitchen after access settles.
There is no separate Primary Kitchen control, preference field or command.
Core synchronises every component-local cookie ref with shared selection so
navigation/disposal cannot flush an older selection. Verify Core's
`workspace-selection.test.mjs` and Kitchen's `workspace-readiness.test.mjs`.

## Workspace arrival language

The Workspace surface exists as soon as a user arrives at `/`. This applies
with or without saved Project or Kitchen records. Use “getting started” for
little or no saved information and describe progress through information added.
Do not tell the user “no workspace yet”. A connected App is a Project-specific
fact, not a universal onboarding stage. These descriptions do not introduce
stored lifecycle fields or change technical `empty`/`ready` read outcomes.
Creation controls still persist domain records through the existing commands;
visible Workspace availability does not grant mutation authority.

## Public and Workspace entry points

Misebox, BuenoHost and Granite have public Directory roots and separate Workspace
entrances. Misebox's Workspace host renders Home at `/`; BuenoHost and Granite
retain explicit family Home routes. FireUX's public `/` is its framework-library
homepage; Project Workspace remains at `/workspace/project`. Detailed product
tours remain on their existing literature routes. Core navigation supplies the explicit Workspace entrance; Workspace sidebars
omit a separate Directory row and retain existing brand/account navigation. This does
not change membership or turn browsing into management authority.

App-owned hostname middleware sends `workspace.fireux.app/` to
`/workspace/project`. Misebox renders its single root page as Kitchen Workspace
on its declared Workspace origin and as discovery on its public origin, without
a root redirect. Its route hook excludes inherited `/workspace` and
`/workspace/kitchen` Home entrances while retaining capability descendants.
Workspace-host responses and explicit `/workspace` paths on any host send
`X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store`.
Core only redirects a generic `/workspace` entrance while that route is registered.
It resolves internal Home from the registered `workspace-<family>` nav key;
`workspaceConfig.<family>.origin` adds a separate external entrance URL. Internal
return destinations remain local. Each App tests its routing and indexing
middleware in `app/tests/workspace-surface.test.mjs`; domains and the
selected Workspace family remain App-owned. The host does not change Workspace membership,
selection, enabled families or permissions. Authentication remains origin-scoped.

## Landing creation allowance

Kitchen exposes allowance, used count, `canAdd`, `canCreate` and `showUpgrade`
through its domain-owned `useKitchenCreate`. Its pure
`kitchen/utils/kitchen-capacity.ts` is also consumed by trusted onboarding:
Free and Premium allow one associated Kitchen; Business has no subscription
count limit. The existing relationship storage ceiling is separate. Counts use
unique Kitchen associations, not other Workspace families or preview tiers.
Creating a new Kitchen and adding an existing Kitchen both consume a new
association; reopening a retained Kitchen does not. Over-limit associations are
not removed or hidden. Both Kitchen Create buttons and their modals are absent
when creation is unavailable. Pending/error account reads offer no creation.

Signed-in Project creation uses Core `useWorkspaceCreation` with an explicit Project access count
and outcome. It resolves App-configured capacity; Kitchen owns its allowance.
Both UI and trusted commands count retained ids from their own domain access
record and wait for that record's authority before enabling creation.
Kitchen and Project Landing put their inline collection and Create doorway on
the left, with selected identity and Edit on the right. Their domain creation
forms retain the existing allowance and onboarding behavior.
This is a presentation gate: trusted creation commands still own mutation
authority and currently check their domain relationship counts. It does not
prove a shared billing allowance across separate Apps or an ownership-only
count that excludes invited relationships.

Anonymous Project Landing uses `project/components/Workspace/Home/Guest.vue`:
the existing named creation command persists one UID-keyed root, and the guest
surface reads that exact record live to resume it. It grants no membership access
and does not adopt the Project after sign-in. This is separate from the ordinary
signed-in collection and capability permissions above.

## Landing information dialogs: Kitchen and Project

The Misebox Kitchen entry and FireUX Project entry use the existing Core
`Workspace/IntroInfo.vue` with explicit Workspace scope and plain-language
presentation. The shared shape is `WorkspaceIntro` in
`workspaceCapabilityContext.ts`: purpose, record scope, access, allowance,
actions with current availability and reasons, boundaries and AI behavior.
The raw state view is not the primary content of these two dialogs; structured
data remains available through the copy action. Other IntroInfo consumers keep
their existing presentation until separately inspected.

Kitchen's `kitchen/utils/kitchen-workspace-intro.ts` and Project's
`project/utils/project-workspace-intro.ts` own their explanations. Each domain
Landing Index supplies current controller facts and publishes that same `intro`
object in its existing Workspace page state. The App entry reads it for both
Hero and Info instead of owning a separate static explanation. A loading
fallback comes from the same domain builder and does not invent account limits.
Kitchen Landing AI interprets the bounded visible state through the Kitchen-owned
`server/index/landing-intent.ts` endpoint. Its Index exposes the same Add modal,
selected settings editor, selection and capability routes used by manual controls.
It never performs a write. The route binds the action callback explicitly; a stale
page snapshot or unavailable control cannot silently execute the prepared action.
Local development uses the existing Codex transport and its FireUX/Codex label;
production uses the configured provider. Facts, instructions, available actions and
response schema are built once before transport selection. Project Landing AI
uses the same bounded interaction through the existing Project intent route's
landing branch, owned by `fireux-fireux/runtime/project/server/landing-intent.ts`.
Project Index exposes current selection and Create Project controls; FireUX's
landing page owns navigation to the existing `/apps/create` setup review.
Chat performs no writes and cannot save launch intents, create Apps, provision
infrastructure or deploy. Guest requests receive no Project record context.
`fireux-fireux/src/test/project-landing-intent.test.mjs` covers intent validation,
permission denial, stale responses, retry and the reviewed control callbacks.

Both landing routes retain the real selector in the top toolbar, then Hero and
visible AI. A settled account with no Entity associations gets a named Getting
Started child and accessible creation/sign-in path instead of collection/focus.
The shared `workspaceLandingState` distinguishes pending, error, missing related
records, empty and ready; existing memberships with missing records are not new
accounts, and unresolved selection is not empty. Populated accounts keep the
collection/focus composition. Domain-owned square discovery cards follow in both
states, using current capability routes when selected and public discovery routes
otherwise. These cards are presentation, not another capability classification.
The shared `Workspace/GettingStarted.vue` provides only the welcome anatomy;
each domain owns its copy, records, allowance and links. Each Landing Index owns
one create modal shared by its empty and populated entry controls. Individual
children retain their editors. State, selection and request-parity tests accompany
the source; browser verification is still required for a release claim.

Kitchen describes its domain-owned associated-Kitchen policy and retained
access. Project describes its current App-configured allowance and existing
identity ownership. Its UI and creation command both count Project access ids.
A full Project downgrade workflow is
not proved by this presentation pass. Focused explanation checks live in
`packages/extensions/fireux-kitchens/src/test/workspace-landing-info.test.ts`.

## Shared spine

Every Workspace Entity must share these rules:

- The Entity index owns only `{ collection, outcome, selectedId, select }`.
  The selected Entity entrance has `{ data, id, outcome, crud }`, where
  `crud` exposes named `create`, `update`, and `delete` functions. Collection
  choice does not leak into the selected-Entity entrance, and page state,
  presentation, Demo, refresh, and compatibility aliases do not belong to
  either contract. Kitchen additionally exposes its actual account allowance
  and creation availability through `useKitchenWorkspace`; the numeric policy
  remains in its adjacent domain-owned pure policy, shared with trusted
  onboarding. Target-specific write authority remains with the command.
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
`WorkspaceAIComposer` interaction seam. Root and Team surfaces use the
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
The Project and Kitchen Team proving pages establish the
capability-page CRUD interaction: a selector establishes the current record;
Update and Delete open capability-owned modals; the domain executes the write;
and the reader changes the UI. The reader implementation is replaceable: an
existing listener, API reader, cache, or consumer is not architectural
authority and may be rebuilt after the contract is fixed.
Project Team and Kitchen Team prove one Core-owned Team interaction for stable
member-id selection, collection Read, Update, and Deactivate mechanics. Their
thin Entity adapters retain Create workflow, detail-route prefix, copy, and
trusted commands; Core does not acquire either Entity's Team authority.
Project and Kitchen Test are disposable string pipelines: a live reader, direct
trusted writes and a plain shared form/list. They do not establish a generic
capability controller, selection framework or AI interaction contract.
Delete retains domain meaning: Kitchen and Project Team remove a roster entry and Test deletes
its disposable record. Kitchen Index separately proves an on-page update of
Kitchen-owned root fields. Project root Update and Delete and Kitchen root
Delete remain visibly unavailable until ProjectMeta synchronization and each
Entity lifecycle and dependent-data policy are proved. Detail pages do not own
a second mutation implementation while this family is being proved.
Project and Kitchen Landing compose the shared `WorkspaceCapability` layout.
Their domain Index UI owns the bounded landing projection; the data composables
retain only their domain collection and selection binding. Project's optional
published App identity and Kitchen's Place identity remain domain differences.
Kitchen owns the live `WorkspaceKitchenSelector`, `WorkspaceKitchen`, creation,
target loading, and collection lifecycle. The Main App supplies its own copy directly to the
shared `WorkspaceHero`, composes Kitchen Workspace at its Workspace origin's `/`
through `app/components/Workspace/KitchenHome.vue`, and adds only App-owned
presentation. Kitchen capability execution remains in
the extension's direct named Workspace capability components. Other Kitchen-enabled Apps receive
an authenticated `/workspace/kitchen` route that mounts the direct
Kitchen-owned Workspace and resolves available Kitchens through runtime
authority rather than configured target ids. The shared component does not
receive Entity names, subscription rules, or capability configuration.

Canonical storage follows the Entity boundary. Project owns
`projects/{projectId}/team/{uid}`. Kitchen owns
`kitchens/{kitchenId}/team/{uid}` while its root model contains
`id` and nested `identity.{slug,status,visibility,source?}`. Shared venue
profile and currency remain on the linked same-id Place.
Core's `workspace/server/team/roles.ts` receives a required `TeamRolePolicy`
from each domain's existing `server/team/roles.ts` boundary (Blank retains its
App-local `server/utils/blank/team/roles.ts`). The policy owns fixed IDs, labels
and fixed-role rename copy. Core combines those fixed roles with persisted
custom roles and validates read/create/rename/assign requests; it does not name
Dev or Operator. Kitchen, Property, Portfolio, Supplier, Project and Blank
currently supply the same Dev/Operator policy. Kitchen's hospitality work and
Property's Reservation work do not prove different role policies, so this is
explicit ownership input, not a configurable role engine. Roles remain
organizational labels; domain authorization and Team capacity stay separate.
Verify all six callers with Core's `team-role-policy.test.mjs`, plus
`team-roles.test.mjs` and `workspace-team-members.test.mjs`. Existing database
targets and Project placement are unchanged by this boundary.

Workspace Team projections preserve the Team record's role labels and linked
User id. A linked member resolves its page-facing name and avatar from the
canonical User; an unlinked operational person resolves the explicitly entered
name retained by the Team record. Neither path invents identity when its
authoritative source is absent. A
Place-backed Kitchen uses its same-ID Place for venue identity; a name-only
shell may be enriched later. `identity.source` records `user` or `place`
onboarding when known and is independent of Place classification. Historical
unknown origin remains unset.
A Kitchen capability owns its configuration and records beneath the
Kitchen only after that destination and its consumers are proved. Existing
Kitchen root fields and App-nested support are migration preimages, not a
second authority; retain them until the capability-owned reader, writer,
migration verification, and protected Workspace consumer are complete.

- Server readers and commands remain under the domain's `server` role, with
  names for their actual responsibility. Workspace page structure does not
  mandate `core`, `capabilities` or other server scaffolding. HTTP adapters
  remain under `runtime/server/api`; this presentation migration changes no
  endpoint, storage, permission or command ownership.
- Core owns only server primitives proven across entity families. Shared App
  runtime policy, membership validation, bounded Team-authority parsing,
  and capacity enforcement live in
  `packages/core/fireux-core/src/runtime/workspace/server/entity/onboarding-authority.ts`.
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
  its Entity reader. It exposes `data`, `id`, `outcome`, and only the commands
  actually consumed by that surface. There is no compulsory CRUD bag. Index pages use `useXWorkspace` for
  the collection and selection; they do
  not establish another Entity reader or selection authority.
  Outcomes are `idle`, `pending`, `error`, `empty`, `missing`, or `ready`; read failure
  never becomes an empty authority result.
- Project and Kitchen selectors present their membership-bounded collection.
  Selecting uses the Core App-scoped selection cookie. A settled collection
  preserves a valid selected id, otherwise selects its first available id, and
  clears only when no ids remain. Pending, idle, and failed reads do not clear
  selection. Collection snapshots and component mounts never reapply an account
  primary preference. Selection grants no access. Unused persisted primary
  fields and primary-change commands are retired.
- Kitchen and Project own `Workspace/Navigation.vue` components, registered once
  as global `WorkspaceKitchenNavigation` and `WorkspaceProjectNavigation` through
  their packages. The Core layout resolves the current family's component by
  that naming convention; it never imports an extension to read its Entity.
  The selected name/image and available choices come from the domain Index.
  The collection-owning Selector presents confirmed empty state; the selected
  Entity Main never infers an empty collection from a missing active id.
  The same shared footer slot serves desktop and mobile, including direct
  capability entry. A change of Entity remounts page-local interaction state;
  ordinary route navigation does not key the layout by URL. The existing page
  error boundary is keyed by family, active Entity id and route;
  `workspace-page-state.test.mjs` verifies disposal of page-local drafts when
  that scope changes. Test form state is
  reset by Entity id so an edit cannot carry into another Workspace root.
  Supplier now registers its named persistent navigation once, reuses the Core
  switcher and existing Supplier identity projection, and has no user clear
  interface. Its inspected Workspace routes have no entity-record subroutes;
  Core selection-keyed page remounting retains the shared form-state boundary.
  Supplier navigation and selection have source-owned behavioral checks and
  representative Bringli registration verification; live browser behavior remains
  unproved. Portfolio now follows that same named-navigation and no-clear
  contract using its existing identity projection; Granite preparation verifies
  the generated global component name. Its own routes and contributed
  Compliance/Documents/Tasks pages have no inspected record subroutes. Property now registers its own persistent navigation and removes the user
  clear action. Switching from a Reservation record returns to the nearest
  registered Property capability before changing selection, so an old record
  URL cannot follow the new Property. Its active-context adapter consumes
  actual selected data/id/outcome and membership-bound Property access; stale
  or unauthorized records are hidden. Source-owned tests cover both boundaries.
  Blank now reconciles settled collections through Core and has no user clear
  doorway; its persistent domain navigation remains unproved. The shared
  `workspace-selection.test.mjs` covers Project, Kitchen, Blank, Supplier, Portfolio and
  Property selection
  retention, replacement, loading/error preservation and settled empty clearing.
- Capability runtimes consume `useXWorkspace().id` and load only their
  own records. They do not reconstruct an Entity directory, read
  `primary_<family>` independently, or establish another selection authority.
- Domain Index composables expose named Entity collections and actions
  directly. Core does not own a generic directory-index adapter.
- `team/{memberId}` belongs to the Entity's roster and stores names, account
  links and role labels. It is not the user's Workspace Entity index.
- Each domain owns an App-scoped access record with retained `ids` and
  `membership_created_at`. The explicit paths and migration boundary are in
  `docs/ai/firestore-mutations-context.md`. AppUser stores membership facts only;
  Team never substitutes for access. Core `useMembershipAccess` provides the live
  binding and strict lifetime validation, without knowing domain names.
- Subscription capacity counts the domain access ids inside the trusted Create
  transaction. The same transaction creates the Entity root, grants its id for
  the current membership lifetime, and may create the initial Team record.
  Missing root records still count; rejoining never merges old grants. The
  Workspace composable and command resolve the same domain allowance.
- Workspace Entity creation has one Core-owned identity decision in
  `runtime/workspace/server/entity/creation-identity.ts`. An explicit
  first shell uses the beneficiary User UID; an explicit existing-source path
  preserves that source id. The Entity family still owns what its authoritative
  source is: Kitchen currently proves same-id Place onboarding, while Project
  proves a source-free first shell. Additional Business shells may use generated
  ids according to the family command's capacity policy. This shared decision
  does not create mutation authority for Property, Supplier, Portfolio, or
  other families whose trusted creation command is not yet proved.
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
  `state.appUser` contains only current App membership facts,
  domain access ids belong under their named domain state, and `state.entity`
  contains only selected Entity inputs read directly.

  `state.derived` contains values the page computes and consumes from those
  inputs. Family `useXWorkspace` readers publish the common Workspace state;
  capability pages must explicitly extend or replace it when they require
  narrower capability props. Tokens, Firestore internals, unused root fields,
  and broad debug objects are never part of this contract.

The current Project/Kitchen proving graph is deliberately small:

```text
User
├─ project_access (current App + membership lifetime)
│  └─ project → ActiveProject
│     ├─ project
│     ├─ project.team
│     └─ project.tests
└─ kitchen_access (current App + membership lifetime)
   └─ kitchen → ActiveKitchen
      ├─ kitchen
      └─ kitchen.team
```

Each named page publishes only the runtime state directly consumed by that
page-facing capability. Workspace-shell context may still be used internally
for selection, fetching, and authority, but it is not repeated in a capability's
copied JSON unless that capability directly consumes it. Capability pages never
inherit or leave behind another page's copied JSON. For example,
Test publishes only workspace id, string records and read state; full Workspace
records are not part of its page-facing context.

Project entry Update reuses the Identity editor and its bounded identity update
controller. An App-owned composition may supply a published description/image
projection; those fields then become read-only and Project Update writes only
the workspace name. Unconnected Projects retain manual identity fields. Core
receives the projection, never an App id or endpoint rule. The Identity route owns its page JSON publication;
the reusable controller does not publish into a caller's inspector. This keeps
the entry page's context intact when the same editor is opened from `/`.

Project Identity saves through the FireUX App's named
`fireux-fireux/runtime/project/server/identity/update.ts` command and App-owned thin PATCH adapter. Its transaction
rereads the current App, membership, membership-bound Project access and Project
before writing the allowlisted identity fields. The ecosystem-owned
`project/utils/app-context-connection.ts` predicate preserves connected App field
ownership independently of provider availability. The client adapter and editor
invalidate obsolete account/Project intent, including same-tick round trips.
See the FireUX ecosystem's `project-identity.test.mjs` and FireUX App's
`project-identity-command.test.mjs`; these use mocked transport/transactions and
are not proof of a deployed save.

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

| Delta                                                         | State      | Why it exists                                                                                                                                                                                                       | Evidence or owner                                                                                             |
| ------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Place-backed Kitchen identity uses its same-id Place          | `accepted` | A Place-backed Kitchen is the operation at one Place; a name-only Kitchen shell may begin without Place identity, while capability records own operational configuration                                            | Current Kitchen and Place models plus package/entity guards                                                   |
| Kitchen Team assigns labels within the shared roster contract | `accepted` | Kitchen and Project share a name, account link and assigned role labels. Removing a roster entry revokes pending invitations; workspace access remains domain-owned.                                                | `useKitchenWorkspaceTeam`, Kitchen Team server commands, and `Workspace/Kitchen/Team`                                  |
| Supplier, Portfolio, and Property Team are minimal today      | `accepted` | Their named Team controllers and components compose the same shared roster controls                                                                                                                                 | family `useXTeam` composables and shared Team Editor                                                          |
| Blank has no domain capabilities                              | `accepted` | Blank is a structural harness; its named Team surface uses the shared roster controls and Blank-owned access                                                                                                        | `projects/fireux/fireux-blank`                                                                                |
| Project Create produces an inactive empty shell               | `accepted` | The trusted FireUX command creates only the canonical Project and caller's linked Team profile; publication and further product composition remain separate lifecycles                                              | Project entity declaration, internal control-plane APIs, and Project Workspace Create                         |
| Active root gates operational top-bar controls                | `accepted` | Calendar and Notifications require signed-in App membership and explicit Entity association to a selected root that completed its family onboarding lifecycle; presentation and publication readiness stay separate | Shared Workspace state/Navbar plus family Workspace readers                                                   |
| Capability families differ by domain                          | `accepted` | Each Workspace Entity exposes only capabilities backed by its own product records and authority                                                                                                                     | current source uses direct `components/Workspace/<Capability>` and `composables/workspace/<Capability>` paths |

Accepted deltas change domain content or authority. They do not change the
Index outcome contract.

Project Team, Kitchen Team, Kitchen Menus, Kitchen Dishes, and Kitchen Drinks
use this page anatomy in order:

1. Selector
2. Hero
3. AI
4. Main
5. Tools
6. Domain capabilities
7. Discovery

Main owns the capability's primitive composition; those primitives are not
page-level siblings. CRUD owns Create, Read, Update, and Delete. The former
client-only Test text transforms were removed because they did not persist and
therefore did not prove a capability. This is a bounded rule for these five
proving pages, not a universal Workspace page contract. Each enabled
Create doorway composes a domain-owned `Crud/Create.vue` modal when its action
is connected. During the current primitive-building pass, CRUD primitives are
kept visibly aligned even where a domain command is not connected; availability
is not a release claim. Selector plus controls remain conditional on the owning
subscription-capacity decision. Kitchen Landing now hides its Create primitive
when its account allowance or authority disallows creation; other capability
CRUD presentations require their own bounded verification.

Within these proving capabilities, Read is a two-stage CRUD primitive.
The Read toolbar action opens a domain-owned modal containing that capability's
collection; selecting a record in the modal opens its individual detail route.
The toolbar action must not navigate directly, and refresh alone is not Read
evidence. Project Team and Kitchen Team keep
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
Current App membership, domain-owned access and subscription are the development
boundary. Every person counts toward subscription capacity. The focused form proof is
`packages/core/fireux-core/src/test/team-dialog-intent.test.mjs`.

Classified boundaries:

- `accepted`: shared selection, capacity and dialog lifecycle; domain-defined
  Identity fields, linked records and access choices.
- `accepted`: `fireux-fireux/src/runtime/project` owns the Project entity,
  Identity editor, readers and Team composition. Its ecosystem module registers
  Project components/composables and protected commands. App routes adapt those
  commands; cross-project discovery and the remote product-context bridge retain App policy.
  Generic App user-joined publication remains Core-owned and does not import Project.
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

Shared capability availability remains expressed by
`WorkspaceCrudPrimitiveId` and `defineWorkspaceCapabilityContext` in
`runtime/workspace/composables/workspaceCapabilityContext.ts`.
Availability does not require a Core button wrapper for every CRUD verb.
Native `UButton` supplies ordinary control behaviour; a shared availability
vocabulary does not imply a generic modal or toolbar owner.

Connected Team compositions remain separate: `Workspace/Team/Crud/Create.vue`
owns the Add person modal over `CreatePerson.vue`, while Team Single/Settings
own the selected person's editing interaction. They preserve active-dialog
intent, domain-supplied commands and availability. Entity and Capability owners
retain records, forms, validation, authority and non-CRUD Tools. See the focused
[Core duplication audit](nuxt-ui.md#focused-duplicate-and-styling-review).

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
- `Workspace/Home/Create.vue` → `WorkspaceXHomeCreate` where consumed
- `Workspace/Navigation.vue` → `WorkspaceXNavigation` where consumed
- `Workspace/<Capability>/Index.vue` → `WorkspaceX<Capability>`
- `WorkspaceXOverview`
- `useXWorkspace`
- `useXWorkspaceHome` where actual summary composition exists

Each `useXWorkspace` exposes selected `data`, `id` and `outcome`, together
with available `collection`, `collectionOutcome` and `select`. There is one
selection owner and no separate Index composable. Consumed commands remain
explicit domain decisions. The public owner does not expose a clear-selection action.
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
- Named domain capability components and composables for active-Entity work.
  Existing `WorkspaceXOperationsY` names are legacy identifiers, not a required
  product layer or prefix for new capabilities.

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
through Core's App-scoped cookie, while Team selection is temporary
page focus. Neither selector implicitly changes the account primary.

The Kitchen selector plus doorway and Landing Create button share the actual
account allowance exposed by `useKitchenWorkspace`; Business is not required
when a Free or Premium account has unused capacity. Kitchen and Menus own their
respective pure policies, shared with their trusted commands. Other capability
policies still use existing App-configured readers; do not infer their allowance
or ownership from these two cutovers. Every write still requires its trusted
command's target-specific authority.

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
└─ useProjectWorkspaceTeam
   ├─ Project Team records and authority
   └─ useWorkspaceTeam

useKitchenWorkspace
├─ useKitchenTest
└─ useKitchenWorkspaceTeam
   ├─ Kitchen Team records and authority
   └─ useWorkspaceTeam
```

The Entity's `/` page and its capability composables consume `useXWorkspace`.
Project/Kitchen Test and Project/Kitchen Team now use this shallow path. The
temporary Kitchen index adapter only translates the bridge into legacy
component props and must disappear when those components accept the canonical
contract directly.

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

Team page roots pass one domain Team controller to their selector, AI,
interaction, and tool adapters. The Core `useWorkspaceTeam` composable owns member
selection, post-create focus, count, capacity and CRUD availability; workspace access-id projections remain with the
Entity access context. Small leaf components may still receive the few values
they render or mutate directly.

Project Team consumes the live collection's explicit pending, error and
settled outcome. An unavailable roster remains an error, loading does not
expose the previous roster, and no selected Project is a settled empty surface.
`packages/ecosystem/fireux-fireux/src/test/project-team-client.test.mjs` protects
these states alongside the command-intent tests.

`useKitchenWorkspaceTeam` and `useProjectWorkspaceTeam` each own their domain reads and commands,
compose shared `useWorkspaceTeam`, and return a single context to the Team UI through a
`team` prop. There is no separate TeamData, WorkspaceTeam or provider layer.
Identity reads workspace association directly and does not load Team for access.

Team Create follows one Core-owned interaction: search the current App's
eligible User directory, choose an existing User when found, or create an
unlinked named member when no suitable User exists. Project and Kitchen own
their trusted create commands, duplicate-link checks, records, and authority.
Choosing a User links identity to the Team record; Workspace access remains an
explicit domain onboarding or authority action rather than a UI side effect.

Current evidence and confidence:

| Seam                                                                 | State        | Evidence and next comparison                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entity selection through `useWorkspace('<entity>')`                  | `accepted`   | Kitchen and Project expose the same top-down selection contract. Their current readers are replaceable implementations rather than constraints on Workspace design.                                                                                                              |
| Named `useWorkspaceTeam`                                             | `to-confirm` | Kitchen and Project Team now share first-member focus, count and capacity. Kitchen empty-state runtime passed; Project and Kitchen tool entrypoints now accept associated AppUsers regardless of Team role during development; the complete sibling comparison is not yet proved |
| `useWorkspaceMenus`, `useWorkspaceStations`, `useWorkspaceSuppliers` | `to-confirm` | Kitchen has named domain capabilities, but a second real Entity family has not yet proved shared mechanics                                                                                                                                                                       |
| Generic capability primitives                                        | `to-confirm` | Extract only after at least two named capability composables repeat the same contract for the same reason                                                                                                                                                                        |

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

Focus List is one surface-family classification, not another hierarchy layer.
Capability, Tool, entry-family, Local Tool and Compound Tool meanings are owned by
[Workspace, Capability, and Tool family](family-workspace-capability-tool.md);
this Workspace map owns only their application to active-Entity surfaces.

## Alignment roadmap

### Now

- Preserve the guard-backed six-family Index parity.
- Keep one family-owned target outcome and one outcome-bound active Entity.
- Keep Team as an Entity-owned roster capability. Current development access
  remains on current App membership and explicit domain-owned access;
  Team labels do not grant access. Individual role restrictions are deferred.
  Follow the global authority boundary rather than inferring access from a
  Team record or introducing another membership list.

### Next

- Keep the Kitchen root + optional same-id Place + root-owned Team composition
  guarded across Live, Demo, and Test sources. Reject copied Place identity,
  Kitchen media overrides, and redundant `place_id` on the Kitchen root.
- Keep Kitchen live Create on its guarded trusted onboarding endpoint and keep
  root identity and Team creation atomic.
- Preserve canonical Supplier and related Place records in Workspace readers;
  Portfolio remains its canonical readable root with scoped and private work
  owned separately. Its Workspace root subscription uses only a selected ID
  present in the current ready membership-bound access set. `usePortfolioScope`
  adapts the actual root `data/id/outcome` and Portfolio model; it does not
  recreate a collection/selection/runtime contract. Child paths are empty until
  that exact root is ready, and obsolete data is hidden.
- Portfolio Tasks, Documents and Compliance routes belong to their respective
  extensions. Properties supplies no competing placeholder routes or navigation
  entries when those owners are absent. The source-owned Portfolio route test
  generates Nuxt hosts with and without those owner layers; it is not a proof
  of their mutation readiness.
- Derive each capability catalogue from current owner source and consumers.
  Identity and Team use the same capability hierarchy as domain work; legacy
  Operation-only discovery consumers remain a separate migration boundary and
  do not define the universal Workspace set.

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
`useWorkspaceTeam` for selection, post-create focus, capacity and CRUD availability;
workspace controllers retain their transport and domain-specific invitation actions.
Names for linked people come from their accounts. Role catalogues contain names;
member role_ids refer to fixed or workspace-defined labels. Legacy job titles,
access-role fields and dossier properties are removed from this profile.

### Collection and focused-record composition

Core `Workspace/Capability.vue` owns a small slot-based layout shared by the
Test surface and Team Editor. Collection content and tools sit on the left;
focused-record content and tools sit on the right. Optional workspace tools
sit above, with open workspace tools below. Open collection and individual
tools remain in their respective columns. Absent sections need no dummy data.
The layout owns no records, selection, permissions or commands.

`useKitchenTest` and `useProjectTest` each own their live reader and direct
trusted create/update/delete calls. Test uses disposable strings to prove the
pipeline and this composition. `Workspace/Test/Form.vue` supplies the creation dialog and record detail editor
through the same command callbacks. Test's local focus
and drafts reset when its Workspace id changes. Its published context contains
only workspace id, string collection, focused string and derived read state;
Info and Copy JSON consume that projection. The named domain controllers call
Core `useTest` for selection, commands and bounded context. Kitchen Test AI uses
that context to prepare reviewed string actions through its domain endpoint and
the existing commands. Both have an exact-record `/test/[id]` configuration route; neither has
discovery or a client capacity framework. Existing server
authorization and storage are unchanged. Other universal pages adopt only the
sections their real responsibilities need; this is not a compulsory whole-page
controller or an assertion that Overview owns a collection.

### Landing Test Team comparison

Inspected scope: Kitchen and Project App Landing routes, domain Index UI,
Index selection bindings, Test readers/commands and UI, Team controllers and
Editor, shared layout, Info/JSON and Team AI context consumers. Kitchen Menus is included in the presentation baseline below. The component-placement contract applies to every maintained Workspace family;
this interaction comparison is still limited to the named surfaces.

| Capability | Collection / focused record     | Shared responsibility                                                                     | Necessary difference                                                                               |
| ---------- | ------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Landing    | Workspaces / selected workspace | `WorkspaceCapability` layout; `useWorkspace` selection/reconciliation; creation allowance | Selection persists as an App-local preference; domain onboarding and identity remain distinct      |
| Test       | Strings / focused string        | Same layout; one form for create dialog and record editor; Info/JSON                      | Disposable pipeline data; local focus; Kitchen AI prepares existing string controls; no role model |
| Team       | People / focused person         | Same layout; Team person forms, focus, capacity and role-label UI; Info/JSON              | Linked accounts, role labels, invitation workflow and existing Team AI need real domain behavior   |

| Workspace concern   | Kitchen                                                                                    | Project                                                             | Classification                                                 |
| ------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------- |
| Landing display     | Kitchen joined with same-id Place; display name/image/tagline                              | Project name/image/description, optionally published App identity   | Accepted domain difference                                     |
| Landing Create/Edit | Kitchen/Place onboarding; root slug/status/visibility editor; Place identity doorway       | Project creation; Project name and manual or published App identity | Accepted domain difference                                     |
| Test transport      | Kitchen child reader; Kitchen id in request body                                           | Project collection reader; Project id in endpoint                   | Accepted transport difference; matching simple command surface |
| Team records        | Shared member profile enriched from linked accounts                                        | Same profile and account enrichment                                 | Shared record/interaction contract                             |
| Team extras         | Invitation links and richer person details                                                 | Project-owned roles and identity composition                        | Domain additions; not branches in the shared layout            |
| Inspector           | Bounded collection/selected/derived; workspace id where an enclosing workspace is consumed | Same sections                                                       | Shared composition; no unused section or full-record dump      |

Landing's enclosing workspace section is omitted because the selected record
is itself the workspace. Test and Team include the parent workspace id. The
collection envelope is `collection.records`; `selected` is the focused record
or null. Named domain additions are allowed only when actually consumed.
Commands remain outside serializable context. Team AI derives its request from
the same bounded context published to Info/JSON.

The App roots now contain framing, short copy and their domain Index. The
unconnected draft/workflow landing and unused Landing Read modals are removed;
the inline list is the reader surface. No shared `useIndex` was added because
`useWorkspace` already owns the common selection mechanics. The short
`useKitchenWorkspace` and `useProjectWorkspace` still bind their real
domain readers. Team's larger controller remains a separate simplification
candidate; this comparison does not prove every Team branch necessary.

The composition boundary for these six surfaces is explicit: Landing Index
assembles domain `Home/Collection.vue` and `Home/Single.vue`; named
Kitchen and Project Test Index components each assemble `Test/Collection.vue`, `Test/Single.vue`, and
`Workspace/ContextTools.vue`. Team Editor assembles its named Collection and
Single children. Collection and Single own their controls; Index owns
only composition and the shared selection/context lifecycle. Nuxt UI owns
ordinary modal, card, button and form presentation.

This is the basis for optional shared and domain capabilities, not a claim that
those existing pages have been audited. Reuse the structure where the capability
has a real collection/focus interaction; retain domain fields, workflows and
commands with their owner. Do not force `useXCapability` and `useCapability` pairs
when one would only forward the other.

### Collection/Single presentation baseline

Kitchen and Project Home, Team and Test use the same
baseline: Core `Workspace/SelectionRow.vue` delegates neutral soft/ghost
selection to Nuxt UI, with an avatar or status icon and one record name.
`WorkspaceCapability` uses equal desktop columns and stacks them on mobile.
Core `Workspace/SingleCard.vue` presents an XL avatar/icon, one record name
and an accessible chevron link inside a `UCard`. Its optional description and
preview slot keep spacing and typography shared; domains supply existing
identity, location, publication or role/account facts. Missing fields stay absent
and previews do not start additional reads or infer operational counts. No settings toolbar or
duplicate selected-name heading is rendered outside the card. Home discovery and Menu tool cards have
no visible section heading.

Domain names, images, status meaning, routes and authority remain domain-owned.
Kitchen/Project chevrons use their existing workspace Identity routes.
Team and Test chevrons use record-id routes. Kitchen Menus now uses direct
record links instead of this collection/focus baseline: regular records open
their existing detail route and daily records open their content calendar.
This is the first bounded Kitchen application of “destinations have URLs;
short actions stay in context”; it does not migrate other capabilities.
Team keeps its role filter; person
editing, assignment, invitations and removal compose the same domain-owned
Team controls on `/team/[memberId]`. AI preparation retains its existing dialog
using the shared `Workspace/Team/Settings.vue` editor. Test creation uses a
dialog; update/delete use `/test/[id]` with the existing Test controller and form.
Record routes resolve the exact requested id within the selected workspace;
a missing id must never fall back to editing another selected record. No data or commands were removed
when simplifying the default presentation. Team and Test share these components
across Kitchen and Project; other Team consumers inherit the presentation but
need their own runtime verification. Main-page Hero/AI, Team role tools and Test
context tools retain their distinct responsibilities.

### Team construction contract

Core `Workspace/Team/Editor.vue` owns the default collection presentation through
People, loading/error feedback and a settled empty message. Existing collection
slots remain available to other domain consumers. Kitchen, Property and Project
use those defaults and retain their role endpoint, authored suggestions,
assignment editor and domain actions. Kitchen invitation creation/copy remains
Kitchen-owned; Property retains its role-label refresh callback. Kitchen and
Project derive their Team title from the already acquired Team state rather
than acquiring another Identity controller. The shared `TeamContext` includes
the existing status projection; it adds no reader or command authority.
Verify `team-editor-composition.test.mjs` in Core and Kitchen's
`team-workspace-composition.test.mjs`, plus the existing Team selection,
command-scope and domain tests.

Kitchen, Project, Supplier, Property, Portfolio and Blank retain named Team
routes, components and `useXTeam` composables. Every domain controller calls
Core `useWorkspaceTeam` for selection, post-create focus and capacity. Routes own
framing, navigation, SEO and the AI entry. Domain Team Index components own
role orchestration, endpoints and suggestions, and compose shared Team Editor,
People, Roles and Assignment. Kitchen additionally owns invitations and its
person-detail doorway. Core Team owns common selection, person controls and
role presentation without Kitchen/Project branches.

Nuxt component registration supplies predictable domain names; it does not
implicitly inherit implementation. Explicit consumption of lower components
and composables establishes sharing. Current named domain source and Team behaviour tests establish this bounded
construction contract; the old `workspace-pages.mjs` guard is retired. Project implementation belongs to the FireUX ecosystem;
Core retains only the shared interaction primitives.

### Supplier Team proving sibling

Supplier Team adopts the same route → domain component and
`useSupplierWorkspaceTeam` → `useWorkspaceTeam` construction as Kitchen and Project. Shared Editor,
People, Roles and Assignment retain their owners. Supplier owns its role
suggestions and endpoints; it has no copied Kitchen invitation or AI surface.
Its authenticated collection reader refreshes after commands rather than
combining a live collection with an account enrichment request. This is an
accepted reader difference, not a second Team interaction model.

Supplier stored Team profiles now use the shared `name`, `user_id`, `role_ids`
contract. Team labels do not grant Supplier access. The Supplier authority
helper is consumed by Team, identity and item commands and requires current App
membership, Supplier association, a valid subscription and compatible App scope.
Onboarding establishes the association and a simple linked Team profile;
connecting an unassociated existing Supplier remains an App admin/developer
action. Supplier selection reads `supplier_access/{appId}/users/{uid}` bound to
the current membership lifetime. Bringli owns the Supplier and Team capacity policy.

The old Supplier Team panel and `useSupplierWorkspaceTeam` path are retired.
Property, Portfolio and Blank use the same construction and shared Server
member mechanics in `runtime/workspace/server/team/members.ts`. Stored
members have only `name`, `user_id` and `role_ids`; document identity remains
separate and survives later account linking. Named domain entrypoints remain
intentional growth points, not a configuration-driven generic page.

Marketplace Store uses the same stored member contract but currently exposes
App-admin member management, not a Workspace Team page. Its existing linked-user
association reader remains distinct from the six domain-access families.
Legacy App-nested migration sources are not runtime fallbacks; their retirement
has its own release and backup requirements.

### Overview construction contract

The six Workspace Overviews retain named `useKitchenOverview`,
`useProjectOverview`, `useSupplierOverview`, `usePropertyOverview`,
`usePortfolioOverview` and `useBlankOverview` controllers, consumed by their
own Overview Index components. Kitchen consumes its existing Workspace selection
and linked Place directly; the other five reuse Core `useOverview` for their
selected Entity projection and outcome. There is no generic page or
industry-content registry.

Main content is domain-owned and may differ: Kitchen presents selected identity
and a route-owned map of working areas. Home remains its Kitchen-selection and
working landing page; Overview links to group indexes, whose mini overviews link
to child working pages. The Kitchen group composition and collection breadcrumbs
reuse the same explicit navigation children rather than flattening children into
Overview or maintaining a second registry. See `workspace-navigation.test.mjs`.
Project composes published App identity and ecosystem-owned App context;
collection-oriented Overviews retain their own scope summaries.
Existing `WorkspaceOverview`, `WorkspaceOverviewFocus` and
`WorkspaceOverviewMultiple` remain presentation building blocks. The
Current domain controllers establish the shared relationship without requiring
identical Main children; the old `workspace-pages.mjs` guard is retired. Other capability controllers are outside this contract.

### Identity composition proving pair

Kitchen and Project Identity use named `useKitchenWorkspaceIdentity` and
`useProjectWorkspaceIdentity` controllers over Core `useWorkspaceIdentity`. Core owns ready-state
read/edit availability, explicit `readState` presentation outcomes and a reactive
scope key; it owns no identity fields,
validation, account association or save endpoint. Kitchen retains Place-owned
venue fields and commands. Project retains its name and the connected App's
published description/image boundary. Their named Identity components
compose domain readers, editors and navigation; routes supply page framing.

Kitchen places Identity & brand and Team before its domain groups, with Settings
last. Identity & brand owns the Kitchen listing plus Venue profile, Operating hours
and Appearance links. Settings holds Payments, Integrations and Access. Food & drink
has a distinct group index linking to Items, Menus, Promotions and Services; those
working pages retain their existing routes and domain commands. Group indexes
introduce their children rather than act as the first working child. The existing
Kitchen pill provides Home access and selection above the sidebar user menu.
Overview remains a primary entrance to the groups. The Menu setup tool directory
stays contextual. The focused listing page composes URL, status and directory
visibility controls. Venue profile
owns the current-value venue sections. Focused side panels
compose the Place-owned inline editors also used by the public Place edit route. The Kitchen Workspace
passes its explicit mutation authority. Currency remains Place-owned; Kitchen
retains its separate palette controls; the public Place route retains Place access and return navigation.
Project presents its profile and, when connected, a separate publication-source
card. The connected App declares its published image fitting; Project's local
image remains a profile photo. `project/utils/project-identity-media.ts` resolves
the exact Project publication for Home, Navigation, selection and Identity
previews without copying App imagery into Project storage. Pending or failed
publication does not become an incomplete editable profile or a completion score. Both retain their bounded Identity proposal editors. Neither needs a page
selector or large AI panel. These are single-entity presentations, not
collection/focus layouts.

Supplier, Property, Portfolio and Blank have named Identity controllers consuming
`useWorkspaceIdentity`. Supplier reads the linked Company/same-id Place profile. Its
focused profile, brand, photo, contact and location panels reuse `PlaceEdit`,
with a Supplier-owned update adapter. Supplier identity media uses the same
Place logo/backdrop and photo-fallback resolution as Kitchen; settled joined
Workspace collection identity supplies its selected Overview. The public detail
passes its existing server-projected Place into presentation rather than opening
a second Company reader. The trusted Supplier profile command
rechecks current membership-bound Supplier access, management and the exact
Company/Place link in the same transaction before consuming Place's named
`stagePlaceUpdate`. Place owns validation and stored profile fields; Suppliers
owns the authority to compose them. The client adapter is not authorization.

Property has a focused editor for name, profile image, property type and unit
count. Its named Identity command updates sparse `identity.*` paths after current
Property authority, preserving relationships, publication state, management and
financial estimates. New Property images use unique objects under
`properties/{id}/images`; cancelled or obsolete uploads do not overwrite a saved
image. Storage and document attachment are not atomic; unused objects are
retained, and cleanup is not part of this editor.

Portfolio opens its existing field controls in focused panels: public profile
(name, tagline and region) is distinct from internal team context (owner label,
strategy and notes). The private context remains supported descriptive metadata
on this management page, not a new capability, role grant or public projection.
Portfolio image editing is not introduced by this pass. The root retains only
its id, management, audit stamps and nested `identity`; the nine descriptive
fields live under Identity. Team, Properties, Clients, Units, Documents, Tasks
and Compliance retain their independent record scopes. Canonical collection
and detail readers fail on malformed roots instead of exposing partial data
or clearing a valid selection. The named Identity update accepts only six
editable descriptive fields and writes sparse `identity.*` paths after current
transaction authority. Both public and Workspace creation use the same trusted
onboarding transaction for the root, Team, access and App management; route mode
changes completion selection, not the writer. Creation captures account, App,
membership, route and form intent before credentials. The offline
`tools/workspace-migrations/portfolio-identity.py` retains exact preimages for
`projects/granite-ecosystem/databases/granite` and has no network or apply mode.
Stored-data conversion remains separately authorized and unexecuted.

Property's current root keeps id, Place/Portfolio relationships, management and
audit stamps separate from `identity`. Slug, status and publication state are
nested with name, image, type and unit count. Optional `valuation` owns
`estimated_value` and `currency_code`; creation invents neither a valuation nor
a currency. Identity editing excludes valuation and publication controls.
Canonical readers reject retired flat publication and identity pricing fields.
Malformed granted roots fail the collection and retain the selected Property
rather than becoming empty or a partial ready list. Public directory summaries
validate and expose only the eligible nested Identity projection. The local
`tools/workspace-migrations/property-identity.py` produces offline proposals with
preimages and explicit valuation ambiguity; it has no network or apply mode.
Stored-data conversion is a separate unexecuted cutover. Blank remains an
explicitly read-only starter.

Supplier, Property and Portfolio Home details consume their index outcome:
loading and failure precede the selection prompt, and only a ready record is
presented. Selected Home/Overview identity cards open the owning Identity page.
Overview's multiple-record summaries remain informational because they do not
select the clicked record. Public Supplier and Project directories forward
reader outcomes rather than reporting a premature empty list.

One named domain controller supplies each reader and editor. Focused panels close
on account, selection or write-availability changes; Supplier also closes on a
linked-Place change. Commands capture original input before credentials and stop
obsolete dispatch across App/membership/route/disposal changes, including
change-away-and-back. Shared Place media editors capture that originating intent
before upload and skip obsolete attachments and feedback. New Place profile,
logo, wordmark and cover objects use unique `revisions` paths; existing fixed
media URLs remain supported. No saved object is overwritten or deleted by this
upload path.

The four older routes omit redundant Hero, selection and unavailable AI framing,
and reuse `MoleculesStateCard` for non-ready Identity outcomes. Supplier's profile
does not fabricate categories or repeat its tagline as a second headline.
Domain sections, linked sources, fields and commands remain local; there is no
universal Identity document or field registry. Supplier now nests publication
in `identity`, catalogue mode in `catalogue` and delivery areas in `delivery`,
while Company/Place and scoped records retain their own identities. Its strict
readers, onboarding, Demo and direct Kitchen consumers use this shape; the mixed
root editor is retired. The offline Supplier planner preserves preimages and
has no apply mode. Project now nests its four local profile fields under
`identity`, while id, audit stamps and optional exact anonymous ownership stay
at the root. Ecosystem owns `project_id`; App owns `ecosystem_id`. Team and Tests
remain separately managed records. Private readers reject malformed roots and
hide partial or stale results. Creation writes this canonical shape; Identity
updates recheck it inside the authority transaction and write sparse
`identity.*` fields. Command inputs remain the named action's bounded fields.
`ProjectPublicSummary` contains only id and Identity; it excludes guest authority
and audit. Directory requires active Identity, while direct detail preserves its
existing inactive/archived profile policy. The connected-App publication DTO
remains a separate presentation contract. See the ecosystem's
`project-model-shape.test.mjs`, `project-access.test.mjs`,
`project-directory.test.mjs`, and `project-guest.test.mjs`. The offline Project
planner retains exact preimages/revisions and has no apply mode; its length
checks match JavaScript UTF-16 units. This is a local source cutover, not proof
of stored-data conversion or signed-in browser acceptance.

Portfolio public directory/detail transport is `PortfolioPublicSummary`, an
allowlisted profile without management, internal notes, owner/strategy labels or
stamps. Its nested public Identity projection requires explicit
`identity.status: active`; this
pass does not add a new publication field or publication editor. Public readers
validate only public summary fields, independently of private management metadata.
Public SEO uses tagline, never internal notes or strategy. See
`fireux-properties/src/test/portfolio-public-identity.test.mjs`,
`portfolio-model-shape.test.mjs` and
`identity-surface.test.mjs`, `property-identity.test.mjs` and
`property-identity-scope.test.mjs`, Suppliers' `supplier-identity-profile.test.mjs`
and `supplier-identity-scope.test.mjs`, Place's `identity-media.test.mjs`,
`property-model-shape.test.mjs` and `property-public-directory.test.mjs`, plus
existing domain command-scope tests. This
construction does not establish authenticated browser verification or completion
of other capabilities.

### Landing collection and focus composition

Kitchen, Project, Supplier, Property and Portfolio Landing Index components
compose named `Home/Collection` and `Home/Single` children inside
`WorkspaceCapability`. Each keeps its `useXWorkspace` selection controller,
which consumes `useWorkspace`; there is no extra `useIndex` forwarding layer.
Blank composes its named Home/Collection and Home/Single children into the same
collection/focus positions. Domain cards and creation doorways remain local.
The Supplier, Property and Portfolio App routes and tools no longer consume the
retired Index `state`/`derived` envelope.

### Landing, Team and Test presentation order

Kitchen and Project Landing, Team and Test place a local collection selector
in Nuxt UI's DashboardToolbar inside the panel header, directly below the Nav.
Landing selects workspace entities; Test selects Test records and Team selects
Team members within the active entity. Kitchen Menus similarly selects Menus.
Capability toolbars do not switch the active workspace entity.
The padded body starts with the Hero heading, then the named capability AI area
and the capability's collection/focus content. Collection tools stay with the collection; individual tools stay with
the focused record, including their open forms beneath the compact controls.
Core WorkspaceCapability retains the lower two-column layout. The routes and
named domain components remain separate; this is not a generic page engine.
Team AI retains its existing intent handling. Kitchen Test AI prepares reviewed
string actions through its domain intent endpoint and existing Test commands;
read requests can select a string without writing. It consumes the same published
page context, and invalidates prepared actions when that context changes. Project
Test uses the same Core Test AI presentation and shared interpreter; landing AI is described above. Inspect the current routes to verify presentation order for the
Kitchen/Project proving pair; the old `workspace-pages.mjs` guard is retired. Other families are outside this presentation check.

### Overview capability summaries

Kitchen and Project Overview compose live Team, Test, Identity, workspace-count
and User notification summaries. Calendar explicitly reports its event source
as unconnected. Named Team summary readers use the existing authorised endpoints;
Test pages and summaries reuse their domain TestRecords readers without mounting
the editing controller or replacing Overview context. Each card has its own
loading/error state. Identity completion measures filled editor fields: nine
Place-owned venue fields for Kitchen and three effective fields for Project,
including connected App description/image. This is field completion, not a
claim of operational readiness. Notifications remain the cross-workspace User feed.

Each future capability includes its Overview summary in the same completion pass.
Supplier, Property, Portfolio and Blank now compose the same summary categories.
Their Team summaries use their existing authenticated endpoints, Identity uses
the named Identity reader, and Notifications remains User-owned. Test storage
is explicitly unconnected in these four families. Property links to its existing
reservation calendar; the Reservations extension adds a read-only recorded-stay summary through the Property Overview capability slot. That summary is not an availability guarantee. The other three Calendar event sources remain unconnected. These availability
states are intentional scaffold boundaries, not claims of complete behaviour.

### Domain capability summaries and read states

Kitchen Overview also consumes named read-only Menu, Dish, Recipe, Station and Order readers, plus its owned Ingredient/Supplier associations, Waste observations and completed-Sales report. It does not mount editing or default-creation controllers for counts. Only settled sources display numbers; source or selected-Entity failures remain distinct from empty results. The Orders summary uses the existing lifecycle board-stage helper; Sales counts completed records, not payments or profit. Unconnected sources remain explicit.

Supplier Overview independently summarizes its Catalogue, Item and Ingredient association collections. Documents, Tasks and Compliance each own their Portfolio summary component. Granite composes them through the Properties-owned Overview capability slot; Properties does not depend on those optional upper extensions. Reservations similarly composes its named read-only summary over the Property Overview. Their explicit Overview registrations take precedence over the foundational component without changing that foundation's ownership. Project Overview reads its App and Ecosystem relationships through the existing named readers.

Portfolio Documents/Tasks/Compliance routes remain thin entrypoints over extension-owned capability Index components. Working collection pages propagate target, pending and error outcomes before showing tools, counts or empty claims. Limited Reservation results are marked as partial; a blank calendar is not evidence of availability. Kitchen Sales invalidates credentials and results across account, membership, Kitchen and range changes, and inspected transaction details close when their report is unavailable. Inspect the owning source and `fireux-kitchens/src/test/kitchen/capability-read-state.test.mjs`, `fireux-properties/src/test/capability-read-state.test.mjs`, and the Documents/Tasks scope checks for these bounded contracts. Those checks do not prove authenticated browser journeys or deployment.

### Immature universal capability scaffolds

Supplier, Property, Portfolio and Blank expose named Test components with an
explicit unconnected storage state. Supplier, Portfolio and Blank Calendar
components use their named Calendar composable over `useWorkspaceCalendar`; Property
preserves the Reservation package override and its domain-owned booking tools.
Their capability routes keep Hero, named selector, visible AI availability and
content in order. Main App Landing places selection before AI and collection /
focus content. Blank's Workspace entry is `/`; the duplicate entry route and
its callers are retired. Notifications is the shared User panel, not six copied
notification pages. Inspect current named routes and summary controllers for these bounded
contracts; `validateUniversalScaffold` and `workspace-pages.mjs` are retired. Runtime and authenticated behaviour
still require their own verification; a scaffold guard does not prove them.

### KitchenAI Landing to Menus

Kitchen owns one bounded handoff in `kitchen/models/ai-handoff.ts` and
`kitchen/composables/workspace/useKitchenAIHandoff.ts`. Landing stores the question
before navigating; the named Menus AI consumes it once after its context is ready,
bound to the signed-in user, selected Kitchen and a two-minute lifetime. It does
not persist a transcript or share parent-chat context.

Menus consumes the same `useKitchenMenusContext` state and action availability
as its manual UI. Its intent endpoint prepares existing controls and review routes;
normal commands retain mutation authority. The focused `kitchen-ai-handoff` and
`menus-intent` tests cover identity, expiry, stale responses, projection and
transport-envelope parity. This relationship is local to Landing and Menus.

### Shared Test AI capability

Kitchen and Project Test consume Core `workspace/components/Test/AI.vue` and
`models/test-intent.ts`. Their named adapters supply scope, label and their
registered intent endpoint; the shared presentation owns prompts, review forms,
stale-context rejection and invoking the supplied `TestController`. Account
changes also invalidate prepared or in-flight results. Both endpoint adapters
consume `fireux-ai/runtime/server/utils/test-intent`, which validates bounded
client context and structured inference, requires sign-in and never writes.
The existing domain Test commands retain write authorization. This contract is
for the shared disposable-string Test capability, not arbitrary domain records.

### Portfolio Task writes

The Tasks extension owns its active Portfolio-scoped create/update commands and
thin POST/PATCH handlers. It reuses Properties' existing Portfolio authority
helper: current App membership, membership-bound Portfolio access and root
management are checked in the transaction. No new role or tier policy is added.
Task identifiers/ownership/stamps are server-owned; supported fields and the
existing status/source enums are validated. Existing pure Compliance/Document
Task projections remain presentation inputs, not authority.

Active adapters capture intent before credentials and invalidate account, App,
Portfolio, route and disposal changes. The Tasks form suppresses obsolete
results and preserves a newer draft after delayed success. Task Delete has no
observed caller in the inspected source and remains outside this cutover.
See Tasks-owned `task-commands.test.mjs` and `task-scope.test.mjs`.

### Portfolio Document writes

Documents owns its upload-and-record and link commands, registered through thin
multipart/JSON handlers. Upload verifies the bearer/runtime actor before parsing
multipart bytes; Portfolio authority follows parsed scope. Both reuse the
existing Portfolio authority. Upload
checks authority before Storage and again in the record transaction. Storage
paths, metadata and audit fields are server-owned. A request fingerprint binds
Portfolio, actor/App, filename/type, notes and file bytes; reuse with changed
content is rejected. The Storage object is create-only and an uncertain save
can reuse only its matching ownership marker. No arbitrary upload size/type
policy is added by this boundary.

Storage and Firestore are not atomic. On an uncertain or rejected record commit,
the owned file is retained for the same request to retry; the command does not
delete a possibly committed or unrelated object. The page retains request IDs
for unchanged in-page retries. Reload/disposal loses that local retry intent;
abandoned uploads need a separately designed recovery/retention policy. This is
not an automated cleanup claim.

Link validates the scoped Document and existing typed-reference grammar. It
does not assert that the target exists or is accessible (including the legacy
`tenancy` target). Link plus optional Task is one runtime transaction, consuming
Tasks' named `stagePortfolioTaskCreate` after the same authority check, without
nested transactions. Retry fingerprints prevent duplicate links/tasks.

The active page and adapters capture file/input and account/App/Portfolio/route
intent before credentials, reject obsolete results, and distinguish an
unconfirmed operation from success. Existing live readers are unchanged.
Unused Document/Link update/delete adapters remain outside this bounded cutover.
Documents-owned `document-commands.test.mjs` and `document-scope.test.mjs` cover
controlled authority, Storage, transaction, transport and UI behavior; live
provider/browser operation is not established by those tests.

### Portfolio Identity writes

Portfolio's active six-field Identity editor uses a named trusted PATCH command.
It validates name, tagline, owner/strategy/region labels and notes using the
existing editor lengths, then rechecks current membership-bound Portfolio and
management authority in the write transaction. Root id/slug, ownership, status
and audit fields are not editable through this command. Its adapter captures
input before credentials and invalidates account/App/selection/route round trips
and disposal; the editor suppresses obsolete success/error feedback. Blank Identity remains explicitly read-only. Property has its own bounded Identity command as described above.
See Properties' `portfolio-identity.test.mjs` and
`portfolio-identity-scope.test.mjs`; browser/provider proof remains separate.

### Interactive Product creation

The Products extension owns the active admin creation command at
`product/server/create/command.ts`, exposed by its native runtime layer at
`POST /api/products/create`. Current runtime App membership must grant
admin/dev or the existing `canManageProducts` flag. The command derives
`source_app_id` from that App, validates the authored Product/Price input, and
rechecks authority at each persistence boundary. The separate existing
service-key provisioning endpoint is unchanged; it is not the authority path
for this interactive command.

Creation reserves the chosen Product slug inactive and App-visible, binding
request id, actor, App and canonical payload fingerprint on that owned Product.
Provider IDs and attempt times are retained there. Final activation/visibility
and all Price records commit in one database transaction. Stripe calls are
external effects, not part of that transaction; failed provisioning leaves a
recoverable inactive reservation, never a false published success. No provider
resource is automatically deleted. Both provider paths consume the existing owning `STRIPE_API_VERSION`; this
cutover does not upgrade the Stripe API contract.

Stripe retains the first idempotent response, including failures, rejects
changed parameters, and can prune keys after at least 24 hours
([official contract](https://docs.stripe.com/api/idempotent_requests)). An
attempt with no recorded provider ID cannot automatically POST again once that
window expires. It requires reconciliation. Stored IDs are retrieved and their
ownership marker verified before continuing. Client retry IDs are retained by
account/App/slug; altered unfinished drafts cannot silently become a new request.
The active create page suppresses obsolete outcomes across account/App/route
changes. Provider 500s may remain replayed failures; this is not an automatic
repair or cleanup system.

`product-create.test.mjs`, `product-create-scope.test.mjs` and
`product-create-route.test.mjs` prove controlled failure/retry, authority,
transport/UI and actual native endpoint discovery. No live Stripe call is
implied. Standalone publish and alternate Create/Submit exports have no observed
rendered consumer in this bounded trace; no new publish endpoint is introduced.

### Completed Workspace role placement

Workspace selection and page-state controllers remain beneath each owning
Entity’s `composables/workspace`, with direct named capability folders. Domain
readers, commands, access and pure helpers live in the Entity’s corresponding
role rather than generic Workspace core/index/operations/capabilities buckets.
Portfolio contributions remain owned by Compliance, Documents and Tasks;
Property Reservations remain owned by Reservations. MarketplaceStore has no
proved Workspace interface and is outside this family. Component-local
presentation helpers may remain beside their component; the shared Kitchen
Finance Overview controller belongs in `kitchen/composables/workspace/finance`.
Supplier capability labels consume its live detail projection’s Place identity;
root Supplier records do not carry hydrated `company_place` fields.

### Access-bounded current Entity projection

Project, Kitchen, Supplier, Portfolio and Property retain one Entity owner and
one Workspace surface. Their base `useXWorkspace` reads the saved selection
only when the owning access reader is settled and includes that exact ID for
the current App membership lifetime. A pending/failed/absent membership or
ungranted saved selection disables the private root read and hides retained
Entity data. A ready response for the previous Entity remains pending until
its ID matches the new selection. Public/guest root readers retain their own
separate visibility contract; this is not a global Workspace entrance gate.

Core `src/test/workspace-entity-projection.test.mjs` exercises all five actual
base adapters with their actual membership access resolution. Selection and
route disposal remain covered separately by `workspace-selection.test.mjs` and
`workspace-page-state.test.mjs`. No capability commands or generic base engine
are introduced by this contract.

### Workspace foundation lifetimes

Setup-owned Core document bindings and live server readers supply source state;
domain projections hide retained rows and fields while their source is inactive,
obsolete, loading or failed. An active read error takes precedence over another
loading source. Public Detail readers also check their exact route identity:
Supplier uses case-sensitive document IDs, while Kitchen uses its declared slug.
Supplier's granted-root collection binds its linked Company Place documents at
setup and projects their current identity; those fields are not copied into the
stored Supplier root. Missing linked identity does not erase a granted Supplier.

Kitchen and Property selection may navigate out of a record before selecting
another Entity. Their Index adapters use shared App/Workspace choice state and
Core command scope so the latest valid choice wins across separate selectors;
reselecting the current Entity cancels an earlier pending switch. Selection still
requires the current settled domain collection and grants.

Creation and preparation capture account, App membership and input before
credentials or other preparation waits. Domain editors add the lifetime of their
current draft and dialog. Obsolete preparation cannot dispatch; obsolete UI
completion cannot close or clear a newer editor. A confirmed server command
retains its truthful result even if its initiating surface changes. A confirmed
guest Kitchen connection consumes only its exact recovery proof and publishes
selection only to the current owner.

Current behavioral entrypoints are Kitchen's `kitchen-workspace-internals` and
`kitchen-identity-internals` tests, Supplier's `supplier-workspace-internals`
tests, Property/Portfolio's `workspace-foundation-internals` tests, and Core's
Workspace projection, selection and page-state tests. These establish the
inspected foundation contracts; capability-record workflows and live browser
acceptance have their own verification boundaries.

Property readers, presentation, onboarding, Identity and Reservations consume the
same pure `property/utils/normalize-property.ts` root validator. It owns no
reactive state or I/O; manual parsing and UI mapping remain separate.

## Workspace sidebar density

Core `layouts/workspace.vue` cycles compact icons, expanded labels with normal
group behaviour, and expanded labels with every group initially open. The control
beside the brand names its next action in its tooltip and accessible label.
Changing mode remounts accordion defaults without changing the active destination
or domain readers. `navigation/workspace-sidebar-mode.ts` owns the small cycle;
verify `workspace-sidebar-mode.test.mjs` and `workspace-active-destination.test.mjs`.

## Shared Home and Team composition

Project, Kitchen, Supplier, Portfolio and Property Home collections reuse Core
`WorkspaceEntityCollection` for loading, error, empty and ready presentation.
Entity rows, creation policy and navigation remain with their domain.

The single `useXWorkspace` owner returns selected `{ id, data, outcome }`
and chooser `{ collection, collectionOutcome, select }`;
they do not acquire creation or mutation commands. Kitchen creation policy lives
in `useKitchenCreate`, and adoption is explicitly composed at entry.
Identity editors acquire their domain commands and submit an explicit Entity ID.

Core `WorkspaceTeamCollection` owns member collection presentation and reuses
`useCollectionSearch` for names, User IDs and domain-supplied role labels.
Domains supply membership, permissions, role meanings and commands. There is no
separate Team People component or filter owner.

## Shared capability ownership

Selected-Entity adapters are named `useXWorkspaceIdentity()`,
`useXWorkspaceTeam()` and `useXWorkspaceCalendar()` and acquire their target
through `useXWorkspace()`. They accept no Entity-ID argument. Current adapters
live directly under the Entity's `composables/workspace`; domain-specific
capabilities keep named child folders. Blank uses App-local `composables/workspace`. Domain fields, roles, events and commands remain
with each domain. A domain-only name must not silently acquire Workspace selection.

Core `useIdentity` owns read states and content scope. Core
`useWorkspaceIdentity` adds management action availability. Core
`useWorkspaceTeam` owns shared roster selection and management availability.
Generic `useCalendar` lives under shared composables; `useWorkspaceCalendar`
adds selected-Entity date-state disposal. Home uses existing shared collection, entry and overview components through
`useXWorkspaceHome()`, which owns the real chooser and summary composition.

Kitchen demonstrates an explicit-ID domain identity path with
`useKitchenIdentity(kitchenId)` and `useKitchenPlace(kitchenId)`. Its Workspace
Identity adapter composes these with the current selection and shared management
state. Setup workflows supply their explicit ID directly to the domain reader.
These private readers retain membership checks; this migration does not publish
a new public identity API or claim event integrations for Calendar placeholders.
Other Identity and Team adapters retain their existing domain reads and commands;
no empty domain wrappers have been introduced for symmetry. Property's Calendar
remains Reservation-owned rather than acquiring a second adapter.

### Retired manual checks

The Workspace migration checks listed as removed in
`docs/ai/gpt-context.md` are no longer available. References to those filenames
in this document describe historical verification, not current coverage.

## Capability organisation

Common Home, Identity, Team and supported Calendar adapters live directly under
`composables/workspace`; domain-specific collections use named capability child
folders with `useXWorkspaceY` owners. Home includes its
lightweight Team summary; separate Team-summary controllers are retired.
Kitchen creation availability lives in `useKitchenCreate` and reuses Core
creation policy with Kitchen's capacity table. Available Kitchen targets are
read by domain-owned `useKitchenTargets`; they are not children of a Kitchen.

Kitchen Dish, Recipe, Ingredient and Supplier detail readers receive explicit
Kitchen and record IDs. Dish, Recipe and Ingredient detail do not load their
entire collection to locate a record. Supplier detail retains existing domain
relationship hydration; its collection-wide hydration remains a separate
performance concern. Workspace pages own route parameters, catalogue labels
and navigation paths. Menu source uploads have the separate plural
`useKitchenWorkspaceMenuSources` owner. Menu Section receives its parent record
state and section ID explicitly; it has no fallback to routed selection.

Stations collection reads never create records. The empty Stations page offers
an explicit Add Pass station action backed by `useKitchenStationCreate`.
Table Tabs and Supplier Catalogues use accurate plural collection names.

`usePortfolioScope(id)` and `usePropertyScope(id)` resolve explicit, authorised
domain scope and storage paths. They do not read Workspace selection. Domain
collections and commands require a scope input; Workspace surfaces establish
it from their selected Entity. Property Identity and Supplier profile commands
submit explicit target IDs, while editor lifetime and feedback remain UI-owned.
These moves do not change storage schemas, server authority or deployment.

## Unified Workspace selection owner

Kitchen, Project, Supplier, Portfolio, Property and Blank combine their former
Index and selected-record readers in `useXWorkspace`. Collection consumers use
`collectionOutcome` and `id`; selected-record capabilities use `outcome`, `id`
and `data`. Home and navigation acquire this same owner. Core `defineWorkspace`
shares the effects per Nuxt App and releases them with the last consumer; the
cache is request-isolated during SSR. It does not serialise runtime instances
into payload state or share actor data between server requests.

Common `useXWorkspaceHome`, Identity, Team and Calendar adapters sit directly
under `composables/workspace`. Named child folders are reserved for genuinely
domain-specific capability implementation. Home retains its summary composition;
it is not a second selector. Retired Index files and one-file common capability
folders are removed without compatibility exports.

## Core shell and account notifications

The Workspace shell consumes App configuration, account state, navigation and Core
selection. User notifications remain under `runtime/user`: `useUserNotifications`
owns the feed, total unread count and shared panel visibility consumed by dashboard
and Workspace. The list is bounded to the latest 50 records; the server separately
counts unread records. The shared panel contains no customer-specific navigation.

`useWorkspacePageState` admits only publications matching the current App, account,
selected Entity and full destination. Publishers release their own current value
on disposal; read-only consumers cannot clear another publisher. Domain commands
receive explicit targets and retain account/App authority checks; editor route and
draft lifetime stays with the consuming surface. The selection-only write guard
is removed rather than treated as mutation authority.
