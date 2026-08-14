# Landing template family

Updated: 2026-08-13
Ref: 93c271035
Role: map, not canon

This family inherits the foundational template definition in
`docs/concepts/templates.md`. A landing template is reusable presentation
structure filled by owner-supplied identity, content, assets, routes, and
operational data. A proving App's values never become template defaults.

## Family

Misebox owns Kitchen-, Menu-, and Dish-aware landing templates. FireUX may
refer customers to the Misebox catalogue, but does not copy Misebox template
anatomy or fixtures. Other ecosystems may later own their own template
families while reusing ordinary Core page, state, and control primitives.

Template One is the only implemented Misebox template. Do not invent a shared
cross-ecosystem template framework or placeholder Template Two before a second
real composition proves a common contract.

## Catalogue

`/templates` has three responsibilities:

1. Select one Kitchen. Four development specimens are temporarily available.
2. Display that Kitchen's Root, Console, and App presentation configuration.
3. List the presentations compatible with that Kitchen.

Compatibility is progressive:

```text
Root    → Default
Console → Default + Theme
App     → Default + Theme + Template One
```

The catalogue does not inspect Storage, validate asset binaries, fetch a
flagship Dish, render template scenes, or own template-specific readiness.

## Detail

`/templates/[slug]?kitchen=<id>` is a thin resolver. It validates the selected
Kitchen/presentation combination, uses ordinary Core/Nuxt UI page structure
for Default and Theme, and renders Template One for a compatible App Kitchen.
It owns no inspection rail, prop ledger, brand switcher, specimen laboratory,
or route-specific CSS.

## Template One

Template One currently proves one shared composition: Scene One. Its internal
grammar remains:

`Page → Scenes → Layers → Elements`

Header and ecosystem page chrome remain outside scenes. Scene One consumes a
canonical wordmark, resolved palette, two typography families, and the unique
Kitchen-owned flagship Dish from the bounded projection. Dish owns food media;
Template One owns scene composition and its fixed charcoal texture. Friiites
and Deano's use the same scene anatomy.

## Authority

- Catalogue/detail routes: `projects/misebox/misebox-app/app/pages/templates/*`
- Temporary specimens: `packages/ecosystem/fireux-misebox/src/runtime/template-one-fixtures.ts`
- Template One contract: `packages/ecosystem/fireux-misebox/src/runtime/template-one.ts`
- Scene One: `packages/ecosystem/fireux-misebox/src/runtime/TemplateOneSceneOne.vue`
- Guard: `scripts/guards/landing-templates.mjs`

## Verification

Run the focused landing-template and CSS guards, verify Root/Console/App
compatibility on `/templates`, verify Friiites and Deano's share Scene One
anatomy, then run the owning builds and `pnpm guard`.
