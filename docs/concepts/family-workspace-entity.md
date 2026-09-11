# Workspace entity family

Updated: 2026-09-11
Ref: 53fa40ee6
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
| Blank             | `accepted`: App-local development harness; it proves the baked-in Workspace surface with the shared Team controls and no domain capabilities, but is not an ecosystem-installed product Workspace |
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

Kitchen exposes allowance, used count, `canAdd`, `canCreate` and `showUpgrade`
through its domain-owned `useKitchenWorkspace`. Its pure
`kitchen/utils/kitchen-capacity.ts` is also consumed by trusted onboarding:
Free and Premium allow one associated Kitchen; Business has no subscription
count limit. The existing relationship storage ceiling is separate. Counts use
unique Kitchen associations, not other Workspace families or preview tiers.
Creating a new Kitchen and adding an existing Kitchen both consume a new
association; reopening a retained Kitchen does not. Over-limit associations are
not removed or hidden. Both Kitchen Create buttons and their modals are absent
when creation is unavailable. Pending/error account reads offer no creation.

Project still uses Core `useWorkspaceCreation`, which reads App-configured
capacity and counts workspace relationships across the current App membership.
That is a remaining ownership/counting difference, not the Kitchen reference.
Kitchen and Project Landing put their inline collection and Create doorway on
the left, with selected identity and Edit on the right. Their domain creation
forms retain the existing allowance and onboarding behavior.
This is a presentation gate: trusted creation commands still own mutation
authority and currently check their domain relationship counts. It does not
prove a shared billing allowance across separate Apps or an ownership-only
count that excludes invited relationships.

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
identity ownership. Its UI counts workspace associations across the App while
its creation command checks Project associations; this difference remains
outside the information-dialog cutover. A full Project downgrade workflow is
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
  ordinary route navigation does not key the layout by URL. Test form state is
  reset by Entity id so an edit cannot carry into another Workspace root.
  Supplier, Property, Portfolio, and Blank remain `migration` at this seam until
  their domain navigation and retained `clear` interfaces are cut over and verified.
- Capability runtimes consume `useXWorkspace().id` and load only their
  own records. They do not reconstruct an Entity directory, read
  `primary_<family>` independently, or establish another selection authority.
- Domain Index composables expose named Entity collections and actions
  directly. Core does not own a generic directory-index adapter.
- `team/{memberId}` belongs to the Entity's roster and stores names, account
  links and role labels. It is not the user's Workspace Entity index.
- The AppUser model reserves the explicit plural Entity-id array and singular
  `primary_<family>` field used by each implemented family; no generic
  Workspace target field owns those relationships. Kitchen, Project, Portfolio,
  Property, and Supplier now prove the primary-only Index read contract.
  Each persisted pair is optional until its family establishes a relationship;
  if either field is present, both must be present and valid. The current-App
  projection normalizes an absent pair to an empty array and empty primary id,
  so runtime consumers retain a complete stable DTO without pre-seeding storage.
  Supplier, Portfolio, Property and Blank creation now establish these pairs
  through trusted transactions. Primary-change workflows remain separately
  owned; Team membership never substitutes for the AppUser index.
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
Test publishes only workspace id, string records and read state; full Workspace
records are not part of its page-facing context.

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
| Kitchen Team assigns labels within the shared roster contract | `accepted` | Kitchen and Project share a name, account link and assigned role labels. Removing a roster entry revokes pending invitations; workspace access remains on AppUser. | `useKitchenTeam`, Kitchen Team server commands, and `Workspace/Kitchen/Team`                         |
| Supplier, Portfolio, and Property Team are minimal today     | `accepted` | Their named Team controllers and components compose the same shared roster controls                                                                                                                                  | family `useXTeam` composables and shared Team Editor                                                  |
| Blank has no domain capabilities                                | `accepted` | Blank is a structural harness; its named Team surface uses the shared roster controls and AppUser association                                                                                                                        | `projects/fireux/fireux-blank`                                                                                |
| Project Create produces an inactive empty shell              | `accepted` | The trusted FireUX command creates only the canonical Project and caller's linked Team profile; publication and further product composition remain separate lifecycles                                                                             | Project entity declaration, internal control-plane APIs, and Project Workspace Create                         |
| Active root gates operational top-bar controls               | `accepted` | Calendar and Notifications require signed-in App membership and explicit Entity association to a selected root that completed its family onboarding lifecycle; presentation and publication readiness stay separate                                                                    | Shared Workspace state/Navbar plus family Workspace readers                                                   |
| Capability families differ by domain                         | `accepted` | Each Workspace Entity exposes only capabilities backed by its own product records and authority                                                                                                                                                     | current source uses direct `components/Workspace/<Capability>` and `composables/workspace/<Capability>` paths |

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
Project Team and Kitchen Team prove capability consumers.

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

Focus List is one surface-family classification, not another hierarchy layer.
Capability, Tool, entry-family, Local Tool and Compound Tool meanings are owned by
[Workspace, Capability, and Tool family](family-workspace-capability-tool.md);
this Workspace map owns only their application to active-Entity surfaces.

## Alignment roadmap

### Now

- Preserve the guard-backed six-family Index parity.
- Keep one family-owned target outcome and one outcome-bound active Entity.
- Keep Team as an Entity-owned roster capability. Current development access
  remains on current App membership and explicit AppUser Entity association;
  Team labels do not grant access. Individual role restrictions are deferred.
  Follow the global authority boundary rather than inferring access from a
  Team record or introducing another membership list.

### Next

- Keep the five-field Kitchen root + optional same-id Place + root-owned Team composition
  guarded across Live, Demo, and Test sources. Reject copied Place identity,
  Kitchen media overrides, and redundant `place_id` on the Kitchen root.
- Keep Kitchen live Create on its guarded trusted onboarding endpoint and keep
  root identity and Team creation atomic.
- Preserve canonical Supplier and related Place records in Workspace readers;
  Portfolio remains its canonical readable root with scoped and private work
  owned separately.
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
`useTeam` for selection, post-create focus, capacity and CRUD availability;
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
pipeline and this composition. `Workspace/Test/Form.vue` supplies both compact
dialogs and open forms through the same command callbacks. Test's local focus
and drafts reset when its Workspace id changes. Its published context contains
only workspace id, string collection, focused string and derived read state;
Info and Copy JSON consume that projection. The named domain controllers call
Core `useTest` for selection, commands and bounded context. Kitchen Test AI uses
that context to prepare reviewed string actions through its domain endpoint and
the existing commands. Neither has a
detail route, discovery or client capacity framework. Existing server
authorization and storage are unchanged. Other universal pages adopt only the
sections their real responsibilities need; this is not a compulsory whole-page
controller or an assertion that Overview owns a collection.

### Landing Test Team comparison

Inspected scope: Kitchen and Project App Landing routes, domain Index UI,
Index selection bindings, Test readers/commands and UI, Team controllers and
Editor, shared layout, Info/JSON and Team AI context consumers. Other workspace
families and Menu capabilities are not included.

| Capability | Collection / focused record | Shared responsibility | Necessary difference |
| --- | --- | --- | --- |
| Landing | Workspaces / selected workspace | `WorkspaceCapability` layout; `useWorkspace` selection/reconciliation; creation allowance | Selection persists as an App-local preference; domain onboarding and identity remain distinct |
| Test | Strings / focused string | Same layout; one form for compact and open use; Info/JSON | Disposable pipeline data; local focus; Kitchen AI prepares existing string controls; no role model |
| Team | People / focused person | Same layout; Team person forms, focus, capacity and role-label UI; Info/JSON | Linked accounts, role labels, invitation workflow and existing Team AI need real domain behavior |

| Workspace concern | Kitchen | Project | Classification |
| --- | --- | --- | --- |
| Landing display | Kitchen joined with same-id Place; display name/image/tagline | Project name/image/description, optionally published App identity | Accepted domain difference |
| Landing Create/Edit | Kitchen/Place onboarding; root slug/status/visibility editor; Place identity doorway | Project creation; Project name and manual or published App identity | Accepted domain difference |
| Test transport | Kitchen child reader; Kitchen id in request body | Project collection reader; Project id in endpoint | Accepted transport difference; matching simple command surface |
| Team records | Shared member profile enriched from linked accounts | Same profile and account enrichment | Shared record/interaction contract |
| Team extras | Invitation links and richer person details | Project-owned roles and identity composition | Domain additions; not branches in the shared layout |
| Inspector | Bounded collection/selected/derived; workspace id where an enclosing workspace is consumed | Same sections | Shared composition; no unused section or full-record dump |

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
`useKitchenWorkspaceIndex` and `useProjectWorkspaceIndex` still bind their real
domain readers. Team's larger controller remains a separate simplification
candidate; this comparison does not prove every Team branch necessary.


The composition boundary for these six surfaces is explicit: Landing Index
assembles domain `Landing/Collection.vue` and `Landing/Individual.vue`; named
Kitchen and Project Test Index components each assemble `Test/Collection.vue`, `Test/Individual.vue`, and
`Workspace/ContextTools.vue`. Team Editor assembles its named Collection and
Individual children. Collection and Individual own their controls; Index owns
only composition and the shared selection/context lifecycle. Nuxt UI owns
ordinary modal, card, button and form presentation.

This is the basis for optional shared and domain capabilities, not a claim that
those existing pages have been audited. Reuse the structure where the capability
has a real collection/focus interaction; retain domain fields, workflows and
commands with their owner. Do not force `useXCapability` and `useCapability` pairs
when one would only forward the other.


### Team construction contract

Kitchen, Project, Supplier, Property, Portfolio and Blank retain named Team
routes, components and `useXTeam` composables. Every domain controller calls
Core `useTeam` for selection, post-create focus and capacity. Routes own
framing, navigation, SEO and the AI entry. Domain Team Index components own
role orchestration, endpoints and suggestions, and compose shared Team Editor,
People, Roles and Assignment. Kitchen additionally owns invitations and its
person-detail doorway. Core Team owns common selection, person controls and
role presentation without Kitchen/Project branches.

Nuxt component registration supplies predictable domain names; it does not
implicitly inherit implementation. Explicit consumption of lower components
and composables establishes sharing. `workspace-pages.mjs` guards this bounded
construction contract. Project's existing location in Core remains ownership
debt; this pass does not promote it as the location for another domain.


### Supplier Team proving sibling

Supplier Team adopts the same route → domain component and
`useSupplierTeam` → `useTeam` construction as Kitchen and Project. Shared Editor,
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
action. Supplier selection reads AppUser `suppliers`, not retired App-owned
Supplier access documents. Bringli owns the Supplier and Team capacity policy.

The old Supplier Team panel and `useSupplierWorkspaceTeam` path are retired.
Property, Portfolio and Blank use the same construction and shared Server
member mechanics in `runtime/server/utils/workspace-team/members.ts`. Stored
members have only `name`, `user_id` and `role_ids`; document identity remains
separate and survives later account linking. Named domain entrypoints remain
intentional growth points, not a configuration-driven generic page.

Marketplace Store uses the same stored member contract but currently exposes
App-admin member management, not a Workspace Team page. Its existing linked-user
association reader remains distinct from the six AppUser-indexed families.
Legacy App-nested migration sources are not runtime fallbacks; their retirement
has its own release and backup requirements.


### Overview construction contract

The six Workspace Overviews retain named `useKitchenOverview`,
`useProjectOverview`, `useSupplierOverview`, `usePropertyOverview`,
`usePortfolioOverview` and `useBlankOverview` controllers, consumed by their
own Overview Index components. They share Core `useOverview` for the selected
Entity projection and outcome, not a generic page or industry-content registry.

Main content is domain-owned and may differ: Kitchen composes linked Place and
setup information; Project composes published App identity and ecosystem-owned
App context; collection-oriented Overviews retain their own scope summaries.
Existing `WorkspaceOverview`, `WorkspaceOverviewFocus` and
`WorkspaceOverviewMultiple` remain presentation building blocks. The
`workspace-pages.mjs` guard checks the controller relationship without enforcing
identical Main children. Other capability controllers are outside this contract.


### Identity composition proving pair

Kitchen and Project Identity use named `useKitchenIdentity` and
`useProjectIdentity` controllers over Core `useIdentity`. Core owns ready-state
read/edit availability and a reactive scope key; it owns no identity fields,
validation, account association or save endpoint. Kitchen retains Place-owned
venue fields and commands. Project retains its name and the connected App's
published description/image boundary. Their named Identity Index components
compose the domain reader/editor children; routes supply page framing.

Kitchen Identity presents its Place imagery and venue profile, grouped contact
and local settings, then the existing setup controls. Project presents its
profile and, when connected, a separate publication-source card. Both retain
their Identity editors. Their profiles lead without a page selector, repeated
Identity hero, or large AI panel. Kitchen reuses the Place header and gallery
also consumed by its public presentation; editing remains Workspace-owned.
These are single-entity presentations, not collection/focus layouts.

This is a two-domain proving pair. Supplier, Property, Portfolio and Blank now have named Identity controllers
consuming `useIdentity`. Supplier reads public identity through the linked Place
reader and explicitly leaves editing unconnected; its retired root-identity
editor is removed. Portfolio retains its existing field editor and current
AppUser association determines UI availability. Property and Blank expose
read-only identity. This construction does not establish browser verification
or completion of their other capabilities.


### Landing collection and focus composition

Kitchen, Project, Supplier, Property and Portfolio Landing Index components
compose named `Landing/Collection` and `Landing/Individual` children inside
`WorkspaceCapability`. Each keeps its `useXWorkspaceIndex` selection controller,
which consumes `useWorkspace`; there is no extra `useIndex` forwarding layer.
Blank composes its existing named Targets and ActiveCard children into the same
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
Test uses the same Core Test AI presentation and shared interpreter; landing AI is described above. The presentation order is guarded by workspace-pages.mjs for the
Kitchen/Project proving pair. Other families are outside this presentation check.


### Overview capability summaries

Kitchen and Project Overview compose live Team, Test, Identity, workspace-count
and User notification summaries. Calendar explicitly reports its event source
as unconnected. Named Team summary readers use the existing authorised endpoints;
Test pages and summaries reuse their domain TestRecords readers without mounting
the editing controller or replacing Overview context. Each card has its own
loading/error state. Identity completion measures filled editor fields: eight
Place-owned venue fields for Kitchen and three effective fields for Project,
including connected App description/image. This is field completion, not a
claim of operational readiness. Notifications remain the cross-workspace User feed.

Each future capability includes its Overview summary in the same completion pass.
Supplier, Property, Portfolio and Blank now compose the same summary categories.
Their Team summaries use their existing authenticated endpoints, Identity uses
the named Identity reader, and Notifications remains User-owned. Test storage
is explicitly unconnected in these four families. Property links to its existing
reservation calendar while marking its Overview summary as unconnected; the
other three Calendar event sources remain unconnected. These availability
states are intentional scaffold boundaries, not claims of complete behaviour.


### Immature universal capability scaffolds

Supplier, Property, Portfolio and Blank expose named Test components with an
explicit unconnected storage state. Supplier, Portfolio and Blank Calendar
components use their named Calendar composable over `useCalendar`; Property
preserves the Reservation package override and its domain-owned booking tools.
Their capability routes keep Hero, named selector, visible AI availability and
content in order. Main App Landing places selection before AI and collection /
focus content. Blank's Workspace entry is `/`; the duplicate entry route and
its callers are retired. Notifications is the shared User panel, not six copied
notification pages. `validateUniversalScaffold` in `workspace-pages.mjs` checks
these bounded route and summary contracts. Runtime and authenticated behaviour
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

Kitchen and Project Test consume Core `components/Workspace/Test/AI.vue` and
`models/test-intent.ts`. Their named adapters supply scope, label and their
registered intent endpoint; the shared presentation owns prompts, review forms,
stale-context rejection and invoking the supplied `TestController`. Account
changes also invalidate prepared or in-flight results. Both endpoint adapters
consume `fireux-ai/runtime/server/utils/test-intent`, which validates bounded
client context and structured inference, requires sign-in and never writes.
The existing domain Test commands retain write authorization. This contract is
for the shared disposable-string Test capability, not arbitrary domain records.
