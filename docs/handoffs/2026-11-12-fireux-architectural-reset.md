# FireUX architectural reset — Codex handoff

Date: 2026-11-12
Status: discussion handoff; proposals require source verification before implementation.
Scope: fireux-mono, starting with Core App.

## Objective
Simplify the architecture and remove unjustified abstractions accumulated through AI-assisted development. Historical consumers are evidence, not authority. Do not automatically restore a removed property merely because a consumer expects it. Rebuild only independently justified capabilities. Git history, persisted production data, and security boundaries remain protected.

## Agreed working vocabulary
- Entity: a deliberately recognised architectural owner with a named directory in its package's spine, and an entity model defining its shape. Entity is an architectural classification, not a TypeScript superclass.
- Model: FireUX convention reserves `models/` for genuine entity shapes. Each entity owns its model; its parent does not own the child's model.
- Type: a value shape, preferably native/inferred or local to its owning feature; promote to shared only for genuinely shared meaning.
- Contract: an agreement across an independently maintained boundary (inputs, outputs, permissions, behaviour). Own it at the responsible boundary; a function argument alone is not grounds for a new contract file.
- Utility: executable helper with a distinct, justified responsibility. Keep it near its owner.

Core provides foundational mechanisms and owns Core entities such as App and User; it must not import models from extension-specific entities. Each package owns its own entity directory. App is the highest-order functional entity in this discussion, not a claim that Core or organisational wrappers are entities above it. Distinguish the FireUX App entity directory from Nuxt's reserved `app/` conventions.

## Generic Core models directory
Target: retain the package-wide `models/` directory with a README explaining that it is intentionally empty of TS model files. Do not silently put new models there. When a model seems necessary, ask whether it is a genuine new entity with its own owner. Otherwise classify it as a local type, contract, utility, or other feature-owned implementation. If unclear, raise the architectural decision.

Do not mark the directory empty until its actual files have been reviewed and moved or removed. Mirror the rule in existing AGENTS.md routing and the relevant spine map, without creating a competing canon.

## App as first audit slice
Current App model directly declares ecosystem_id, role, status, name, short_name, tagline, description, social_links, and media. It intersects with FireuxEntity for id, context, created and updated. Consider making the App model self-contained and retiring FireuxEntity, but verify actual ownership and persistence requirements first. Shared timestamps are a separate question, not a mandate to remove them.

Files observed under Core App models include app.model.ts, app-user.model.ts, conversation.model.ts, app-membership.ts, app-initialization.ts, app-environment-check.ts, app-media-requirements.ts, and others. Several contain operational results, storage descriptors, or asset configuration rather than entity definitions. Core-wide models/utils contains entity-create.model.ts, which is a create result, not an entity.

Review AppUser and Conversation for genuine entity identity/lifecycle before classification. Do not infer that all files in an entity directory are themselves models.

## Cleanup method
1. Read AGENTS.md, docs/ai/gpt-context.md, docs/concepts/fireux-mono.md, docs/concepts/spine.md, and applicable maps. Inspect source, tests, consumers and git status before edits.
2. Map App-owned model definitions, types, contracts, utilities, and the actual App creation/read/use path.
3. For every questionable file or property, ask: who owns this fact, is it distinct, is it required by actual product behaviour, is it already available elsewhere, can it be inferred or derived?
4. Remove or consolidate unjustified representations. A consumer breaking is a prompt to reassess, not proof that the old abstraction was correct. Avoid broad commented-out dead code; remove deliberately obsolete code in reviewable commits.
5. Keep production security and data intact. Verify authentication, authorization, writes, and critical nonvisual behaviour in addition to the visible UI.
6. Report removed files, simplified responsibilities, deferred functionality, failed checks, and decisions requiring human authority.
7. Apply the same discipline one entity/family at a time, not via a monorepo-wide blind deletion.

## Important distinction
The minimum information to create an App may be much smaller than the minimum needed to operate every capability. ID-only progressive onboarding is an exploratory idea, not an approved schema migration. Do not add readiness flags preemptively; derive state where possible.

## Stop signals
- Creating a new abstraction merely to organise old abstractions.
- Treating current consumers as architectural requirements.
- Putting a non-entity type or runtime configuration into models/.
- Duplicating the same fact under reversed readiness flags.
- Moving a domain model into Core for convenience.
- Creating a new generic type/contract/utils dumping ground.

## Deliverable
Begin with an audit and a small, source-backed App cleanup proposal. Distinguish decisions made in this handoff from findings requiring verification. Do not implement an irreversible migration without explicit approval.
