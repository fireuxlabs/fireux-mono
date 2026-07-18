Components spine map
Updated: 2026-07-18
Ref: dd0401906
Role: map, not canon

Purpose:
Map component folder and naming conventions.

Vertical links:
- Parent: nuxt-ui.md
- Child: family-console-entity.md
- Child: family-public-index.md
- Child: family-public-detail.md

Horizontal links:
- pages.md
- composables.md
- debug.md

Package components:
- Package UI belongs under `src/runtime/components`.
- App UI belongs under `app/components`.

Domain component folders:
- `X/Cards`
- `X/Collection`
- `X/Create`
- `X/Detail.vue`
- `X/Detail/Index.vue` when detail owns child slices
- `X/Edit`
- `X/Overview`
- `Console/X/*`

Detail rule:
- Use `X/Detail.vue` when the detail component is simple and self-contained.
- Use `X/Detail/Index.vue` when the detail surface owns child components.
- Put those child components inside `X/Detail/*` so the filesystem reads like the UI surface.

Root entity naming:
- Root entity component folders such as `Kitchen/**`, `Menu/**`, and `Supplier/**` are already public/root surfaces.
- Do not prefix components in those folders with `Public` unless it names an external imported concept.
- Use route/composable buckets such as `fireux/public/*` when “public” distinguishes runtime behavior rather than component location.

Console component folders:
- `Console/X/Index`
- `Console/X/Overview`
- `Console/X/Identity`
- `Console/X/Team`
- `Console/X/Operations`
- `Console/X/Sundries`

Console bucket rule:
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

Working rules:
- Prefer named domain components over vague generic shells.
- Share functions/composables where behavior is common.
- Let child components own local presentation when it reduces parent script weight.
- Keep Nuxt UI as the default chrome layer.
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
- `scripts/guards/css-system.mjs` enforces the narrow executable CSS spine:
  current Nuxt UI variables, semantic text and surface utilities, `--ui-radius`
  authority through `rounded-*` utilities or direct calculations in authored
  CSS, Tailwind-owned ordinary typography and spacing values, and retirement
  of the audited entity-card, inset-panel, raw disclosure, repeated card-stack,
  and visual-only disabled recipes.
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
  or component. Current shared rhythm classes live in core
  `assets/styles/scss/organisms/sections.scss`. Domain-owned semantic seams,
  such as Menu spacing, may remain when their defaults derive from
  `--spacing`.
- Off-grid spacing is an explicit local delta for branded optical layout,
  responsive/viewport geometry, safe areas, print, artwork, or accessibility;
  it is not another general-purpose scale.
- The CSS guard does not ban one-off Tailwind for local layout, pixel-specific
  non-system deltas, or intentional branded color.

Guard warnings:
- No component `organisms` folders or `Organisms*` component names.
- `assets/styles/scss/organisms` is a CSS composition layer, not a component
  bucket; keep it semantic and shared rather than using it as catch-all CSS.
- Relative imports in component source must resolve.

Open questions:
- Operator/claim/action panels need a clearer entity-family spine.
