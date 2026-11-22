# fireux-workspace

Optional Workspace navigation, selection, and framing for managing Entities.
See the [shared Workspace contract](../../../docs/concepts/workspace.md)
for the division between Workspace, Core Dashboard, Apps, and domain owners.

## Registration

- Declare `fireux-workspace` as a direct dependency when consuming its runtime.
  Enable the module and extend `fireux-workspace/layer` in the App that hosts
  Workspace. Declare the App's supported families through `workspaces`.
- The [module](src/module.ts) registers `Workspace*` components, shared
  composables, styles, and `/workspace.webmanifest`. It orders Workspace
  availability ahead of Core authentication.
- The [native layer](src/runtime/nuxt.config.ts) supplies the Workspace layout,
  native pages, and middleware. It includes the Dashboard shortcut and Workspace
  entrance. An App may control the availability of its entrance.
- Compare [FireUX Blank](../../../projects/fireux/fireux-blank/nuxt.config.ts)
  for a small opt-in and [Misebox](../../../projects/misebox/misebox-app/nuxt.config.ts)
  for a domain consumer. [Go QR](../../../projects/fireux/go-qr/nuxt.config.ts)
  uses Core without Workspace.

## Selection

[`useWorkspace(family)`](src/runtime/workspace/composables/useWorkspace.ts)
shares the active ID across an App and family. It synchronizes Nuxt state with a
host-local cookie, including changes from other tabs. Reconciliation runs only
when the accessible collection settles. It retains a permitted ID, otherwise
chooses the first available ID or clears selection. `defineWorkspace` shares one
domain controller per Nuxt App and disposes it after its last consumer unmounts.

The domain supplies its current access and permitted records. Use
[`useWorkspaceRecord`](src/runtime/workspace/composables/useWorkspaceRecord.ts)
for the access-bounded selected record contract. When switching requires leaving
a detail route, [`useWorkspaceSwitch`](src/runtime/workspace/composables/useWorkspaceSwitch.ts)
uses the declared `workspaceSwitchTo` or the registered fallback. It commits only
after navigation succeeds and the requested selection is still current and allowed.
See [Kitchen's controller](../fireux-kitchens/src/runtime/kitchen/composables/workspace/useKitchenWorkspace.ts).

## Layout

Domain routes select `layout: 'workspace'`. The
[layout](src/runtime/layouts/workspace.vue) supplies a persistent sidebar and one
[page frame](src/runtime/workspace/components/Page.vue). The frame owns the
Navbar, shared introduction, breadcrumbs, route-content slot, and Workspace
manifest head link. Its error boundary keys content by family, selected Entity,
and route path, so obsolete page state is disposed. Domain pages supply their
own work and may use a nested outlet where the routes actually nest. Shared entry actions resolve the App's destination via
[`useWorkspaceEntryCta`](src/runtime/workspace/composables/useWorkspaceEntryCta.ts).

### Breadcrumbs

The frame mounts one [breadcrumb trail](src/runtime/workspace/components/Breadcrumbs.vue)
from registered navigation metadata. Group indexes and trails with only a current
item omit the landmark. Detail routes supply any domain-specific ancestry or title.

### Page introductions

The frame renders the route's static navigation description by default.
A route with `workspaceHeader: 'content'` supplies its own
[`WorkspacePageHeader`](src/runtime/workspace/components/PageHeader.vue) and
keeps the shared Navbar and breadcrumbs. Use the primary variant for a group or
standalone entrance and the child variant for a child capability.

### Workspace group overview composition

A group entrance names its supported overview, actions, and child links.
The domain owns its stateful coordination and mounts it once per actual host.
Children reuse that scope where needed and retain their own interaction and
command boundaries. Sibling routes may mount separate hosts. The shared frame
does not imply that a provider persists across routes. See
[Kitchen Menu](../fireux-kitchens/src/runtime/kitchen/components/Workspace/Menu/Index.vue).

## Verification

Core's source-owned [selection](../../core/fireux-core/src/test/workspace-selection.test.mjs),
[Entity projection](../../core/fireux-core/src/test/workspace-entity-projection.test.mjs),
and [installation](../../core/fireux-core/src/test/installation.test.mjs) checks
cover selected scope and integration. Compare generated registration in the
actual App when changing module or layer wiring.
