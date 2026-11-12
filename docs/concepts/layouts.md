# Layouts spine map

Updated: 2026-11-07
Ref: a38377207
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
| Public pages and Entity indexes/details  | FireuxApp or the App root supplies NuxtPage to NuxtLayout | Layout owns site chrome; Entity routes compose their named content, readers and actions |
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

The public [app.vue guide](../../packages/extensions/fireux-docs/src/runtime/pages/docs/app.vue) compares Nuxt, Nuxt UI and FireUX and explains the supported root constraints.

Core [FireuxApp](../../packages/core/fireux-core/src/runtime/app/components/FireuxApp.vue)
owns the stock UApp provider, PWA status, normal-page fallback, shared head policy and
current-App initialization blocker. Workspace-capable Apps compose it through `FireuxWorkspaceApp`; ordinary Apps
use it directly,
including the [starter](../../projects/templates/fireux-template/app/app.vue).
The starter home uses native UPage/UPageHeader beneath the default layout; the
layout supplies its only container. Repeating UApp plus Workspace/NuxtLayout in an App root bypasses that lifecycle
and is not a stock alternative.

[Go QR](../../projects/fireux/go-qr/app/app.vue) retains one explicit exception:
`/tools/` uses a UApp-wrapped NuxtPage without ordinary site chrome or App
initialization. Other Go QR routes still use FireuxApp.

Bangin Coffee and La Tap retain App-owned theme injection around their chosen root;
Interlaken Essen retains its language metadata. These are product deltas, not
alternative route outlets or initialization owners. They remain with those Apps.

For ordinary routes, FireuxApp supplies one `UMain` around `NuxtPage` inside the
selected Nuxt layout's slot. Layout headers, footers and navigation remain
outside that landmark. Layouts, route pages and their child components do not
add another `main`. This also covers routes with `layout: false`.
WorkspacePage owns the Workspace `main`; that branch does not receive another
FireuxApp wrapper. Go QR's embedded branch and the standalone ErrorPage each own
their own `UMain` because they bypass the ordinary shell.

`useAppHead` owns shared robots and versioned-manifest policy.
`AppInitializationGate` owns its single App read and setup modal. Workspace
manifest paths are supplied by FireuxWorkspaceApp; the ordinary root imports no
Workspace code. The default header still uses the Workspace entry-link helper;
this root split does not establish complete Workspace bundle isolation. Shared
sign-in phase belongs to Core `composables/fireux/firebase/useAuthPhase`, not Workspace.

[AppDevControls](../../packages/core/fireux-core/src/runtime/app/components/DevControls.vue)
owns the developer dock and its local feedback/cleanup. It consumes existing
Diagnostics state and the existing media-sync command; moving the controls does
not move command authority into FireuxApp or create another App reader.
FireuxApp places it inside native `DevOnly`, whose production transform removes
the component reference before bundling. The controls component must be absent
from production executable code; a hidden template alone does not satisfy this
boundary.

The focused foundation rules in `eslint.config.js` check semantic styling and
SFC block order for App roots and the reviewed shared shell/chrome/disclosure
owners. Other existing Core styles remain migration debt; that scoped check
is not a repository-wide styling certificate.

Ecosystem Main Apps with Workspaces open their registered Workspace entrance
through a native index route; public Home stays at `/home`. FireUX keeps its
public root. See [App configuration](app-config.md#app-entrance-and-optional-workspace).
Separate Workspace domains remain a future product decision.

## Workspace composition

[FireuxWorkspaceApp](../../packages/core/fireux-core/src/runtime/app/components/FireuxWorkspaceApp.vue)
lazily selects the named `Workspace` composition when the App declares
Workspaces and the current route has
`workspacePage` metadata. Workspace routes disable the separate Nuxt layout.
Other routes continue through `<NuxtLayout><NuxtPage /></NuxtLayout>`.
App roots delegate that choice to FireuxWorkspaceApp instead of repeating the route branches.

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

- FireuxApp owns the normal layout and page fallback. FireuxWorkspaceApp supplies
  its default slot only for Workspace routes; ordinary routes reuse the fallback.
- The Kitchen [Menu layout](../../packages/extensions/fireux-kitchens/src/runtime/layouts/menu.vue)
  uses Nuxt's layout slot for route-family chrome.
- Core [default](../../packages/core/fireux-core/src/runtime/layouts/default.vue),
  [landing](../../packages/core/fireux-core/src/runtime/layouts/landing.vue),
  [auth](../../packages/core/fireux-core/src/runtime/layouts/auth.vue),
  [diagnostics](../../packages/core/fireux-core/src/runtime/layouts/diagnostics.vue)
  and [dashboard](../../packages/core/fireux-core/src/runtime/layouts/dashboard.vue)
  consume NuxtLayout's native slot. FireuxApp or the App root supplies NuxtPage.
  Auth and Diagnostics retain their client-only boundary; the other layouts
  retain their existing chrome. This follows [Nuxt's layout composition](https://learn.nuxt.com/en/concepts/layout).
- The neutral `landing` layout remains in Core for shared public and Chat shells.
  Commercial/public content and landing styles are registered by `fireux-app/layer`;
  Main discovery composition is registered by `fireux-ecosystem/layer`.
- Core's [page policy](../../packages/core/fireux-core/src/config/module/pages-config.ts)
  disables page transitions for Workspace routes and routes using the Dashboard
  layout. Dashboard policy follows inherited layout metadata, including nested
  pages, and respects an explicit layout override. It runs at `pages:resolved`,
  after Nuxt extracts route metadata. Core requests native extraction of the
  `layout` key explicitly; Dashboard's fragment-based pages retain their
  previous unanimated behavior.
- App/package layouts also consume native slots:
  [Docs](../../packages/extensions/fireux-docs/src/runtime/layouts/docs.vue),
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
and its [regression check](../../packages/core/fireux-core/src/test/composables/navigation/useDashboardNav.test.mjs).

WorkspacePage supplies the native document-title fallback from its shared route
title. Domain pages can still provide their more specific head metadata.

## Verification and refresh

Inspect FireuxApp, route metadata and generated routes, the nearest non-Workspace
layout, and actual parent/child routes. Confirm each page renders once at its
intended boundary; retain sidebar, session, transition, error and nested-route
behavior. Refresh this map when the shell owner or route metadata contract
changes. See [components](components.md) for shared component responsibilities
and [Workspace composition](workspace.md) for domain boundaries.

`app-shell-composition.test.mjs` renders the ordinary, Docs, bare, Workspace and
embedded compositions and checks their single content landmark. A fresh
production build and route review verify native component behavior and the
absence of executable developer-control code in the client and server artifacts;
template tests
alone do not prove production isolation.
