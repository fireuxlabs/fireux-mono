# Components Directory

Authority: Operational
Updated: 2026-05-25
Scope: `packages/*/fireux-*/src/runtime/components` and child directories under `components/*`.

This page documents FireUX rules for `runtime/components/`.
It does not explain general Nuxt component behavior.

For Nuxt mechanics, use Nuxt documentation.
This page is only for FireUX ownership and canon seams.

## FireUX Rule

`runtime/components/` is where FireUX package-owned UI and runtime behavior surfaces live.

Package modules should expose components from `runtime/components/**` and let Nuxt derive component names from the path. Do not add extra taxonomy folders or one-off aliases just to change the generated name.

The important FireUX rule is not “how components work in Vue.”
It is “which behavior belongs in components, and which does not.”

Open guard note: `docs/dev/component-resolution-guard.md` tracks the unresolved-component risk where a route returns `200 OK` while package/module child components fail to resolve.

## FireUX Ownership

In FireUX:

- pages own route delivery
- components own UI behavior and reusable runtime surfaces
- composables own state, reads, writes, and adaptation logic

That means:

- route shells belong in `pages/`
- behavior-heavy UI surfaces belong in `components/`
- fetch and mutation logic should not be invented inside components unless that is the explicit canon

## FireUX Canon Seams

The main repo-wide component seams are:

- `**/Create/System.vue`
- `**/Collection/Manager.vue`
- `**/Main.vue`
- `**/Featured.vue`
- `**/Cards/*.vue`
- `public/SimplePage.vue`
- `public/PricingPage.vue`
- `public/PartnerPricingPage.vue`
- `Provider/Tool/Iframe.vue`
- `Provider/Tool/Frame.vue`
- `Design/PaletteStrip.vue`

Read them like this:

- `Create/System.vue`
  FireUX create behavior surface
- `Collection/Manager.vue`
  FireUX collection browse shell
- `Main.vue`
  Optional entity-owned public growth layer between the entity CTA and collection manager
- `Featured.vue`
  Optional entity-owned highlighted subset that must not replace the full collection manager
- `Cards/*`
  FireUX presentational entity surfaces such as `pill`, `cell`, `preview`, and `profile`
- `public/SimplePage.vue`
  FireUX shell for simple public pages such as help, terms, privacy, and support
- `public/PricingPage.vue`
  FireUX shell for app-owned pricing pages; app pages provide plan copy, optional plan groups, and actions while core owns the frame and pricing JSON-LD
- `public/PartnerPricingPage.vue`
  FireUX shell for ecosystem partner pricing details; app pages provide only the route and page meta
- `Provider/Tool/Iframe.vue`
  FireUX consumer shell for embedding hosted provider tools
- `Provider/Tool/Frame.vue`
  FireUX hosted-provider card shell for provider apps such as Go QR, Sproochli, and Misebox
- `Design/PaletteStrip.vue`
  FireUX visual primitive for rendering named colour palettes; app or ecosystem assets own the actual colour values

`EntityIndexCta` uses management-path families:

- `console`
- `console-managed`
- `admin-managed`
- `profile-managed`
- `domain-managed`
- `utility-managed`

Use the family that says where the entity is managed. Do not use pricing, help, about, or other page surfaces as entity families.

## FireUX Override

FireUX adds stronger behavior rules on top of ordinary component placement:

- create ownership may start in pages, but create behavior usually lives in `Create/System.vue`
- collection browse behavior should stay consistent across domains through the collection manager seam
- entity index pages may add an entity-owned `Main.vue` layer for richer public presentation, but the collection manager remains the canonical full browse/manage surface
- profile cards should move toward prop-in, render-out rather than local read logic
- simple public pages should keep app-local copy in pages while sharing the core page frame, spacing, and return-link behavior
- pricing pages should keep app-local plans and route meta in pages while sharing the core pricing frame, plan sections, canonical link handling, generated structured data, and CTA area
- partner pricing pages should keep partner/revenue-share explanation consistent across ecosystem apps unless the ecosystem has a real custom partner model

## What This README Should Answer

Use this branch README when the question is:

- does this behavior belong in a component at all
- which component seam owns this FireUX pattern
- is this component a shell, a manager, or a card surface

If the question is only about Vue component syntax, that belongs to Nuxt or Vue docs instead.

## Short Version

`runtime/components/` is for FireUX-delivered UI surfaces and component-owned behavior.

FireUX care points are ownership and canon seams, not basic Vue mechanics.
