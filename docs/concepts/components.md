# Components spine map

Updated: 2026-11-18
Ref: 5e2450a2f
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
extraction adds no useful boundary. A named section may own authored content and
presentation as a separation of concerns, without reactive state or reuse across
consumers. Do not create a wrapper for every Nuxt UI
control, forwarding-only components or empty controllers. A visible component
does not own mutation authority. Preserve its reader, lifecycle, accessibility,
pending/error states and stale-completion behavior.

The parent should make responsibility, state ownership and data flow readable.
Check the route through composition and commands before moving a component.
Keep accepted product differences explicit. Follow [Lasagne](lasagne.md) and
the applicable family map before introducing a new shared seam.

### Component APIs and extension points

This is the canonical contributor rule for component composition. Ordinary
parents visibly name their responsible children. Use typed props and events
(including controlled `v-model`) for ordinary presentation inputs and actions;
keep shared state in its existing bounded domain context when the
[workflow and lifecycle](lasagne.md#controllers-and-context) justify it. Do not
replace a simple presentation API with an injected controller or a slot engine.

Binding App identity constants and merely forwarding props or a default slot
into an existing Core component does not earn a forwarding adapter. Consume Core
directly unless the adapter demonstrates an independent product, structural or
lifecycle responsibility. Ordinary page/tool wrappers must not just conceal
native/shared structure and named children.

Consuming a supported native Nuxt/Nuxt UI slot, such as `UCard`'s footer or
`UDashboardPanel`'s header/body, is normal native composition. Defining a custom
shared slot API is a separate design decision: name its real shared structural
responsibility and demonstrated consuming compositions, keep the extension
surface bounded, and retain domain content, state and commands with their owners.
A wrapper that only moves ordinary page children behind named slots has not
proved that responsibility. Native API validity alone does not establish FireUX
fit. Creating a Nuxt layout also requires the separate
[layout admission](layouts.md#layout-admission) check; its native page slot is
not a new custom component API.

Inherit native component styling, existing shared semantic styles and tokens
before adding domain styling. A new style owner needs a real presentation or
structural responsibility. The single utility rule and exact human-exception
boundary remain in [global context](../ai/gpt-context.md#ui-and-design-system).

Classify references by their inspected responsibility rather than certifying
all their implementation or treating every shared component as a template:

| Reference                                                                                                               | Classification and boundary                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [WorkspacePage](../../packages/core/fireux-core/src/runtime/workspace/components/Page.vue) consuming native panel slots | Supported native slot consumption; Core owns the frame and landmark, the App owns its page outlet, and domains supply route content.                                                                                                                                                                                                                                                                                                                                                      |
| [FireOnboardingShell](../../packages/core/fireux-core/src/runtime/components/Onboarding/Shell.vue)                      | Bounded shared extension point for stage/progress/error framing, consumed by [Place](../../packages/extensions/fireux-places/src/runtime/place/components/Onboarding/Index.vue) and [Kitchen](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Onboarding/Index.vue). Their journey state, stage content and commands remain domain-owned.                                                                                                                        |
| [WorkspaceCapability](../../packages/core/fireux-core/src/runtime/workspace/components/Capability.vue)                  | Bounded shared extension point for responsive collection/single panels and focus behavior, used by [Project Test](../../packages/extensions/fireux-projects/src/runtime/project/components/Workspace/Test/Index.vue), [Kitchen Test](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Test/Index.vue) and [Team](../../packages/core/fireux-core/src/runtime/workspace/components/Team/Editor.vue). It is a component, not a Nuxt layout or data owner. |
| [WorkspaceOverview](../../packages/core/fireux-core/src/runtime/workspace/components/Overview/Index.vue)                | Project-only direct composition reference: the [Project consumer](../../packages/extensions/fireux-projects/src/runtime/project/components/Workspace/Overview/Index.vue) supplies default/attention content; `badge` has no current consumer. This does not establish a universal page-shell pattern or justify copying its extension API.                                                                                                                                                |

The authored-utility and SFC-order rules in [ESLint configuration](../../eslint.config.js)
cover an explicit file allowlist, including the reviewed Overview. That bounded enforcement is not a
repository-wide composition or styling certificate.

## Authentication composition

Core `Auth/System.vue` composes Brand, SignIn and Continue, using the existing
`useAuthPhase` owner to choose pending, guest or signed-in presentation.
Brand selects configured App/Ecosystem artwork through `AppBrandWordmark` and
contains no named-Ecosystem policy. SignIn owns Google interaction and coordinates
busy state with the existing EmailPanel, which retains native `UAuthForm`.
Continue owns setup-aware return navigation, recovery and account switching.
It consumes `useUserSetup` and `useAuth`; it does not recreate their commands.
The native `/auth` page retains route metadata and tenant framing.
See Core's `auth-composition.test.mjs` and Kitchens' `kitchen-access.test.mjs`
for interaction and return-navigation checks.

## Dashboard composition

`Dashboard/Home.vue` supplies the native Dashboard panel and composes Overview.
Overview only arranges its User and App children and has no readers or props.
User owns identity, private-account state and Recovery. It shows a small identity
summary with Profile and Settings links, plus account recovery only when needed.
Missing or incomplete identity uses the existing User identity-completeness
policy and Recovery, while loading and read errors retain their own outcomes.
App owns current membership and its role/plan summary, Join, Workspace and
management actions. It reads no App-status document; initialization stays with
the root App gate. Overview has no profile catalogue, welcome banner or completion
prompt system. Recovery owns no reads or writes. Workspace remains a link to
its separate operational surface. Each section handles its own outcomes.
See `foundation-read-contract.test.mjs` and
`components/Dashboard/Overview.test.mjs` under Core's `src/test`.

The Dashboard header uses `FireLayoutsDashboardProfileButton` for the current
User identity link. It has no profile switcher or shared selection state.
Domain sidebar entries follow the current route's `nav.profileId`; their
readers and editors remain with their owning extensions.

The [shared sidebar footer](../../packages/core/fireux-core/src/runtime/components/layouts/shared/SideBarFooter.vue)
reads the signed-in User directly. Its account menu offers Profile, Settings
and Sign out. Workspace adds the configured App Home link to that menu.
Dashboard presents App Home as a separate footer link. Guests see Sign in
with a return to their current route. Auth supplies sign-out and the provider
identity fallback. The mounted guard keeps hydration stable.

## Profile and Settings composition

The shared Profile route composes `UserEditProfile`, which reads only the public
User and delegates editing to the existing `UserEditCore` and `UserEditAvatar`.
Settings composes `UserAccountDetails` and `UserAccountSession`; the existing
private-context editor is a ready-account slot. Details owns its account read,
while Session owns only Auth state and sign-out. Its initial loading state
stays stable through hydration before displaying the browser session. Routes retain metadata and
native Dashboard framing, with no duplicated account summaries or plan cards.
See Core's `pages/dashboard/profile-settings.test.mjs`, editable-completion/workflow tests and
native module registration check. The FireUX App has no competing Profile route.
Overview, Profile and Settings share the semantic `fx-account-content` width
in `page-layouts.scss`; field groups reuse `pagebody` spacing.

## Component placement and names

### Domain component surfaces

Human-approved rule review: **replace** the direct-Entity capability-screen and
Workspace-only-mechanics convention with audience-owned Public and Workspace
composition; **replace** operator `Workspace<Entity>*` ordering with
`<Entity>Workspace*`; **narrow** neutral sharing to proved lower responsibilities.
This records the accepted placement, naming and library-admission convention.
Existing source that retains the former grouping or operator naming is pending
alignment, not another accepted convention or proof of a completed migration.

| Surface                        | Owns                                                                                                                                                           | Registered naming                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Public                         | Customer-facing composition, including protected customer experiences. Authentication alone does not make a screen operator management.                        | A separate Public scan supplies `Public<Entity>*`.                                              |
| Workspace                      | Complete operator capability screens and their children, including operational workflows, not only selection or coordination.                                  | A separate Workspace scan supplies `<Entity>Workspace<Capability>*`.                            |
| Neutral lower domain component | A bounded responsibility with proved independent consumers and a shared/cross-Entity API. Several hosts of the same surface do not prove cross-audience reuse. | The neutral scan supplies `<Entity><Capability>*` and excludes both Public and Workspace trees. |

The operator order is Entity, audience, then capability and responsible child.
Where a matching composable owns meaningful coordination, its name uses `use`
followed by that same order, such as `useKitchenWorkspaceMenuServices`. Native
composable discovery uses named exports rather than deriving folder prefixes.
A matching composable is optional; local computed values and handlers can stay
in the SFC, and pure presentation uses typed props/events. Do not extract a
forwarding facade or pass a large controller merely to satisfy naming symmetry.
Kitchen's Menu target is `KitchenWorkspaceMenu`, composing
`KitchenWorkspaceMenuOverview`, `KitchenWorkspaceMenuCreate`,
`KitchenWorkspaceMenuAi`, `KitchenWorkspaceMenuItemsOverview`,
`KitchenWorkspaceMenuPromotionsOverview` and `KitchenWorkspaceMenuServicesOverview`.
The operational naming decision does not change `Public<Entity>*`. The
[group composition contract](family-workspace-entity.md#workspace-group-overview-composition)
owns the corresponding parent/child composable lifecycle and shared creation flow.

Keep a single-surface leaf with that surface/capability. Do not create mandatory
`Cards`, `Other` or `Shared` roots, or move useful children into neutral folders
merely to shorten names. Public contribution and operator Setup are distinct
onboarding compositions; shared Find/Review stages need their own proved
consumers and contract. Marketing and standalone tools retain their actual
App/tool owners and are not automatically operator Entity management.

Workspace describes audience here, not a URL, chrome choice, selected-Entity
injection or authority grant. Explicit-subject User administration retains its
supplied User target; grouping it as operator UI does not substitute the selected
Kitchen or another Workspace Entity. Models, public/presentation contracts,
readers, commands and domain state stay outside this component grouping with
their current owners.

#### Registration and migration boundary

Core's
[registration helper](../../packages/core/fireux-core/src/config/module/module-helpers.ts)
passes the supplied prefix, path and exclusions to Nuxt; it does not enforce
Workspace-first Entity naming. Each registration owner must cut over its actual
surface and consumers together. Current source remains mixed:

| Owner/source                                                                                                                                                                                               | Current registration and adoption boundary                                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Kitchen](../../packages/extensions/fireux-kitchens/src/config/module/components-config.ts)                                                                                                                | `KitchenWorkspaceMenu*` and `KitchenWorkspacePrep*` have bounded scans excluded from the existing `WorkspaceKitchen*` integration scan. `PublicKitchen*` and remaining direct-root working capabilities retain their current owners; this is not a whole-Kitchen cutover. |
| [Project](../../packages/extensions/fireux-projects/src/config/module/components-config.ts)                                                                                                                | `WorkspaceProject*` and `PublicProject*`; operator naming adoption remains pending.                                                                                                                                                                                       |
| [Supplier](../../packages/extensions/fireux-suppliers/src/config/module/components-config.ts) and [Portfolio/Property](../../packages/extensions/fireux-properties/src/config/module/components-config.ts) | `WorkspaceSupplier*`, `WorkspacePortfolio*` and `WorkspaceProperty*`; operator naming adoption remains pending.                                                                                                                                                           |
| [Business](../../packages/extensions/fireux-businesses/src/config/module/components-config.ts)                                                                                                             | The `BusinessWorkspace*` scan already uses the target order. This alone does not prove family-wide surface alignment.                                                                                                                                                     |
| [Blank App](../../projects/fireux/fireux-blank/app/components/Workspace/Blank)                                                                                                                             | App-local `Workspace/Blank` components are a separate native discovery boundary, not another package-prefix declaration.                                                                                                                                                  |

Core's shared
[`Workspace*` tree](../../packages/core/fireux-core/src/config/module/components-config.ts)
retains its shared Workspace owner and names. Classify Entity adapters such as
Kitchen Navigation, Test and collection controls by their actual integration
responsibility; do not blanket-rename every `WorkspaceKitchen*` reference. Core's
dynamic `Workspace<Entity>Navigation` lookup remains the current ABI in
[Sidebar](../../packages/core/fireux-core/src/runtime/workspace/components/Sidebar.vue)
and [Navbar](../../packages/core/fireux-core/src/runtime/workspace/components/Navbar.vue).
Changing it requires a bounded cutover of both lookup sites, every registered
navigation owner and their global registrations.

Higher composition can deliberately override an Entity name. Granite's
[`WorkspacePortfolioOverview`](../../packages/ecosystem/fireux-granite/src/config/module/components-config.ts)
composes Portfolio with Documents, Tasks and Compliance; Reservations supplies
[`WorkspacePropertyOverview`](../../packages/extensions/fireux-reservations/src/config/module/components-config.ts)
above Properties. Preserve their ownership, direct imports and registration
priority when their base family's public name moves. Their `workspace/` or
Entity contribution paths do not make them shared Core components.

Complete a bounded move with its scans/exclusions, real route and component
consumers, explicit imports, source-owned checks and rendered/interaction review.
Keep Public and Workspace excluded from the neutral scan and check generated
names for duplicate registrations, including explicit navigation and override
names. A directory move and a prefix change are separate parts of that contract.
Preserve subject, state lifecycle and command authority. Retire old names and
paths without aliases when that slice is complete; do not infer migration of
untouched families or add placeholder trees. Specific source examples below
remain evidence for their inspected responsibility, not universal migration
baselines.

### Library admission and maturity

Classify a library entry explicitly as pure presentation, a connected Core
platform adapter, or a named domain workflow. A presentation primitive consumes
supplied values/actions; a connected adapter must expose its actual Core
session/configuration/lifecycle prerequisites. A domain workflow stays with the
owner that has its full meaning and authority. The word library does not admit
generic CRUD, storage, slot engines or universal record editors. Existing
unconsumed/unproved entries remain unproved, not canonical alternatives.

The [component API admission rule](#component-apis-and-extension-points) still
applies to props/events, bounded domain context and shared extension points.
Maturity is limited by actual consumers: `WorkspaceOverview` has a Project-only
composition reference; [WorkspaceFormActions](../../packages/core/fireux-core/src/runtime/workspace/components/FormActions.vue)
is pure supplied-action presentation with a [Docs preview](../../packages/extensions/fireux-docs/src/runtime/components/CorePreview.vue),
not production consumer proof. [SimpleField](../../packages/core/fireux-core/src/runtime/components/molecules/forms/editable/SimpleField.vue)
is a connected Core adapter: Auth, App configuration and AppUser changes
invalidate its supplied update intent; it invokes the caller's update rather
than owning generic persistence. Unused `WorkspaceCapability` slots do not prove
production reuse of those extension points.

### Vue file convention

Authored Vue single-file components put `<template>` first, then
`<script setup>`, then any `<style>` blocks. Omit blocks that have no purpose.
This order does not replace readable composition or domain ownership. The
existing formatter and applicable lint checks are separate evidence; scoped
lint rules do not establish repository-wide enforcement.

Runtime component trees contain `.vue` files and folders of components only.
Put styles used by one component in its SFC style block. Styles shared by
several components belong in the existing owner's assets/styles directory,
preserving scoped imports where required. App copy belongs in App content;
types, pure helpers and reactive lifecycle code belong in the corresponding
owner's models/types, utils and composables. Do not introduce a new shared
abstraction merely to relocate a file. Tests remain outside runtime and may
mirror the component hierarchy.

Core's native [runtime layer](../../packages/core/fireux-core/src/runtime/nuxt.config.ts)
registers the shared library with `Fire`. Atomic Design folders are scanned as
internal roots: `molecules/State.vue` exposes `FireState`. Public names omit
the Atomic Design category. Other responsibility folders remain meaningful; for example
Collection/Pagination.vue exposes FireCollectionPagination. `Fire` is not a
physical responsibility folder. No old-name compatibility registrations remain.
`FireuxApp` is the explicit application-root registration; it is not part of
the App-prefixed Entity scan. App-local overrides use the same Fire name;
Entity operator names follow the [surface convention](#domain-component-surfaces)
with adoption established by their current registration. Shared Core Workspace
components retain `Workspace`; Nuxt UI keeps `U`.

- Core owns proved domain-neutral components and connected Core platform UI.
- Entity UI belongs beneath the owning package's
  `src/runtime/<entity>/components`, grouped by the [surface convention](#domain-component-surfaces).
  Cross-Entity package UI belongs at the package root only for a proved
  cross-Entity responsibility.
- Reusable capability UI that spans consuming Apps belongs in its owning
  Extension's `src/runtime/components` when real consumers prove the shared
  responsibility. Its module supplies the package prefix; each App keeps its
  own service choices, policies, reads and commands. It does not join Core's
  component library. See the
  [Bookings customer surface](../../packages/extensions/fireux-bookings/src/runtime/components/Surface.vue).
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

Entity Cards use the [Pill, Cell, Preview and Overview roles](card-family.md)
within the admitted surface or lower shared boundary; these roles do not require
a neutral Cards root.
Core User is the four-role baseline; its Detail composes `UserCardsOverview`
beside the App-owned membership capability. Card presentation does not own
route acquisition, editing or trusted command authority.

Core [FireDisclosureCard](../../packages/core/fireux-core/src/runtime/components/molecules/DisclosureCard.vue)
combines Nuxt UI's native disclosure with the shared card-cell surface. Its
consumer controls `v-model:open` when several cards share one-open-at-a-time
state and owns the slot content. Use [FireDisclosurePanel](../../packages/core/fireux-core/src/runtime/components/molecules/DisclosurePanel.vue)
for a disclosure without the card-cell surface. Both reuse native UCollapsible
interaction. DisclosurePanel owns the labelled trigger and description with
semantic styles; controlled open state remains with the caller. The FireUX App exposes the
[Disclosure Card component page](../../projects/fireux/fireux-app/app/pages/components/disclosure-card.vue).

## Workspace composition

[FireuxApp](../../packages/core/fireux-core/src/runtime/app/components/FireuxApp.vue)
supplies one page outlet to native NuxtLayout. Pages select the
[Workspace layout](../../packages/core/fireux-core/src/runtime/layouts/workspace.vue)
with `layout: 'workspace'`. It composes the shared sidebar and one
[WorkspacePage](../../packages/core/fireux-core/src/runtime/workspace/components/Page.vue)
frame, which owns the dashboard panel, main, Navbar, Breadcrumbs and error
boundary and consumes the supplied page slot. App roots retain one provider and
initialization lifecycle. Domain pages supply content without another frame.

Routes provide their content. Group indexes use
[WorkspacePageLinks](../../packages/core/fireux-core/src/runtime/workspace/components/PageLinks.vue)
as ordinary page content. Apply the
[component API rule](#component-apis-and-extension-points) to page/domain children
and any proposed shared extension point; do not repeat the existing route frame.
Shared styles live in
[workspace-surface.scss](../../packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/workspace-surface.scss).
The authored utility rule still applies, and unapproved utility usage elsewhere remains
migration debt; this shell change does not certify every connected component.
WorkspaceNavbar accepts the page title and owns selected-identity and page
actions. The separate Dashboard Navbar retains its existing `ui` forwarding;
that does not permit authored utility overrides.

Workspace grouping, routes, selection and domain capability placement belong in
[workspace.md](workspace.md), [layouts](layouts.md) and
[family-workspace-entity.md](family-workspace-entity.md). A navigation group
does not create a data owner or require matching page anatomy across families.

## Sharing page chrome

Use the native control as the common foundation before introducing another
FireUX frame. The [rendering map](layouts.md) records the App, layout, Workspace
and Entity route boundaries.

| Responsibility            | Current shared boundary                                                                                    | Remaining difference                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Public site header/footer | Core default and landing layouts already reuse their named Header and Footer; navigation comes from useNav | Framework, tenant and branded App headers retain real product framing                                                   |
| Operational top bar       | Dashboard and Workspace both compose native UDashboardNavbar                                               | Dashboard owns account context; Workspace owns selected Entity identity, capability info, page JSON and Calendar access |
| Subscription control      | Both operational bars consume AppUserSubscriptionControl                                                   | Placement follows the surface                                                                                           |
| Notifications             | Both use the same User notification state and shared slideover                                             | UserNotificationsButton owns the badge, accessible label and open interaction; Dashboard retains its keyboard hint      |
| Breadcrumbs               | Workspace owns its named route/navigation derivation and consumes native UBreadcrumb                       | Public Entity and Dashboard breadcrumb policy is not yet shared; resolved record labels remain with the owning reader   |
| Page introduction         | Entity routes compose native UPageHeader or their named Hero/Detail                                        | A record introduction, collection introduction and operational context bar have different jobs                          |
| Transitions               | Existing Core page policy uses native route metadata                                                       | Workspace and Dashboard remain unanimated; other page policy and genuine App differences remain explicit                |

The Kitchen [Collection Header](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Collection/Header.vue)
supplies content titles and actions for Ingredients, Recipes, Items, Menus and
Promotions. It derives no route breadcrumbs; Core's Workspace frame owns the
single trail. Domain controls and commands remain with those capabilities.

[FireCollectionHeader](../../packages/core/fireux-core/src/runtime/components/Collection/Header.vue)
already shares collection-section title and controls across Ingredient, Supplier,
Property and Portfolio collections. Its h2 is a section heading, separate from
the page's route heading. Reuse that proved boundary or native controls where
appropriate rather than introducing a universal page/header wrapper.

[UserNotificationsButton](../../packages/core/fireux-core/src/runtime/user/components/Notifications/Button.vue)
shares the notification interaction between Dashboard and Workspace. It consumes
the existing User notification state and opens the existing shared slideover;
it adds no reader, account authority or notification-delivery mechanism. Reuse native navigation and breadcrumb controls;
keep their items, identity, permissions and route context with their owners.
Workspace content introductions must earn their place as content; do not repeat
frame metadata merely to create another heading. Public Entity readers, SEO and
commands stay independent of page chrome.

## Visible page composition

Public Entity indexes compose native `UPage`, their named introduction or
`UPageHeader`, and `UPageBody` directly. The body visibly names creation/current
identity, `FireState`, the Entity Collection, `FireCollectionPagination` and
development diagnostics when applicable. `FirePage` and the older multi-slot
`FireCollectionPage` are retired; there are no compatibility registrations.

The domain `useXCollectionPage` acquires once through its reader and composes
Core `useCollectionPage` for state, pagination and diagnostics. Collection children own
filtering and presentation without repeating acquisition. Both Apps routes supply
their endpoint to Core's
[`useAppCollectionPage`](../../packages/core/fireux-core/src/runtime/app/composables/useAppCollectionPage.ts).
The [Ecosystem route](../../packages/extensions/fireux-ecosystem/src/runtime/pages/apps/index.vue)
selects its shared directory API; FireUX's
[`usePlatformAppsPage`](../../projects/fireux/fireux-app/app/composables/usePlatformAppsPage.ts)
selects its platform API, diagnostic scope, Showcase copy and structured SEO
using those same records. Core coordinates the supplied reader and page state
without selecting an upper App's endpoint. Routes retain their
metadata and visible composition. The default layout supplies the container;
a full-width App layout may require explicit route framing, as FireUX's Apps
route does. Never nest a second implicit container.

Workspace keeps its existing Core frame and route outlet. Capability pages
compose named domain controls beneath it; they do not use a public index shell.
Workspace introductions use `WorkspacePageHeader`, which owns the shared primary/child
presentation over native `UPageHeader`. Its explicit content-ownership contract
avoids duplicate frame descriptions and adds no reader or route outlet; see
[page introductions](workspace.md#page-introductions). The old WorkspaceHero wrapper is retired.
Info, selection, AI and availability sections are included for real domain
responsibilities rather than a mandatory universal page scaffold. Their domain
controllers retain lifecycle, scope and trusted commands.

Project and Kitchen Identity compositions reuse the semantic
[Workspace profile styles](../../packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/workspace-profiles.scss).
Project keeps its own identity summary, progress and guarded modal; Kitchen
keeps Place-owned profile sections, brand media and listing controls. Kitchen's
specialist media geometry remains scoped in its Profile component. These
selected compositions use semantic classes and native control props; this does
not certify every descendant editor or other Entity surface. Project's Read
component emits its edit action to the named editor through an event.

## State presentation

Core [State.vue](../../packages/core/fireux-core/src/runtime/components/molecules/State.vue)
(`FireState`) accepts a `ReadOutcome`, an optional Entity label, retry affordance and optional
error details for the existing copy-error control. It presents pending, empty
and error messages with accessible status/alert semantics; ready and
idle render nothing. It emits `retry` when an enabled retry action is chosen. It owns no reader,
command, card shell or content slot.
Core, domain and App consumers use it for plain feedback. Domains compose native
`UAlert` or `UCard` when they need contextual copy or actions; there is no second
shared state-card API. Error copying uses supplied details or the displayed message.

Core [FireCollectionPagination](../../packages/core/fireux-core/src/runtime/components/Collection/Pagination.vue)
accepts `hasMore`, `loading` and optional `error`, emits `load-more`, and uses
`FireState` for pagination failure presentation and copying. It does not
fetch records. App collection acquisition keeps next-page failures separate
from initial-load errors, retaining the current records while loading or retrying.

The public [component reference](../../packages/extensions/fireux-docs/src/runtime/pages/docs/components/index.vue)
publishes only Core's explicit `src/catalogue/public-components.mjs` entries,
each with a Docs-owned safe preview. Core contains reusable runtime components;
example-only fixtures stay with the consuming reference. The complete inventory lives at the development-only
`/dev/core-components`; internal implementation components are not a public API.
Extension previews live separately
and may render a package-owned component with generic placeholder data; this
does not make that component part of Core. The
[Bookings preview](../../packages/extensions/fireux-docs/src/runtime/pages/docs/components/bookings.vue)
shows the shared customer surface separately from the Core inventory. The FireUX App
[playground](../../projects/fireux/fireux-app/app/pages/components/index.vue)
links to that reference. Nuxt UI documents its own controls.

[Page composition](../../projects/fireux/fireux-app/app/pages/patterns/page-composition.vue)
shows how to use native `UPage` with FireUX components and a single collection reader.

## Multiple selection

Core [MultiSelect.vue](../../packages/core/fireux-core/src/runtime/components/molecules/MultiSelect.vue)
(`FireMultiSelect`) provides visible toggle choices for short multi-select
lists. It accepts labelled
items, an accessible group label, optional descriptions and disabled state, and
an array model. It owns interaction only; domains provide choices, eligibility
and persistence. Current consumers are Kitchen Services setup, Promotions, and
the public Menu ordering form. Use Nuxt UI `URadioGroup` for a short list with
one choice, as the Kitchen order ticket example does. Searchable or long lists
use Nuxt UI selection controls suited to those lists.

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

## Diagnostics display defaults

`FireDiagnosticsDebugPanel` owns its generic title (`Debug`), empty explanatory
context, included route context and collapsed launcher defaults. Supplied objects
are `passed` by default; only a caller that owns acquisition should explicitly
label them `fetched`. Callers may override display settings, including
`:launcher="false"` for inline display and `:include-route="false"` to omit route
context. Explicit `open`/`defaultOpen` behavior and development-only rendering
remain supported. Collection-page coordinators supply only object and derived
facts; they do not select diagnostic display defaults or assert acquisition.

## Stock public composition boundary

Core's default and landing layouts own Header, one content slot/container and
Footer. Header consumes existing navigation, session and Workspace-entry owners;
Footer consumes its existing navigation and public Admin presentation. Brand
media remains with AppBrandLogo/Wordmark. Product pages supply their actual copy,
actions and named domain sections; adding native controls or copying a screenshot
does not establish that composition.

The unused platform-specific `LandingHeroSection` and forwarding `LandingShell`
are retired. They are not stock App baselines. The maintained Misebox and Werkbox
landings compose `FireLandingProductIndex` with their own content and sections;
inspect those owners before extending that family. Their existence is not a
certificate that every descendant is free of utility debt.
