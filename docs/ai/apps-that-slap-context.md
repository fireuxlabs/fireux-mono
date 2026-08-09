# Apps That Slap context

Updated: 2026-08-09
Ref: 90f82847e
Role: living context
Scope: Apps That Slap ecosystem identity, admission, routing, and reusable presentation boundary

## Inheritance

This context inherits `AGENTS.md` and `docs/ai/gpt-context.md`. Product wording
also follows `docs/concepts/product-language.md`; shared landing and transition
work follows `docs/ai/identity-literature-context.md` and its current Core
sources.

## Purpose

Keep Apps That Slap a first-class ecosystem for independent, experience-led
Apps without making FireUX Core the miscellaneous App owner or taking Apps
away from genuine operational domains.

## Scope and ownership boundaries

- `slap` remains the stable package, project-routing, Firebase, and database
  binding key. The product name is Apps That Slap; do not create a competing
  package or ecosystem identifier merely to expand the name.
- Admit an App when the independent branded or digital experience is primarily
  the product and no genuine operational-domain ecosystem owns it.
- Lack of another owner is insufficient evidence. Establish the App's current
  nouns, operations, routes, and data authority before classification.
- Apps with a genuine operational domain stay there. Kitchen Apps remain
  Misebox, property Apps remain Werkbox or their current property ecosystem,
  and Friiites remains a Misebox tenant App.
- FireUX Core owns only generic infrastructure and primitives. Apps That Slap
  owns its ecosystem identity and its opt-in presentation vocabulary.
- Consuming `fireux-slap/runtime/presentation/apps-that-slap` does not change
  App ownership, `ecosystem`, Firebase binding, database authority, modules,
  routes, or deployment target. Domain records and behavior remain with their
  owning package and App.
- Landing scene composition and visual quality remain App-owned. Shared
  transitions and GSAP/ScrollTrigger infrastructure remain coordinated through
  the Core transition seam; this ecosystem package does not add motion
  infrastructure.

## Presentation contract

The reusable seam preserves this semantic grammar:

`Page -> Scenes -> optional Background / required Content / optional Foreground -> Elements`

The contract is structural and presentation-only. It contains no Firebase,
storage, routing, domain records, ownership inference, motion engine, or visual
implementation. Consumers may build their own components and animation above
it while retaining their existing ecosystem.

## Authority and current source

Use this order:

1. App source, package manifests, `defineFireuxConfig`, and executable guards.
2. `packages/ecosystem/fireux-slap/src/module.ts` and `src/config/**`.
3. `packages/ecosystem/fireux-slap/src/runtime/presentation/apps-that-slap.ts`.
4. `scripts/_lib/app-registry.mjs`, Firebase templates, project smoke contracts,
   and brand-asset guards.
5. This context and `docs/concepts/apps-that-slap.md`.

## Refresh process

When an App is proposed for admission or removal, inspect its current product
source, nearest domain sibling, App config, registry entry, Firebase/database
binding, public asset family, and smoke/deployment contract. Record a durable
classification only after that evidence is exact. Update this context when the
admission rule, ownership boundary, stable binding, or presentation contract
changes; keep candidate lists and migration plans out of living context.

## Verification expectations

- Run the `fireux-slap` package build or type check after contract changes.
- Run `node scripts/guards/ecosystem.mjs` and relevant package/project guards.
- Run `pnpm guard` before handoff.
- If an App changes ecosystem, separately verify registry, Nuxt config,
  Firebase/database authority, dependencies, brand assets, smoke routes, and
  deployment preflight. Presentation consumption alone requires none of those
  ownership changes.

## Living-context maintenance

Keep this file source-directed and free of chat history, temporary task state,
candidate inventories, visual drafts, and speculative migrations. Update the
repo-wide context only when a rule also becomes repo-wide; point to current
source and guards instead of copying implementation details here.
