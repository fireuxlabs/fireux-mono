# Components spine map
<!-- Concurrent edit — 2026-07-23 02:43 CEST — Map the shared product-led landing surface and project proof slot. -->
<!-- Concurrent edit — 2026-07-23 12:13 CEST — Record FireUX as the second shared product-landing consumer. -->
<!-- Concurrent edit — 2026-07-23 — Extract the two-consumer product-preview frame without moving product proof into Core. -->
<!-- Concurrent edit — 2026-07-25 — Map Misebox's real Orders proof inside the shared Main App hero. -->
Updated: 2026-07-25
Ref: e98ffb195
Role: map, not canon

## Purpose
Map component folder and naming conventions.

## Vertical links
- Parent: nuxt-ui.md
- Child: family-console-entity.md
- Child: family-public-index.md
- Child: family-public-detail.md

## Horizontal links
- pages.md
- composables.md
- debug.md

## Package components
- Package UI belongs under `src/runtime/components`.
- App UI belongs under `app/components`.

## CSS-to-component mapping
- The CSS atomic taxonomy supports the Vue tree; it does not mirror it. Vue
  components remain domain-first (`Kitchen/Cards`, `Supplier/Collection`,
  `Console/X/Operations`) and pages remain route-first.
- `atoms` own foundations or one semantic visual role, such as system tokens
  and the `.fx-type-*` vocabulary. They do not own a form, card, or page
  composition.
- `molecules` own reusable local contracts assembled from atoms and Nuxt UI,
  such as browser-level form behavior, inset panels, pills, and entity/preview
  card anatomy that the installed component library does not provide.
- `organisms` own recurring multi-component or page-region composition, such
  as collection layouts, public-action panels, profile/console composition,
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
  named `X/Cards/*` components; collection organisms to `X/Collection/*` and
  console indexes; console header/summary molecules plus the console surface
  organism to `Console/X/*`; public-action organisms to claim/operator panels;
  profile cards to named `Cards/Profile` trees; the public specialist-profile
  family composes Core `PublicProfileHero`, `PublicProfileSection`, and
  `PublicProfileDirectoryCard` presentation while each named domain retains
  its content; profile editors use Nuxt UI cards and named `Edit/*` form
  composition; and page organisms to genuinely shared layout and route
  regions. Core `LandingProductIndex` owns the
  product-led public landing composition and responsive/reveal behavior; app
  projects supply typed copy, routes, catalogues, and genuine product proof
  through its named slot rather than copying that presentation. FireUX and
  Misebox are the current sibling consumers. Misebox fills the shared hero's
  proof slot with a read-only real Orders board reduced to three tickets in one
  Pass rail, without a project-owned outer preview frame, and keeps the shared
  typed hero text as the only explanation. Misebox reuses the existing Core
  hero action hierarchy beside the proof for its project-owned conversion
  routes and short capability notes; it does not add a detached CTA card.
  Core's `copy-proof` presentation remains available when a consumer needs to
  omit action and trust rows. Core's paired `proof-wide` layout owns the
  mobile-first full-viewport hero breakout, retaining compact phone gutters
  and adding the text/proof columns only at wider breakpoints. Core
  exposes a post-hero slot for project-owned conversion content without
  absorbing its routes or copy. Misebox uses that seam for its second landing
  section, pairing a read-only canonical Kitchen Operations launcher with
  project-owned Console copy. Its thin root owns frame/navigation, local page
  state, and one Product Demo load. Named Menus, Dishes, Recipes, Mise, and
  empty-canvas children own their projected bodies; Dishes further separates
  Collection, image-led Detail, and named Finance/Spec/Prep/Recipes/Mise child
  pages. The root owns local Dish page identity, the Dishes coordinator owns
  its breadcrumb and page dispatch, and detail tiles are navigation doorways
  rather than inline expanders. Children consume typed read-only props and do
  not acquire Console selection, Demo loading, live reads, Firebase, or write
  authority. The project source begins at
  `projects/misebox/misebox-app/app/components/Misebox/Landing/ConsolePreview/Index.vue`.
  Mobile keeps the component before the text and desktop places it to the left.
  Core
  `LandingProductPreviewFrame` owns the
  narrated-preview frame when a project genuinely needs identity/status
  chrome, mode controls, panel transition, footer action, and reduced-motion
  behavior; project proof truth never moves into Core. Core
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
- `X/Cards`
- `X/Collection`
- `X/Create`
- `X/Onboarding.vue` with named stages under `X/Onboarding/*`
- `X/Detail.vue`
- `X/Detail/Index.vue` when detail owns child slices
- `X/Edit`
- `X/Overview`
- `Console/X/*`

## Detail rule
- Use `X/Detail.vue` when the detail component is simple and self-contained.
- Use `X/Detail/Index.vue` when the detail surface owns child components.
- Put those child components inside `X/Detail/*` so the filesystem reads like the UI surface.

## Root entity naming
- Root entity component folders such as `Kitchen/**`, `Menu/**`, and `Supplier/**` are already public/root surfaces.
- Do not prefix components in those folders with `Public` unless it names an external imported concept.
- Use route/composable buckets such as `fireux/public/*` when “public” distinguishes runtime behavior rather than component location.

## Console component folders
- `Console/X/Index`
- `Console/X/Overview`
- `Console/X/Identity`
- `Console/X/Team`
- `Console/X/Operations`
- `Console/X/Sundries`

## Console bucket rule
- Every `components/Console/X` family should expose the same peer buckets: `Index`, `Overview`, `Identity`, `Team`, `Operations`, and optional `Sundries`.
- These buckets are directories. Prefer `Console/X/Overview/Index.vue` over `Console/X/Overview.vue`.
- `Team` is a shared console access concept, not an operation.
- `Operations` contains selected-target work such as kitchen dishes, menus, orders, recipes, or supplier catalogue items.
- `Sundries` quarantines parked or underdeveloped console surfaces so they do not pretend to be confirmed operations.
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
  `MoleculesOnboardingSystem` shell for progress, navigation, pending, and
  errors. Each domain retains its own `XOnboarding` root and one
  `XOnboarding<Stage>` component per visible decision; domain copy, drafts,
  validation, and creation never move into the shared shell.
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
  collapsible trigger and open-state chevron; `MoleculesCreateCard` owns the
  recurring create-workflow card header and body rhythm; and
  `MoleculesActionSurface` owns the linked, action-button, or static root of an
  entity card. These components do not own domain copy or domain card content.
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
