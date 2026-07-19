Console spine map
Updated: 2026-07-19
Ref: 565ebd668
Role: map, not canon

Purpose:
Map the shared console system and domain adapters.

Vertical links:
- Parent: app-config.md
- Child: family-console-entity.md
- Child: family-tenant-global.md

Horizontal links:
- composables.md
- components.md
- pages.md
- debug.md

Shared core:
- `useConsole`
- `useConsoleTargets`
- `useConsoleIndex`
- `useConsoleOverview`
- `useConsoleSelection`
- `useConsoleTeam`

Page surface vocabulary:
- `browse`: an operation collection or operational summary at `/<operation>`.
- `detail`: one record at `/<operation>/[recordId]`.
- `create`: a form at `/<operation>/create`.
- `edit`: a record form at `/<operation>/[recordId]/edit`, or persistent operation settings at `/<operation>/edit`.
- `workflow`: a resumable process at `/<operation>/workflows/<name>/[runId?]`.
- `live`: a real-time command surface at the operation root; it may use an immersive domain layout.

Shared page rules:
- The page directly composes `UDashboardPanel`, `LayoutsConsoleNavbar`, a header slot, and a body slot. Do not hide that route shell in a generic component.
- The page owns high-level width and spacing. Family indexes may stay full width; simple forms may use `panels-narrow`; named domain components own their internal presentation.
- Back navigation and page actions stay in the navbar right slot.
- Create and edit share form behavior. Small primitives such as `ConsoleFormActions` may standardize Save, Cancel, pending, disabled, and status treatment without owning the page.
- New and adopted route access visibility and selection requirements live at top-level page meta; navigation metadata only describes navigation presentation.
- A route opts into only the surfaces its operation needs. A live Orders board does not imply an Orders edit page.
- Route pages stay thin. Domain components own data, permissions, states, and mutations.
- Adopted routes can declare `consoleSurface`; edit routes declare `edit` and live routes declare `live`.
- The console-pages guard enforces the explicit panel/navbar/body contract for visible leaf pages. Only redirects, nested routers, and live layouts are structurally exempt; the guard does not constrain body geometry.
- Tables is the first operation-level edit reference: `/console/kitchen/tables` and `/console/kitchen/tables/edit`.

Allowed domain buckets:
- `core`
- `index`
- `overview`
- `identity`
- `team`
- `operations`
- `sundries`

Component bucket shape:
- Console families carry only the peer buckets their real lifecycle needs.
  `Team` is not mandatory; Project deliberately has none today.
- A bucket may own an `Index.vue` entry when the folder itself is the component rendered by a page.
- Do not mix `Console/X/Overview.vue` with `Console/X/Overview/*`; use `Console/X/Overview/Index.vue`.
- `Team` sits beside `Operations` only when the entity has a real collaboration lifecycle.
- `Operations` is for selected-target work and may contain domain-specific child folders.
- `Sundries` is a temporary quarantine for parked, loose, or underdeveloped console surfaces that are not yet core sheets or confirmed operations.

Index pattern:
- Page renders `ConsoleXIndex`.
- `ConsoleXIndex` renders selected and targets sections.
- `useXConsoleIndex` adapts domain data into shared `useConsoleIndex`.
- Tenant apps can auto-select single configured targets.
- Global apps usually source target IDs from user/app data.
- Target adapters pass the collection `outcome` through `useConsoleIndex`.
  Target presentation orders pending, error, cards, then settled empty; counts
  are not authoritative while a read is unsettled.
- Persisted selection is validated only against a successful target read.
  Pending or failed target reads must not clear a saved selection.

Operations:
- Operations are child surfaces inside a selected console target.
- Operations must not leak into Firestore entity root folders.
- The default operation component spine is entry, optional tools seam, `Read.vue`, optional `Write.vue`, and optional `Detail.vue`.
- A browse entry composes tools first and `Read.vue` for current state. A collapsed write lane is only for a small add/create action that belongs in browse context.
- Persistent operation settings use the operation-level edit route and `consoleSurface: 'edit'`; do not hide configuration inside a browse-page dropdown.
- `Read.vue` lists current records and should link each record to detail when the operation owns record identity.
- `Detail.vue` is justified for operations; it can start as a small selected-record surface and grow detail-level read/write children.
- The matching operation composable is `useXConsoleOperation`; it owns selected target, child collection path, pending/write permissions, and debug wiring.
- Use `Index.vue` only when the operation folder itself needs to auto-import as the rendered component.
- Use named workflow folders only when the operator UI has a real workflow step, such as `Menus/Creation`, `Menus/Process`, or `Menus/QR`.
- Do not use root entity buckets like `Create` inside operations unless the visible scoped workflow is actually named creation.
- Do not promote `Sundries` into a permanent product bucket. A sundry should later graduate into `Operations`, move into a core sheet, or be deleted.

Similarities:
- All console entities need target selection or a selected target.
- Console entities expose access/team only when that lifecycle is real.
- All console indexes should stay thin.

Differences:
- Kitchen has richer operations.
- Supplier has catalogue/item/ingredient operations.
- Portfolio is more private and document/task/compliance oriented.
- Blank is the minimal mirror for testing console spine.

Open questions:
- Demo/test/read-only modes should remain minimally invasive and not infect child operations.
