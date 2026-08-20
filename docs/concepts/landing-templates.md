# Landing template family

Updated: 2026-08-14
Ref: d5efe9160
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

Template One is the current baseline and only implemented Misebox template. A
future Template Two must be a real intended catalogue member, not nominal
parity. It may begin as a separately named, structurally aligned proving
sibling, then deliberately differentiate under `spine.md`. Initial equivalence
does not prove a shared template engine. Extract only the family contract that
survives material differentiation, and do not invent a cross-ecosystem
framework from the two Misebox members.

A proving Template Two adopts independently established catalogue identity,
compatibility, readiness, owner-injection, and renderer-boundary checks from
its first save. Template-specific anatomy remains separately named and owned.

## Catalogue

`/templates` has three responsibilities:

1. Select one Kitchen. Four development specimens are temporarily available.
2. Display that Kitchen's Root, Workspace, and App presentation configuration.
3. List the presentations compatible with that Kitchen.

Default and Theme remain progressive presentation levels:

```text
Root    → Default
Workspace → Default + Theme
```

Template One instead requires a template-ready Kitchen. Eligibility is based
on fulfilled Kitchen inputs, not whether the Kitchen is App-managed. The
catalogue reports Kitchen name, tagline, effective palette and typography,
the five standard identity asset roles, one unique flagship Dish, and its
image. Menu readiness is evaluated separately.

## Detail

`/templates/[slug]?kitchen=<id>` is a thin resolver. It validates the selected
Kitchen/presentation combination, uses ordinary Core/Nuxt UI page structure
for Default and Theme, and renders Template One for a template-ready Kitchen.
Both the catalogue and tenant route inject a `TemplateOneKitchenProjection`
into the same package-owned `TemplateOnePage`; neither owns scenes, adapters,
template CSS, or iframe previews.
It owns no inspection rail, prop ledger, brand switcher, specimen laboratory,
or route-specific CSS.

## Template One

Template One owns one canonical six-scene page: hero, Menu, ordering,
franchise, provider, and footer. Its internal grammar remains:

`Page → Scenes → Layers → Elements`

Header and ecosystem page chrome remain outside scenes. Scene One consumes a
canonical wordmark, resolved palette, two typography families, and the unique
Kitchen-owned flagship Dish from the bounded projection. The remaining scenes
consume the same projection's Menu, ordering, franchise, provider, and footer
content. Dish owns food media; Template One owns all six scene compositions
and its fixed charcoal texture. Friiites and Deano's inject different owner
data into the same package-owned page without consumer scenes.

## Authority

- Catalogue/detail routes: `projects/misebox/misebox-app/app/pages/templates/*`
- Temporary specimens: `packages/ecosystem/fireux-misebox/src/runtime/template-one-fixtures.ts`
- Template One contract: `packages/ecosystem/fireux-misebox/src/runtime/template-one.ts`
- Page and scenes: `packages/ecosystem/fireux-misebox/src/runtime/TemplateOne*.vue`
- Guard: `scripts/guards/landing-templates.mjs`

## Verification

Run the focused landing-template and CSS guards, verify Kitchen readiness on
`/templates`, verify Friiites and Deano's render the same canonical
`TemplateOnePage`, then run the owning builds and `pnpm guard`.
