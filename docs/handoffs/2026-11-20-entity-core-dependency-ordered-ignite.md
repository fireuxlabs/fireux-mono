# FireUX — Entity Core First & Dependency-Ordered Ignite

**Date:** 2026-11-20  
**Status:** Codex architecture and bounded implementation-planning handoff; not evidence that the flow has been implemented.  
**Repository:** `fireuxlabs/fireux-mono`  
**Suggested task:** `fireux-ignite — plan dependency-ordered implementation from assembly`  
**Primary owner:** `packages/extensions/fireux-ignite`  
**Reference consumer:** `projects/fireux/fireux-app/app/pages/workspace/project/ignition-reconciliation.vue`  
**First domain proof:** Kitchen in `fireux-kitchens`, consumed by Misebox.

## Decision: build in the order the real business can come into existence

FireUX should model **real-world entities, responsibilities and dependencies**, then extend them with software capabilities. The architecture must not start at a downstream feature and force the prerequisites to conform to it.

The agreed planning sequence is:

1. **Pre-Workspace Entity / prerequisites** — establish any domain-specific thing needed to create the target Entity. For Kitchen, a Place can provide location and venue identity. This is **not** a universal Place or Google Places requirement: current Workspace family guidance also describes name-only Kitchen creation and unrelated Workspace Entity types that do not need a Place.
2. **Workspace Entity Core** — create, read, edit and independently manage the domain Entity itself (Kitchen, Property, Portfolio, Project, etc.), including its canonical model, lifecycle, authorized commands and storage. `Entity Core` is a *design/verification slice*, **not** a second model or framework wrapper.
3. **Workspace** — provide the Core-owned selectable management surface for that Entity: accessible collection, selection, shared frame, navigation and access-aware composition. **Workspace is not another persisted Entity.** The domain retains its model, readers, access decisions and commands.
4. **Capability flows** — build and prove the smallest useful operational journeys one at a time, ordered by real dependencies. Optional capabilities can attach later rather than being woven into the Entity Core.

A feature may only be treated as ready to build when its prerequisites are identified. Dependency ordering must be paired with human business priority and a verifiable exit condition; a graph alone cannot decide commercial priority.

## Clarification from the Stable example — structure is not build order

The 2026-11-19 [Workspace Spine & Firestore Canon Alignment](workspace-spine-firestore-canon-alignment.md) used a **hypothetical horse Stable** to illustrate predictable navigation, source-file/composable placement and Firestore paths. Its list of Overview, Identity, Horses, Health, Stalls, Feeding, Staff, Bookings and Invoices is a **structural catalogue**, **not a justified construction sequence**. Do not turn that table's row order or folder nesting into an implementation plan.

**Ignite must show two separate views of the same domain:**
- **Structural map:** UI navigation → route → component/composable → owned source/Firestore path; identifies ownership and namespace consistency. It describes *where something belongs*.
- **Dependency-ordered delivery plan:** real-world prerequisite → minimal independently useful Entity Core → selectable Workspace → smallest verified capability journeys; explicit hard dependencies, optional capabilities, operator priority and acceptance evidence. It determines *what can be built next*, not where a file happens to sit.

**Illustrative Stable reasoning, not an approved App or a researched industry plan:** an empty Stable and its basic management view should be possible without Horse, Stall or Feeding features. Horse records and Stall records might be separate independently buildable capabilities; assigning a Horse to a Stall needs both. A per-Horse health record needs an existing Horse; a Feeding Plan might need a Horse, but need not depend on Stalls. These are hypotheses to validate against actual operator needs, not universal mandatory gates. Several capabilities may be simultaneously unblocked; an operator's business priorities then decide which to build first.

**Codex / Ignite completion check:** Given a Stable-shaped example alongside the Kitchen example, the plan must **not** treat the proposed navigation order as a delivery order. Report all currently buildable slices, their declared `uses` dependencies, the evidence missing for genuine readiness, and why a downstream feature is blocked. Do not invent hard dependency edges to make a neat linear roadmap. Trace the simplest real Kitchen sequence separately: independently usable Kitchen → Items → draft Menu → public Menu → configured Services → Orders, while treating suppliers, stock, recipes, costs and Team as branches attached at their actual dependency points. Keep domain-specific assumptions out of Core.

**Execution boundary:** This clarification enriches the existing bounded Ignite planning assignment. It does **not** authorize starting Kitchen implementation, building a Stable App, a monorepo-wide cleanup, automatic code generation, live Firestore changes or deployment. Current FireUX Core/User/membership/optional Workspace reset remains the upstream implementation gate.

## First proof: Kitchen Core, not Ordering

The Kitchen should be a viable domain Entity with **zero Items, Menus or Orders**. Begin with the bounded journey:

**Create or select the supported prerequisite → create Kitchen → see/select Kitchen → read Kitchen → edit Kitchen.**

For the proposed minimal Kitchen Core, inspect and settle only responsibilities genuinely owned by Kitchen:
- Identity/linkage and lifecycle (including creation, status and visibility where these already exist).
- Minimal operational settings actually needed for the Kitchen, if owned by Kitchen.
- Canonical audit metadata and explicit, authorized read/write paths.
- Distinct loading, empty, denied and missing-Entity outcomes.

**Do not invent a new Kitchen schema from this list.** Inspect the existing model and commands. Place already owns venue identity/media in the current Place–Kitchen source mapping; the Kitchen must not copy the Place's logo, address or name just because they are displayed in Workspace. The existing Place–Kitchen mapping uses the same ID where linked. Current family guidance also acknowledges name-only Kitchen roots; reconcile the actual supported creation variants before imposing a hard dependency.

In particular, the older Place–Kitchen media map and newer Workspace Entity family map disagree about the ownership of operational default currency. The newer shared rule places operational currency on the selected Workspace Entity, while the older map documents Place-owned data and existing Kitchen consumers still reading Place currency. **Treat this as an explicit source reconciliation gap, not permission to change stored amounts or quietly duplicate currency.**

Kitchen's existing Team, access and onboarding paths require inspection, but are not reasons to make Team setup a prerequisite for the small Core journey or to remove existing authority. Keep the domain's membership-bound access and trusted commands.

## Example capability delivery sequence

**Kitchen → Items → Menus → Public Menu → Services → Orders** is a starting business journey, not a universal static scaffold. Each step must name its exact source dependencies and usable exit test.

- Items: define what the Kitchen offers; an Item is presently a **Kitchen-owned Record**, not a new independent Entity.
- Menus: assemble those Items into a usable offering.
- Public Menu: verify that a customer can see the offering under actual publication/visibility policy.
- Services: decide how the offering may be sold or served, such as collection or table ordering.
- Orders: consume the established menu and service contracts; do not dictate their upstream data model.

Other capabilities such as Prep/Recipes, Suppliers, Stock, Costing, Finance, and Team/Training can be placed at their **actual** dependency point. Some kitchens may need them before opening, others may add them later. Distinguish a product launch prerequisite from a technically optional operational enhancement. Do not mark Orders complete solely because its source files exist; prove the full user journey.

**Architectural rule:** no downstream capability may dictate an upstream Entity's ownership, storage or lifecycle merely to make the downstream feature work.

## What current Ignite source does, and what is missing

Reviewed on `main` at handoff time:

- `packages/extensions/fireux-ignite/src/runtime/utils/ignition-method.ts` defines an evidence-led method from brief/research/search strategy through assembly, comparison, delivery, infrastructure, build, task, verification and reconciliation. It does **not** currently have an explicit dependency-ordered implementation-plan stage.
- `packages/extensions/fireux-ignite/src/runtime/models/ignition.ts` includes `IgnitionAssembly.elements[].uses` references and source/evidence contracts.
- `packages/extensions/fireux-ignite/src/runtime/utils/reconcile-ignition.ts` validates named dependencies and rejects unknown or circular assembly references. It is a structural comparison, **not** a build scheduler, readiness gate or code generator.
- `packages/extensions/fireux-ignite/docs/ai/ignite-context.md` explicitly separates declaration, source review, passing checks and independently proved journeys.

### Codex task: design and prove the smallest scheduling extension

1. Read `AGENTS.md`, `docs/ai/gpt-context.md`, `docs/concepts/spine.md`, `docs/concepts/entities.md`, `docs/concepts/workspace.md`, `docs/concepts/family-workspace-entity.md`, Ignite context, Kitchen and Misebox owning context, and the actual current consumers/tests. Inspect real source before changing contracts.
2. Audit the **Entity Core → Workspace** journey in Kitchen and one independent Workspace family member. Separate shared fundamentals from Kitchen-specific Place, data and authority rules. Report confirmed behavior, design gaps and accepted deltas. Do not generalize a Kitchen-specific model into Core.
3. Introduce a small **dependency-ordered delivery plan** in Ignite's existing method, positioned after assembly/review and before bounded implementation. Reuse `elements[].uses` for explicit dependency edges; do not add another graph engine, duplicate registry, or orchestration layer.
4. For each planned slice, make the output understandable to an operator: **responsibility; prerequisites; owner; minimal user journey; acceptance evidence; essential/optional classification; blocked/unblocked status; next buildable slice**. Do not infer unrecorded dependencies silently. Highlight unresolved decisions for review.
5. Use deterministic topological ordering for declared hard prerequisites; report independently buildable slices without inventing a rigid universal order. A valid dependency graph does not mean a downstream slice is ready if the required user journey has not been verified. Keep evidence levels distinct.
6. Apply that method to the Kitchen example. Explicitly show Orders as downstream of a proved, orderable Menu and configured Service. Show Stock, Team, Costing and Prep as separate capabilities whose scheduling depends on real readiness needs, not a compulsory global staircase.
7. Add focused checks for missing/circular dependencies, stable ordering, independent enhancements, honest blockers, incomplete acceptance evidence and the Kitchen case. Verify actual Ignite consumer output as well as utility tests. Record the smallest source-backed design and any remaining blocker in the owning docs.

## Acceptance criteria

Codex can produce an operator-readable development plan demonstrating:

- What must exist **before** an Entity can be created, where applicable.
- What the **Entity Core** owns, and what the shared **Workspace** owns, without inventing a stored Workspace Entity.
- Why the first basic Kitchen journey works without Items, Menus or Orders.
- Which capability is genuinely next, the facts blocking it, and what would count as a completed journey.
- Why Orders cannot become the first implementation just because its UI or data model has been drafted.
- That a second, non-Kitchen Workspace Entity can follow the same planning **method** without inheriting Place or restaurant-specific contracts.
- No duplicate readers, mutation authority, mandatory directory symmetry or generated folder trees are introduced to achieve the plan.

## Boundaries and non-goals

This is **not** authorization to delete Ordering source, migrate or delete Firestore data, change Rules, deploy, force Google Places registration, invent new root Entity types, or implement the whole sequence at once. The operator is open to removing obsolete Ordering code after a bounded, source-backed removal scope is agreed, rather than protecting chaotic wiring indefinitely. Git history is available for source recovery; live data and access boundaries still require explicit care.

Keep progress incremental: **inspect → choose one slice → build → verify → only then extend**. Prefer one understandable reference implementation over a network of abstractions designed for hypothetical future capabilities.

## Reference anchors

- [Item Detail and Capability Relationships](2026-11-20-item-detail-capability-relationships.md) — small Item Detail and smart capability principles.
- [Workspace Entity family](../../docs/concepts/family-workspace-entity.md) — current cross-domain composition and accepted differences.
- [Entities](../../docs/concepts/entities.md) — Entity versus parent-owned Record.
- [Workspace](../../docs/concepts/workspace.md) — shared management surface, not stored Workspace Entity.
- [Ignite context](../../packages/extensions/fireux-ignite/docs/ai/ignite-context.md) — shared implementation method and evidence limitations.
- [Place and Kitchen media](../../docs/concepts/place-kitchen-media.md) — ownership mapping that must be reconciled with newer currency guidance.

**Handoff only:** no app code, Firestore data or deployed behavior changed by writing this document.
