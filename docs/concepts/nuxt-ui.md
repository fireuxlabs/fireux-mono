# Nuxt UI concept map
Updated: 2026-07-22
Ref: 796952bf0
Role: map, not canon

## Purpose
Explain the UI library context for agents.

## Vertical links
- Parent: AGENTS.md
- Child: components.md
- Child: pages.md

## Horizontal links
- nuxt4.md
- debug.md
- color-mode.md

## UI stack
- FireUX uses Nuxt UI / Nuxt UI Pro style components.
- Common shell components include `UPage`, `UPageHeader`, `UPageBody`,
  `UPageGrid`, `UPageColumns`, `UPageCard`, `UPageFeature`, `UPageHero`,
  `UPageSection`, `UCard`, `UButton`, and dashboard components.
- The installed Nuxt UI package source is the contract authority when its
  alpha/version differs from later online documentation. Do not assume a
  component or prop exists without checking the installed package.

## Working style
- Prefer existing Nuxt UI components over handmade HTML chrome.
- Configure universal component defaults through Nuxt UI app configuration;
  use direct component props for ordinary color, variant, size, loading, and
  disabled states; reserve per-instance `ui` slot overrides for genuine local
  composition.
- A shared FireUX molecule is appropriate only when the repeated contract
  spans multiple Nuxt UI elements or adds semantics Nuxt UI does not provide
  as one component. Current seams are disclosure triggers, create-workflow
  cards, entity-card action roots, and explicit state cards.
- Do not recreate a Nuxt UI page grid, card root, dashboard body stack, page
  transition, or ordinary radius default in global CSS. A one-component layout
  delta stays with that component; global CSS requires repeated cross-tree
  evidence or a narrow browser/accessibility behavior.
- Nuxt UI owns the ordinary `--ui-radius` default. FireUX may calculate from
  that live variable but must not copy its installed value into a second token
  declaration.
- Use `ULink`/`UButton` disabled behavior rather than visual-only disabled
  classes. Use `UAlert` for notices and errors, `USkeleton` for shaped loading,
  and the FireUX state card for empty/missing/loading outcome presentation.
- Preserve existing app/package visual language.
- Keep pages composed from domain components where possible.
- Avoid heavy parent scripts that pass many tiny display props; let named child components own local presentation when reasonable.

## Typography
- Nuxt UI's semantic text colors and Tailwind's installed typography scale are
  the default system.
- Core `.fx-type-*` roles name repeated Nuxt UI page typography without owning
  another numeric scale; headline and label remain distinct, while the display
  title owns the recurring FireUX landing H1 recipe.
- Named Tailwind type utilities remain appropriate for local composition.
- Exact tenant display, artwork, print/output, debug, and responsive optical
  typography remain owned deltas when the shared roles do not describe them.

## Design caution
- Display defaults are okay.
- Fake stored truth is not okay.
- Do not add fallback identity, fake logos, fake avatars, or fake canonical data.

## When touching frontend
- Check nearest sibling page/component first.
- Keep mobile and desktop layout safe.
- Avoid generic AI-looking boilerplate if creating a new visual surface.
