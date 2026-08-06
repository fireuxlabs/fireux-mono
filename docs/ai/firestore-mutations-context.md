# Firestore mutation GPT context

Updated: 2026-08-05
Ref: 1fca9417e
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

Typed mutation targets own database placement, collection path, allowed verbs,
and access lane. `(default)` contains only the bounded metadata projections
`project`, `ecosystem`, and `apps` and is never client-writable. Canonical
Project is a Console Entity at `fireux/projects`; its `(default)/project`
record is only the bootstrap/control-plane projection. The normal second
database is the owning `ProjectName`; it owns that Project's canonical entities
and operations. Apps, consumers, and scripts do not select additional databases. Sproochli retains a
bounded provisional exception for `menu_translation_caches` and
`translation_memory` until its dedicated migration task. Go QR database
authority remains unresolved and must not be broadened incidentally. Demo is
source-only; Test and simulation storage are retired.

Directory publication, cross-Project signup replication, and their receiver,
outbox, reconciliation, provisioning, and user-monitor source are retired.
Public App and Ecosystem directory presentation reads the canonical `(default)`
records directly; it is not a separate database authority.

The permanently rejected names are `directory-outbox`, `platform-directory`,
`registry`, every `*-simulation`, `test`, every `test-*`, every `seo_index_*`,
`handles`, `user-handles`, `user-handle-state`, and `security-migrations`.

## Current source and migration boundary

- Stable target registry barrel and static targets:
  `packages/core/fireux-core/src/runtime/utils/firestore-mutations/targets.ts`
- Target validation and dynamic Server target factories:
  `packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts`
  and `server-targets.ts` in the same directory
- Client touchpoints:
  `packages/core/fireux-core/src/runtime/composables/fireux/firestore/mutations/useClient{Create,Update,Delete}.ts`
- Server touchpoints and guarded transactions:
  `packages/core/fireux-core/src/runtime/server/utils/firestore-mutations/`
- MCP/Skill touchpoints:
  `scripts/_lib/firestore-mutations/mcp-skill-{create,update,delete}.mjs`
- Executable enforcement and the frozen pre-spine debt inventory:
  `scripts/guards/firestore-mutations.mjs`

The enforcement guard fingerprints the exact legacy writer set. A migration
removes entries from that set and deliberately refreshes the reviewed
fingerprint; a new raw writer fails. The fingerprint is temporary migration
scaffolding, not an approved fourth API or precedent for new exceptions.

## Ownership boundaries and verification

Core owns target types, validation, and Client/Server touchpoints. Operational
tooling owns MCP/Skill adapters but consumes the same target objects. Domain
packages own payload validation and lifecycle decisions, not placement.
Security Rules remain an independent authorization boundary.

During migration, run the mutation guard after each slice, then focused package
typechecks. Before handoff run full `pnpm typecheck` and `pnpm guard`. Never use
verification to mutate remote Firestore, deploy Rules, or provision databases.

## Refresh and living-context maintenance

Refresh this file whenever lane ownership, target placement, allowed verbs,
transaction authority, retired names, or enforcement source changes. Check
current source and `scripts/guards/firestore-mutations.mjs` first. Keep temporary
task progress and file-by-file migration status out of this context; the guard
is the executable inventory.
