# Misebox Kitchen — walking checkpoint (parked)

**Date:** 2026-11-20
**Status:** PARKED discussion handoff; **not approved for execution**
**Implementing reference:** [Kitchen real-world build order](2026-11-20-kitchen-real-world-build-order.md)
**Prerequisite:** [Core reset build order](2026-11-20-fireux-core-reset-build-order.md)

## Decision from walking discussion

FireUX/Project is the intentionally simple reference for verifying clean filesystem, namespaces, component/composable ownership, Nuxt registration, and the principle that upstream packages remain ignorant of downstream domain features. A separate Project-free App fixture verifies that the Core contract does not implicitly require Project.

Misebox is the product we aim to ship to chefs. Kitchen is its central managed entity, but **the Kitchen implementation follows the Core/User/membership and optional Workspace gates**. Do not start a Kitchen rebuild as a side effect of parking this note.

## Kitchen work — exact sequence

1. **Kitchen Core alone:** One simple Kitchen can be created by name (without requiring Google Places) or via an existing Place, read, selected, edited, reopened, and switched with the correct permission scope. Its Workspace is useful when it contains **zero Items, Menus, Suppliers, Team members, Services, or Orders**.
2. **Clean the proven slice:** Audit its real folders, namespaces, shapes/models, routes, components, composables, readers, trusted commands and Nuxt registration. Preserve source truth and authorization; remove demonstrably unnecessary couplings and duplicates. No speculative restructuring. The goal is a small, understandable independent Kitchen implementation.
3. **Items FIRST:** Prove the smallest Kitchen-owned Item journey independently: create one dish/drink/item, read, edit and list it alphabetically. It needs **no Menu, Recipe, Supplier, Order, or full costing model** just to exist. Decide appropriate stored model and owned supporting records from actual source before changing files.
4. **Menus SECOND:** Compose existing Items into a Menu with simple sections/placements. Prove a draft/private Menu independently of Services and Orders. Menu consumes Item identity; it does not duplicate or redefine Item.
5. **Later and separately:** Menu presentation/publishing, configured Services/channels, then Orders. Recipe/prep, suppliers/stock, costing, team, and compliance are optional separately owned capability branches, not mandatory prerequisites for Item or Kitchen Core.

## Tests / acceptance

Each slice needs exact ownership and import review, protected create/read/edit, reload/switch and empty/error states, focused owner tests, and verification through a real App consumer. Record path → responsibility → owner → upstream dependencies → evidence → unnecessary coupling.

**Not authorized:** automatic execution, blanket source deletion, Firestore/Storage migrations or deletion, changing Rules, provider settings or deployment. No live data modification.

## How to resume

Reopen after Core and optional Workspace are genuinely checked. Treat this as decision context, not a duplicate task generator. Execute *one* bounded slice at a time, starting with independent Kitchen Core. Codex must seek the separate approved bridge trigger before beginning any automated execution. Do not self-trigger based on this document commit.
