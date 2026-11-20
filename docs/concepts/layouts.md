# Layouts spine map

Updated: 2026-11-17
Ref: e20047a13
Role: map, not canon

## Purpose and authority

Map native Nuxt route rendering, content landmarks and shared chrome ownership.
Nuxt owns layout selection, asynchronous layout loading and `NuxtPage`; see the
[Nuxt integration map](nuxt4.md) and the official
[layout guide](https://nuxt.com/docs/4.x/directory-structure/app/layouts).
Current source and exercised checks establish implementation. Human product
requirements establish the intended differences between surfaces.

## Links

- Parent: [Nuxt integration](nuxt4.md)
- Siblings: [pages](pages.md), [components](components.md),
  [App configuration](app-config.md)
- Workspace family: [Workspace and Entity](family-workspace-entity.md)

## Rendering ownership across surfaces

| Surface                                                  | Route outlet owner                            | Content landmark and surrounding UI                                                                                                                             |
| -------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public, Auth, Dashboard, Diagnostics and product layouts | FireuxApp supplies one NuxtPage to NuxtLayout | The selected native layout consumes that slot inside one main; its existing chrome remains outside the landmark.                                                |
| Workspace and Entity capabilities                        | The same FireuxApp outlet                     | Native workspace layout supplies the persistent frame; WorkspacePage owns its main, Navbar, breadcrumbs and error boundary and consumes the supplied page slot. |
| Effective layout: false after middleware                 | The same FireuxApp outlet                     | Rendered route content supplies its own UMain. Empty placeholders and redirect-only pages require no invented content or frame.                                 |
| Genuine nested route                                     | Its route parent                              | A real parent/child relationship can require a nested NuxtPage, as with Kitchen Identity. It shares the selected layout's landmark.                             |
| Go QR embedded tool                                      | Its explicit App branch                       | The existing UApp/UMain-wrapped outlet bypasses ordinary chrome and App initialization.                                                                         |
| Standalone error page                                    | ErrorPage                                     | Its UMain remains independent of the ordinary App shell.                                                                                                        |

One owner applies at each route boundary. A layout consumes the page it receives;
it does not open another page outlet. Layouted route pages and their descendants
reuse that landmark. A public Entity header introduces a record or collection;
a Workspace navbar identifies the operational context. Similar titles do not
merge those responsibilities.

## Layout admission

A new layout needs real repeated route-family chrome or lifecycle ownership.
Name its consumers and the exact difference from the nearest maintained layout.
Use ordinary named component composition for a page-content difference. The
[component API rule](components.md#component-apis-and-extension-points) distinguishes
native slot consumption from a new shared extension API.

A native layout has one real root, consumes the App-supplied page slot and
preserves initialization, transition, cleanup and error behavior. Reuse shared
chrome, semantic styles and tokens. A supported slot does not authorize copying
chrome or creating a universal page/controller wrapper.

## App-root provider ownership

Every ordinary App uses Core
[FireuxApp](../../packages/core/fireux-core/src/runtime/app/components/FireuxApp.vue),
including Apps with declared Workspaces and the
[starter](../../projects/templates/fireux-template/app/app.vue).
It owns one UApp, PWA status, one NuxtLayout/NuxtPage pair, development-only
controls and the current-App initialization blocker. App roots retain genuinely
App-owned theme or language setup around that shared lifecycle.

[Go QR](../../projects/fireux/go-qr/app/app.vue) keeps its deliberate `/tools/`
embed branch. Its other routes use the same FireuxApp. Bangin Coffee and La Tap
retain their theme setup; Interlaken Essen retains its language metadata.
Those product differences do not create another shared route renderer.

[useAppHead](../../packages/core/fireux-core/src/runtime/app/composables/useAppHead.ts)
owns the single reactive theme, robots and versioned-manifest registration.
[useAppManifest](../../packages/core/fireux-core/src/runtime/app/composables/useAppManifest.ts)
owns the App manifest path: a native Workspace layout and enabled family use the
existing `useWorkspaceEntryCta` Home destination as `start_url`; other layouts
use the ordinary manifest. It coordinates route/configuration policy without
loading Workspace UI or acquiring domain records. The manifest endpoint retains
its own scope validation. Rendering and route authority remain separate facts.

[AppInitializationGate](../../packages/core/fireux-core/src/runtime/app/components/InitializationGate.vue)
retains its single App read and setup modal.
[AppDevControls](../../packages/core/fireux-core/src/runtime/app/components/DevControls.vue)
retains its feedback, diagnostics and command owners. Native DevOnly surrounds
its reference so production compilation can remove executable controls; a hidden
interface alone is insufficient proof of production isolation.
Pages that render inline developer notes declare `devNotes: true` in their
Nuxt page metadata. The shared toolbar reads that declaration to enable its note
controls, and the note component owns the content and visibility rendering.

Each native layout owns the UMain around its slot. Workspace delegates this to
WorkspacePage; content that remains bare after middleware owns its UMain; Go QR's embed and ErrorPage own their
existing landmarks. This keeps the public header/footer outside main and avoids
nesting the public root landmark inside the Workspace frame.

Main App entrance purpose remains App-owned. The Workspace-first entrances and
FireUX/Misebox public-root differences are mapped in
[App configuration](app-config.md#app-entrance-and-optional-workspace).

## Workspace composition

Pages select `layout: 'workspace'` through native `definePageMeta`.
Core's [workspace.vue](../../packages/core/fireux-core/src/runtime/layouts/workspace.vue)
is discovered through the native runtime layer and loaded asynchronously by
Nuxt. It composes the existing Dashboard group, Sidebar, WorkspacePage and
User-owned auxiliary controls within one layout root. The layout stays mounted
while its supplied route content changes.

[WorkspacePage](../../packages/core/fireux-core/src/runtime/workspace/components/Page.vue)
owns the panel, [Navbar](../../packages/core/fireux-core/src/runtime/workspace/components/Navbar.vue),
[breadcrumbs](../../packages/core/fireux-core/src/runtime/workspace/components/Breadcrumbs.vue),
main and native error boundary. Its slot consumes the App's page. The boundary
key retains Workspace family, selected Entity and route path so old page state
is disposed when that context changes. Navbar and page-title responsibilities
remain with the existing navigation owner.

Group links use
[WorkspacePageLinks](../../packages/core/fireux-core/src/runtime/workspace/components/PageLinks.vue)
as ordinary content. Group indexes omit breadcrumb trails; other pages show a
trail only when the existing registered navigation provides useful ancestors.
See the [Workspace breadcrumb contract](workspace.md#breadcrumbs).

[Page transition policy](../../packages/core/fireux-core/src/config/module/pages-config.ts)
follows native Workspace and Dashboard layout metadata, including inherited
layouts and the supported layout object shape. Explicit child overrides remain
native. URL prefixes and filenames do not select a renderer or transition policy.

Domain routes retain their own readers, commands, access, selection and visibility
metadata. The Workspace layout grants none of those capabilities. Optional
Workspace availability remains an App configuration and middleware decision.

## Navigation placement

[useNav](../../packages/core/fireux-core/src/runtime/composables/navigation/useNav.ts)
discovers authored `nav` descriptors. `nav.menus` selects navigation placement;
`layout` selects rendering. Their names may coincide without coupling their
meaning. Native Nuxt layout registration remains unchanged.

| Descriptor                                                      | Placement               |
| --------------------------------------------------------------- | ----------------------- |
| No nav descriptor, or nav.hidden: true                          | No entry.               |
| nav.menus absent or empty                                       | The default menu.       |
| One or several explicit menu names                              | Those menu placements.  |
| Any unspecified, named, false, inherited or object layout value | No effect on placement. |

App `navigation.overrides` apply before placement is resolved, followed by the
existing hidden-key, App-role and scope filters. Multiple and cross-menu
placements stay explicit. Only declarations equivalent to the shared default
are redundant; an override of a different inherited placement remains explicit.
No descriptor is created from a URL, layout, authority rule or visible page.
Auth, roles, selection and domain visibility retain their existing owners.

## Runtime layout selection

Landmark review follows effective native layout metadata after middleware. The
Menu projection middleware selects `menu` or `default` for the required Menu id;
that page consumes the selected layout's landmark even though its initial
metadata opts out. Misebox Jobs and Interlaken Essen select their existing named
Jobs layouts. Their inherited route content supplies no additional main.
Sharer's `/shared` opt-out currently serves an empty placeholder; adding visible
content must establish its bare-page landmark owner. Go QR's embed retains its
explicit App-owned landmark. No generic wrapper or URL-derived frame is added.

## Other route families

Core's default, landing, Auth, Dashboard and Diagnostics layouts consume native
slots. Auth and Diagnostics retain their client-only content boundaries.
Dashboard retains its mounted permission filtering and `useAuthRedirect`
lifecycle. Workspace navigation does not replace Dashboard account navigation.

Public Kitchen/Menu discovery keeps its existing default chrome. The Kitchen
[Menu layout](../../packages/extensions/fireux-kitchens/src/runtime/layouts/menu.vue)
retains its customer exit, presentation and kiosk-manifest responsibility.
Public browse, QR, kiosk and ordering routes retain their existing access and
service contracts; moving a landmark does not admit a new layout or capability.

[Docs](../../packages/extensions/fireux-docs/src/runtime/layouts/docs.vue) and the
maintained App-owned product layouts keep their own branding, navigation,
headers, footers, theme and language differences. Their UMain consumes the same
native page slot. The neutral landing layout stays in Core; commercial content
remains with its existing App/Extension/Ecosystem owners.

## Verification and refresh

Inspect the common App root, native layout registration, route metadata, actual
consumers and parent/child outlets. Check one page outlet per boundary, one main,
persistent frame state, error-key cleanup, manifest paths and unchanged authority.
Inspect both public and Workspace navigation after App overrides.

`app-shell-composition.test.mjs` exercises supplied-slot rendering, App lifecycle,
landmarks and all maintained layout/bare-page owners. Focused navigation,
Workspace group, route-auth, entrance, transition and native-default tests cover
their exercised contracts. Native App typechecks and desktop/mobile interaction
review remain required evidence for the consuming result. Production isolation
of developer controls requires a fresh artifact inspection.

Refresh this map with the source owners when rendering, landmark or navigation
contracts change. Keep task status and temporary verification snapshots outside
living context.
