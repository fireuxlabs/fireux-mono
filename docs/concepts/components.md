# Components spine map

Updated: 2026-08-26
Ref: e5a742124
Role: map, not canon

## Purpose

Map component folder and naming conventions.

## Vertical links

- Parent: nuxt-ui.md
- Child: family-workspace-entity.md
- Child: family-entity-directory.md
- Child: family-entity-detail.md
- Child: card-family.md

## Horizontal links

- pages.md
- composables.md
- lasagne.md
- runtime-filesystem.md
- debug.md

## Package components

- Cross-entity package UI belongs under `src/runtime/components`.
- Entity-owned package UI belongs under
  `src/runtime/<entity>/components`, following `runtime-filesystem.md`.
- App UI belongs under `app/components`; reusable entity implementation does
  not move into an App merely to preserve conventional Nuxt discovery.
- App-owned Workspace composition uses
  `{Ecosystem}Workspace{Entity}{Job}` and the matching
  `components/{Ecosystem}/Workspace/{Entity}/{Job}.vue` path. Route placement
  such as Landing is not part of that component identity. For example,
  `MiseboxWorkspaceKitchenHero` is the Misebox-owned Kitchen Workspace Hero;
  package-owned children retain their package family names.
- Declared Entity components live beneath `runtime/<entity>/components` and
  are registered with prefixes that preserve established component names.
  Confirmed parent-owned record/operation components live beneath their parent
  Entity scope. Root component families for still-to-confirm concepts remain
  on the package spine; neither case is automatic evidence for a new Entity.

## CSS-to-component mapping

- The CSS atomic taxonomy supports the Vue tree; it does not mirror it. Vue
  components remain entity-owned (`runtime/kitchen/components/Cards`,
  `runtime/supplier/components/Collection`, and an entity's direct
  `components/Workspace/<Capability>`) while pages remain route-first.
- `atoms` own foundations or one semantic visual role, such as system tokens
  and the `.fx-type-*` vocabulary. They do not own a form, card, or page
  composition.
- `molecules` own reusable local contracts assembled from atoms and Nuxt UI,
  such as browser-level form behavior, inset panels, pills, and entity/preview
  card anatomy that the installed component library does not provide.
- `organisms` own recurring multi-component or page-region composition, such
  as collection layouts, public-action panels, profile/workspace composition,
  and shared page rhythm that still has more than one real consumer.
- If a real external surface needs shared CSS, `integrations` isolates that
  contract; it is not a domain organism. Do not keep speculative integration
  CSS without an authored consumer.
- A global CSS family must have a real repeated consumer contract or a narrow
  browser behavior that cannot be expressed through Nuxt UI. A single shared
  Vue component is not enough evidence: use the installed Nuxt UI component,
  its props/slots, or a small component-local utility recipe first. Business
  copy, routes, data authority, actions, and one-off presentation remain in the
  named component or page that owns them.
- The intended cross-tree mappings are: entity and preview card molecules to
  the prop/view-model-driven `X/Cards/Cell`, `Pill`, and `Preview` family
  classified in `card-family.md`; collection organisms to `X/Collection/*` and
  workspace indexes; workspace header/summary molecules plus the workspace surface
  organism to an entity's `components/Workspace/*`; public-action organisms to
  claim/operator panels;
  legacy `Cards/Profile` compositions are migration debt rather than ordinary
  Cards; the public specialist-profile
  family composes Core `PublicProfileHero`, `PublicProfileSection`, and
  `PublicProfileDirectoryCard` presentation while each named domain retains
  its content. Image-led entity directories use their domain-owned
  `Cards/Cell`; Kitchen and Place are reference siblings for
  whole-card directory interaction, photographic media, honest fallbacks,
  focus, and mobile-first composition. Their separately named `KitchenHeader`
  and `PlaceHeader` components retain detail identity, actions, media, and
  future presentation differences. Shared lower-level primitives do not create
  a generic data-configured entity-card framework. Profile editors use Nuxt UI cards
  and named `Edit/*` form
  composition; and page organisms to genuinely shared layout and route
  regions. Core `LandingProductIndex` owns the product-led landing region
  vocabulary and default order: `hero-preview`, the `onboarding` entry slot,
  `surfaces`, `workspace`, `specifics`, `ecosystems`, `apps`, `tools`,
  `solutions`, then `operations`. An App may provide an ordered subset through
  the shared `regionOrder` prop so absent product layers disappear without
  copying the renderer or adding an unowned region. The hero
  places shared product copy on the left and the App-owned product presentation
  on the right. FireUX uses the live public App and Ecosystem Card orbit;
  Static Main App photography uses Core `LandingProductHeroImage`, which owns
  the sharp clipped frame while each App owns its reviewed image, alternative
  text, and focal position. Core measures the live heading/image intersection
  and uses it to size a long horizontal blur fade running the image's full
  height. A bounded desktop fallback and transparent end buffer prevent the
  fade detaching during motion; the copy remains untreated and stacked layouts
  resolve to no blur.
  Reviewed source files share the guarded 1600 x 1000
  pixel, 8-bit opaque RGB PNG contract. FireUX's live Card orbit is the accepted
  non-image hero delta. `LandingProductEntryPaths`
  owns the ordered `start` and `join`
  choice, optional subordinate Tool doorway, icons, card anatomy, responsive
  layout, and reveal behavior. The slot is a public entry decision rather than
  account onboarding, so App adapters contribute only copy and routes.
  `scripts/guards/product-landing.mjs` discovers every adapter using
  `LandingProductIndex` and requires exactly one entry component there.
  `LandingProductProofSection` owns the recurring proof-and-copy
  split, and `LandingProductCatalogue` owns the shared Tools, Solutions, and
  Operations grid. Core keeps their responsive/reveal behavior and flat
  semantic presentation free of decorative gradients and flares. App projects
  supply truthful data, copy, routes, and proof through named slots and may
  omit a slot when no public capability exists. FireUX places Ecosystems before
  Apps and does not fabricate Tools; Misebox supplies Menu surfaces and Finance
  under `specifics`, its bounded Apps projection, and an Ordering entry that
  lists published Menus and exposes only their enabled guest order paths
  before Solutions and Operations. FireUX and Misebox are the current sibling
  consumers. Slotted content opts into Core's single IntersectionObserver
  reveal system with `data-landing-reveal`; projects do not create a second
  scroll-animation observer or stylesheet. Core `useLandingMotion` owns that
  observer lifecycle and uses its Core-owned GSAP dependency for a responsive
  hero timeline plus one-shot, interruptible in-page reveals. The timeline
  coordinates semantic hero copy and preview parts while the App retains the
  proof itself. Both Main Apps call this two-part composition Section One:
  Hero, with product title and actions on the left and App-owned visual proof
  on the right. Subscription pricing follows outside the pinned Hero. FireUX
  proves the opt-in `immersive` composition with a
  viewport-scale hero, a pinned copy-to-proof handoff driven by its live App
  and Ecosystem cards, and scrubbed chapter transitions. Misebox now shares
  that immersive Core composition while retaining its Kitchen-owned hero
  image and product order. Core `LandingPricingStrip` owns the shared Monthly
  subscriptions presentation; both Main Apps supply their source-backed Free,
  Premium, and Managed plans at the project edge. Core `LandingOperationRail`
  sits above Section One in both Main Apps. Despite its historical component
  name, each App projects its complete source-backed Workspace capability
  catalogue to matching `/operations/<slug>` literature routes; Identity
  remains a peer capability rather than becoming an Operation. As Section One hands off, Core moves the
  immersive landing header and Operations rail upward and out rather than
  hiding either surface beneath pricing; reverse scrolling restores both. This
  behavior is scoped to the immersive landing and does not affect ordinary App
  layouts. The pricing strip has no
  visible heading; its App-owned aria label retains the semantic name. Core
  compacts it promptly to plan names and prices, then moves the compact strip
  upward and out as the first content stage takes over the full viewport. Core
  animates only each named region's motion-stage shell; the slotted component
  owns its internal reveal markers so chapter motion does not reach across that
  boundary. Compact and reduced-motion modes remain free of that choreography.
  It preserves visible SSR output, falls back
  to the CSS reveal contract if GSAP cannot load, kills active tweens on
  unmount, and exposes no project-level GSAP seam. Reduced-motion users see
  the final layout without movement. Native Nuxt route transitions remain a
  separate Core integration and do not move into GSAP. Core
  `LandingWorkspacePreviewFrame` owns the shared Nuxt UI Workspace shell: target
  rail, primary and optional secondary navigation, selected heading,
  responsive composition, and persistent full-Workspace doorway. Misebox's
  Workspace proof pairs that shell with a read-only canonical Kitchen Operations
  launcher and project-owned Workspace copy. Its thin root owns local operation
  and page state plus one Product Demo load. Named Menus, Dishes, Ingredients,
  Recipes, Mise, and empty-canvas children own their projected bodies; Dishes
  further separates Collection, Overview, and named
  Finance/Spec/Prep/Recipes/Mise child pages beneath one persistent
  image-backed Dish context. Ingredients
  receives the selected Demo Kitchen's usage links already resolved through
  canonical root Ingredients; it does not copy name or image truth. Its compact
  collapsible groups use the same ordered food-group resolver as the real
  Kitchen Workspace.
  Mise uses the real `KitchenMiseTask` collection and a Kitchen-owned summary
  projector, prop-only collection presentation, and task board shared with the
  Workspace. The landing disables task navigation and owns only its outer scroll
  boundary; it does not maintain a compact Mise variant. Product Demo exposes
  those records as `workspace.miseTasks`; production requirements remain confined
  to their derived Dish graph. The shared board groups collapsible cards by
  chef workflow stage rather than status; status remains a badge/action state,
  checklist progress stays inside the task card, and missing stages appear in
  Unsorted. Menu availability controls belong to the real Workspace; the landing
  Menu child stays presentation-only. The Workspace and landing roots consume
  the Kitchen-owned Demo service state and pass filtered Mise. Inactive-card
  styling remains a real Workspace concern; landing Dish, Recipe, Ingredient,
  and Menu cards stay visually neutral. The persistent `Open full Workspace`
  header doorway selects the Deanos Demo target before entering
  `/workspace/kitchen`; the root otherwise owns only local Dish page identity,
  filters Drink records from the entry-level Dishes showcase, and suppresses
  Food/Drink type labels there, while the
  Dishes
  coordinator owns its breadcrumb, persistent image-backed icon-only page
  selector, and page dispatch. The muted Dish image remains stable while child
  pages change; its circled information icon represents the selected Dish
  overview, and accessible names and hover titles preserve each icon's meaning.
  Detail tiles are navigation doorways rather than inline expanders.
  Children consume typed read-only props and do not acquire Workspace selection,
  Demo loading, live reads, Firebase, or write authority. The project source
  begins at
  `projects/misebox/misebox-app/app/components/Misebox/Landing/WorkspacePreview/Index.vue`.
  FireUX consumes the same shell for its Project Operations and projects Apps
  and Ecosystems from the explicitly FireUX-owned Core Project Demo scenario.
  Ignition remains App intake with a separate private app-admin delivery
  workflow; it is not a Project Operation. User activity remains a truthful
  private state. The Workspace doorway selects the real Demo Project only when
  that projection succeeds. Mobile keeps each component before the text and desktop places it
  to the left. Project proof truth never moves into Core. Core
  `LandingCardOrbit` owns deterministic sphere geometry, drag/keyboard
  interaction, a one-shot visibility-gated desktop launch with one stable
  per-mount vector, two closed turns through one long deceleration that settles
  exactly onto the main pitch, continuous visibility-aware autoplay in the same
  direction, desktop hover selection that elevates one card in place without
  snapping the pack or changing touch/root keyboard behavior, fully opaque and
  crisp orbital elements whose scale and stacking carry depth, gentle mobile
  autoplay that continues while the document is visible, and reduced-motion behavior
  for card showcases. It receives typed items and one dumb item slot; FireUX
  projects its bounded public
  App/Ecosystem directory into canonical Cards from the explicit `live` source.
  Misebox instead projects its network-free Demo PowerCards into a local,
  keyboard-focusable left-to-right scroll window with a responsive bento grid.
  The shared
  orbit source discriminant is closed to `demo | live`; an orbit cannot mix,
  join, or fall back across those sources. The Misebox window preserves its
  single `demo` envelope without adopting orbit geometry or motion. The orbit
  is a landing compositor, not a fourth Card variant and not a Sci-Fire-only
  component. Core
  `EffectsAmbient` owns the fixed viewport, isolation, content-stack, and print
  contract for project-owned landing art. FireUX Stars and Misebox Steam are
  the sibling visual consumers: they share the outer layer and reduced-motion
  contract while retaining distinct app-owned character. FireUX Stars uses the
  deterministic Core field helper; Misebox Steam retains its project-owned
  client-initialized puff lifecycle. Core
  `LandingAppCollection` renders the bounded public App directory controller
  inside the product landing's named App slot; the project supplies only
  section copy and presentation-safe filtering, never a hard-coded tenant App
  list or direct App storage read. Solution grids,
  compact metrics, ordinary card roots, and dashboard body stacks use Nuxt UI
  directly rather than retaining parallel global CSS.
- `assets/styles/main.scss` is the explicit cascade authority. Its import order
  preserves behavior and the file remains import-only; a CSS folder name does
  not create component auto-import, route ownership, or business ownership.
- The `/design/components/contracts` page exposes stable light/dark, desktop,
  and mobile specimens for these shared contracts.

## Domain component folders

Inside `runtime/<entity>/components`:

- `Cards`
- `Collection`
- `Create`
- `Onboarding.vue` with named stages under `Onboarding/*`
- `Detail.vue`
- `Detail/Index.vue` when detail owns child slices
- `Edit`
- `Overview`
- `Workspace/*`

## Detail rule

- Use `X/Detail.vue` when the detail component is simple and self-contained.
- Use `X/Detail/Index.vue` when the detail surface owns child components.
- Put those child components inside `X/Detail/*` so the filesystem reads like the UI surface.

## Root entity naming

- Entity component roots such as `runtime/kitchen/components`,
  `runtime/menu/components`, and `runtime/supplier/components` already declare
  their owner.
- Do not prefix components in those folders with `Public` unless it names a
  real publication or privacy boundary.
- A surface such as Workspace, Detail, Directory, or Kiosk may qualify the path
  inside the entity's component role; it does not replace the entity owner.

## Workspace component folders

The entity-scoped destination is:

- `runtime/<entity>/components/Workspace/Index`
- `runtime/<entity>/components/Workspace/Overview`
- `runtime/<entity>/components/Workspace/Identity`
- `runtime/<entity>/components/Workspace/Team`
- `runtime/<entity>/components/Workspace/Capability` for shared capability chrome
- `runtime/<entity>/components/Workspace/<Capability>` for a named capability
- `runtime/<entity>/components/Workspace/Sundries`

Shared Workspace presentation remains under `runtime/components/Workspace`.
Entity Workspace families now live beneath their owner. Do not recreate
`runtime/components/Workspace/X`; shared Workspace presentation alone remains in
the root Workspace folder.

## Workspace bucket rule

- Every Workspace Entity uses `Index`, `Overview`, `Identity`, and `Team`.
  Entity-specific `Operations` and temporary `Sundries` remain optional.
  Notifications is supplied once by the shared Workspace shell.
- These buckets are directories. Prefer
  `runtime/<entity>/components/Workspace/Overview/Index.vue` over a peer
  `Overview.vue` file.
- `Team` is a shared workspace access concept, not an operation.
- `Operations` contains selected-target work such as kitchen dishes, menus, orders, recipes, or supplier catalogue items.
- `Sundries` quarantines parked or underdeveloped workspace surfaces so they do not pretend to be confirmed operations.
- Operation folders should default to an entry component, `Read.vue`, `Write.vue`, and optional `Detail.vue`.
- `Read` answers what exists. `Write` owns deliberate creation or editing when
  the operation genuinely supports those actions; safe atomic edits should
  compose the shared profile-editable/form molecules rather than inventing a
  page-wide draft and Save system.
- A live workflow may replace generic `Read`/`Write` wrappers with named
  operator stages when its writes are lifecycle commands rather than entity
  editing. Keep those commands explicit, scoped, and separate from CRUD.
- Use `Index.vue` only when the folder itself is intentionally the auto-imported component.
- `Create` belongs to root/public entity creation by default. In scoped operations, prefer `Write` unless a real UI workflow is named creation.
- Workflow subfolders under operations should be named after visible operator concepts, not technical storage buckets.

## Working rules

- Prefer named domain components over vague generic shells.
- Share functions/composables where behavior is common.
- Let child components own local presentation when it reduces parent script weight.
- Keep Nuxt UI as the default chrome layer.
- Staged entity onboarding uses the small shared
  `MoleculesOnboardingSystem` shell for structure, stage progress, error
  placement, and slots. Each domain retains its own `XOnboarding` root and one
  `XOnboarding<Stage>` component per visible decision; domain copy, drafts,
  validation, actions, navigation, and creation never move into the shared
  shell. See `lasagne.md` for the dependency rule.
- Nuxt UI owns the ordinary global visual baseline, including `--ui-radius`.
  FireUX consumes that value but does not redeclare the installed default.
- Purely aesthetic global behavior is not part of the current system baseline:
  do not hide scrollbars globally or animate every page-body child on entry.
  Core's single Nuxt-generated route-transition integration is the narrow
  shared navigation contract, not permission for broad page-motion recipes.
- Shared visual primitives such as radius, borders, elevation, standard
  spacing, surface backgrounds, and control geometry belong to Nuxt UI theme
  configuration or a real reusable component/molecule. Domain components
  compose those primitives; they do not redeclare them in every file.
- Tailwind's installed font families, type sizes, weights, line heights, and
  tracking values are the numeric typography authority. Templates may compose
  named Tailwind utilities for local presentation; authored CSS derives
  ordinary values from the corresponding Tailwind theme variables.
- Repeated semantic typography uses the core `.fx-type-*` roles in
  `assets/styles/scss/atoms/typography.scss`. Those roles mirror Nuxt UI's page
  vocabulary rather than creating a second scale: headline, page title,
  display title, section title/display, card title/heading, description, body,
  caption, label, and code. Headline is page/section eyebrow copy; label is
  compact metadata or field/status copy. Display title owns the recurring
  FireUX landing H1 recipe; section-display and card-heading are the larger
  marketing/card variants rather than repeated utility overlays.
- Domain-owned display type, print/output geometry, debug microtype, artwork,
  and responsive optical type may stay exact when they are a real local delta.
  They must not become a parallel general-purpose type scale.
- Before adding CSS or another wrapper, use the complete Nuxt UI component
  contract: variants, colors, sizes, slots, loading, disabled, and state
  semantics. Wrapping a Nuxt UI component in a second local design layer is
  duplication, not abstraction.
- Shared molecules exist for repeated multi-element contracts that Nuxt UI
  does not own by itself. `MoleculesDisclosurePanel` owns the standard
  collapsible trigger and open-state chevron, and `MoleculesActionSurface`
  owns the linked, action-button, or static root of an entity card. Ordinary
  create cards use `UCard` directly. Editable field molecules own their
  display, edit, save, cancel, and error lifecycle; their `value` and `update`
  props are transport-neutral and therefore use the `FormsEditable` vocabulary rather
  than naming Firestore. These components do not own domain copy or domain
  card content.
- Disabled interactive cards must use the action-surface contract. Styling a
  `NuxtLink` or clickable `div` with reduced opacity does not disable
  navigation, provide button semantics, or remove it from keyboard operation.
- `MoleculesStateCard` represents an explicit `loading`, `empty`, `missing`, or
  `error` outcome and can render as a standalone card or a bare state inside an
  existing card. Missing data and failed reads are different outcomes. Use
  `UAlert` for compact notices and actionable errors, and use `USkeleton` when
  the loading state needs to preserve the shape of real content.
- Component-scoped CSS is for genuine domain layout and state deltas. Do not
  replace long inline Tailwind strings with the same repeated design system in
  local CSS. When a touched surface has grown either way, move the shared
  primitive to its owning layer and keep the leaf component semantic.
- `scripts/guards/css-system.mjs` enforces the narrow executable CSS spine and
  its ordered core entrypoint:
  current Nuxt UI variables, semantic text and surface utilities, `--ui-radius`
  authority through `rounded-*` utilities or direct calculations in authored
  CSS, Tailwind-owned ordinary typography and spacing values, and retirement
  of the audited entity-card, inset-panel, raw disclosure, repeated card-stack,
  and visual-only disabled recipes.
- Package and project templates use Nuxt UI semantic color utilities rather
  than raw Tailwind palette utilities for ordinary UI. Intentional brand,
  artwork, overlay, print, and output colors remain owned deltas and should use
  a named local seam or a narrow reviewed guard exception when they need to
  differ from ordinary UI semantics.
- Ordinary rectangular UI uses the installed Nuxt UI `xs` through `3xl`
  radius scale. Do not add a parallel radius step or an arbitrary numeric
  radius. True circles and pills, explicitly approved percentage artwork, and
  owned domain seams are exceptions; Menu's owned radius seams derive from
  `--ui-radius` by default.
- Tailwind's `--spacing` is the single numeric spacing authority. Templates
  use named Tailwind spacing utilities for genuinely local composition;
  authored CSS derives ordinary margin, padding, and gap values from
  `--spacing` instead of declaring a second `--space-*` scale.
- Repeated page, list, form, or layout rhythm belongs in a named shared class
  or component. Core rhythm and composition live in the specifically named
  modules under `assets/styles/scss/molecules` and
  `assets/styles/scss/organisms`; `organisms/page-layouts.scss` owns the shared
  page/list rhythm family, while `organisms/public-profile-surfaces.scss` owns
  only the cross-domain specialist detail grid, sidebar rhythm, and semantic
  tone inheritance. Profile editor headers and field rhythm remain with Nuxt
  UI page cards and their named form components rather than a global editor
  organism. Domain-owned semantic seams, such as Menu spacing, may remain when
  their defaults derive from `--spacing`.
- Off-grid spacing is an explicit local delta for branded optical layout,
  responsive/viewport geometry, safe areas, print, artwork, or accessibility;
  it is not another general-purpose scale.
- The CSS guard does not ban one-off Tailwind for local layout, pixel-specific
  non-system deltas, or intentional branded color.

## Guard warnings

- No component `organisms` folders or `Organisms*` component names.
- `assets/styles/scss/organisms` is a CSS composition layer, not a component
  bucket; keep it semantic and shared rather than using it as catch-all CSS.
- Relative imports in component source must resolve.
