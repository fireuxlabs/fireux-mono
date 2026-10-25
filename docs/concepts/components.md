# Components spine map

Updated: 2026-10-25
Ref: ce2861c77
Role: map, not canon

## Purpose and navigation

Define where FireUX component responsibility belongs and how components consume
the shared design system. Inherit [AGENTS.md](../../AGENTS.md) and
[global context](../ai/gpt-context.md). Source and registration establish current
behavior; accepted product decisions define the intended contract.

- Parent: [Nuxt UI integration](nuxt-ui.md).
- Related: [composition boundaries](lasagne.md), [pages](pages.md),
  [composables](composables.md), [runtime ownership](runtime-filesystem.md),
  [theming](theming.md), [component families](spine.md).
- Domain maps: [Workspace Entities](family-workspace-entity.md),
  [collections](family-entity-collection-page.md),
  [Entity detail](family-entity-detail.md), [cards](card-family.md),
  [Menu](family-menu.md), [landing templates](landing-templates.md).

## Design-system ownership

FireUX uses one design system built on Nuxt UI:

| Owner              | Responsibility                                                                         |
| ------------------ | -------------------------------------------------------------------------------------- |
| Nuxt UI            | Native controls, accessibility and supported props, slots and events.                  |
| Core design system | Shared tokens, semantic styles, typography and proved interaction or layout contracts. |
| Domain composition | Domain sections, copy, workflows, readers and commands.                                |
| App                | Product framing, branding, routes and deliberate App policy.                           |

Use the repository-wide authored-utility rule in
[global context](../ai/gpt-context.md#ui-and-design-system). This map owns
component responsibility and placement; it does not repeat the utility rule.

Core's [main.css](../../packages/core/fireux-core/src/runtime/assets/styles/main.css)
and [main.scss](../../packages/core/fireux-core/src/runtime/assets/styles/main.scss)
are the shared style entrypoints. The existing atoms, molecules, organisms and
integration styles organize semantic CSS responsibilities; they are not a
second Vue ownership tree. Reuse named tokens and current style owners. Domain
CSS owns real domain-specific media, print or specialist geometry.

## Composition and authority

A route supplies route metadata and composes its owning page surface. A shared
frame supplies platform structure. Domain sections supply domain meaning.
Focused controls consume one coordinator and supported domain commands.

Give every child a real responsibility. Keep small cohesive controls local when
extraction adds no useful boundary. Do not create a wrapper for every Nuxt UI
control, forwarding-only components or empty controllers. A visible component
does not own mutation authority. Preserve its reader, lifecycle, accessibility,
pending/error states and stale-completion behavior.

The parent should make responsibility, state ownership and data flow readable.
Check the route through composition and commands before moving a component.
Keep accepted product differences explicit. Follow [Lasagne](lasagne.md) and
the applicable family map before introducing a new shared seam.

## Component placement and names

Core's native [runtime layer](../../packages/core/fireux-core/src/runtime/nuxt.config.ts)
registers the shared library with `Fire`. Atomic Design folders are scanned as
internal roots: `molecules/State.vue` exposes `FireState`. Public names omit
the Atomic Design category. Other responsibility folders remain meaningful; for example
Collection/Pagination.vue exposes FireCollectionPagination. `Fire` is not a
physical responsibility folder. No old-name compatibility registrations remain.
App-local overrides use the same Fire name; Entity and Workspace registrations
keep their existing names. Nuxt UI keeps `U`.

- Core owns proved domain-neutral components and connected Core platform UI.
- Entity UI belongs beneath the owning package's
  `src/runtime/<entity>/components`. Cross-Entity package UI belongs at the
  package root only when it genuinely spans domain owners.
- App-only UI belongs in app/components. Use responsibility-first names such as
  Landing and Workspace; do not repeat the App name beneath its own boundary.
- A leaf can be Detail.vue. A composition with real children can be
  Detail/Index.vue. These names describe responsibilities, not required
  scaffolding.
- Collection, Detail, Summary, Create, Preview and Public name actual user or
  data distinctions; none is a mandatory set for every Entity.
- Use one canonical registration tree and preserve path-derived names. Move
  registration and consumers together, then retire old paths. Do not retain
  aliases or forwarding wrappers for a completed move.
- Use Nuxt-generated names for registered components. Add explicit imports only
  for a concrete registration gap or name collision.

A shared or public component needs a named responsibility, explicit inputs or
slots, known runtime prerequisites and real consumer evidence. A package
catalogue, auto-registration or visual similarity does not prove shared use.
Use [spine.md](spine.md) to compare materially different consumers.

## Workspace composition

[AppShell](../../packages/core/fireux-core/src/runtime/app/components/Shell.vue)
selects the named [Workspace composition](../../packages/core/fireux-core/src/runtime/workspace/components/Index.vue)
through route metadata. It combines the shared sidebar and one
[WorkspacePage](../../packages/core/fireux-core/src/runtime/workspace/components/Page.vue)
frame. WorkspacePage owns the dashboard panel, Navbar, Breadcrumbs, error
boundary and Workspace route outlet. Apps with a custom root shell select the
same component when `workspacePage` is set; see the [Find My SEO app root](../../projects/fireux/find-my-seo-app/app/app.vue).
The old GroupPage and Workspace layout shell are retired.

Routes provide their content. Group indexes use
[WorkspacePageLinks](../../packages/core/fireux-core/src/runtime/workspace/components/PageLinks.vue)
as ordinary page content. Keep page/domain work in named components with typed
props and events. Nuxt UI's supported slots remain valid when extending a native
control; do not add a custom slot shell to repeat shared route framing.
Shared styles live in
[workspace-surface.scss](../../packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/workspace-surface.scss).
The authored utility rule still applies, and utility usage elsewhere remains
migration debt; this shell change does not certify every connected component.
Navbar retains its existing `ui` forwarding API, which does not permit callers
to add authored utility overrides.

Workspace grouping, routes, selection and domain capability placement belong in
[workspace.md](workspace.md), [layouts](layouts.md) and
[family-workspace-entity.md](family-workspace-entity.md). A navigation group
does not create a data owner or require matching page anatomy across families.

## Visible page composition

Public Entity indexes compose native `UPage`, their named introduction or
`UPageHeader`, and `UPageBody` directly. The body visibly names creation/current
identity, `FireState`, the Entity Collection, `FireCollectionPagination` and
development diagnostics when applicable. `FirePage` and the older multi-slot
`FireCollectionPage` are retired; there are no compatibility registrations.

The domain `useXCollectionPage` acquires once through its reader and composes
Core `useCollectionPage` for state, pagination and diagnostics. Collection children own
filtering and presentation without repeating acquisition. Both Apps routes use
`useAppCollectionPage`; FireUX's `usePlatformAppsPage` supplies platform scope,
Showcase copy and structured SEO using those same records. Routes retain their
metadata and visible composition. The default layout supplies the container;
a full-width App layout may require explicit route framing, as FireUX's Apps
route does. Never nest a second implicit container.

Workspace keeps its existing Core frame and route outlet. Capability pages
compose named domain controls beneath it; they do not use a public index shell.
Workspace introductions consume native `UPageHeader` directly; the forwarding
WorkspaceHero wrapper is retired.
Info, selection, AI and availability sections are included for real domain
responsibilities rather than a mandatory universal page scaffold. Their domain
controllers retain lifecycle, scope and trusted commands.

## State presentation

Core [State.vue](../../packages/core/fireux-core/src/runtime/components/molecules/State.vue)
(`FireState`) accepts a `ReadOutcome`, an optional Entity label, retry affordance and optional
error details for the existing copy-error control. It presents pending, empty
and error messages with accessible status/alert semantics; ready and
idle render nothing. It emits `retry` when an enabled retry action is chosen. It owns no reader,
command, card shell or content slot.
Both Core and FireUX App Apps indexes consume it. Existing `FireStateCard`
consumers remain separate and are not migrated by this page change.

Core [FireCollectionPagination](../../packages/core/fireux-core/src/runtime/components/Collection/Pagination.vue)
accepts `hasMore`, `loading` and optional `error`, emits `load-more`, and uses
`FireState` for pagination failure presentation and copying. It does not
fetch records. App collection acquisition keeps next-page failures separate
from initial-load errors, retaining the current records while loading or retrying.

The working [Page composition showcase](../../projects/fireux/fireux-app/app/pages/components/page.vue)
at `/components/page` extends the Nuxt UI reference for FireUX consumers, with
Usage, Examples, API, Data and authority, and Theme sections. It uses native
UPage side regions for component navigation and a table of contents. It keeps
upstream component APIs upstream and documents FireUX-owned composition
conventions and the actual State/Pagination contracts. Code examples do not
acquire Entity records. The Components index lives at
`pages/components/index.vue`; no custom parent shell is added.

## Multiple selection

Core [MultiSelect.vue](../../packages/core/fireux-core/src/runtime/components/molecules/MultiSelect.vue)
(`FireMultiSelect`) provides visible toggle choices for short multi-select
lists. It accepts labelled
items, an accessible group label, optional descriptions and disabled state, and
an array model. It owns interaction only; domains provide choices, eligibility
and persistence. Kitchen Services menu selection is its current production
consumer. Searchable or long lists and single selection remain separate
responsibilities.

## Collection rows

Core [Row.vue](../../packages/core/fireux-core/src/runtime/components/Collection/Row.vue)
owns simple row alignment and wrapping with optional value and actions slots.
The consuming list supplies its semantics and dividing lines. Domain owners keep
record identity, links, menus, permissions and mutations; the row is presentation.
Kitchen Menu examples and deltas live in the [Menu map](family-menu.md).

## Verification and maintenance

When changing a component, inspect its owning source, Nuxt registration,
real consumers and nearest sibling. For visual or interaction changes, verify
the affected responsive, keyboard, state and lifecycle behavior. Use current
source-owned checks and report their limits. Documentation changes verify local
paths and anchors, then finish with git diff --check.

Keep this map focused on durable ownership and consumption. Put workflow detail
in its family map and use Git history for superseded implementation snapshots.
