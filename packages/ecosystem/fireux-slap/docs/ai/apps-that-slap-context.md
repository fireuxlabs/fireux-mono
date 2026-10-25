# Apps That Slap context

Updated: 2026-10-21
Ref: 53fa40ee6
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
  owns its ecosystem identity and configuration.
- Landing scene composition and visual quality remain App-owned. Shared
  transitions and GSAP/ScrollTrigger infrastructure remain coordinated through
  the Core transition seam; this ecosystem package does not add motion
  infrastructure.

## Runtime composition

The global and Yellow Velo Apps explicitly declare Core → Slap → Blogs → Products
native layers in their established precedence. Slap exports its conventional
runtime layer; domain and infrastructure registration remain in the owning
modules. Verify both Apps when changing discovery because their App-owned pages
and components differ.

Interlaken Bike Tours (`projects/slap/interlaken-bike-tours`) consumes Core → Slap
→ Blogs native layers through `defineFireuxConfig`. Its App-owned `tours` layout
frames only the public cycling pages; Core retains shared account, management,
initialization, SEO and PWA manifest responsibilities. The dedicated prototype
Hosting site uses the App's Firebase SSR function. Its custom footer consumes Core's `FireLayoutsSharedPlatformFooter`; landing/detail metadata consumes Core SEO helpers, with preview indexing policy configured explicitly. The App-owned `app/ignition/search.ts` supplies its reviewed preview origin,
page metadata and sitemap policy to the brief and runtime configuration; Ignition
reviews this declared plan without certifying live indexation. Tour and destination content (`app/content/tours.ts` and `app/content/destinations.ts`) and external
enquiry drafts remain App-owned. Destination routes distinguish existing rides from custom trips by enquiry; no booking domain or operator Workspace is
implied by the runtime integration.

## Presentation boundary

App source owns its scene structure and presentation types. Extract a reusable
presentation contract only when maintained App consumers prove the shared shape.
Shared transitions remain Core-owned; presentation does not change domain or
infrastructure ownership.

## Authority and current source

Use this order:

1. App source, package manifests, `defineFireuxConfig`, and source-owned tests.
2. `packages/ecosystem/fireux-slap/src/module.ts` and `src/config/**`.
3. App-owned dev commands and deployment configuration, ecosystem Firebase
   templates, and current brand assets.
4. This context and `docs/concepts/apps-that-slap.md`.

## Refresh process

When an App is proposed for admission or removal, inspect its current product
source, nearest domain sibling, App config and manifest, Firebase/database
binding, public asset family, routes, and deployment configuration. Record a
durable classification only after that evidence is exact. Update this context when the
admission rule, ownership boundary, stable binding, or presentation contract
changes; keep candidate lists and migration plans out of living context.

## Verification expectations

- Run the `fireux-slap` package build or type check after contract changes.
- Inspect affected module/layer registration and run relevant source-owned tests.
- Run `git diff --check` before handoff; the former guard suite is removed.
- If an App changes ecosystem, separately verify its manifest, Nuxt config,
  Firebase/database authority, dependencies, brand assets, and affected routes.
  Check that its deployment command still has an implementation before use;
  the removed deployment wrappers have no supported repository replacement.
  Presentation consumption alone requires none of those ownership changes.

## Living-context maintenance

Keep this file source-directed and free of chat history, temporary task state,
candidate inventories, visual drafts, and speculative migrations. Update the
repo-wide context only when a rule also becomes repo-wide; point to current
source and available tests instead of copying implementation details here.
