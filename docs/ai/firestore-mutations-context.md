# Firestore mutation GPT context

Updated: 2026-08-21
Ref: d1a7d5eec
Role: living context
Scope: Firestore writes across runtime packages, projects, scripts, CLI, Codex skills, and MCP

## Inheritance and purpose

This context inherits the root `AGENTS.md` and `docs/ai/gpt-context.md`. It owns
the durable mutation authority boundary; entity models, Security Rules, and
read projections retain their existing owners.

## Authority

Firestore has exactly three mutation lanes: Client, Server, and MCP/Skill. Each
lane exposes only Create, Update, and Delete. Scripts and CLI invoke MCP/Skill;
they never become additional lanes. Generic set,
upsert, write, arbitrary collection strings, and caller-selected database ids
are not consumer APIs. Domain transactions use the guarded Server transaction
interface.

Registered-customer Order links are User-owned records at
`users/{userId}/orders/{orderId}`. Their Server target derives the User id and
the canonical App/Kitchen Order explicitly. Guest customer details remain on
the Order and never create another Customer identity.

Typed mutation targets own database placement, collection path, allowed verbs,
and access lane. `(default)` contains only the bounded metadata projections
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
- Client touchpoints:
  `packages/core/fireux-core/src/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate.ts`
  and the remaining Update/Delete migration touchpoints in that directory
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
  and reports exact User identity and AppUser membership shape. The guarded
  `scripts/migrate-user-app-user-canon.mjs` owns the backup-first cutover to
  independent AppUser `role` and `subscription`, including deletion of the
  retired premium boolean and exact post-write verification.
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

Core owns target types, validation, generic Client/Server touchpoints, and
targets for Core-owned records. Operational tooling owns MCP/Skill adapters
but consumes the same target objects. Domain packages own their domain-specific
target definitions, payload validation, and lifecycle decisions while reusing
Core's target-definition API.
Security Rules remain an independent authorization boundary.

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
