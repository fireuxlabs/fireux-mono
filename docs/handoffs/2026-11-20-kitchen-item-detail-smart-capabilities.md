# FireUX — Kitchen Item Detail, Smart Capabilities & Relationship Graph

**Date:** 2026-11-20  
**Status:** Codex handoff — product direction and bounded implementation assignment; not evidence that the proposed features exist  
**Scope:** Kitchen Workspace → Menu → Items → Item Detail, with reusable FireUX composition conventions  
**Predecessors:** [Workspace Spine & Firestore Canon Alignment](workspace-spine-firestore-canon-alignment.md) and [Predictable Spine Rules](2026-11-17-fireux-predictable-spine-rules.md)

## Product intent

The Kitchen Workspace should become the Kitchen's **operational intelligence**, not merely a collection editor. Opening one Item (for example, Margherita Pizza) should progressively reveal:

1. **Model:** What the Item actually is according to its canonical persisted identity.
2. **Derived:** Computations from that acquired model, such as whether the name, description or photo is missing.
3. **Relationships:** Evidence from other domain capabilities: Menu placements, Ingredients, Preparations, Batches, Team training, costs, stock and sales, where the real contracts exist.
4. **Presentation:** How the Item looks to customers, using an appropriate public-facing presentation component.

The principle is **simple page, smart capability components, reusable presentation**. Each capability owns its source truth and bounded computations; the Workspace assembles the answers for the selected Item.

This handoff captures direction, not permission to create a graph database, generic registry, new Firestore schema or large Item controller.

## Why this direction emerged

The Item catalogue had become difficult to reason about when treated as a full Collection Manager too early. It was deliberately reduced to a working baseline:

- Read the selected Kitchen's Items.
- Display a simple alphabetically sorted list.
- Click an Item and open its Detail route.
- Read one Item and inspect its actual model.

That simplification made the model and architectural responsibilities visible. **Preserve this working path as the reference and do not rebuild the Collection Manager first.** Finish Item Detail in small increments; only then progressively enhance the catalogue.

The operator also wants to see the customer-facing result **while editing**, preferably by reusing the same presentation building block rather than maintaining two competing designs. There is **no requested Item draft/publish workflow**. Item changes are live; Menu publication is a distinct existing capability. A possible manual safety disable/visibility control is a later, explicitly reviewed Item capability, not an excuse to invent parallel publish states.

## Source evidence inspected on committed `main` (2026-11-20)

These are inspected files, not an assertion about concurrent, uncommitted local work:

| Responsibility | Current owner or evidence |
| --- | --- |
| Catalogue route and navigation | `packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/menu/items/index.vue`; `kitchen/components/Workspace/Menu/Items/Index.vue` |
| Basic alphabetical catalogue | `kitchen/components/Workspace/Menu/Items/Index.vue` sorts `dishes` by name or ID and links to each Item |
| Catalogue reader | `kitchen/composables/workspace/menu/items/useKitchenWorkspaceItems.ts` delegates to `useKitchenItemCollection`, Workspace selection and access |
| Item Detail route | `packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/menu/items/[dishId].vue` passes one `item` to the Detail component |
| One-Item reader | `kitchen/composables/items/useKitchenItemRead.ts` reads the authorized selected Kitchen's single Item; separately exposes `item`, `offer`, `outcome`, errors and read-only state |
| Workspace Item Detail composition | `kitchen/components/Workspace/Menu/Items/Detail/Index.vue` composes `KitchenMenuItemDetail` and `WorkspaceItemDetail` |
| Current basic Item presentation | `kitchen/components/Workspace/Menu/Items/Detail/WorkspaceItemDetail.vue` renders name, description and photo from passed Item |
| Menu-aware presentation | `menu/components/ItemDetail.vue` composes existing Menu display; when given Menu context it can acquire menu/directory data independently |
| Canonical Item identity / storage | `kitchen/records/menus/items/item.ts`: `Item` contains ID, name, optional description/image and stamps. Existing persisted path: `kitchens/{kitchenId}/dishes/{dishId}` |
| Separate selling defaults | `kitchen/records/menus/items/item-offer.ts` defines `ItemOffer`; one reader may expose it without expanding Item identity |
| Domain boundaries | `docs/concepts/family-menu.md`: Item is Kitchen-owned; Menu owns placements; preparation specification belongs to Prep & Production; Menu publication is separate |
| Existing diagnostic convention | `docs/concepts/debug.md`: `objects` vs `derived`, `fetched` vs `passed`, bounded child-owned diagnostics, raw JSON as secondary view |

When locating paths, the `kitchen/` shorthand above is relative to `packages/extensions/fireux-kitchens/src/runtime/`.

**Do not confuse discussion examples with existing features:** food cost, gross profit, 142 monthly sales, 4/6 trained employees and stock-based availability were illustrative numbers/capabilities, not verified live data.

## Intended ownership contract

| Layer | Job | Owner / boundary |
| --- | --- | --- |
| Workspace | Select the Kitchen, hold route context and compose the detail experience | Shared Workspace mechanics plus Kitchen Workspace consumer |
| Model | Acquire **one** canonical Kitchen Item record with safe outcome and access handling | Existing Kitchen Item reader; stable `dishId` |
| Derived | Calculate local display/completeness facts from data already acquired | Nearest Item presentation/detail owner; simple `computed` is enough |
| Capability relationship | Answer **one** relevant question about this Item using an existing capability's authority and reader | The specific capability's smart component/composable |
| Public presentation | Render public-safe Item content and, where appropriate, actual Menu placement/offer context | Existing Menu/Item presentation owners; reuse before creating substitutes |
| Diagnostics | Expose bounded source objects, provenance and derived projections for developers | Component that actually owns the read or computation |

**Smart does not mean a component must talk to Firestore itself.** A smart component may coordinate an existing owner reader, scope its input, compute and present. Its presentational child can be pure props. Do not duplicate a lower-layer listener, command, authorization check or canonical Item read.

The Item is a **Kitchen-owned Record**, not a new root Item Entity. Item identity, ItemOffer, Menu placement, Recipe, Ingredient, Preparation, training and transaction truth must not be collapsed into one expanded Item document simply to make Detail convenient.

## Capability Relationship Graph — a view, not a new database

The relationship graph means: *for this selected Item, what is known about its participation in the rest of the Kitchen?* It may follow the Workspace's navigation as a discovery tool, but sidebar grouping **does not create automatic Firestore parents or graph edges**.

Potential bounded panels (implement only after confirming a real owner and query):

| Panel / question | Source of truth / note |
| --- | --- |
| **Public presentation** — How does the Item look? | The existing shared Item/Menu display and applicable public projection |
| **Menus** — Which Menu placements reference this Item? | Menu-owned Sections/Entries reference Items (currently by `dish_id`); preserve placement identity and publication policy |
| **Ingredients & preparations** — What produces the dish? | Reuse their actual canonical/associated readers; these relationships are not all currently guaranteed by the bare Item model |
| **Cost** — What is its cost per serving? | Requires verified quantities, unit conversion, valid supplier cost/provenance and possibly yield; never fabricate a cost |
| **Team training** — Who is qualified to prepare it? | Team/training owner; never put personnel internals in a public Item payload |
| **Batches & stock** — Can it be produced or ordered? | Production/stock owner; differentiate missing evidence from zero stock |
| **Sales** — Units sold, revenue and performance | Transaction/Sales owner, scoped by Kitchen and period; aggregate efficiently rather than loading all orders into the detail page |

For costing, gross profit and food-cost percentage, confirm the financial definitions and VAT/tax treatment before displaying operator numbers. Where data is absent, show an honest **not available / not configured** state, not zero or a green completeness signal.

**No universal auto-discovery mechanism is required now.** If multiple panels eventually demonstrate a genuinely repeated contract, propose the smallest typed interface backed by evidence. Do not introduce a graph store, eager relationship fetch, global registration framework or mandatory per-capability boilerplate.

## Live visibility versus publishing

User direction: Item edits should be live. The operator may eventually need a **manual stop** to prevent a dish being offered, including a safety incident; stock management may separately derive orderability. Keep these distinct if/when implemented:

- A manual Item enable/disable (product eligibility or emergency suppression) is a candidate capability. Verify existing commands, menu projections, authorization and persisted status before deciding the field, name or ownership.
- Stock or service-time availability is a separate derived or capability-owned concern.
- An Item's disabled state must **not** silently delete its record or its Menu references.
- Existing Menu publication and Menu-specific availability remain authoritative, and public/ordering endpoints must enforce any eventual suppression on the server—not merely hide a button.

**This handoff does not authorize adding a new `active` field or changing stored data yet.** Resolve whether a global safety disable should override every Menu placement as a separate, bounded policy decision.

## Order of work for Codex

### Phase 0 — verify current source and working baseline

Read `AGENTS.md`, `docs/ai/gpt-context.md`, applicable Kitchen/Menu/Workspace/component/composable maps and the active local checkout. Check for uncommitted concurrent work. Trace catalogue → Item Detail → Item reader → actual Item document, then Detail → public Menu presentation. Record real existing component names, current outcome behavior and which reads are duplicated, if any.

### Phase 1 — finish Item Detail without complexity

- Keep the catalogue's current alphabetical list and click-through behavior.
- Make the Item Detail readable and attractive with the existing Item presentation and Nuxt UI conventions. Identify the *existing* public display primitive (`MenuItemDisplay` is one candidate) and reuse its legitimate presentation API rather than introducing a second design.
- Display the acquired Item's model, preferably in developer diagnostics as a bounded `objects` payload with its origin; raw JSON remains available for inspection, not necessarily the main operator UI.
- Add minimal derived content-completeness checks from the already-acquired Item (name, description, image), with clear semantics. These are computed, not persisted fields.
- Keep Workspace operator-only information private. The public presentation must not disclose internal diagnostics, costs, team or access data.
- Preserve the existing route parameter, selected Kitchen access guards, live reactive updates, missing/error/loading outcomes and no second canonical Item acquisition.

### Phase 2 — one proved relationship

Pick **one real, well-scoped relationship**, preferably existing Menu placements, **only if** its reader and ownership are already trustworthy. Implement one smart, bounded relationship panel. It should use the passed Item ID and selected Kitchen scope and delegate its read to the owning capability. Avoid scanning unrelated collections or fetching all Kitchen data.

Confirm correctness when switching Kitchen and Item, leaving the page, losing access and handling missing linked records. A missing relationship is not evidence of an empty relationship until the read has completed successfully.

### Phase 3 — progressive expansion

Only then consider more panels such as Ingredients, Cost, Team, Batches, Stock or Sales. Each requires its own evidence-backed owner, data path, access boundary, performance strategy and presentation. There is no mandate to implement all panels now or to match every Workspace navigation entry with a panel.

### Phase 4 — Collection Manager later

Once Item Detail is sound, return to the alphabetical Item catalogue and add exactly one justified Collection Manager feature at a time. If a feature reintroduces large controllers, duplicated listeners or difficult state, stop and simplify the abstraction rather than compromising the baseline.

## Acceptance criteria for the initial bounded slice

1. `/workspace/kitchen/menu/items` remains a simple, alphabetical, accessible list; clicking a record opens its correct Detail.
2. Detail shows the canonical Item from **one** authorized read and handles pending, empty and error states.
3. The operator sees a presentable customer-facing Item using existing display ownership, plus a simple derived completeness indication and optional dev-only raw model inspection.
4. No duplicate Item model/offer truth, no new mandatory `useX` facade, no new graph database, no eager Kitchen-wide reads, no invented values and no unauthorized storage mutation.
5. At most one new relationship panel in the first implementation pass, and only after verifying its existing authority and query contract.
6. Preserve separation between live Item edits, Menu publication, Menu placement, and any future stock or emergency-disable policies.
7. Check actual Misebox consumer behavior, relevant tests, reactivity, authorization, loading/missing states, accessible labels and desktop/mobile UI. Report **FireUX fit** separately from functional evidence.

## What Codex should return

- A brief **verified / existing / gap / later** matrix for Model, Derived, Relationships and Presentation.
- Exact source/consumer and Firestore paths used by any changed slice.
- The smallest implementation and corresponding tests for **Phase 1**, then one justified Phase 2 relationship only if evidence supports it.
- A concise account of what remained intentionally untouched, including why the basic Item list stayed simple.
- Updated applicable living documentation where an established contract actually changed.

**Do not** rename `dishes` storage, migrate Firestore, broaden Item identity, implement hypothetical cost/training/sales data, create a generic Relationship Graph engine, introduce Item publishing, or redesign the catalogue as a side effect of this handoff.

**Guiding test:** Opening one Item should be understandable at a glance: *what is this Item, what is missing, how does it look publicly, and which specific Kitchen capabilities can tell me something trustworthy about it?*
