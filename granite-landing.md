# Granite Landing Alignment Report

Date: 2026-02-27
Repo: `fireux-mono`

## Scope

Reviewed all project landing routes/components to define a concrete alignment contract for Granite:

- Home pages: `projects/*/*/app/pages/index.vue`
- Additional landing-routed pages (`layout: 'landing'`):
  - `projects/misebox/misebox-app/app/pages/get-started.vue`
  - `projects/misebox/misebox-app/app/pages/programme.vue`
- Shared landing layout + spacing contract:
  - `packages/core/fireux-core/src/runtime/layouts/landing.vue`
  - `packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/sections.scss`

## Full Landing File Paths

Complete path inventory for landing-related implementation files in this repo.

### Shared landing infrastructure (core)

- `packages/core/fireux-core/src/runtime/layouts/landing.vue`
- `packages/core/fireux-core/src/runtime/components/landing/Shell.vue`
- `packages/core/fireux-core/src/runtime/components/effects/LandingEffect.vue`
- `packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/sections.scss`

### Landing entry pages

- `projects/bringli/bringli-app/app/pages/index.vue`
- `projects/cleanbox/cleanbox-app/app/pages/index.vue`
- `projects/cleanbox/richies-reinigung/app/pages/index.vue`
- `projects/fireux/fireux-app/app/pages/index.vue`
- `projects/fireux/fireux-app/app/pages/get-started.vue`
- `projects/fireux/tenant/app/pages/index.vue`
- `projects/fireux/tenant/app/pages/join.vue`
- `projects/granite/granite-app/app/pages/index.vue`
- `projects/misebox/misebox-app/app/pages/index.vue`
- `projects/misebox/misebox-app/app/pages/get-started.vue`
- `projects/misebox/misebox-app/app/pages/programme.vue`
- `projects/misebox/niederhorn/app/pages/index.vue`
- `projects/templates/fireux-template/app/pages/index.vue`

### Landing components (all app-level `components/landing`)

- `projects/cleanbox/cleanbox-app/app/components/landing/Apps.vue`
- `projects/cleanbox/cleanbox-app/app/components/landing/BrandBadge.vue`
- `projects/cleanbox/cleanbox-app/app/components/landing/CTA.vue`
- `projects/cleanbox/cleanbox-app/app/components/landing/Features.vue`
- `projects/cleanbox/cleanbox-app/app/components/landing/GetStarted.vue`
- `projects/cleanbox/cleanbox-app/app/components/landing/Hero.vue`
- `projects/cleanbox/cleanbox-app/app/components/landing/HeroBottom.vue`
- `projects/cleanbox/cleanbox-app/app/components/landing/HeroMiddle.vue`
- `projects/cleanbox/cleanbox-app/app/components/landing/HeroSection.vue`
- `projects/cleanbox/cleanbox-app/app/components/landing/HeroTop.vue`
- `projects/cleanbox/cleanbox-app/app/components/landing/Integrations.vue`
- `projects/cleanbox/cleanbox-app/app/components/landing/Products.vue`
- `projects/cleanbox/cleanbox-app/app/components/landing/QuickLinks.vue`
- `projects/cleanbox/cleanbox-app/app/components/landing/QuickPeek.vue`
- `projects/cleanbox/cleanbox-app/app/components/landing/Solutions.vue`
- `projects/cleanbox/cleanbox-app/app/components/landing/TechStack.vue`
- `projects/cleanbox/richies-reinigung/app/components/landing/CTA.vue`
- `projects/cleanbox/richies-reinigung/app/components/landing/Features.vue`
- `projects/cleanbox/richies-reinigung/app/components/landing/Fuel.vue`
- `projects/cleanbox/richies-reinigung/app/components/landing/Hero.vue`
- `projects/cleanbox/richies-reinigung/app/components/landing/Integrations.vue`
- `projects/cleanbox/richies-reinigung/app/components/landing/QuickPeek.vue`
- `projects/cleanbox/richies-reinigung/app/components/landing/Shell.vue`
- `projects/cleanbox/richies-reinigung/app/components/landing/SkillsIcons.vue`
- `projects/cleanbox/richies-reinigung/app/components/landing/Solutions.vue`
- `projects/cleanbox/richies-reinigung/app/components/landing/SolutionsCards.vue`
- `projects/cleanbox/richies-reinigung/app/components/landing/TechStack.vue`
- `projects/fireux/fireux-app/app/components/landing/Apps.vue`
- `projects/fireux/fireux-app/app/components/landing/BrandBadge.vue`
- `projects/fireux/fireux-app/app/components/landing/Ecosystems.vue`
- `projects/fireux/fireux-app/app/components/landing/Features.vue`
- `projects/fireux/fireux-app/app/components/landing/FireUX.vue`
- `projects/fireux/fireux-app/app/components/landing/Fuel.vue`
- `projects/fireux/fireux-app/app/components/landing/GetStarted.vue`
- `projects/fireux/fireux-app/app/components/landing/Hero.vue`
- `projects/fireux/fireux-app/app/components/landing/HeroBottom.vue`
- `projects/fireux/fireux-app/app/components/landing/HeroMiddle.vue`
- `projects/fireux/fireux-app/app/components/landing/HeroSection.vue`
- `projects/fireux/fireux-app/app/components/landing/HeroTop.vue`
- `projects/fireux/fireux-app/app/components/landing/Products.vue`
- `projects/fireux/fireux-app/app/components/landing/QuickLinks.vue`
- `projects/fireux/fireux-app/app/components/landing/QuickPeek.vue`
- `projects/fireux/fireux-app/app/components/landing/SkillsIcons.vue`
- `projects/fireux/fireux-app/app/components/landing/Solutions.vue`
- `projects/fireux/tenant/app/components/landing/Features.vue`
- `projects/fireux/tenant/app/components/landing/FireUX.vue`
- `projects/fireux/tenant/app/components/landing/Fuel.vue`
- `projects/fireux/tenant/app/components/landing/Hero.vue`
- `projects/fireux/tenant/app/components/landing/QuickPeek.vue`
- `projects/fireux/tenant/app/components/landing/Shell.vue`
- `projects/fireux/tenant/app/components/landing/SkillsIcons.vue`
- `projects/fireux/tenant/app/components/landing/Solutions.vue`
- `projects/misebox/misebox-app/app/components/landing/Apps.vue`
- `projects/misebox/misebox-app/app/components/landing/BrandBadge.vue`
- `projects/misebox/misebox-app/app/components/landing/Features.vue`
- `projects/misebox/misebox-app/app/components/landing/GetStarted.vue`
- `projects/misebox/misebox-app/app/components/landing/Hero.vue`
- `projects/misebox/misebox-app/app/components/landing/HeroBottom.vue`
- `projects/misebox/misebox-app/app/components/landing/HeroMiddle.vue`
- `projects/misebox/misebox-app/app/components/landing/HeroSection.vue`
- `projects/misebox/misebox-app/app/components/landing/HeroTop.vue`
- `projects/misebox/misebox-app/app/components/landing/Integrations.vue`
- `projects/misebox/misebox-app/app/components/landing/Products.vue`
- `projects/misebox/misebox-app/app/components/landing/QuickLinks.vue`
- `projects/misebox/misebox-app/app/components/landing/Solutions.vue`
- `projects/misebox/niederhorn/app/components/landing/Features.vue`
- `projects/misebox/niederhorn/app/components/landing/Fuel.vue`
- `projects/misebox/niederhorn/app/components/landing/Hero.vue`
- `projects/misebox/niederhorn/app/components/landing/QuickPeek.vue`
- `projects/misebox/niederhorn/app/components/landing/Shell.vue`
- `projects/misebox/niederhorn/app/components/landing/SkillsIcons.vue`
- `projects/misebox/niederhorn/app/components/landing/Solutions.vue`

### Landing visual effects used by app landing pages

- `projects/cleanbox/cleanbox-app/app/components/effects/Bubbles.vue`
- `projects/cleanbox/richies-reinigung/app/components/effects/Bubbles.vue`
- `projects/fireux/fireux-app/app/components/effects/Stars.vue`
- `projects/fireux/tenant/app/components/effects/Stars.vue`
- `projects/misebox/misebox-app/app/components/effects/Steam.vue`
- `projects/misebox/niederhorn/app/components/effects/Stars.vue`

## Current Landscape (What Other Apps Do)

### 1) Layout baseline

All active product home pages use `layout: 'landing'` except Granite.

- Uses `landing`: Bringli, Cleanbox, Richies, FireUX, Tenant, Misebox, Niederhorn
- Uses `default`: Granite

### 2) Structure archetypes in production

- Archetype A (modular stack): `Effects*` + `LandingHeroSection` + section flow (`LandingGetStarted`, `LandingProducts`, `LandingApps`, optional `Fuel/Features/Skills`)
  - Used by: FireUX, Cleanbox, Misebox
- Archetype B (shell + domain cards): `Effects*` + `LandingShell` (hero left, quick peek right) + `LandingSolutions` + optional `Fuel/Features/Skills`
  - Used by: Tenant, Niederhorn, Bringli
- Archetype C (single-card brand page):
  - Used by: Richies (intentional outlier)

### 3) Shared behavior patterns

- Home routes include `definePageMeta(... nav ...)` and `useSeoMeta(...)`.
- Top-of-page visual effect is common (`EffectsStars`, `EffectsBubbles`, `EffectsSteam`, etc.).
- Hero includes at least one primary CTA and usually a secondary CTA.
- Auth-aware shortcut pattern exists in multiple apps:
  - Authenticated: `Go to console` -> `/console`
  - Anonymous: `Get started` -> `/get-started`
- Lucide icon contract is consistent (`i-lucide-*`), matching UX conventions.

### 4) Shared spacing/visual contract

From `sections.scss`:

- `.landing-index-flow` provides stacked section rhythm.
- `.landing-index-flow > * + *` adds section dividers.
- `.landing-index-section` uses large vertical breathing room (`padding-block: 9rem`).
- Hero class family (`landing-hero*`) standardizes heading/body/actions/bullets behavior.

## Granite Current State

File: `projects/granite/granite-app/app/pages/index.vue`

What Granite does now:

- Uses `layout: 'default'`, not `landing`.
- Renders a minimal `UPageHeader + UCard` block.
- CTA pathing is correct for current runtime model (`/portfolios`, `/console/portfolio`).
- Has SEO metadata.

Where it diverges from ecosystem baseline:

- No landing-shell or modular section flow.
- No landing visual effect.
- No landing component set under `app/components/landing`.
- No auth-aware quick-link CTA behavior.
- No dedicated onboarding/marketing landing rhythm matching peer apps.

## Granite Alignment Boundaries

Use these boundaries as acceptance criteria for Granite landing alignment.

### MUST

1. Home page layout uses `layout: 'landing'` and nav metadata targets `layouts: ['landing']`.
2. Home page includes a recognizable landing hero pattern (Archetype A or B), not a plain `default` page card.
3. Preserve runtime entry CTA model:
   - Primary: portfolio context selection (`/portfolios`)
   - Secondary: open runtime console (`/console/portfolio`)
4. Use shared spacing contracts:
   - `.landing-index-flow`
   - `.landing-index-section`
   - shared hero class family or equivalent visual rhythm
5. Include `useSeoMeta` with Granite-specific title + description on landing pages.
6. Keep icon naming on Lucide (`i-lucide-*`) and copy in sentence case.
7. Keep landing asset usage on canonical app paths:
   - `/img/app/logo.png`
   - `/img/app/wordmark-light.png`
   - `/img/app/wordmark-dark.png`
   - `/img/app/cover.png`, `/img/app/thumbnail.png` when used

### SHOULD

1. Add an auth-aware quick action card on home:
   - authenticated -> `/console`
   - anonymous -> `/get-started` (or Granite equivalent onboarding route)
2. Introduce a Granite onboarding page (`/get-started`) under `layout: 'landing'`.
3. Keep section count between 3 and 6 on home to match current ecosystem scannability.
4. Ensure each section has one clear CTA route (avoid dead/demo-only links on the primary path).
5. Reuse existing landing primitives where possible (`LandingShell`, `LandingSolutions`) before creating unique one-off structures.

## Recommended Granite Target Pattern

Recommended: Archetype B (closest to Granite’s domain + existing runtime gating).

Proposed section contract:

1. `Effects*` background
2. `LandingShell`
   - Left: Granite value proposition + two CTAs (`/portfolios`, `/console/portfolio`)
   - Right: quick peek card (portfolio runtime status + key workflows)
3. `LandingSolutions`
   - Cards for: Properties, Compliance, Documents, Tasks, Portfolio Setup
4. Optional credibility/feature section (`LandingFeatures`-style) for landlord workflows

This keeps Granite aligned with Tenant/Niederhorn/Bringli while preserving Granite’s portfolio-runtime-first flow.

## Handoff Notes for Support

If support asks “what exactly should change first,” prioritize in this order:

1. Switch Granite home to `layout: 'landing'`.
2. Replace current `UPage` block with a `LandingShell`-based hero + CTA structure.
3. Add one sectioned flow block (`LandingSolutions`) using shared landing spacing classes.
4. Add auth-aware quick action behavior (`/console` vs onboarding route).
5. Keep all CTAs console/portfolio-runtime correct (`/portfolios`, `/console/portfolio`).
