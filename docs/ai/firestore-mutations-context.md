# Firestore mutation GPT context

Updated: 2026-09-05
Ref: 3426543f2
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
membership or replaces an AppUser authorization check. Historical repair uses
`scripts/reconcile-user-app-references.mjs`, which is read-only unless passed
`--apply` for one registered App.

`App.ecosystem_id` is the App–Ecosystem relationship authority. Trusted App
initialization idempotently reconciles a minimal
`ecosystems/{ecosystemId}/apps/{appId}` locator in the identity database. Basic
client App Create and Update reject `ecosystem_id`; relationship creation or
movement is never hidden inside root CRUD. Historical locator repair uses the
dry-run-by-default `scripts/reconcile-ecosystem-app-references.mjs`.

Normal entity façades expose the four client CRUD operations directly: Read,
Create, Update, and Delete. Delete removes exactly one selected document. It
does not archive, cascade, reconcile relationships, or delete authentication.
Any future relationship-aware removal is a separately named entity operation;
it must not replace Delete or be hidden inside a primitive.

## Authority

Firestore has exactly three mutation lanes: Client, Server, and MCP/Skill. Each
lane exposes only Create, Update, and Delete. Scripts and CLI invoke MCP/Skill;
they never become additional lanes. Generic set,
upsert, write, arbitrary collection strings, and caller-selected database ids
are not consumer APIs. Domain transactions use the guarded Server transaction
interface.

New Entities begin with the smallest complete Client CRUD and a live Firestore
reader. UI usage proves whether a later business operation needs atomic
multi-document changes, cross-database authority, secrets, external effects,
or a cascade. Only that proved operation moves to a named Server command; the
Server command does not replace or obscure the Entity's basic CRUD seam.

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

Workspace creation capacity is derived from the current AppUser's explicit
Entity-id array, never from Team discovery or a client count. The AppUser model
reserves a named plural id array and singular primary field for Kitchen,
Project, Property, Portfolio, Supplier, and Blank. Kitchen, Project, Property, Portfolio, Supplier and Blank use this trusted
runtime pattern for Team entry and creation. Primary-selection workflows remain
separately verified; a Team cutover does not prove those workflows complete. A
trusted creation transaction updates the relevant User fields atomically with
the Entity root. It may also create the initial Team record for the separate
Team surface, but Team is not the Workspace index authority. Kitchen directory
contribution is a separate named command: it publishes a new location-backed or name-only
listing with creator attribution and no Team or AppUser association.
Each App declares its capability-scoped subscription capacities, except the
Kitchen association allowance owned by `kitchen/utils/kitchen-capacity.ts` in
`fireux-kitchens`. That allowance counts My Kitchens associations and preserves
retained ids; directory contribution does not consume it. Core owns only
the config shape and resolver; it owns no product limits. The relevant
Workspace capability composable and trusted Server command resolve the same App
entry, such as `kitchen`, `kitchen.team`, `project`, or `project.team`. Missing
entries fail closed. Team and local Test capacities remain separate capability
policies and do not make their mutation authorities interchangeable.
The persisted relationship pair is optional until that Entity family establishes
a relationship; when present, the plural array and singular primary field must
appear and validate together. The bounded current-App projection normalizes an
absent pair to an empty array and empty primary id for consumers.
FireUX Project creation is a named `fireux` Server command; ordinary
clients call its fixed endpoint and never receive a Project Firestore writer.
Kitchen and Project primary selection updates the AppUser field directly for
Business. Free and Professional users with several retained ids submit a
trusted administrator-notified request instead; client-only selection is never
presented as a persisted primary change.
The protected `scripts/migrate-app-user-workspace-index.mjs` command performs
the one-time, preimage-backed legacy-source-to-AppUser index migration; runtime
readers must not retain the retired source as a fallback after that cutover.

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
- Reference App CRUD seam:
  `packages/core/fireux-core/src/runtime/app/composables/useApp{Create,Read,Update,Delete}.ts`,
  composed only by the adjacent `useApp.ts`. Later settings, media, and
  settings use `useAppSettings.ts`, media uses `useAppMedia.ts`, and AppUser
  commands remain separate in `runAppUserCommand.ts`.
- Server touchpoints and guarded transactions:
  `packages/core/fireux-core/src/runtime/server/utils/firestore-mutations/`
- Current-App trusted writers:
  `packages/core/fireux-core/src/runtime/app/server/initialization/initialize.ts`,
  `packages/core/fireux-core/src/runtime/app/server/settings/update.ts`, and
  `packages/core/fireux-core/src/runtime/app/server/media/sync.ts`
- FireUX platform aggregation targets and direct metadata reader:
  `projects/fireux/fireux-app/server/config/platform-directory-targets.ts` and
  `projects/fireux/fireux-app/server/utils/default-directory.ts`
- MCP/Skill touchpoints:
  `scripts/_lib/firestore-mutations/mcp-skill-{create,update,delete}.mjs`
- Auditable onboarding projection alignment:
  `scripts/align-user-app-onboarding.mjs`; its `project` family aligns existing
  canonical Projects with their local ProjectMeta records through a dry-run
  plan, confirmation hash, protected pre-image, and post-write verification.
- Canonical User and AppUser conformance:
  `scripts/audit-user-app-user-canon.mjs` reads every registered App database
  and reports exact User identity, required AppUser governance, optional
  Entity-relationship pairs, and unknown fields. The guarded
  `scripts/migrate-user-app-user-canon.mjs` owns the backup-first cutover to
  independent AppUser `role` and `subscription`, including deletion of the
  retired premium boolean and exact post-write verification.
- Bounded Misebox User identity reconciliation:
  `scripts/apply-misebox-user-identity-reconciliation.mjs` consumes the exact
  plan produced by its sibling planner and remains part of the User/AppUser
  family rather than general product tooling.
- Entity storage cutover:
  `scripts/migrate-firestore-entity-canon.mjs` plans the root Workspace,
  User-owned Profile, Marketplace Store, and legacy FireUX Product moves one
  ecosystem at a time. Copy and retirement are separate confirmed phases and
  both require the retained managed-export URI plus a protected local plan
  artifact. Its protected read-only evidence binds a current zero-copy plan to
  the retained export without creating a migration-marker collection.
  Retirement is disabled until every canonical target verifies and the
  matching runtime has been released.
- Small-ecosystem Rules release:
  `scripts/deploy-workspace-firestore-rules.mjs` compiles and compares the
  FireUX, Granite, and BuenoHost named-database Rules. Promotion accepts only
  fresh Entity evidence, exact source confirmation, and a protected release
  preimage. Misebox and Werkbox retain their ecosystem-specific adversarial
  release tools.
- Executable enforcement and the frozen pre-spine debt inventory:
  `scripts/guards/firestore-mutations.mjs`

The enforcement guard fingerprints the exact legacy writer set. A migration
removes entries from that set and deliberately refreshes the reviewed
fingerprint; a new raw writer fails. The fingerprint is temporary migration
scaffolding, not an approved fourth API or precedent for new exceptions.

## Ownership boundaries and verification

Core owns the path-based Client primitives plus target types, validation, and
generic Server touchpoints. Operational tooling owns MCP/Skill adapters
but consumes the same target objects. Domain packages own their domain-specific
target definitions, payload validation, and lifecycle decisions while reusing
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
Core owns the shared policy. Render with `node scripts/render-firestore-rules.mjs
--write` and check with `--check`. Rendering is local only: changing source does
not change deployed Rules. Every deployment must compile/test the exact source,
save the current release and Rules source, update only the declared named
database, then read back and compare the deployed source. Do not include default,
simulation, retired, or other App-specific databases implicitly.

Retained domain policy fragments and older hardened release tools are not the
active development policy and must not be deployed as a silent repair. Before
shipping, replace the open policy with reviewed product permissions and test
both allowed and denied client operations. Storage Rules and Authentication
configuration are separate and are not changed by this Firestore policy.

Ordinary entity update adapters use one typed command object with named
identity fields and `changes`; positional identity-plus-patch signatures are
not the public composable contract. This grammar is shared across Client and
Server transports but does not weaken their different authority. Bound-record
and specialist capability commands retain narrower domain inputs. Current
shape enforcement lives in `scripts/guards/entity-update-contract.mjs`.

During migration, run the mutation guard after each slice, then focused package
typechecks. Before handoff run full `pnpm typecheck` and `pnpm guard`. Never use
verification to mutate remote Firestore, deploy Rules, or provision databases.

## Refresh and living-context maintenance

Refresh this file whenever lane ownership, target placement, allowed verbs,
transaction authority, retired names, or enforcement source changes. Check
current source and `scripts/guards/firestore-mutations.mjs` first. Keep temporary
task progress and file-by-file migration status out of this context; the guard
is the executable inventory.
