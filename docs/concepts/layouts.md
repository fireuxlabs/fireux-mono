# Layouts spine map

Updated: 2026-10-26
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

## Rendering ownership across surfaces

| Surface                                  | Route outlet owner                                        | Surrounding UI and content                                                              |
| ---------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Public pages and Entity indexes/details  | AppShell or the App root supplies NuxtPage to NuxtLayout  | Layout owns site chrome; Entity routes compose their named content, readers and actions |
| Auth                                     | The same App-root outlet, inside the Auth layout slot     | Auth keeps its client-only account surface                                              |
| Dashboard and Diagnostics                | The same App-root outlet, inside the selected layout slot | Each layout keeps its navigation; page content stays route-owned                        |
| Workspace, including Entity capabilities | Core WorkspacePage                                        | One shared panel, Navbar, breadcrumbs and error boundary; domain pages supply content   |
| Genuine nested route                     | Its route parent                                          | Kitchen Identity delegates to its real child pages through a nested NuxtPage            |
| Embedded tool                            | Its explicit App branch                                   | Go QR keeps a UApp-wrapped tool outlet without ordinary site chrome                     |

One owner applies at each route boundary. A real parent/child route can require
another outlet; a layout must consume the page it was supplied. A public Entity
header introduces a record or collection, while a Workspace navbar identifies
the active operational context. Similar titles alone do not make them the same
responsibility.

## App-root provider ownership

Core AppShell supplies Nuxt UI's UApp provider. Custom roots compose native
UApp around their existing Workspace and NuxtLayout branches, including:

- [starter](../../projects/templates/fireux-template/app/app.vue)
- [Holzworm](../../projects/fireux/holzworm/app/app.vue)
- [Lifeguard Community](../../projects/fireux/lifeguard-community/app/app.vue)
- [Yellow Velo](../../projects/slap/yellow-velo/app/app.vue)

These roots retain their existing lifecycle and routing; adding UApp does not
opt them into AppShell's initialization. Go QR's embedded branch likewise keeps
its native provider around its distinct tool outlet.

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
- Core [default](../../packages/core/fireux-core/src/runtime/layouts/default.vue),
  [landing](../../packages/core/fireux-core/src/runtime/layouts/landing.vue),
  [auth](../../packages/core/fireux-core/src/runtime/layouts/auth.vue),
  [diagnostics](../../packages/core/fireux-core/src/runtime/layouts/diagnostics.vue)
  and [dashboard](../../packages/core/fireux-core/src/runtime/layouts/dashboard.vue)
  consume NuxtLayout's native slot. AppShell or the App root supplies NuxtPage.
  Auth and Diagnostics retain their client-only boundary; the other layouts
  retain their existing chrome. This follows [Nuxt's layout composition](https://learn.nuxt.com/en/concepts/layout).
- Core's [page policy](../../packages/core/fireux-core/src/config/module/pages-config.ts)
  disables page transitions for Workspace routes and routes using the Dashboard
  layout. Dashboard policy follows inherited layout metadata, including nested
  pages, and respects an explicit layout override. It runs at `pages:resolved`,
  after Nuxt extracts route metadata. Core requests native extraction of the
  `layout` key explicitly; Dashboard's fragment-based pages retain their
  previous unanimated behavior.
- App/package layouts also consume native slots:
  [Docs](../../packages/core/fireux-docs/src/runtime/layouts/docs.vue),
  [Misebox Jobs](../../projects/misebox/misebox-app/app/layouts/misebox-jobs.vue),
  [Friiites templates](../../projects/misebox/friiites/app/layouts/templates.vue),
  [Bären](../../projects/misebox/baeren-ringgenberg/app/layouts/baeren-default.vue),
  [La Tap Berne](../../projects/misebox/la-tap-berne/app/layouts/latap-default.vue),
  [Slap landing](../../projects/slap/slap-app/app/layouts/landing.vue),
  [Yellow Velo landing](../../projects/slap/yellow-velo/app/layouts/landing.vue),
  and [Lifeguard Community default](../../projects/fireux/lifeguard-community/app/layouts/default.vue).
  App roots supply their page; these layouts retain their real brand, navigation,
  content and lifecycle differences. Slap's minimal landing layout keeps a real
  element root around its slot, as required by native layout transitions.
- App-local layouts remain appropriate for real product chrome. Compare the
  nearest package or Ecosystem owner and keep the App-specific delta explicit.

## Accepted boundaries

| Boundary                                                         | State      | Reason                                                                    |
| ---------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------- |
| Workspace route metadata selects one named shared composition    | `accepted` | Sidebar, page frame, Navbar and breadcrumbs have one owner.               |
| WorkspacePage owns one shared route outlet                       | `accepted` | Route pages provide content without repeating the Workspace frame.        |
| Native Nuxt UI slots extend native components                    | `accepted` | They are supported library composition APIs, not replacement page shells. |
| Core Nuxt layouts consume the supplied page through native slots | `accepted` | App roots own the page outlet; layouts own chrome.                        |
| App/package layouts consume the supplied page through slots      | `accepted` | App roots supply the page; branded chrome remains App-owned.              |

Dashboard navigation keeps permission-dependent entries hidden until the
component mounts, using native VueUse mounted state. Cached client permissions
therefore cannot change the server tree during hydration. After mounting, the
existing current-account permission and Workspace checks still govern visibility.
See [Dashboard navigation](../../packages/core/fireux-core/src/runtime/composables/navigation/useDashboardNav.ts)
and its [regression check](../../packages/core/fireux-core/src/test/dashboard-nav.test.mjs).

WorkspacePage supplies the native document-title fallback from its shared route
title. Domain pages can still provide their more specific head metadata.

## Verification and refresh

Inspect AppShell, route metadata and generated routes, the nearest non-Workspace
layout, and actual parent/child routes. Confirm each page renders once at its
intended boundary; retain sidebar, session, transition, error and nested-route
behavior. Refresh this map when the shell owner or route metadata contract
changes. See [components](components.md) for shared component responsibilities
and [Workspace composition](workspace.md) for domain boundaries.
