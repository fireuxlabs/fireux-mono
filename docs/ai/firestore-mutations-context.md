# Firestore mutation GPT context

Updated: 2026-09-12
Ref: e7c391de2
Role: living context
Scope: Firestore writes across runtime packages, projects, scripts, CLI, Codex skills, and MCP

## Inheritance and purpose

This context inherits the root `AGENTS.md` and `docs/ai/gpt-context.md`. It owns
the durable mutation authority boundary; entity models, Security Rules, and
read projections retain their existing owners.

The top-level relationship and client entrances are mapped in
`docs/concepts/core-models.md`. Root CRUD changes one root document only.
AppUser CRUD changes one `apps/{appId}/users/{userId}` relationship only.
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
`ecosystems/{ecosystemId}/apps/{appId}` locator in the identity database. Client App Update rejects `ecosystem_id`; App creation uses trusted Project creation or runtime
initialization, which establishes the required relationship. Relationship
movement is never hidden inside root CRUD. The historical Ecosystem locator
repair script has been removed; there is no supported repository repair command.

App is an explicit exception to primitive client creation: `useApp` exposes
Read, Update and Delete; trusted Project creation and `initializeConfiguredApp` own creation with
its required relationships. No primitive App Create may write an incomplete
root. Other normal entity façades expose four client CRUD operations: Read,
Create, Update, and Delete. Delete removes exactly one selected document. It
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

New Entities begin with the smallest complete Client CRUD and a live Firestore
reader. UI usage proves whether a later business operation needs atomic
multi-document changes, cross-database authority, secrets, external effects,
or a cascade. Only that proved operation moves to a named Server command; the
Server command does not replace or obscure the Entity's basic CRUD seam,
except where required creation invariants prove a domain exception such as App.

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
and operations. Apps, consumers, and scripts do not select additional databases. Sproochli retains a
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

Workspace access belongs to each domain, not AppUser. Kitchen, Project,
Property, Portfolio, Supplier and Blank own the explicit collections
`kitchen_access/{appId}/users`, `project_access/{appId}/users`,
`property_access/{appId}/users`, `portfolio_access/{appId}/users`,
`supplier_access/{appId}/users` and `blank_access/{appId}/users` in their runtime
database. Each User document contains `ids` and `membership_created_at`.
Core's `app/utils/membership-access.ts` validates this shared stored shape and
compares the timestamp exactly with the current AppUser's `created.at`.
Missing or superseded access grants nothing; malformed access blocks the read
or command. Leaving and rejoining cannot reactivate a previous membership's
rights. Core's `useMembershipAccess` owns the live binding; the domain supplies
its path and owns authority, capacity and connection policy. Team is a separate
roster and never substitutes for this access record.

Trusted creation transactions read the current App, AppUser and domain access,
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
- Reference App CRUD seam:
  `packages/core/fireux-core/src/runtime/app/composables/useApp{Read,Update,Delete}.ts`,
  composed by the adjacent `useApp.ts`; sessions also reuse the owning reader.
  Settings use `useAppSettings.ts`;
  App media sync uses `app/composables/firestore/utils/appMediaSync.ts`, and
  AppUser commands remain separate in `runAppUserCommand.ts`.
  Join review reads every required snapshot before its first transaction write.
  Account provisioning checks its captured account after asynchronous stages;
  bootstrap, membership commands and composed profile creation retain the
  intended authenticated actor. Domain profile creators compose
  `bootstrapUser(actor)` and `useProfileCreate().createProfile(actor)`; Core's
  profile command remains self-only and rejects a changed signed-in account.
- Server touchpoints and guarded transactions:
  `packages/core/fireux-core/src/runtime/server/utils/firestore-mutations/`
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
- FireUX platform aggregation targets and direct metadata reader:
  `projects/fireux/fireux-app/server/config/platform-directory-targets.ts` and
  `projects/fireux/fireux-app/server/utils/default-directory.ts`
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

## Ownership boundaries and verification

Core owns the path-based Client primitives plus target types, validation, and
generic Server touchpoints. MCP/Skill target authority remains defined even
though its operational write adapters are absent. Domain packages own their
domain-specific target definitions, payload validation, and lifecycle decisions while reusing
Core's target-definition API.
Security Rules remain an independent authorization boundary.

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
Core owns the shared policy. The repository Rules renderer and release commands
are removed; no supported replacement is provided. Template artifact comments
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

## Refresh and living-context maintenance

Refresh this file whenever lane ownership, target placement, allowed verbs,
transaction authority, retired names, or enforcement source changes. Check
current target definitions, runtime touchpoints, real consumers and available
source-owned tests first. Keep temporary task progress and file-by-file migration
status out of this context; no deleted guard serves as an executable inventory.
