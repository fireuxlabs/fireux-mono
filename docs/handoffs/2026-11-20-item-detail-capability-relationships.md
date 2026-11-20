# FireUX — Item Detail & Capability Relationship Graph

**Date:** 2026-11-20  
**Status:** Conversation handoff to Codex; design intent plus source observations, **not** authorization to migrate Firestore, publish data, or build a generic graph engine.  
**Repository:** `fireuxlabs/fireux-mono`

## Purpose

Finish the **small, clear Item Detail** journey first, then grow it by composing independently useful, domain-owned relationship capabilities. The bigger idea is an operator Workspace that reveals the performance and operational context of a record across the whole Workspace, without making the record itself own copied facts from every capability.

**Guiding principle:** *The Item describes the dish; capabilities own its related truth; Workspace reveals the result.* Keep pages simple, reactive data ownership explicit, and presentation reusable.

This handoff follows [Workspace Spine & Firestore Canon Alignment](workspace-spine-firestore-canon-alignment.md). Consult `AGENTS.md`, `docs/ai/gpt-context.md`, `docs/concepts/entities.md`, `docs/concepts/workspace.md`, `docs/concepts/family-menu.md` and the applicable Kitchen/Misebox context before implementation.

## Why we stopped building the Collection Manager

The Items page had accumulated too much orchestration before its basic value was clear. The operator deliberately reduced it to:

1. Select a Kitchen through the existing Workspace.
2. Read its Item catalogue.
3. Show a simple **alphabetical linked list**.
4. Open one **Item Detail** using an exact Item ID.
5. Understand the underlying model before adding more features.

**Preserve this as the working baseline.** Finish and verify the detail journey before rebuilding search, richer cards, catalog tools or a Collection Manager. Introduce enhancements only when their responsibilities and benefits are clear.

## Current source observed on `main` (verify again in local checkout)

- `kitchen/components/Workspace/Menu/Items/Index.vue`: plain alphabetical `<ul>` linking to Item detail routes.
- `pages/workspace/kitchen/menu/items/[dishId].vue`: obtains the selected `useKitchenWorkspace()`, reads the exact Item through `useKitchenItemRead(kitchenId, dishId)`, and mounts `KitchenWorkspaceMenuItemsDetail`.
- `kitchen/components/Workspace/Menu/Items/Detail/Index.vue`: currently composes a Menu-owned `ItemDetail.vue` presentation with `WorkspaceItemDetail.vue`.
- `kitchen/components/Workspace/Menu/Items/Detail/WorkspaceItemDetail.vue`: displays Item name, description and optional image, driven by supplied Item data.
- `menu/components/ItemDetail.vue`: renders a Menu-context browse presentation where a qualifying Menu can be resolved, otherwise a basic Item display. It currently has its own contextual Menu lookup; **do not assume this is already a pure shared presentation component or an exact published/customer preview in every circumstance**.
- `kitchen/records/menus/items/item.ts`: canonical Kitchen-owned Item identity with `id`, `name`, optional `description`, `image`, stamps. **No generic Item publication or Active boolean exists in this inspected type.**
- `kitchen/composables/items/useKitchenItemRead.ts`: one access-gated live Item read at `kitchens/{kitchenId}/dishes/{dishId}`, with separate offer/selling projection. It is **not** an entire-catalogue acquisition.
- `kitchen/composables/workspace/menu/items/useKitchenWorkspaceItems.ts`: obtains the selected Kitchen and acquires the scoped catalogue for the list.

Existing storage and URL names (`dishes`, `dishId`) are historical contracts and are **not** renamed by this handoff. Source placement, domain ownership, Workspace navigation and Firestore path form a traceable mapping, but must not be conflated.

## Proposed Item Detail anatomy

### A. Model (source truth)

Show the actual canonical Item model for inspection, initially including an optional development JSON view. The JSON was useful precisely because it made it obvious which fields really exist. Do not invent fields or return internal/private data to the public surface. Keep separate owned record projections (e.g. Item offer) explicit.

### B. Derived (computed from known inputs)

Small, *named* computed facts, such as `hasName`, `hasPhoto`, or `missingContent` once the required-content policy is agreed. Do not persist calculations on the Item just to display them; do not interpret an absent field as operational failure without an agreed domain rule. Model ≠ derived.

### C. Relationships (other capabilities' truth)

A **Capability Relationship Graph**, initially a collection of small, useful relationship sections (not a new graph database). Potential examples:

| Capability | Question on Item Detail | Status |
| --- | --- | --- |
| Menus | Which saved Menus or sections place this Item? | Existing reference/usage flow is a candidate to reuse; verify its scope |
| Ingredients / Recipes / Preparations | What contributes to making this Item? | Domain association contracts require inspection; do not assume links exist |
| Team / Training | Which members are trained on this dish? | Future relationship; no implementation claim |
| Batches / Production | Which batches produce or consume it? | Future relationship; no implementation claim |
| Sales / Orders | How many were sold in a defined date range? | Future read-only capability; not an existing performance assertion |
| Costing | Cost per portion, selling price, contribution margin, food-cost % | Depends on authoritative quantities, units, yields, purchases/costs and currency; do not infer incomplete inputs |
| Stock / Availability | Is it currently orderable, and why? | Depends on separate stock and serving policy; not equated with Item publication |

A relationship is not necessarily a stored edge. It may be a query, a reference, an existing command-backed usage reader, or an explicitly marked unavailable integration. **Each owning capability defines and obtains its own evidence**. Item does not copy all those records or grant their access.

### D. Presentation

The Item detail should contain readable Item identity and an optional **customer-facing presentation** using the actual Menu presentation components where appropriate. The Workspace may have editing controls around those components. Distinguish:
- Live changes to the Item's own saved record.
- A contextual preview that shows how that Item appears in a specific Menu.
- Actual public visibility, which remains governed by Menu publication, placement, audience and service eligibility.

**Do not add an Item draft/publish workflow.** The operator wants Item edits to be live; publication is primarily a Menu concern. A separate manual enable/disable or safety-off switch may be warranted for urgent operational removal, while stock-based availability is a different concern. Decide its exact model field, write authority and impact on public/order readers **before** adding the toggle; disabling an Item should not silently delete Menu placements or the Item itself.

## Smart component contract

An Item Detail parent should be easy to read: it mounts the already-acquired Item once and composes only the capabilities that have genuine consumers. A smart relationship component may coordinate its own focused source reader(s), reactive calculations, outcome and display, ideally through a responsibility-matched composable. The *data access and business calculation* belong to the correct capability owner; the component brings them together.

- **One active Item identity and selected Kitchen scope.** Child components receive narrow IDs or typed values, or consume an existing strictly scoped parent; no competing Item selection/read authority.
- **No giant `useItemEverything()` controller.** Independent relationship summaries can be added one at a time without modifying the canonical Item model or reworking all other sections.
- **No duplicate capability logic.** Reuse domain readers and pure calculations; only extract Core behavior proved by more than one independent family for the same reason.
- **Lazy/conditional acquisition.** Do not query every Kitchen subcollection when Item Detail opens. Load sections only when relevant (e.g. visible or expanded), share already acquired sources where possible, and ensure switching Kitchen/Item disposes or invalidates obsolete results.
- **Honest outcomes.** Loading/error/empty/unconnected/insufficient-input are distinct; never fabricate zero cost, zero sales, training completion or stock quantities.
- **Authority and privacy.** A relationship component does not authorize reads/writes to another family's data. Trusted domain commands and public projections keep their existing enforcement.
- **Presentation stays reusable.** Prefer passing settled, typed facts to presentational children instead of passing huge internal controller bags.

The reusable FireUX *pattern* is **Model → Derived → Relationships → Presentation**. It does **not** imply a universal four-slot component, a mandatory composable per file, a graph schema or a generic relationship registry. Stable, Property and Portfolio may eventually use it, but only after this Kitchen proof.

## Suggested smallest Codex slice

1. **Inspect and report** the current exact Item Detail route → Item reader → Item model/offer → Workspace wrapper → Menu presentation/placement relationships. Distinguish working behavior from design ideas above.
2. Keep the alphabetical Items list simple. Verify direct navigation, missing Item, no selected Kitchen, unauthorized Kitchen, stale result while switching, and browser refresh.
3. Finish a coherent basic Item Detail: confirmed fields displayed clearly, optional development JSON of the actual model, and properly scoped reusable Menu presentation. Check whether the two existing detail renderers currently duplicate identity on screen and simplify only with a real consumer-preserving change.
4. Add a **small, pure Derived example** (e.g. presence of name/description/image), once semantics are agreed. No new stored fields.
5. Add **one proved relationship**, preferably existing Menu placements/usage, with owner-supplied read/status and direct links. Don't build the entire graph yet.
6. Write acceptance tests for exact Kitchen/Item scope, source reuse, state changes, lack of duplicate authority, public/private boundary, and nested navigation. Test desktop/mobile rendered behavior, not only code shape.
7. Record a short comparison of the next possible capability relationships and their actual source/ownership readiness. **Stop before inventing or implementing incomplete costing, training, stock or sales APIs.**
8. Only then evaluate incremental Collection Manager enhancement, using the finished Item Detail as the destination.

## Acceptance test for the architecture

A new developer should be able to answer without searching through a controller maze: **Where is the Item model? Which exact Firestore document does this page read? Which component is public presentation? Which capability owns this relationship? What is computed rather than stored? What changes when the selected Kitchen changes?**

If answering those questions requires duplicated readers or hidden routing behavior, simplify the seam first.

## Authority / guardrails

This handoff captures design direction and authorizes **audit and a proposed bounded implementation plan**; coordinate with the active Kitchen Codex thread before editing shared files. It does not authorize a blanket rename, Firestore schema migration, publishing private content, public API expansion, active toggle implementation, new sales/cost/training systems, deployment, or removal of established functionality.
