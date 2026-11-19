# Workspace

Updated: 2026-11-17
Ref: f798e3e99
Role: map, not canon

Business is an additional Workspace Entity owned by `fireux-businesses`. Its first tools are business profile/contact editing, optional Place links and the organisational Team roster. Current source and authority are routed through `packages/extensions/fireux-businesses/docs/ai/businesses-context.md`.

## Purpose and authority

Map shared Workspace mechanics, domain-owned capabilities and their current
adoption. Inherit `../../AGENTS.md` and `../ai/gpt-context.md`. Current source
and executable checks establish behaviour; this map routes into that evidence.
The detailed family inventory and deltas belong in
[family-workspace-entity.md](family-workspace-entity.md).

The product hierarchy is Workspace → Capability → Tool → authorized command.
Workspace is a working surface over an Entity, not another Entity, storage owner
or compulsory controller layer. A navigation group adds an overview entrance,
not another data or authority layer.

Related maps: [repository](fireux-mono.md), [components](components.md),
[runtime placement](runtime-filesystem.md), [pages](pages.md),
[capability grammar](family-workspace-capability-tool.md), and
[tenant/global composition](family-tenant-global.md).

## Ownership

```text
App → Ecosystem → Extension → Core

Core                    Shared Workspace mechanics and proved controls
Domain Entity runtime   Identity, capabilities, authority, records and commands
Ecosystem / App         Product composition, enabled surfaces and App policy
```

- Core owns selection mechanics, entry resolution, the named Workspace
  composition and its shared page frame, plus Identity and Team interaction
  primitives.
- Domains supply accessible Entity collections, canonical readers, fields,
  roles, invitations, capability rules and trusted commands. Sharing a control
  does not transfer its authority to Core.
- Apps own deployment, branding, configured navigation and route adapters.
  Ecosystems own genuine cross-extension composition. Neither copies a lower
  owner's implementation.
- An independently owned child Entity retains its models and commands even when
  another Entity's Workspace manages it. UI grouping does not decide storage.

Current Core entrypoints under `packages/core/fireux-core/src/runtime/`:

- `workspace/composables/useWorkspace.ts`: active Entity selection.
- `workspace/composables/useWorkspaceEntryCta.ts`: App-aware entry links.
- `workspace/components/EntitySwitcher.vue`: selected-Entity switching control.
- `app/components/FireuxApp.vue`: one native layout and page outlet.
- `app/composables/useAppManifest.ts`: configured native Workspace manifest path.
- `layouts/workspace.vue`: native sidebar, Workspace frame and shared controls.
- `workspace/components/Page.vue`: dashboard panel, main and supplied page slot.
- `workspace/components/Navbar.vue` and `Breadcrumbs.vue`: shared page framing.
- `workspace/components/PageLinks.vue`: group navigation as page content.
- `composables/fireux/useIdentity.ts` and `useWorkspaceTeam.ts`: shared interaction state.
- `workspace/components/Team/`: Editor, People, Assignment and Roles controls.

## Home, Overview, groups and children

These are separate responsibilities:

| Surface         | Job                                                                                                             |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| Home            | Resolve the selected Entity, offer switching or permitted creation, and provide the product's working entrance. |
| Overview        | Summarise the selected Entity across its implemented capabilities.                                              |
| Group index     | Introduce a related set of child capabilities, with one useful surface per child.                               |
| Capability page | Do the named domain work with its own controls and authority.                                                   |
| Record page     | Inspect or edit a record when the journey needs a separate destination.                                         |

The [Workspace sidebar](../../packages/core/fireux-core/src/runtime/workspace/components/Sidebar.vue)
links the App wordmark to the configured public `homePath`. Compact mode uses
the App logo for the same link. Signed-in users can also reach App Home from
their account menu. The [Entity switcher](../../packages/core/fireux-core/src/runtime/workspace/components/EntitySwitcher.vue)
opens one menu from the selected Entity's avatar, name or chevrons when choices
are available. Compact mode opens the same menu from the avatar. Both menus
offer the active family's Workspace Home followed by its available Entities.
With no switching choices, the control links directly to Workspace Home.

Kitchen's inspected navigation places shared Identity & brand and Team before
Misebox domain groups, with Settings after domain work.
Other families retain their own declared navigation; this is not a claim that
all have adopted Kitchen's grouping or need the same number of groups.

Pages select Core's native `workspace` layout through `layout: 'workspace'`.
FireuxApp supplies the same page outlet used by every other native layout.
Workspace composes the persistent sidebar, one page frame and shared
Navbar/Breadcrumbs; the frame consumes the supplied page slot and owns its main
and error boundary. Group indexes use `WorkspacePageLinks` as ordinary content. Route
pages provide their domain surface without repeating the outer panel or header.
The retired GroupPage shell is not the target for new routes. Apply the canonical
[component API rule](components.md#component-apis-and-extension-points), including
its bounded shared extension points. See the
[layouts map](layouts.md#workspace-composition) and
[component map](components.md#workspace-composition).

Group-parent components directly compose their introduction and supported
overview, actions, AI and child summaries. One domain-owned
`use{Entity}Workspace{Capability}()` mounts their real shared coordination;
responsible children consume that owner through named child Workspace composables,
with strict internal lookup rather than public `State` APIs. See the
[group composition contract](family-workspace-entity.md#workspace-group-overview-composition)
for Kitchen Menu/Prep source examples and bounded adoption. Native framing and
record editors retain their own owners. The group owner is a logical scope, not
an assumption that a Vue ancestor persists across route navigation. Menu/Prep
provide document-oriented examples; Orders retains its operational application
composition. Do not mount editing controllers merely to calculate overview
counts; status comes from records and policy, not AI.

## Breadcrumbs

`useWorkspacePageNavigation` owns the shared trail consumed by native
`UBreadcrumb`. Core's `WorkspacePage` mounts `WorkspaceBreadcrumbs` once, before
the route content; domain page headers and children do not mount another trail.
An explicit registered `nav.groupIndex` suppresses its trail, including nested
group indexes. A trail containing only the current-page label is also omitted
because it supplies no ancestor navigation. This covers Home, Overview and
standalone entrances without per-page suppression flags or URL-depth rules.
`WorkspaceBreadcrumbs` renders no empty breadcrumb landmark.

Child and detail pages retain useful registered ancestor links and their
unlinked final current item. Workspace Home and Overview are not prepended;
the sidebar and selected-Entity navigation retain those entrances.

This simplification does not invent ancestry from individual URL segments or
read record names. Existing registered ancestor matching remains unchanged.
Full record/section ancestry and resolved identity need domain-owned metadata;
a generic detail label is not evidence of a record's name.

## Page introductions

Core's [WorkspacePageHeader](../../packages/core/fireux-core/src/runtime/workspace/components/PageHeader.vue)
is the shared Workspace introduction presentation, built on native `UPageHeader`.
It accepts reactive `title` and `description` props, an optional `actions` slot,
and `variant="primary"` (default) or `variant="child"`. A group index or
standalone working entrance uses primary; a group's child capability uses the
quieter child presentation. For example, Kitchen `/menu` uses primary and
`/menu/items` uses child. Choose by the named capability/navigation relationship,
never URL depth or the presence of an index filename.
Both variants retain native `h1` semantics for a separate page. Sections within
that page use their own `h2` headings, not another page header.

The frame retains Navbar, breadcrumbs, document-title fallback and route outlet.
By default it renders only the static navigation description through this shared
component, preserving existing pages that already own their title and actions.
A page with its own introduction declares `workspaceHeader: 'content'` in
`definePageMeta` and renders exactly one `WorkspacePageHeader` in its domain
composition. This suppresses the frame description; it does not replace the
Navbar or breadcrumbs. Keep `nav.label` as the stable navigation label. Dynamic
record wording is passed directly from the existing domain reader/context;
there is no shared header reader, global registration or child-to-parent state.

```vue
<WorkspacePageHeader
  title="Food & drink"
  :description="description"
  variant="primary"
/>
```

The corresponding route declares `workspaceHeader: 'content'`. Replace the
existing page introduction when adopting this API; do not stack it alongside
another `h1`, local collection header or frame description. Domain commands and
action controls keep their existing owners. Existing specialised record headers
are not automatically replaced by this bounded introduction pattern.
Existing Workspace surfaces have not all adopted these shared variants; align
the complete introduction and route metadata when touching that boundary.

Group descriptions name their actual child capabilities. Useful spanning status
or actions may accompany their entrances; detailed workflows remain child-owned.
Optional AI supports these responsibilities rather than defining page anatomy.
Simple navigation groups do not require dashboards or extra reads.

## Workspace AI presentation

`WorkspaceAICompact` owns child-page chat layout: an optional labelled,
keyboard-focusable `results` region with bounded scrolling, followed by the
composer. It defaults to `WorkspaceAICompactComposer`, a one-row inline prompt bar, and accepts `v-model`,
`placeholder`, `ariaLabel`, `resultsLabel`, `submitting`, `disabled`, `canSubmit`
and `@submit`. A `composer` slot accommodates the existing domain composer with voice/file
controls. That domain composer must use `WorkspaceAICompactComposer` for its
compact branch, placing microphone/file buttons in its `actions` slot. This
shared prompt bar places those actions and Send beside the native textarea,
with no model badge or persistent suggestions. It retains native keyboard and
IME handling, grows to four rows, and guards disabled/busy/empty submissions.
The full `WorkspaceAIComposer` remains the group-page presentation; setting
`spacious=false` alone does not turn that full composer into the compact bar. The `results` slot retains domain
messages, errors and confirmation controls; supply it only when there is content.
This component adds no conversation state, provider or authority. Use it directly
rather than nesting it inside another WorkspaceAI section. Existing domain
Assistant controllers remain mounted once and own their lifecycle. See the
[compact surface checks](../../packages/core/fireux-core/src/test/workspace/components/AICompact.test.mjs).

Core's `workspace/components/AI/Composer.vue` is the shared prompt control.
Use `WorkspaceAIComposer spacious` for a group index: three initial text rows,
growing to twelve. Child capabilities use the same composer without `spacious`:
one initial row, growing to four. Native UChatPrompt retains textarea resizing,
keyboard submission and accessible controls. Choose the size explicitly by page
responsibility, not URL depth. `WorkspaceAI compact` controls the surrounding
section spacing; it is separate from composer size.

Group chat sits after the page introduction and useful group summaries. Child
chat stays inline near the page introduction, before its working collection or
controls; it is not hidden in More or an App-specific slideover. Keep one chat
surface per capability. The smaller surface still exposes its prompt and result;
compact does not mean removing AI from child pages.

Domain AI components supply prompt state, suggestions, messages/errors, scoped
context and supported action handlers. They reuse the page's existing context
and retain confirmation, permission, cancellation and stale-result checks. Core
adds no provider call, domain read or global conversation. Suggestions remain
optional and should fit the capability. The Kitchen Menu group consumes the
spacious composer; child adoption uses the same API and existing domain owner.

Kitchen composes one named assistant through its
[`Workspace/AI/Focus.vue`](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/AI/Focus.vue)
presentation. The explicit `kitchen-ai.*` name identifies its supplied working
focus; it is not another agent, record owner or authorization layer. Connected
Home/Menu/People children keep their own controllers and allowed actions. Other
working pages may expose an honest disabled placeholder using the same native
composer controls. Group placeholders use the spacious composer; children use the
compact one. The Context disclosure links existing operator background and labels
unconnected area-specific context. It adds no provider, record reader or write.
The owning Misebox context and Kitchen's focused UI tests track this bounded
composition; do not copy a second focus catalogue into Core.

## Component organisation

Entity implementation lives under `src/runtime/<entity>/<technical-role>`.
Component audience and lower-domain admission follow the canonical
[component convention](components.md#domain-component-surfaces). Use the owning
registration and real consumers to locate the current cutover; a folder listing
is not another placement rule.

Domain capabilities are not universal Workspace machinery. Kitchen Services,
for example, owns menu selection and serving policy; other industries do not
inherit that meaning merely because they also use the word service.

Operator capability screens follow the canonical
[component surface convention](components.md#domain-component-surfaces), including
complete Identity, Team and operational UI. Workspace component grouping does
not make every capability shared framework machinery or require selected-Entity
injection. Existing direct-Entity capability paths are pending alignment until
their registration and real consumer cutover is complete; they are not another
canonical placement. Readers, state and commands retain their current owners.

## Selection and entrances

One active Entity ID is shared selection state. Its accessible collection and
permissions remain domain-owned. A saved ID grants no read or write authority.

- Restore a valid last selection; wait for access to settle before fallback.
- Loading and errors must not appear as an empty accessible collection.
- A settled non-empty collection retains a valid selection; confirmed empty
  access permits no selection.
- Core persists the last selection in an App/family cookie for one year on the
  current host and synchronises cookie changes between tabs. There is no separate
  Primary Kitchen preference.
- A capability list can change selection in place. The Kitchen Menu section
  route declares its safe exit with `workspaceSwitchTo`. Core commits the switch
  after that exit succeeds and the choice is still current and allowed.
  Other record pages retain the existing registered-parent fallback.

Home is available as a surface even before a domain record exists. Creation and
attachment use existing domain commands, access checks and capacity policy;
there is no universal `crud.create` shape required of every controller.

Misebox keeps public discovery, authentication and Kitchen Workspace on one
host: public directory Home is `/`, `/home` redirects to that canonical entry,
and Kitchen Workspace remains at `/workspace/kitchen`. Its
[App-owned entrance contract](../../packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md#apps-and-workspace)
links the owning routes and composition.
BuenoHost and Granite retain `/workspace/property` and `/workspace/portfolio`.
FireUX presents its industry SaaS offering and framework resources at `/` and
keeps Project Workspace at `/workspace/project`.
Tenant Apps retain their customer root and an
App-resolved Workspace entrance. Use `useWorkspaceEntryCta`, not a hard-coded
family path, for shared entry actions.

## Composition and authority

Routes remain thin adapters. Workspace route metadata selects the shared Core
frame; pages provide domain content and may use nested Nuxt outlets only for a
real parent/child route. Follow the
[component API rule](components.md#component-apis-and-extension-points); a shared
slot component does not become another route-rendering owner. Shared page geometry belongs to native Nuxt UI and the
semantic Workspace styles, not authored utility overrides. Workspace introductions use
WorkspacePageHeader over native UPageHeader; the persistent frame still owns Navbar and breadcrumbs. Inspect the
registered route and generated App output rather than inferring behaviour from
a filename. See [layout ownership](layouts.md) for the renderer boundary.

A capability mounts its stateful graph once. Focused descendants consume that
context when shared, while owning their local editing responsibilities. Do not
add duplicate readers, pass-through controllers or universal form schemas.
Small creation/editing actions may stay inline or in dialogs; separate routes
are justified by the actual workflow, not a compulsory create/edit page list.

Route metadata owns route access and selection requirements. Domain commands
retain server-side scope and permission checks; navigation visibility, saved
selection and UI `canWrite` are not authority. Contextual AI may explain state
or prepare supported actions, but does not become another writer or permission
system. Notifications remain User-owned shared presentation.

## Adoption and future industries

| Family               | Current boundary                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Kitchen              | Shared foundation plus capability-first component arrangement and composed group indexes.                                                                    |
| Property / Portfolio | Shared foundation with domain-owned accommodation/property capabilities; capability placement still uses Workspace folders.                                  |
| Project              | Shared foundation with FireUX control-plane capabilities; Identity and Team use capability folders, while remaining capabilities retain Workspace placement. |
| Supplier             | Shared foundation with Supplier-owned catalogue work; capability placement still uses Workspace folders.                                                     |
| Blank                | App-local development harness, not a complete industry product.                                                                                              |

Use [the family map](family-workspace-entity.md) for exact accepted differences,
authority boundaries and proving checks. A shared foundation does not establish
that every capability, route or browser journey is complete.

Future industry work starts with operator needs and named domain owners. Reuse
proved Core mechanics and lower capabilities, then add only the domain behaviour
needed. Do not clone Kitchen's capability list, require six universal pages,
or invent an industry package before real siblings prove common behaviour.

[Ignite's context](../../packages/extensions/fireux-ignite/docs/ai/ignite-context.md)
owns the build/reconciliation method and its evidence contracts. It does not
currently generate or automatically enforce this folder organisation. Misebox
is a reference implementation; independent assembly and acceptance remain
separate evidence.

## Refresh and verification

When owners, registration, entrances or shared contracts change, refresh this
map in the same change. Keep detailed family deltas in the family map and
repo-wide rules in global context; do not accumulate task history here.

For a bounded alignment, trace route → composition → controls → state owner →
commands, including Nuxt component names and indirect consumers. Run the owning
source tests and relevant package/App checks. A file move or green typecheck
alone does not establish composition or a verified user journey. For map-only
changes, verify source pointers and claims and run `git diff --check`.
