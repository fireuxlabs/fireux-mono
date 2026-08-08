# Identity and product literature context

Updated: 2026-08-04
Ref: 1d6857c57
Role: living context
Scope: cross-system Main App identity, landing, pricing, and product literature

## Inheritance

This context inherits `AGENTS.md` and `docs/ai/gpt-context.md`. Product wording
also follows `docs/concepts/product-language.md`. App-specific work continues to
inherit the relevant App or ecosystem context.

## Purpose

Keep the Main App family understandable in normal English while preserving the
real identity and capability boundary of each product. Use this context for
recurring cross-system landing, pricing, Console, Operation, Tool, Solution,
and ecosystem literature work.

## Scope

The primary comparison is the FireUX Main App and the current global ecosystem
Apps. Tenant Apps are evidence for what an ecosystem supports, but they do not
define the parent product or receive ecosystem-owner pricing literature.
Standalone utilities enter the comparison only when current source proves a
shared public-language or pricing seam applies to them.

## Ownership boundaries

- Core owns shared landing anatomy, motion, pricing meanings, tier routes,
  `usePricing`, and reusable prop-driven presentation contracts. Each Main App
  owns one `useXPricing` wrapper for its Console name, capabilities, limits,
  contact, and explicit ecosystem-tier eligibility. Pricing literature is not
  App boot configuration and never enters `defineFireuxConfig` or public
  runtime config.
- Core owns the exact Main App Hero font family and display weight. Both remain
  identical across Main Apps unless an explicit product typography delta is
  declared.
- FireUX, Misebox, Werkbox, BuenoHost, Bringli, and Granite use Core's shared
  immersive section dwell. Slap shares the anatomy but is an accepted
  brand-commerce interaction delta and opts out through the Core seam.
- Main App landings use Hero, pricing, product surfaces, then App-owned deeper
  features. A single surface has no selector; multiple genuine usage surfaces
  may use one. Operations inside a Console are not separate surfaces.
- Core owns the landing region vocabulary and default order. Each Main App may
  provide an ordered subset through the shared `regionOrder` seam so its real
  product layers remain truthful without copying the renderer or inventing
  another landing framework.
- FireUX alone owns the platform Ecosystems section. Ecosystem Main Apps show
  an Apps section only when their public collection contains more than one
  active child App after excluding the Main App; the heading is only
  `<App name>'s Apps`.
- Each Main App owns its product nouns, Console name, capability limits,
  imagery, actions, and working routes.
- Identity is a required Operation for every Console family. The owning
  Operation catalogue keeps its Console route, landing subheader entry, and
  `/operations/<slug>` literature page aligned.
- Static ecosystem hero photography shows people doing the product's current
  work through Core's sharp image frame. FireUX's live App/Ecosystem orbit and
  Misebox Kitchen's product-surface composition are the explicit non-people
  hero exceptions. Reviewed static hero sources use the guarded 1600 x 1000
  pixel, 8-bit opaque RGB PNG contract; subject, alternative text, and focal
  position remain App-owned.
- FireUX owns standalone App creation and the separate product for creating an
  ecosystem. Other Main Apps may offer a branded App inside their existing
  ecosystem; they do not offer ecosystem creation.
- Core owns one blank new-App onboarding surface. The current Main App derives
  the allowed placement but never supplies the new App identity. Runtime App
  initialization and repair remain an internal shell operation and must not be
  presented as `/apps/create`.
- An Operation changes or manages an owned product object through a Console. A
  public directory or navigation link does not become an Operation merely
  because it appears in the landing rail.
- Tools remain bounded utilities or provider doorways. Solutions remain
  source-backed explanations of supported situations.
- Pricing literature separates access, product capacity, human service,
  branded deployment, new development, and external costs.

## Authority

Use this order:

1. Current models, routes, catalogues, configuration, and guards.
2. Core product-literature and pricing sources.
3. This scoped router and the relevant App context.
4. Concept maps.

Start with the smallest current source atoms and work upward. A landing
summarises its children; it does not create a second product promise.

## Current source

- `packages/core/fireux-core/src/types/landing-product.ts`
- `packages/core/fireux-core/src/runtime/components/landing/ProductIndex.vue`
- `packages/core/fireux-core/src/runtime/components/landing/EcosystemHome.vue`
- `packages/core/fireux-core/src/runtime/components/landing/ProductSurfaceShowcase.vue`
- `packages/core/fireux-core/src/runtime/components/landing/ProductPricingStrip.vue`
- `packages/core/fireux-core/src/runtime/components/public/ProductPricingIndex.vue`
- `packages/core/fireux-core/src/runtime/components/public/ProductPricingTier.vue`
- `packages/core/fireux-core/src/runtime/composables/fireux/pricing/usePricing.ts`
- `projects/*/*-app/app/composables/use*Pricing.ts`
- `projects/*/*-app/app/components/*/Landing`
- `scripts/guards/product-landing.mjs`
- `docs/concepts/product-language.md`

## Refresh process

When a Main App adds or removes a Console, Operation, Tool, Solution, pricing
tier, branded-App path, or ecosystem role:

1. inspect the owning source and nearest working sibling;
2. update the smallest owned literature atom;
3. review the parent Console, pricing, and landing summaries;
4. update Core only when the meaning is genuinely shared;
5. update this context only when the durable scope or ownership rule changes.

Do not record campaign drafts, temporary copy options, incomplete audits, or
chat decisions here.

## Verification

- Run `node scripts/guards/product-landing.mjs` while iterating.
- Run focused lint and App type checks for touched consumers.
- Visually verify the hero, two actions, operational rail, pricing strip,
  surface presentation, pricing index, and each tier detail route at phone and
  desktop widths.
- Run the mandatory repository `pnpm guard` before handoff.
- Search for superseded prices and tier names after changing the shared source.

## Living-context maintenance

Keep this file short and source-directed. If a rule applies repository-wide,
update `docs/ai/gpt-context.md` as well. If it applies only to one ecosystem,
update that ecosystem context instead. Remove stale pointers when source moves;
do not copy current catalogues or pricing tables into this file.
