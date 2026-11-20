# FireUX — Entity Core and dependency-ordered Ignite delivery

**Date:** 2026-11-20  
**Status:** Codex architecture handoff / proposed bounded implementation plan; **not an implementation or data-migration authorization**.  
**Repository:** `fireuxlabs/fireux-mono`

## Decision

**Model the real-world business first; extend it with software capabilities. Build in the order dependencies become usable, rather than building the whole ecosystem simultaneously.**

The repeating development pattern is:

1. **Pre-Workspace Entity / prerequisites** — What must be known, selected, linked or created to establish the real-world thing? These are *domain-specific* and can be optional.
2. **Workspace Entity Core** — What is the smallest independently valid Entity root? Prove identity, lifecycle, canonical model, exact read, guarded create/update and access without downstream capabilities.
3. **Workspace** — Provide the shared operator surface over that Entity: entry, selection, navigation, detail, settings and authorized controls, reusing Core mechanics. Workspace is **not another stored Entity**.
4. **Capability flows** — Attach one independently useful operational slice at a time, ordered by actual dependencies and explicit readiness evidence.

**A domain Entity defines the thing. Workspace manages the thing. Capabilities extend what the thing can do.** Real-world relationships and responsibilities are the architectural north star, not an excuse to duplicate every physical process or organisation chart in code.

## Why this handoff exists

Building complex ordering early entangled upstream Kitchen, Item and Menu work with downstream Orders. Repairing that coupling became harder because existing, complicated consumers were treated as reasons not to simplify the foundations. The new rule is:

> Nothing downstream should dictate an upstream Entity's core model, ownership or implementation.

Rebuild a reliable reference slice rather than perpetuating compatibility layers. Existing Orders code **may be proposed for scoped removal or disconnection** after inspecting consumers; do not delete operational data or shared infrastructure, and do not execute a wholesale deletion under this planning handoff. Git history preserves source, not necessarily private data, so protect persisted records explicitly.

## Kitchen is the first proof, not a universal kitchen-shaped schema

### A. Pre-Workspace: Place / identity acquisition

A user can select a Google Place to seed known identity, address, and available media, where provider rights and source data allow. **Do not require a Google Places listing**: the current Workspace family documents a Place-backed *or name-only* Kitchen. Place owns Place facts; Kitchen owns Kitchen operations. Verify exact existing Place and Kitchen link contracts before modifying them. A mobile, temporary or private Kitchen is not invalid because it has no Google Place.

### B. Kitchen Entity Core

Create, read, view and edit one Kitchen even when it has **zero Items, Menus, employees or Orders**. Inspect the real model and mutations first; do not add fields because a proposed UI has sections. Separate:

- Identity and lifecycle: canonical Kitchen ID, current identity fields/status and trustworthy Place/name source.
- Operational root settings only where they truly belong to Kitchen; classify Hours, Theme, currency, visibility and preferences against actual source ownership rather than dumping them into the core by assumption.
- Created/updated stamps and exact authority-bound read/write paths.
- Place facts remain Place-owned; Team/access and capability records retain their current owners.

**Source reality at this handoff:** `packages/extensions/fireux-kitchens/src/runtime/kitchen/models/model.ts` defines `Kitchen` with `id`, `identity` (slug/status/visibility/source), optional `context`, `guidance_ids`, stamps, optional `theme`, and existing `orders`, `services`, and `tables` configuration. Therefore the model is **not currently a clean four-field 'Kitchen Core'**. Audit those fields and their consumers; propose a smallest safe core without silently changing persisted Kitchen documents or pretending dependent settings are already decoupled. The Workspace family map discusses an optional `default_currency_code` contract, but this inspected Kitchen type does not yet declare it; don't assert adoption.

### C. Kitchen Workspace

Prove selecting a permitted Kitchen, opening its Home/Overview, viewing its canonical identity, editing supported fields via the owning trusted commands, switching Kitchens safely, and handling no Kitchen, missing Kitchen, access denial and refresh. Reuse Core `useWorkspace`, the `workspace` layout, shared Workspace page shell, and existing domain access contracts. Do not add a parallel Workspace record, controller, reader or permissions layer.

### D. Operational capability flow, **after** core/Workspace proof

Indicative customer-facing path:

```text
Place or name-only start
  → Kitchen Core
  → Kitchen Workspace
  → Items (Kitchen-owned reusable records)
  → Menus (compose Item placements and offerings)
  → Public Menu (verify guest-readable offering)
  → Service/channel configuration (where/how orderable)
  → Orders (consume ready offerings and supported service)
```

This is a **candidate sequence, not a mandatory schema or universal product recipe**. There are parallel, optionally enabled branches: Ingredients, Recipes/Prep, Suppliers, Stock, Costing/Finance, Team/Training, and operational checks. Some kitchens need these *before* safely opening; others can publish a simple menu first. The minimum viable journey and explicit real-world safety/availability constraints determine readiness, not a rigid universal checklist.

Kitchen Items' basic alphabetical list and exact Item Detail should remain the simple reference UI while verifying one relationship at a time, as covered in `docs/handoffs/2026-11-20-item-detail-capability-relationships.md`. Do not reopen its entire capability graph in this slice.

## Ignite responsibility: convert dependency evidence into build logistics

Ignite already has:
- `packages/extensions/fireux-ignite/src/runtime/models/ignition.ts` — brief, assembly and evidence types; assembly elements carry `uses` dependency IDs.
- `packages/extensions/fireux-ignite/src/runtime/utils/reconcile-ignition.ts` — checks uniqueness, known references and cyclic dependencies, then compares declared coverage; **it is not an execution scheduler**.
- `packages/extensions/fireux-ignite/src/runtime/utils/ignition-method.ts` — ordered research, assembly, build and verification guidance, but not an explicit capability delivery sequence.

**Propose the smallest extension to these existing contracts** so an approved assembly can yield a comprehensible, dependency-ordered **delivery plan** before implementation. Do not build a second lifecycle engine, a cross-domain graph database, or an App-local copy of Ignite.

For each proposed slice, capture or derive, with evidence:

- **Responsibility and outcome:** What real-world activity or fact is being supported? Who uses it?
- **Prerequisites and blocking relationships:** Which records, access paths, capability outputs or verified journeys must already exist? Differentiate *hard dependencies* from *optional enhancements*.
- **Minimum working journey:** Smallest useful create/read/use action with real consumers, not a mock page or file scaffold.
- **Owner and authority:** Which Entity package owns data, readers and trusted mutations? Which App composes the surface?
- **Acceptance evidence:** What can be checked end to end, including failure modes, route/access isolation and a user-visible result?
- **Current readiness:** Unsupported / planned / source exists / checks passed / journey proved, preserving the distinction between declaration and proof.

Sort hard dependencies deterministically; flag cycles and missing dependencies using existing validation. Allow parallel independent slices, but recommend **one bounded vertical slice at a time** to the operator. Never infer dependencies merely from navigation nesting or folder names. Do not mark a slice ready just because a typecheck passed; a completed journey needs its own evidence. Preserve unverified and deliberately skipped branches instead of manufacturing readiness.

### Indicative Ignite output

| Stage | Candidate slice | Blocks on | Proof required |
| --- | --- | --- | --- |
| Foundation | Kitchen creation (Place-backed or manual) | validated identity and authorized creation | a real Kitchen root can be created/read |
| Foundation | Kitchen Workspace | accessible Kitchen root | selection, view/edit, switch and authorization work |
| Operation | Items | Kitchen Workspace/authorized Kitchen | create/read/edit one Item, direct detail route |
| Operation | Menus | existing Items | compose and save Item placements; correct visibility |
| Presentation | Public Menu | saved eligible Menu | actual guest-facing read and navigation |
| Service | Ordering configuration | supported Menu and service contract | verified eligibility and configured channel |
| Outcome | Orders | eligible Menu + working service | valid order journey; no upstream rewrites |

Treat the table as *hypotheses for Kitchen* to validate, not fabricated test evidence. Costing, stock and team may be independently prioritized where local operating requirements demand them.

## Scope for the next Codex implementation thread

1. Audit the existing Kitchen root model, Place acquisition, trusted mutations, access guards, Workspace entry and creation path. Map **implemented vs proposed** Entity Core fields.
2. Compare Kitchen with **one other existing Workspace Entity** (e.g. Property or Project) to validate the *pattern* without imposing Kitchen's Place dependency on the other Entity.
3. Write a bounded Kitchen Core + Workspace acceptance journey and identify obsolete or cross-wired integration points. Do not build Items, Menus or Orders in this core slice.
4. Audit Ignite's current assembly dependencies and tests. Propose a small plan representation or pure derivation strategy, with test cases for ordering, independent branches, cycles, absent evidence and an Order slice blocked by absent Menu/service proof.
5. Implement only the smallest agreed change with checks. Document actual source links and verified outcomes. If removal of old Orders wiring is desirable, enumerate exact files, consumers and data risks for separate review first.

### Acceptance

A developer or Codex should be able to explain in minutes: **What is this Entity? What makes it valid before any capabilities exist? What prerequisite really blocks creation? What does Workspace do without owning domain data? What can be built next, and what proves it?**

**Success for Ignite:** it cannot recommend implementing Orders as the next *ready* Kitchen slice when the required Menu/service journeys have not been proved. It can still show Orders as a future blocked outcome. The same planning mechanism works for other Workspace Entity families without hardcoding Kitchen terminology.

## Guardrails and authority

- Follow `AGENTS.md`, `docs/ai/gpt-context.md`, `docs/concepts/entities.md`, `docs/concepts/workspace.md`, `docs/concepts/family-workspace-entity.md`, and the owning package context/tests.
- Source paths and a handoff are not evidence of working behaviour. Reinspect current checkout before editing.
- Root Entity model, child Records, Place-owned facts, access authority, and Workspace selection are different concerns.
- Use existing readers, composables, commands and tested Core presentation; no giant controller or automatic folder generator.
- Preserve Firestore data, authentication, tenant separation and production behaviour. No deployment, mass deletions, migrations or new provider provisioning under this handoff.
- Coordinate with active Codex work. Any implementation, deletion or schema cutover must be bounded, explicit and independently verified.

**Immediate recommended work:** prove Kitchen Core + Workspace and add an Ignite delivery-order gate before reviving downstream Orders.
