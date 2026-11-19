# FireUX — Workspace Spine & Firestore Canon Alignment

**Status:** Codex handoff — architecture review and bounded implementation plan  
**Date:** 2026-11-19  
**Scope:** FireUX Core Workspace, Entity Workspaces, navigation, component/composable spine, Firestore conventions.

## Objective

Make the Workspace UI, FireUX source-code spine and Firestore schema predictable representations of the **same domain tree**. The industry determines its capabilities; FireUX supplies reusable application machinery. A developer or AI should be able to traverse from sidebar to components/composables to Firestore paths (and back) without guessing.

**Do not redesign the app architecture for every new industry.** The hypothetical Stable Workspace discussed below is an illustrative test case, **not** a request to implement a stable app.

## Agreed boundaries

1. **Workspace Core owns context, not the domain.** The selected Entity document ID, selection persistence, reconciliation and shared reactive lifecycle belong to reusable FireUX mechanisms. Core should not contain Kitchen, Portfolio, Project or Property-specific models.
2. **Entity Workspace supplies domain data.** It defines its accessible entities, selected root document reader, permission checks and domain-specific presentation. Selecting Kitchen A gives the workspace Kitchen A's ID and root document fields.
3. **A root Firestore document read does not retrieve subcollections.** Child capabilities fetch their own records when needed, always scoped to the selected Entity ID. Avoid eagerly fetching every child collection on Workspace selection.
4. **Workspace selection should not inherently navigate.** Switching Kitchen A to Kitchen B normally changes the data in focus while the current capability page stays open. Navigation/layout/router already own navigation policy. If a deeply nested record route is invalid for the newly selected Entity, handle that at the routing/page boundary—not in a domain-specific switcher.
5. **Navigation names domain capabilities.** The UI hierarchy, components, composables and Firestore layout should be designed together and documented as a deterministic mapping. Do not let the three trees drift independently.
6. **Storage follows cardinality and access needs.** Distinguish root nested fields/maps, single-document capabilities, and multi-document catalogues. A Firestore subcollection can contain one document. Firestore paths must alternate collection/document segments.

## Current findings to verify against HEAD

Previous source audit reported:
- `useWorkspace(family)`: selected ID, Nuxt state/cookie persistence, reconciliation.
- `defineWorkspace(create)`: shared instance/lifecycle.
- `useWorkspaceRecord`: access-aware selected-record read and stale-result guarding.
- `useWorkspaceSwitch`: access checks and route navigation before selection.
- Kitchen and Property reportedly adopted guarded switching; Project and Portfolio reportedly exposed direct `selection.select`.

These observations come from the prior conversational audit and **must be verified afresh in the repository**; they are not an assertion that HEAD still matches.

### Design question for Codex

Do we still need `useWorkspaceSwitch` as a separate composable? If it primarily enforces route navigation, simplify or relocate that policy to routing/layout rather than maintaining another selection mechanism. Preserve access verification and stale-data safety. Do **not** blindly replace all guarded switching with direct selection until nested-route handling is tested.

## Proposed naming convention for review

- **Domain models/entity types:** singular, PascalCase (`Kitchen`, `Horse`, `Menu`).
- **Firestore collection IDs:** plural, kebab-case (`kitchens`, `feeding-plans`).
- **Vue component names:** PascalCase.
- **Composable functions:** camelCase (`useKitchenWorkspace`).
- **URL and Firestore path segments:** kebab-case where applicable.
- **Singleton fixed document IDs:** descriptive and stable (`identity/details`, `settings/preferences` are examples).

**Important:** Audit existing FireUX canon and shipped schemas **before enforcing or renaming**. Existing actual paths (e.g. `prep-items`) take precedence until a deliberate migration is approved. Treat the rules above as proposed, not an instruction to silently rename production data.

## Illustrative Stable Workspace contract

| UI capability | Component/composable capability spine | Possible Firestore path | Shape |
| --- | --- | --- | --- |
| Overview | `workspace/overview` | `stables/{stableId}` | Root document / aggregated views |
| Identity | `workspace/identity` | `stables/{stableId}/identity/details` | Singleton (or root map if justified) |
| Horses | `workspace/horses` | `stables/{stableId}/horses/{horseId}` | Collection |
| Horses / Health | `workspace/horses/health` | `stables/{stableId}/horses/{horseId}/health/{recordId}` | Nested records |
| Facilities / Stalls | `workspace/facilities/stalls` | `stables/{stableId}/stalls/{stallId}` | Collection |
| Facilities / Pastures | `workspace/facilities/pastures` | `stables/{stableId}/pastures/{pastureId}` | Collection |
| Care / Feeding | `workspace/care/feeding` | `stables/{stableId}/feeding-plans/{planId}` | Collection |
| Staff / Shifts | `workspace/staff/shifts` | `stables/{stableId}/shifts/{shiftId}` | Collection |
| Clients / Owners | `workspace/clients/owners` | `stables/{stableId}/owners/{ownerId}` | Collection |
| Bookings / Lessons | `workspace/bookings/lessons` | `stables/{stableId}/lessons/{lessonId}` | Collection |
| Finances / Invoices | `workspace/finances/invoices` | `stables/{stableId}/invoices/{invoiceId}` | Collection |

This table intentionally demonstrates that *logical navigation parents* need not create extra Firestore levels. If strict path mirroring would be valuable, propose it explicitly and examine query/security implications first. These paths are not deployed-schema claims.

## Codex task — audit first, implement only bounded fixes

1. Inspect the current Core workspace composables and the Kitchen, Project, Portfolio and Property domain workspace consumers. Record real files, routes and data paths.
2. Build a **side-by-side audit** for each capability: sidebar/navigation label → route → Vue component → composable/reader → Firestore document/collection. Mark exact matches, deliberate aliases and unexplained drift.
3. Identify Core responsibilities that belong to routing/layout or domain readers. Propose the smallest corrective changes. Avoid large refactors and new abstractions without a concrete need.
4. Confirm which Kitchen data lives as root document fields, nested maps, singleton documents, or subcollections. Use actual code paths and mark anything requiring live Firestore verification.
5. Define the canon's naming and storage rules *compatible with existing data*. Document deliberate exceptions and any potential migrations; do not perform Firestore migrations in this task.
6. Add focused tests for initial selection, switching between Entities on the same capability page, stale read suppression, access revocation, logout, missing document, and a deeply nested record route.
7. Update canon documentation with verified outcomes; report code changes separately from recommendations.

## Acceptance criteria

- One reusable selected-Entity context across Kitchen, Project, Portfolio and Property; no domain knowledge leaking into Core.
- Child capability reads are correctly scoped by selected Entity and do not load all subcollections eagerly.
- Switching selection ordinarily retains the current capability route; invalid record-specific routes are handled safely and explicitly.
- A human or AI can reliably trace the same capability across navigation, component/composable spine and Firestore.
- Existing persisted data remains readable; no unapproved renames or migrations.
- New architecture is **simpler** than the old, not another orchestration layer.

## Delivery instruction

Start with an evidence-based audit and a concise change proposal. Make the smallest safe repository changes and tests after verifying the actual HEAD contracts. Do not implement the Stable example or perform live-data migrations.
