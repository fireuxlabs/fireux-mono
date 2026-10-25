# Layouts spine map

Updated: 2026-10-25
Ref: ce2861c77
Role: map, not canon

## Purpose and authority

Map Nuxt route rendering and shared chrome ownership. Nuxt owns the layout and
`NuxtPage` APIs; see the [Nuxt integration map](nuxt4.md) for upstream docs.
Current source establishes implementation. FireUX's accepted Workspace route
composition is recorded here; this map does not make another route-rendering
layout pattern universal.

## Links

- Parent: [Nuxt integration](nuxt4.md)
- Siblings: [pages](pages.md), [components](components.md),
  [App configuration](app-config.md)
- Workspace family: [Workspace and Entity](family-workspace-entity.md)

## Workspace composition

[AppShell](../../packages/core/fireux-core/src/runtime/app/components/Shell.vue)
selects the named `Workspace` composition when the current route has
`workspacePage` metadata. Workspace routes disable the separate Nuxt layout.
Other routes continue through `<NuxtLayout><NuxtPage /></NuxtLayout>`.
Apps with a custom root shell use the same route metadata and named Workspace
composition; see the [Find My SEO app root](../../projects/fireux/find-my-seo-app/app/app.vue).

Core [Workspace](../../packages/core/fireux-core/src/runtime/workspace/components/Index.vue)
composes the dashboard group, sidebar and one
[WorkspacePage](../../packages/core/fireux-core/src/runtime/workspace/components/Page.vue).
WorkspacePage owns the panel, shared
[Navbar](../../packages/core/fireux-core/src/runtime/workspace/components/Navbar.vue),
[breadcrumbs](../../packages/core/fireux-core/src/runtime/workspace/components/Breadcrumbs.vue),
route error boundary and the Workspace `<NuxtPage />` outlet. The navigation
composable derives the page title, description and breadcrumb ancestors from
route metadata and registered Workspace navigation. Group index links use the
ordinary [WorkspacePageLinks component](../../packages/core/fireux-core/src/runtime/workspace/components/PageLinks.vue).
Core disables page transitions for Workspace routes through
[pages-config.ts](../../packages/core/fireux-core/src/config/module/pages-config.ts)
so the shared frame remains mounted while its page outlet changes.

Workspace pages supply their domain content and route metadata. Shared chrome
does not acquire domain data or mutation authority. Prefer named components
with typed props and events; use Nuxt UI's supported named slots when extending
its native components. Do not add another custom slot shell around each route.
Nested Nuxt pages remain valid where the route tree has a real parent/child
relationship.

## Other route composition lanes

- AppShell's non-Workspace branch composes the selected Nuxt layout and page.
- The Kitchen [Menu layout](../../packages/extensions/fireux-kitchens/src/runtime/layouts/menu.vue)
  uses Nuxt's layout slot for route-family chrome.
- Core [default](../../packages/core/fireux-core/src/runtime/layouts/default.vue)
  and [dashboard](../../packages/core/fireux-core/src/runtime/layouts/dashboard.vue)
  plus [La Tap Berne](../../projects/misebox/la-tap-berne/app/layouts/latap-default.vue)
  retain direct `NuxtPage` rendering. Inspect their route, parent and transition
  ownership before changing them; the Workspace contract does not generalize to
  these separate lanes.
- App-local layouts remain appropriate for real product chrome. Compare the
  nearest package or Ecosystem owner and keep the App-specific delta explicit.

## Accepted boundaries

| Boundary | State | Reason |
| --- | --- | --- |
| Workspace route metadata selects one named shared composition | `accepted` | Sidebar, page frame, Navbar and breadcrumbs have one owner. |
| WorkspacePage owns one shared route outlet | `accepted` | Route pages provide content without repeating the Workspace frame. |
| Native Nuxt UI slots extend native components | `accepted` | They are supported library composition APIs, not replacement page shells. |
| Other layouts render pages directly | `to-confirm` | Their route and transition owners must be proved independently. |

## Verification and refresh

Inspect AppShell, route metadata and generated routes, the nearest non-Workspace
layout, and actual parent/child routes. Confirm each page renders once at its
intended boundary; retain sidebar, session, transition, error and nested-route
behavior. Refresh this map when the shell owner or route metadata contract
changes. See [components](components.md) for shared component responsibilities
and [Workspace composition](workspace.md) for domain boundaries.
