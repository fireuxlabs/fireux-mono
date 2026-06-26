Console spine map
Updated: 2026-06-26
Ref: c00678d44
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

Allowed domain buckets:
- `core`
- `index`
- `overview`
- `identity`
- `team`
- `operations`

Component bucket shape:
- Every `components/Console/X` family should carry `Index`, `Overview`, `Identity`, `Team`, and `Operations` as peer directories.
- A bucket may own an `Index.vue` entry when the folder itself is the component rendered by a page.
- Do not mix `Console/X/Overview.vue` with `Console/X/Overview/*`; use `Console/X/Overview/Index.vue`.
- `Team` sits beside `Operations` because access/team management is shared by console families.
- `Operations` is for selected-target work and may contain domain-specific child folders.

Index pattern:
- Page renders `ConsoleXIndex`.
- `ConsoleXIndex` renders selected and targets sections.
- `useXConsoleIndex` adapts domain data into shared `useConsoleIndex`.
- Tenant apps can auto-select single configured targets.
- Global apps usually source target IDs from user/app data.

Operations:
- Operations are child surfaces inside a selected console target.
- Operations must not leak into Firestore entity root folders.
- The default operation component spine is entry, `Read.vue`, `Write.vue`, and optional `Detail.vue`.
- The entry composes the operation page, `Read.vue` shows current state, and `Write.vue` owns selected-target mutation.
- Use `Index.vue` only when the operation folder itself needs to auto-import as the rendered component.
- Use named workflow folders only when the operator UI has a real workflow step, such as `Menus/Creation`, `Menus/Process`, or `Menus/QR`.
- Do not use root entity buckets like `Create` inside operations unless the visible scoped workflow is actually named creation.

Similarities:
- All console entities need target selection or a selected target.
- All console entities should expose access/team concepts.
- All console indexes should stay thin.

Differences:
- Kitchen has richer operations.
- Supplier has catalogue/item/ingredient operations.
- Portfolio is more private and document/task/compliance oriented.
- Blank is the minimal mirror for testing console spine.

Open questions:
- Demo/test/read-only modes should remain minimally invasive and not infect child operations.
