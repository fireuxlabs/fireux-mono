# Theming and branded presentation

Updated: 2026-08-10
Ref: 99570c6ab
Role: map, not canon

## Purpose

Map the difference between shared FireUX theme primitives, ordinary Kitchen
theming, tenant App-brand systems, entity-owned media, and reusable
presentation templates. This map keeps richer branded experiences composable
without making FireUX Core the owner of product artwork or making every
Kitchen pretend to be an independent brand.

## Vertical links

- Parent: `fireux-mono.md`
- Family registry: `spine.md`

## Horizontal links

- Runtime App assets: `brand-assets.md`
- Light and dark mode: `color-mode.md`
- Place and Kitchen media: `place-kitchen-media.md`
- App runtime configuration: `app-config.md`
- Menu ownership: `family-menu.md`
- Product language: `product-language.md`
- Landing templates: `landing-templates.md`

## Current source

- Shared palette and page-style vocabulary:
  `packages/core/fireux-core/src/runtime/models/utils/style.model.ts`
- Shared palette parsing:
  `packages/core/fireux-core/src/runtime/utils/brand-palette.ts`
- Rendered color-mode seam:
  `packages/core/fireux-core/src/runtime/composables/fireux/app/useColorMode.ts`
- Kitchen theme mutation:
  `packages/extensions/fireux-kitchens/src/runtime/server/kitchen/theme.ts`
- Kitchen theme editor:
  `packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen/Identity/Theme.vue`
- App runtime asset contract: each project's `public/img/app/*`
- Brand asset verification: `scripts/guards/fireux-brand-assets.mjs`
- Entity and media ownership verification: `scripts/guards/entity-authority.mjs`
- Canonical catalogue and injection contract:
  `projects/fireux/fireux-app/app/pages/templates/*` and
  `projects/fireux/fireux-app/app/{types,content,components}/`
- Misebox seller doorway:
  `projects/misebox/misebox-app/app/pages/templates/index.vue`
- Template verification: `scripts/guards/landing-templates.mjs`

The current source proves shared tokens, App runtime identity assets, and
Kitchen theme overrides. It also proves one code-owned landing-template
catalogue and bounded preview injection contract. It does not yet prove a
canonical stored App-brand catalogue, packaging model, Dish blueprint family,
theme-specific SKU, entitlement, or automated installation.

## Vocabulary

### Theme primitives

FireUX Core owns generic presentation vocabulary: semantic color tokens,
page-style types, light/dark behavior, and reusable UI primitives. Core does
not own a tenant's approved artwork, packaging, food photography, venue
photography, or campaign composition.

### App brand

An App brand is the durable branded system belonging to a genuine tenant App.
It may include canonical identity, an approved palette, typography intent,
packaging artwork, reusable product-presentation assets, and landing
presentation choices. Friiites is an App brand because Friiites has a tenant
App. `Brand` without an owner is too vague; name the owning App.

An App brand is not established merely because a Kitchen uploads a logo. A
Kitchen without its own App continues to use the ordinary Kitchen theme family.

Transparent entity identity media has one backdrop authority chain: the
entity's explicit `media_backdrop_color`, then its secondary brand colour,
then its primary brand colour. With no owned colour it remains transparent;
semantic application surfaces never supply a substitute brand backdrop.

### Kitchen theme

A Kitchen theme is bounded operational presentation. It may inherit Place
palette values and store Kitchen/Menu-specific style overrides. It supports
useful branded menus and Console surfaces without creating an App-level asset
catalogue or a second product identity authority.

### Entity media

Entity media stays with the entity whose truth it depicts:

- Place owns location photography such as its storefront and interior.
- Kitchen owns operational identity overrides and Kitchen-specific card media.
- Dish owns the image representing that Dish.
- Menu and Menu Item own publication, placement, price, availability, and
  options; they do not become the authority for Dish photography.
- App owns its canonical runtime identity and genuinely App-wide artwork.

Concept artwork must not be attached to a Live entity as though it documented
reality. A proposed franchise storefront belongs to an explicitly named
App-brand concept or presentation source until a real Place exists.

### Presentation template

A presentation template owns composition: scene grammar, slots, layout,
responsive rules, and presentation variants. It consumes references to owned
content and media. It does not duplicate logos, Dish images, Place galleries,
prices, or operational records into a flattened second source of truth.

`projects/templates/fireux-template` is the guarded Nuxt App starter and is not
evidence for this proposed operational presentation-template family. The two
meanings of template must remain explicit until source gives the operational
family a distinct durable name.

A brand injection is preview/configuration data: approved tokens, type intent,
copy, links, and media references. It does not create a tenant App, production
record, or second media authority, and it never duplicates template markup or
CSS. FireUX owns the canonical `/templates` catalogue and preview anatomy.
FireUX and Misebox may both offer the same theme; Misebox owns its hospitality
seller doorway and links to the canonical preview rather than copying the
template implementation.

## Composition order

Build at the lowest level that needs independent reuse, then compose upward:

```text
FireUX theme primitives
  -> tenant App brand
    -> App-brand presentation assets
      -> entity media or branded product blueprint
        -> Menu publication and Kitchen facts
          -> presentation template
            -> landing scene or operational preview
```

For Friiites product presentation, the first reusable artwork is shared
packaging rather than a whole Scene or a Place:

```text
Friiites App brand
  -> packaging: empty black carton
  -> product content: fries and approved treatments
  -> composed Dish presentation: Classic, Fondue, Deluxe, Poutine
  -> Scene slots referencing those Dish presentations
```

The carton remains App-brand packaging. A Dish presentation may compose that
packaging with Dish-specific contents. A flattened Scene image may be retained
as a design reference during reconstruction, but it is not the ongoing source
for the carton, Dish, Menu, or Place.

Ingredient media is introduced only when a real consumer needs independent
ingredient presentation, such as recipe operations, allergen explanation, or
a configurable product surface. Do not build an exhaustive ingredient image
catalogue merely because Ingredients are smaller than Dishes.

## Capability levels

### Ordinary Kitchen

- Shared FireUX UI and color-mode spine.
- Place-inherited palette plus sparse Kitchen/Menu overrides.
- Kitchen logo, wordmark, and card media under existing ownership.
- Generic operational and public menu presentation.

### Tenant App brand

- Everything available to an ordinary Kitchen.
- Canonical App identity through `/img/app/*`.
- App-owned product and packaging presentation where current source declares
  that ownership.
- Rich landing presentation and reusable scene composition.
- Future operational template previews using explicit App-brand injections.

This is a capability distinction, not permission to infer a paid plan or
marketing promise. Commercial packaging remains `to-confirm` until product
and billing source define it.

## Operational template direction

The implemented public surface is one shared template family projected through
bounded brand injections:

- FireUX catalogues templates and compares controlled brand injections.
- Misebox exposes `/templates` as a hospitality seller doorway to that canonical
  preview.
- A Kitchen without a tenant App receives the bounded ordinary-Kitchen
  presentation rather than a fabricated App-brand catalogue.

The route and code ownership are now proven. Storage, authoring authority,
publication lifecycle, theme-specific product records, entitlements, and
automated installation remain `to-confirm`.

## Delta register

| Difference                                                                 | State        | Reason or alignment trigger                                                             |
| -------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------- |
| Apps expose one standard `/img/app/*` identity family                      | `accepted`   | Runtime consumers need a stable App identity contract                                   |
| Kitchens inherit Place palette and may store sparse presentation overrides | `accepted`   | Operational presentation is Kitchen-owned without requiring a tenant App brand          |
| A tenant App owns richer packaging and product-presentation artwork        | `to-confirm` | Friiites proves the need, but the canonical catalogue and storage seam do not exist yet |
| Templates compose referenced owned media rather than copying it            | `accepted`   | Scene One and its typed injections implement this boundary                              |
| FireUX and Misebox both offer one theme family                             | `accepted`   | Seller ownership differs while canonical anatomy remains in FireUX                      |
| Theme-specific SKU, entitlement, or automated installation                 | `to-confirm` | Product, Billing, and provisioning source do not define them                            |
| Flattened landing mockups remain temporary design references               | `migration`  | Retire each mockup only after its reconstructed scene matches the approved composition  |
| A fictional storefront is stored as a real Place gallery image             | `drift`      | Keep concept artwork App/presentation-owned until it depicts a real Place               |
| Every Ingredient receives media before a consumer exists                   | `drift`      | Add independent media only when product behavior requires it                            |
| An ordinary Kitchen is promoted to an App brand because it has a logo      | `drift`      | Kitchen identity and tenant App-brand authority are different layers                    |

## Verification and maintenance

When this family changes, first name the family, nearest working sibling,
storage owner, projection boundary, mutation authority, and guard. Verify
light/dark rendering, ordinary-Kitchen fallback, tenant App injection, entity
ownership, responsive template behavior, both seller routes, and absence of
copied media.

Run focused checks while iterating and `pnpm guard` before handoff. Update this
map when source establishes the operational template family or an App-brand
catalogue. Do not record temporary mockup choices, generated-image prompts, or
individual Scene review history here.
