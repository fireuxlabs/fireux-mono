# FireUX — Item Detail & Capability Relationship Graph

Design handoff for open Item Detail decisions, dated November 20, 2026.

## Purpose

Finish the **small, clear Item Detail** journey first, then grow it by composing independently useful, domain-owned relationship capabilities. The bigger idea is an operator Workspace that reveals the performance and operational context of a record across the whole Workspace, without making the record itself own copied facts from every capability.

**Guiding principle:** _The Item describes the dish; capabilities own its related truth; Workspace reveals the result._ Keep pages simple, reactive data ownership explicit, and presentation reusable.

The [Kitchens README](../../packages/extensions/fireux-kitchens/README.md#item-detail)
links the current route, reader, presentation and tests. The alphabetical Items
list and exact Item Detail are the baseline for any future catalogue work.

## Proposed Item Detail anatomy

### A. Model (source truth)

Show the actual canonical Item model for inspection, initially including an optional development JSON view. The JSON was useful precisely because it made it obvious which fields really exist. Do not invent fields or return internal/private data to the public surface. Keep separate owned record projections (e.g. Item offer) explicit.

### B. Derived (computed from known inputs)

Small, _named_ computed facts, such as `hasName`, `hasPhoto`, or `missingContent` once the required-content policy is agreed. Do not persist calculations on the Item just to display them; do not interpret an absent field as operational failure without an agreed domain rule. Model ≠ derived.

### C. Relationships (other capabilities' truth)

A **Capability Relationship Graph**, initially a collection of small, useful relationship sections (not a new graph database). Potential examples:

| Capability                           | Question on Item Detail                                           | Status                                                                                                           |
| ------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Menus                                | Which saved Menus or sections place this Item?                    | Existing reference/usage flow is a candidate to reuse; verify its scope                                          |
| Ingredients / Recipes / Preparations | What contributes to making this Item?                             | Domain association contracts require inspection; do not assume links exist                                       |
| Team / Training                      | Which members are trained on this dish?                           | Future relationship; no implementation claim                                                                     |
| Batches / Production                 | Which batches produce or consume it?                              | Future relationship; no implementation claim                                                                     |
| Sales / Orders                       | How many were sold in a defined date range?                       | Future read-only capability; not an existing performance assertion                                               |
| Costing                              | Cost per portion, selling price, contribution margin, food-cost % | Depends on authoritative quantities, units, yields, purchases/costs and currency; do not infer incomplete inputs |
| Stock / Availability                 | Is it currently orderable, and why?                               | Depends on separate stock and serving policy; not equated with Item publication                                  |

A relationship is not necessarily a stored edge. It may be a query, a reference, an existing command-backed usage reader, or an explicitly marked unavailable integration. **Each owning capability defines and obtains its own evidence**. Item does not copy all those records or grant their access.

### D. Presentation

The Item detail should contain readable Item identity and an optional **customer-facing presentation** using the actual Menu presentation components where appropriate. The Workspace may have editing controls around those components. Distinguish:

- Live changes to the Item's own saved record.
- A contextual preview that shows how that Item appears in a specific Menu.
- Actual public visibility, which remains governed by Menu publication, placement, audience and service eligibility.

**Do not add an Item draft/publish workflow.** The operator wants Item edits to be live; publication is primarily a Menu concern. A separate manual enable/disable or safety-off switch may be warranted for urgent operational removal, while stock-based availability is a different concern. Decide its exact model field, write authority and impact on public/order readers **before** adding the toggle; disabling an Item should not silently delete Menu placements or the Item itself.

## Smart component contract

An Item Detail parent should be easy to read: it mounts the already-acquired Item once and composes only the capabilities that have genuine consumers. A smart relationship component may coordinate its own focused source reader(s), reactive calculations, outcome and display, ideally through a responsibility-matched composable. The _data access and business calculation_ belong to the correct capability owner; the component brings them together.

- **One active Item identity and selected Kitchen scope.** Child components receive narrow IDs or typed values, or consume an existing strictly scoped parent; no competing Item selection/read authority.
- **No giant `useItemEverything()` controller.** Independent relationship summaries can be added one at a time without modifying the canonical Item model or reworking all other sections.
- **No duplicate capability logic.** Reuse domain readers and pure calculations; only extract Core behavior proved by more than one independent family for the same reason.
- **Lazy/conditional acquisition.** Do not query every Kitchen subcollection when Item Detail opens. Load sections only when relevant (e.g. visible or expanded), share already acquired sources where possible, and ensure switching Kitchen/Item disposes or invalidates obsolete results.
- **Honest outcomes.** Loading/error/empty/unconnected/insufficient-input are distinct; never fabricate zero cost, zero sales, training completion or stock quantities.
- **Authority and privacy.** A relationship component does not authorize reads/writes to another family's data. Trusted domain commands and public projections keep their existing enforcement.
- **Presentation stays reusable.** Prefer passing settled, typed facts to presentational children instead of passing huge internal controller bags.

The reusable FireUX _pattern_ is **Model → Derived → Relationships → Presentation**. It does **not** imply a universal four-slot component, a mandatory composable per file, a graph schema or a generic relationship registry. Stable, Property and Portfolio may eventually use it, but only after this Kitchen proof.

## Open capability decisions

- Agree what a small derived fact means before adding it. Keep it computed.
- Verify the scope of the existing Menu usage reader before using placements as
  the first relationship. Check that the result follows the exact Kitchen and
  Item, clears when either changes, and links back to the owning Menu section.
- Review evidence for each further capability before adding its section.
  Defer richer catalogue controls until Item Detail serves the operator's task.

## Open availability decision

Item edits stay live. Decide separately whether an emergency operator stop
should override every Menu placement. Any approved stop must be enforced by
the public and ordering owners without deleting the Item or its placements.
Stock and service-time availability retain their own authorities. Keep
operator-only costs, personnel and diagnostics out of the public projection.

## Authority / guardrails

This handoff captures design direction and authorizes **audit and a proposed bounded implementation plan**; coordinate with the active Kitchen Codex thread before editing shared files. It does not authorize a blanket rename, Firestore schema migration, publishing private content, public API expansion, active toggle implementation, new sales/cost/training systems, deployment, or removal of established functionality.
