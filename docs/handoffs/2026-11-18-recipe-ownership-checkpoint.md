# Recipe ownership return checkpoint

Date: 2026-11-18
Role: continuation handoff, not living context

Return here after the current interruption. Recipe migration has not started.

## Settled decisions

- Every Recipe has one User owner; Kitchen use does not transfer ownership.
- Kitchen explicitly adopts an approved Recipe version and accepts updates deliberately.
- Approved internal use survives owner departure or unpublishing. This does not grant source-editing or public redistribution rights.
- Preparation is a Kitchen-owned Record. Recipe output descriptions are portable embedded shapes; Kitchen owns local Preparation/input bindings.

The durable contract is [Recipe ownership and Kitchen use](../concepts/entities.md#recipe-ownership-and-kitchen-use).
Follow [migration step 4](../roadmaps/fireux-spine-migration.md#4-establish-recipes-independent-domain-contract) for the transition.

## Resume boundary

Current Recipe source remains under `packages/extensions/fireux-kitchens/src/runtime/kitchen/recipe/`, with Kitchen-bound readers and commands. The target sibling root is `runtime/recipe/` in the same owning package.

Next, design the Recipe-owned version Records and Kitchen-owned use Records against real consumers. Confirm User owners for existing Recipes explicitly; do not infer them from creator/import stamps or the containing Kitchen. Resolve portable prepared-input references and retained-use access before a data/authority cutover. Any live copy or retirement needs its own authorized plan and verification.

## Other shared work included in this save

Menu/Prep composition work includes bounded component namespaces, private presentation composables, real child summaries, and composed Menu Controls with one status filter contract. Prep Overview currently has intentionally unfinished Controls/Collection placeholders. Preserve ongoing human IDE edits; these placeholders are not a completed workflow.

Latest bounded Menu Controls acceptance reported 37 passing focused tests and desktop/mobile checks. Its native Misebox comparison retained 126 existing diagnostics with none added. These are scoped historical results, not a fresh verification of every file in this shared checkpoint.

The [Kitchen chat](codex://threads/01a1deaf-559e-73e2-98e7-0f0e695efd10) owns its ongoing Menu/Prep UI slices; Main coordinates Recipe ownership and the later Services grouping cutover. Read current source/status before resuming overlapping work. This checkpoint authorizes no further migration, data write or release.
