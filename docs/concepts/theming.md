# Theming and branded presentation

Updated: 2026-08-10
Ref: 93c271035
Role: map, not canon

## Purpose

Keep generic FireUX theme primitives, entity-owned media, tenant App brands,
brand injections, reusable presentation templates and commercial storefronts
separate. Rich presentation stays composable without moving product artwork or
sales ownership into FireUX Core.

## Links

- Parent and family registry: `fireux-mono.md`, `spine.md`
- Runtime App assets: `brand-assets.md`
- Light and dark mode: `color-mode.md`
- Place and Kitchen media: `place-kitchen-media.md`
- Template family: `landing-templates.md`
- Product language and pricing: `product-language.md`

## Vocabulary and ownership

FireUX Core owns generic semantic colour tokens, page-style vocabulary,
light/dark behaviour and reusable UI primitives. It does not own tenant
artwork, typography, photography or presentation-specific scene chrome.

An App brand belongs to a genuine tenant App and uses the canonical
`public/img/app/*` runtime asset contract. Friiites is a Misebox tenant App and
therefore owns a real App brand. A Kitchen logo alone does not create an App
brand; ordinary Kitchens retain their bounded Kitchen theme and sparse
Place-inherited overrides.

Media stays with the entity whose truth it depicts. Place owns location
photography, Kitchen owns operational identity overrides, Dish owns Dish
imagery, and App owns genuinely App-wide identity and artwork. Concept art is
not Live entity evidence.

A brand injection is preview/configuration data: approved tokens, type intent,
copy, links and media references. It does not create a tenant App, production
record or second media authority, and it never duplicates template markup or
CSS.

A presentation template owns reusable composition: Page → Scenes → Layers →
Elements, responsive rules and presentation variants. Page and catalogue
chrome remain outside scenes. `projects/templates/fireux-template` remains the
guarded neutral Nuxt starter App; it is not the landing catalogue.

Template One begins at `/templates/template-one` with a four-Kitchen toggle:
one Basic Demo, one Console Demo, Friiites App and the incremental Deano's App
preview Demo. It presents Basic, Console and App props in capability order and
uses Rule as the first visible atom. Core `BrandPalette` stays a coherent theme
value object, not a collection of colour atoms. Presentation resolves
dynamically from defaults through Place and Kitchen before future Console and
App-template layers; inherited values are not copied upward during onboarding.
Current source models Place palette and Kitchen Menu PageStyle, but not separate
Console-theme or App-template-override storage. Kitchen also currently owns
sparse identity media overrides; that source-backed delta is not silently
removed by the progressive model.

## Catalogue and storefronts

Misebox owns the canonical Kitchen-template detail experience and
`fireux-misebox` owns its shared anatomy and injection contract. FireUX and
ecosystem storefronts may both sell or arrange the same theme:

- Misebox exposes the canonical `/templates/template-one` preview.
- FireUX exposes a catalogue referral and FireUX request path without copying
  the implementation.
- A seller owns its offer, qualification and checkout/request surface. Selling
  a theme does not transfer implementation authority to that storefront.

This is one template family with multiple valid sellers, not duplicated
templates. Current source proves request paths; it does not yet prove a
theme-specific price, SKU, entitlement, stored purchase or automated theme
installation. Do not advertise those until Product/Billing and provisioning
sources exist.

## Current source

- Generic style vocabulary:
  `packages/core/fireux-core/src/runtime/models/utils/style.model.ts`
- Kitchen theme mutation/editor:
  `packages/extensions/fireux-kitchens/src/runtime/server/kitchen/theme.ts`
  and `components/Console/Kitchen/Identity/Theme.vue`
- Canonical catalogue: `projects/fireux/fireux-app/app/pages/templates/*`
- Injection/anatomy: `projects/fireux/fireux-app/app/{types,content,components}`
- Misebox doorway:
  `projects/misebox/misebox-app/app/pages/templates/index.vue`
- Guard: `scripts/guards/landing-templates.mjs`

## Delta register

| Difference                                    | State      | Reason                                                       |
| --------------------------------------------- | ---------- | ------------------------------------------------------------ |
| FireUX owns canonical anatomy and previews    | accepted   | One implementation prevents seller-specific forks            |
| FireUX and Misebox both offer the theme       | accepted   | Commercial doorway differs; template implementation does not |
| Misebox repeats template markup or injections | drift      | Its route is a seller doorway into the canonical preview     |
| Brand injection creates an App or record      | drift      | Preview identity is not operational ownership                |
| Theme SKU, price or automated install         | to-confirm | Product, Billing and provisioning do not define them         |

## Verification and maintenance

When template anatomy, injection fields, seller routes, purchase semantics,
theme storage or brand ownership changes, update this map and
`docs/ai/templates-context.md`. Verify both storefront routes, every injection
at desktop and phone sizes, media provenance, and the absence of copied
anatomy. Run the focused guard, relevant App builds and `pnpm guard`.

Do not record temporary mockups, generated-image prompts, campaign copy or
individual review history here.
