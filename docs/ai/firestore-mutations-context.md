# Firestore mutation GPT context

Updated: 2026-10-09
Ref: 57d034087
Role: living context
Scope: Firestore writes across runtime packages, projects, scripts, CLI, Codex skills, and MCP

## Inheritance and purpose

This context inherits the root `AGENTS.md` and `docs/ai/gpt-context.md`. It owns
the durable mutation authority boundary; entity models, Security Rules, and
read projections retain their existing owners.

The top-level relationship and client entrances are mapped in
`docs/concepts/core-models.md`. Root CRUD changes one root document only.
AppUser membership commands own `apps/{appId}/users/{userId}`; there is no
consumed primitive AppUser Create/Update/Delete API.
Authentication bootstrap and other cross-record workflows keep explicit names
and must not be presented as User CRUD.

AppUser is authoritative in the owning App database. Its trusted mutation
finishes that transaction first, then idempotently reconciles the minimal
`users/{userId}/apps/{appId}` locator in the identity database. Firestore cannot
make the two databases atomic; a retry repairs the locator, which never grants
membership or replaces an AppUser authorization check. The historical locator
repair script has been removed; there is no supported repository repair command.
Any repair needs a separately reviewed, exact-App plan and verification.

`App.ecosystem_id` is the App–Ecosystem relationship authority. Trusted App
initialization idempotently reconciles a minimal
`ecosystems/{ecosystemId}/apps/{appId}` locator in the identity database. App settings do not change `ecosystem_id`; App creation uses trusted Project creation or runtime
initialization, which establishes the required relationship. Relationship
movement is never hidden inside root CRUD. The historical Ecosystem locator
repair script has been removed; there is no supported repository repair command.

App exposes consumed readers and trusted settings/media/membership commands.
Unused root mutation parity files are retired. Trusted Project creation
and `initializeConfiguredApp` own creation with its required relationships.
No primitive App Create may write an incomplete root. Other Entities expose
only their supported, consumed named CRUD capabilities; no aggregate façade
or mandatory four-file scaffold is required. Delete removes exactly one selected document. It
does not archive, cascade, reconcile relationships, or delete authentication.
Any future relationship-aware removal is a separately named entity operation;
it must not replace Delete or be hidden inside a primitive.

## Authority

The retained mutation types define three lanes: Client, Server, and MCP/Skill,
with Create, Update, and Delete verbs. Client primitives and Server touchpoints
remain implemented. MCP/Skill target declarations remain, but their write
adapters were removed with `scripts/`; there is no supported repository
MCP/Skill write entrypoint. Scripts and CLI do not gain an additional lane or
permission to bypass target authority because those adapters are absent.
Generic set, upsert, write, arbitrary collection strings, and caller-selected database ids
are not consumer APIs. Domain transactions use the guarded Server transaction
interface.

New Entities expose the smallest complete domain-owned CRUD contract and live
reader appropriate to their authority. Active protected writers use named Server
commands when membership/access, validation or invariants must be enforced by a
trusted boundary, including ordinary single-record writes. Browser adapters keep
the current scope, capture input and credentials, and reject stale continuations;
they do not substitute for server authority. Compound operations additionally own
atomic document changes or explicit external-effect recovery. Do not require an
initial direct-browser write path or duplicate CRUD implementation before using
an evidenced trusted command. Primitive CRUD and named workflows remain distinct.

Kitchen Order numbering owns its Server target in
`fireux-kitchens/runtime/kitchen/server/orders/numbering-target.ts`, retaining the
existing `order-service` child path. Its guarded allocator/reset is in
`order-numbering.ts`; Core owns the transaction mechanism, not this counter target.
Source relocation does not convert saved counters or replay responses.

Kitchen Order lifecycle authority is checked against the acting App and Kitchen
inside `kitchen/server/orders/actions.ts`. Completion retains the saved Order
source App for its immutable Sale and financial-fact target; another authorized
App surface does not reassign revenue. The source App comes from the transaction
read, never from a caller-supplied financial owner. Customer acceptance
notifications retain that same source App. Kitchen reports aggregate their
scoped Sales across source Apps using document identity; this is separate from
granting membership, cross-database writes or live conversion.

Registered-customer Order links are User-owned records at
`users/{userId}/orders/{orderId}`. Their Server target derives the User id and
the canonical App/Kitchen Order explicitly. Guest customer details remain on
the Order and never create another Customer identity.

Server and MCP/Skill mutation targets own database placement, collection path,
allowed verbs, and access lane. Client CRUD instead consumes a domain-owned
collection path and optional runtime database id; the domain composable owns
validation, authorization intent, and relationship cascades. `(default)` contains only the bounded metadata projections
`project`, `ecosystem`, and `apps` and is never client-writable. Canonical
Project is a Workspace Entity at `fireux/projects`; its `(default)/project`
record is only the bootstrap/control-plane projection. The normal second
database is the owning `ProjectName`; it owns that Project's canonical entities
and operations. Consumers and scripts must not choose arbitrary per-operation
databases. Explicit App infrastructure `databaseId` bindings are supported by
`packages/core/fireux-core/src/config/app/fireux.config.ts` and
`packages/core/fireux-core/src/config/app/database.ts`; they preserve the
owning ecosystem identity database while selecting the App's domain database.
Each additional binding retains its own lifecycle and Rules authority; its
existence does not authorize a Rules rollout. Sproochli retains a
bounded provisional exception for `menu_translation_caches` and
`translation_memory` until its dedicated migration task. Go QR database
authority remains unresolved and must not be broadened incidentally. Demo is
source-only; Test and simulation storage are retired.

Directory publication, cross-Project signup replication, AppMeta, and their
receiver, outbox, reconciliation, provisioning, and user-monitor sources are
retired. App indexes read canonical named-database Apps through Server
endpoints. The Server path derives its scope from runtime configuration or
guarded platform targets; the browser never selects Firestore targets.

Workspace mutation targets are owner-first. Project, Kitchen, Supplier,
Portfolio, Property, and Marketplace Store own their Team, Team requests,
operations, and protected support beneath their root record. App-nested
Workspace records and `users/{uid}/private/targets` are migration sources only;
they are not additional target authorities or supported destinations.

Workspace access belongs to each domain, not AppUser. Kitchen owns one
`kitchen_access/{uid}` document with `apps[appId]` entries containing `ids` and
`membership_created_at`. Its runtime selects only the current App entry; trusted
transactional writers preserve other App entries and enforce the 50-Kitchen
limit per App. Its trusted target permits create/update only: removing one
App grant must not delete the shared index. There is no old per-App document
fallback. The production candidate validates the shared index once per cross-App
authority check and reads one index plus at most six current memberships and a Kitchen
parent, keeping this authority boundary within eight document reads.
Project, Property, Portfolio, Supplier and Blank retain
`project_access/{appId}/users`, `property_access/{appId}/users`,
`portfolio_access/{appId}/users`, `supplier_access/{appId}/users` and
`blank_access/{appId}/users` in their runtime database. Their User documents
contain `ids` and `membership_created_at`. Core's
`app/utils/membership-access.ts` validates each selected membership grant and
compares its timestamp exactly with the current AppUser's `created.at`.
Missing or superseded access grants nothing; malformed access blocks the read
or command. Leaving and rejoining cannot reactivate a previous membership's
rights. Core's `useMembershipAccess` owns the live binding; the domain supplies
its path and an optional pure entry selector, and owns authority, capacity and connection policy. Team is a separate
roster and never substitutes for this access record.

Kitchen's explicit guest creation is a bounded exception to account-owned creation:
it verifies anonymous Firebase identity, creates one unpublished Kitchen at that
uid, and stores a recovery-secret hash at `kitchens/{id}/claims/guest`. No User,
AppUser or membership access is fabricated. Adoption verifies that proof and the
current account's ordinary membership/capacity, then atomically consumes the
claim, transfers Team and grants Kitchen access. A consumed claim cannot grant
another account access or restore a revoked membership. See the Misebox context
and Kitchen's onboarding `guest.ts`/`connect-guest.ts`; this does not broaden other
domains or override the accepted development Rules boundary.

Project Landing separately supports anonymous create/resume through the FireUX
ecosystem's `project/server/index/create.ts`, exposed by its App's thin route. The verified UID fixes the canonical Project id;
the transaction creates only the root, or resumes an existing canonical nested
root whose `guest_owner_uid`, creator and owning App match. It never overwrites on retry or
creates User, AppUser, Team or membership access. FireUX ecosystem Project `components/Workspace/Home/Guest.vue`
reads that exact root live without extending account-owned access. Recovery requires
the same Firebase anonymous identity; account adoption and recovery secrets are not
implemented for Project. Signed-in creation retains its ordinary transaction below.
The focused `project-guest.test.mjs` and `project-access.test.mjs` cover this boundary.

Ordinary account-owned creation transactions read the current App, AppUser and domain access,
validate authority, count retained domain ids, and atomically create the root,
grant its id and create any initial Team record. Existing missing root records
still consume allowance. A superseded access record is replaced with the new
membership's grants; its previous ids are never merged. Creation does not
implicitly join a missing App membership. UI creation uses that same domain
count and waits for a settled access read. Core does not total unrelated domains.

Each App declares its capability-scoped subscription capacities, except the
Kitchen allowance owned by `kitchen/utils/kitchen-capacity.ts`. Core owns the
config shape and resolver, not product limits. Missing configured entries fail
closed. Team and other capability capacities remain separate policies.
Kitchen directory contribution is a separate named command: it publishes a
location-backed or name-only listing with creator attribution and no Team or
workspace access grant. FireUX Project creation remains a fixed trusted Server
command. Workspace selection is App/family-local state in `useWorkspace`;
unused account-primary fields and change workflows are retired.

The former AppUser Entity arrays and primary fields are migration sources only,
never a runtime fallback. Data migration is separate from the code cutover:
for each exact App database and User, retain preimages; validate the existing
AppUser, its `created.at`, and each id list; refuse conflicting destination
records; then copy ids with the exact membership timestamp and remove the old
fields atomically. Preserve retained ids even if a root is missing. Do not infer
grants from Team or creator attribution. Stop old writers first and verify exact
postimages and membership-revocation behaviour. No live migration is implied by
changing these contracts. The old migration tool remains retired.

The permanently rejected names are `directory-outbox`, `platform-directory`,
`registry`, every `*-simulation`, `test`, every `test-*`, every `seo_index_*`,
`handles`, `user-handles`, `user-handle-state`, and `security-migrations`.

## Current source and migration boundary

- Stable target registry barrel and static targets:
  `packages/core/fireux-core/src/runtime/utils/firestore-mutations/targets.ts`
- Target validation and dynamic Server target factories:
  `packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts`
  plus Core-owned targets in the adjacent target modules. Domain-specific
  targets live with their owning domain command; Kitchen Team invitation
  targets are the current proved example.
- Client primitives:
  `packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestore{Create,Update,Delete}.ts`.
  They accept collection paths directly and contain no target registry or
  transport selection. Domain-owned `useXCreate`, `useXUpdate`, and
  `useXDelete` composables decide when these primitives apply.
- Live read conversion belongs to the adjacent `useFirestoreRead.ts` primitive.
  VueFire receives its supported Firestore `converter`, not a `transform`
  option. Collection and document results expose the snapshot id as an
  enumerable `id`, so ordinary domain object spreads preserve record identity.
  Do not repair lost identity by storing duplicate ids in Firestore documents.
  `firestoreCollectionPage` adds a bounded live query window, with one lookahead
  record and explicit expansion. User directories and AppUser administration
  reuse it; single membership presentation uses `useAppUserRead`, never the
  administrative collection. Paging does not replace live subscriptions.
- Reference App reader and named command seams:
  `packages/core/fireux-core/src/runtime/app/composables/useAppRead.ts`,
  imported directly by consumers; sessions also reuse the owning reader.
  App identity edits use `app/composables/identity/useAppIdentityUpdate.ts`;
  App media sync uses `app/utils/sync-app-media.ts`, and
  AppUser client controls and readers live in `app/composables/membership`;
  their command transport is `app/utils/runAppUserCommand.ts`.
  `app/composables/initialization/useAppInitialization.ts` captures one
  account/App/User intent across initialization, media sync and diagnostics
  refresh; obsolete scope stops follow-on dispatch and local completion.
  `useAppEnvCheck.ts` keys client-only diagnostics by App/account, passes
  request cancellation and rejects obsolete credentials/results. Verify both
  through `src/test/app-initialization-scope.test.mjs`.
  Join review reads every required snapshot before its first transaction write.
  User private-account and avatar command functions live in `user/utils`,
  alongside canonical identity provisioning and handle transport. Profile edits
  use `user/composables/identity/useUserProfileUpdate.ts`; bootstrap uses the
  adjacent `useUserBootstrap.ts`. The complete bootstrap captures one originating
  account/App intent before credentials and stops obsolete follow-on stages,
  including account change-away-and-back and component disposal. Outside a
  component, it releases its temporary watcher. Profile handle/avatar commands
  carry their editor's current-intent predicate through credentials and upload
  preparation. Private-account provisioning also rejects obsolete credentials
  and validates the server result shape. Source-owned behavioral coverage is
  `src/test/user-workflow-scope.test.mjs`.
  Domain profile creators compose `bootstrapUser(actor)` and
  `useProfileCreate().createProfile(actor)`; Core's profile command remains
  self-only and rejects a changed signed-in account.
- Browser command intent is captured before credentials, including original
  payload, account/App/membership and the owner's actual selection or route.
  Core `useCommandScope` rejects change-away-and-back and disposal before
  dispatch. A validated committed result stays truthful after client context
  changes; the originating UI suppresses obsolete selection, navigation and
  local completion. Explicit owner predicates let shared edit controls distinguish
  a parent's temporary saving state from a revoked owner scope.
- Project App/Test, Property Reservation and Portfolio Document/Task commands
  recheck existing membership-bound authority inside the writing transaction.
  Their client results identify the exact owning record; lifecycle and external
  recovery remain domain-owned.
- Server touchpoints and guarded transactions:
  `packages/core/fireux-core/src/runtime/server/utils/firestore-mutations/`.
  Guarded collection/query reads accept an optional document-id cursor so a
  domain transaction can read all pages before writing. Page bounds and target
  placement checks remain enforced; callers own the query and traversal.
  Menu publication validates content and commits scoped status plus directory
  projection in one runtime-database transaction. See the Misebox context and
  Kitchens' `src/test/menu-publication.test.mjs` and `menu-root-publication.test.mjs`.
- Current-App trusted writers:
  `packages/core/fireux-core/src/runtime/app/server/initialization/initialize.ts`,
  `packages/core/fireux-core/src/runtime/app/server/settings/update.ts`, and
  `packages/core/fireux-core/src/runtime/app/server/media/sync.ts`
- App media single-image and bulk sync share the same development/developer
  command. Only known image kinds are caller inputs; App and bucket come from
  runtime authority. Missing owner artwork fails instead of borrowing a parent
  App's assets. A stored URL alone does not establish matching local bytes.
  Each sync uploads immutable `apps/{appId}/img/app/revisions/{uuid}/{role}`
  objects before attaching URLs. Failed or concurrent attachments cannot revoke
  another saved URL. Superseded and unattached revisions are retained; cleanup is
  not part of this command. Production presents Sync as unavailable.
- User avatar upload and attachment:
  `packages/core/fireux-core/src/runtime/user/server/avatar/update.ts`.
  This authenticated command validates image bytes, writes a unique Storage
  object, attaches it to the existing User, and attempts exact owned-file
  cleanup on attachment failure or replacement. Storage and Firestore are not
  atomic; cleanup failures are logged without undoing a successful User update.
  User creation establishes identity before optional avatar upload. Profile
  editing and onboarding reuse this command; AppUser has no separate avatar.
- FireUX platform aggregation targets and canonical Ecosystem readers:
  `projects/fireux/fireux-app/server/config/platform-directory-targets.ts` and
  `projects/fireux/fireux-app/server/utils/default-directory.ts` and
  `projects/fireux/fireux-app/server/utils/ecosystems.ts`
- Retained MCP reader: `tools/mcp-firestore/src/index.mjs` exposes collection
  and document reads only, using the configured project's default database. It
  is not a replacement for the removed mutation adapters or named-database
  migration tooling.

The former onboarding alignment, User/AppUser conformance, identity
reconciliation, Entity/index migration, Rules rendering and release tools were
removed with `scripts/`. No supported repository operational replacement is
provided for those workflows. Package templates, target declarations and runtime
commands remain source evidence; they are not substitutes for a migration or
deployment procedure.

The deleted mutation guard no longer fingerprints legacy writers or rejects new
raw writers. Review changed writers against current target definitions, trusted
commands and their consumers; do not claim a frozen inventory or fingerprint
check ran. The removal does not authorize new raw-write exceptions.

Any subsequently authorized migration must retain a read-only, exact-target plan,
a confirmation hash bound to the reviewed source and plan, protected preimages
and the relevant backup/export. Entity storage copy and retirement retain the
managed-export URI and protected local plan artifact; verify targets without
introducing a migration-marker collection. Prefer create-only changes, verify
the exact result, and keep copy and retirement under separate authorization. Retirement remains blocked until canonical targets verify
and the matching runtime is released. A missing tool is not permission to skip
those requirements or silently restore an obsolete procedure.

Kitchen sellable adoption is a named domain transaction under
`fireux-kitchens/src/runtime/kitchen/server/sellables`. It binds one exact
Menu placement to Kitchen-owned shared terms after current membership/access,
Dish and currency checks. Creation and placement binding are atomic; explicit
reuse never matches by label or price. The terms writer requires the current
revision and preserves stable variant identity. Bound placement price/options/
add-on writes and import replacement are rejected. Unbound legacy placements
remain transitional owners. The offline sellables planner is review-only and
does not authorize or implement live migration. See the Misebox context and
the sellables/menu-workspace-command tests for the exercised authority boundary.

## Ownership boundaries and verification

Core owns the path-based Client primitives plus target types, validation, and
generic Server touchpoints. MCP/Skill target authority remains defined even
though its operational write adapters are absent. Domain packages own their
domain-specific target definitions, payload validation, and lifecycle decisions while reusing
Core's target-definition API.
Security Rules remain an independent authorization boundary.

Kitchen Offering commands use their domain-owned
`kitchen/server/offerings/target.ts` with the existing guarded transaction.
Create writes one child; metadata/interaction configuration updates that exact
child after current Kitchen authority and relevant Menu checks. They never
rewrite a root array or unrelated Offering. The order commit guard separately
rechecks the complete child collection so stale configuration cannot authorize
an order. The current Offering reader shares pure interaction constraints with
command validation and refuses malformed saved policy. See the Misebox context
and Kitchen's Offering storage/command/commit-guard tests.

## Explicit open development Rules

The current eight ecosystem templates select Core's
`packages/core/fireux-core/src/config/firebase/rules/fragments/development-open.rules`.
They deliberately allow unauthenticated reads and writes to every document in
the single named database declared by each ecosystem's Firebase config.
This is an explicitly accepted development policy, not a secure or shipping
policy. There is no localhost restriction, developer UID check, schema
validation, or data privacy boundary in these Rules. Server command checks are
unchanged, but direct Firestore clients can bypass those application checks.

The ecosystem `firestore.template.rules` files own exact deployment targets;
Core owns the shared policy. The repository Rules renderer and generic release commands
are removed. Misebox Main App has App-owned release tooling that refuses upload
unless the existing named-database Rules match its reviewed production source;
it does not deploy Rules. No replacement Rules rollout command is provided.

Misebox remains in development. The user-selected policy for `misebox-78f9c` /
`misebox` is the existing development-open template, including public read/write
access to that shared live database. Real data, a production hostname, or a P0
label does not authorize production hardening. Restricted Rules rollout requires
explicit shipping authorization; never silently restore a production candidate.
Live release readback, not this policy decision, establishes what is deployed.

Misebox's separate `packages/ecosystem/fireux-misebox/src/config/firebase/firestore.production.rules`
is retained as a future shipping candidate using current App membership and
membership-bound Kitchen access. Preserve its tests and the independent App
release safeguards; a development policy decision does not authorize App upload. Rules-only rollout requires
exact backup, prerequisite verification and source readback; application release
remains separate. Its executable emulator suite is
`projects/misebox/misebox-app/test/firestore.production.test.mjs`; missing localhost
emulator configuration fails release preflight. This source does not replace the
accepted development template or migrate existing access records. Offering
children permit operator reads only; Offering mutations and raw Sellable terms
remain server-owned. Six-App authorization must also pass the required
overlapping-stale-grant access-budget regression and the deleted/malformed
earlier-grant cases, not only single-App cases. ID lists must remain string-only;
Rules joining a list alone is not a type check.
The App-owned release README documents the local proof and separate rollout boundary.
Template artifact comments
may still name removed output paths and do not prove a deployable artifact
exists. Changing source does not change deployed Rules. Every authorized
deployment must compile/test the exact source, retain fresh target evidence and
exact source confirmation, save the current release and Rules source, update only the declared named
database, then read back and compare the deployed source. Do not include default,
simulation, retired, or other App-specific databases implicitly.

Retained domain policy fragments are not the active development policy and
must not be deployed as a silent repair; the older hardened release tools are
removed. In particular, Misebox `app-support.rules` and Werkbox
`app-authority.rules` still contain the retired AppUser Entity fields. They do
not support the new domain access contract and must be replaced and tested
before a restricted policy is released. Before shipping, replace the open policy with reviewed product permissions and test
both allowed and denied client operations. Storage Rules and Authentication
configuration are separate and are not changed by this Firestore policy.

Ordinary entity update adapters use one typed command object with named
identity fields and `changes`; positional identity-plus-patch signatures are
not the public composable contract. This grammar is shared across Client and
Server transports but does not weaken their different authority. Bound-record
and specialist capability commands retain narrower domain inputs. Current
shape must be checked against the owning adapters and consumers; the former
Entity update contract guard has been removed.

For a mutation change, inspect the owning target, payload validation, trusted
command and affected consumers, then run focused package typechecks and relevant
source-owned tests. Broaden to affected App checks when a runtime contract
changes, and finish with `git diff --check`. The deleted guards provide no
verification. Never use verification to mutate remote Firestore, deploy Rules,
or provision databases.

Project Identity's active browser editor uses `useProjectUpdate` to call the
FireUX ecosystem's named `project/server/identity/update.ts` command through a thin App route. The trusted
transaction reads the current App membership, its timestamp-bound Project access,
and the canonical Project before sparse allowlisted `identity.*` updates.
Creation stores name, description, image URL and status under Identity; optional
anonymous authority and stamps remain at the root. The client captures account,
membership, App, route and caller form before credentials, validates the exact
response id/action and suppresses obsolete UI completion. Displayed create
failures are sanitized and copyable. The offline `project-identity.py` planner
targets only `projects/fireux-2005/databases/fireux`, preserves preimages and
revisions, and neither connects to Firestore nor applies/deletes records. Connected App ownership of
description/image is enforced by the ecosystem connection predicate even when
that provider is unavailable. Project implementation, canonical reads, authority and protected commands live in
the FireUX ecosystem; App-specific cross-project discovery, remote product context
and HTTP transport remain App-owned. Focused proof lives in the FireUX ecosystem's `project-identity.test.mjs`
and FireUX App's `project-identity-command.test.mjs`.
Project Team create/update/delete and role-label commands reuse
`fireux-fireux/runtime/project/server/authority.ts` to recheck App membership, timestamp-bound
Project access and Project existence inside their writing transaction. Creation
uses the current transactional subscription for Team capacity, not the preflight
copy. Team labels do not grant App membership or broaden access to existing Apps.
The App-owned `project-relationship-authority.test.mjs` proves revocation and
subscription races plus Project/App privilege separation.

Core `composables/fireux/commands/useCommandScope.ts` owns the proved client
intent watcher: component commands capture an epoch, standalone async commands
release their temporary watcher after completion. Capture original inputs before
credentials and reject obsolete account/App/Entity continuations before dispatch.
A committed server result is not rolled back by a later client context change;
UI owners suppress obsolete completion effects. Multi-command workflows also capture
one originating intent before their first await and recheck before each following
command or upload; a fresh capture inside the second command cannot establish that
the original workflow is still current. Editable draft lifecycle belongs to its
editor, not to object membership in the persisted array. No Tool/Service scaffold
is required.

Blog authoring lives under `blog/server/authoring.ts`; its exact source-App and
admin/developer membership are validated in the writing transaction. Job authoring
and hiring retain their named Job server owners, while Agent and Professional
profile implementation is User-owned. Marketplace writes use setup-owned
`useMarketplaceCommands`; its read transport remains usable inside a live reader
without creating component lifecycle hooks there. Place onboarding captures input
before credentials and stops obsolete follow-on enrichment/media writes. These
commands return exact record identity and retain validated committed results;
actual UI owners guard completion separately. Current cross-domain proof lives in
Core `src/test/other-entity-command-scope.test.mjs`, with Blog authoring tests and
owner-specific command/UI tests.

User-owned profile and notification workflows live in
`user/server/profile/update.ts` and `user/server/notifications/mark-read.ts`;
the existing HTTP routes delegate to those owners. Both retain self-only bearer
authority. Profile responses identify the acting UID; notification responses
identify both UID and notification. The notification surface follows its live
reader and suppresses obsolete completion effects rather than patching another
account's feed.

App public featured-slug curation captures its App, account, admin/membership
context and submitted values, then verifies the returned App and field. Portfolio
Identity updates accept nested `changes.identity`, capture original inputs and relevant live
account/App/membership/record/route/disposal context; results identify the exact
updated root. The server remains authoritative after client dispatch. Current
proof includes Core `foundation-command-intent.test.mjs` and
`foundation-additional-surfaces.test.mjs`, and Properties'
`portfolio-identity-scope.test.mjs`.


### Supplier, Property and Portfolio Identity

Supplier roots nest publication in `identity`, catalogue mode in `catalogue`,
and delivery areas in `delivery`; Company relationship, management and audit
stamps remain root-owned. Child records retain independent scoped identity. The
mixed root-update endpoint and generic editor are retired; no compatibility
reader or writer preserves the flat shape. The offline Supplier configuration
planner under `tools/workspace-migrations` retains preimages for the canonical
Bringli target and has no network or apply mode. Current proof is Suppliers'
`src/test/supplier-model-shape.test.mjs`.

Supplier's `supplier/server/identity/profile.ts` owns
`PATCH /api/workspace/supplier/profile`. It derives the acting App from runtime
configuration, rechecks membership-bound Supplier access and management, and
requires the currently linked canonical Company plus same-id Place before
staging a Place update in that transaction. Place's `stagePlaceUpdate` in
`place/server/identity/stage-update.ts` reuses
`place/server/identity/normalize-patch.ts` for field validation, timezone/hour
invariants and media target checks, then adds audit stamps. Normalization reuses
the Place-owned currency and timezone validators. The Place route and Supplier
command consume this same staging boundary after proving authority. A
caller-supplied Place id never establishes or changes the relationship. Supplier does not grant direct
Place-editor authority or copy Place fields onto its root.

Property's `property/server/identity/update.ts` owns
`PATCH /api/workspace/property/identity`. It allows only name, image URL, property
type and non-negative whole unit count, rechecks current Property authority and
the canonical root in the writing transaction, then updates sparse `identity.*` paths. Valuation, relationship, publication and
management fields are outside this command. New image attachments must belong
to the configured bucket and `properties/{propertyId}/images/` prefix.
Property's registered trusted onboarding command validates primitive document IDs
and nested Identity input, writes publication as draft, and supplies no valuation
defaults. Its unconsumed browser creation/manual adapter is retired; no rendered
creation entrance is currently registered. Current roots
store slug/status/publication under Identity and optional valuation separately.
The offline Property planner under `tools/workspace-migrations` preserves
preimages and flags ambiguous financial facts; it cannot apply or delete records.

Portfolio roots keep management and stamps separate from their nested Identity.
Its named Identity command permits only name, tagline, owner label, strategy
label, region label and notes; it rechecks authority and the canonical root in
the transaction, then updates sparse `identity.*` paths. Slug, status, image and
management are outside that editor. Public projections expose only the public
Identity subset and require explicit active status; private descriptive context
is never a public fallback. Both creation entrances call
`portfolio/server/index/onboarding/onboarding.ts` through `usePortfolioCreate`,
which captures account/App/membership/route and caller form intent before
credentials. Root creation and existing-root attachment keep their distinct
conflict and authority policies in that transaction; no duplicate browser root
writer remains. The offline Portfolio planner preserves exact preimages for
`projects/granite-ecosystem/databases/granite`, requires target validation and
has no network/apply/delete mode. Proof lives in Properties'
`portfolio-model-shape.test.mjs`, `portfolio-identity.test.mjs` and
`portfolio-public-identity.test.mjs`, plus Core's onboarding command-scope tests.

The Supplier and Property client adapters capture account/App/membership, route, owning Entity,
write availability and disposal before credentials. Supplier additionally binds
the linked Place. Validated committed results remain truthful; obsolete UI
completion is suppressed. Place editors may receive Supplier's explicit update
adapter through their local composition provider; that adapter changes client
transport, never trusted authority. Media uploads capture this same intent before
upload and skip obsolete attachment. New Place image/logo/wordmark/cover uploads
use unique owned revision objects, with fixed legacy URLs still readable and
accepted. Cancelled/failed unattached uploads are retained; no Storage cleanup or
live migration is implied. Current command/lifetime proof lives in Suppliers'
`src/test/supplier-identity-{profile,scope}.test.mjs`, Properties'
`src/test/property-identity{,-scope}.test.mjs` and Place's `identity-media.test.mjs`.

Shared editable fields capture their own draft/editing/value lifecycle and receive
an optional existing owner `captureIntent` predicate. The update callback may
receive a current-surface predicate for parent completion messages; it is never
mutation authority. App/User/Kitchen/Portfolio root editors and the Supplier-linked Place editor consume
this contract. A submitted command retains its truthful result while obsolete
field completion cannot close a new edit, overwrite its draft, emit an update,
or release a newer pending action. Proof lives in Core
`src/test/editable-completion-scope.test.mjs` and the named owner tests.

## Refresh and living-context maintenance

Refresh this file whenever lane ownership, target placement, allowed verbs,
transaction authority, retired names, or enforcement source changes. Check
current target definitions, runtime touchpoints, real consumers and available
source-owned tests first. Keep temporary task progress and file-by-file migration
status out of this context; no deleted guard serves as an executable inventory.
