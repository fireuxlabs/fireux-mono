# Theming and branded presentation

Updated: 2026-08-11
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
the Live Seehotel Bönigen Root Kitchen, the Pizza the Action Console Demo, the
Friiites App Kitchen and the Deano's Demo App emulation. The public `/kitchens`
collection classifies real Kitchen records
directly from `Kitchen.management.mode`: Root, Console and App. Demo status
never changes that capability classification. The Root input is only the Place
primary colour; Seehotel is as complete as Friiites at that level. It is the
first agreed fallback, used behind poor or transparent identity media and
overridden by richer resolved Console or App presentation. Level Two compares the same
Menu sample using the existing `Kitchen.menus.style` / `PageStyle` contract:
Seehotel shows the resolved default Menu baseline with no authored Console
override, while Pizza the Action shows its source-owned Demo Console theme.
Friiites and Deano's do not receive invented Console values before their App
template work begins. Place presentation is intentionally bounded to the semantic
`place_primary_color` input. Current persisted Place source still names this
field `media_backdrop_color`; renaming that stored field requires a guarded
Place projection/write migration and is deliberately not hidden inside the
Template One change. The
existing gallery and public Place/business-card presentations may evolve, but
they do not justify more Place theme fields yet. Core `BrandPalette` stays a
coherent App-template value object, not a collection of colour atoms. Presentation resolves dynamically
from defaults through Place and Kitchen before future Console and App-template
layers; inherited values are not copied upward during onboarding. Current
source models the Place media backdrop and Kitchen Menu PageStyle, but not separate
Console-theme or App-template-override storage. Kitchen also currently owns
sparse identity media overrides; that source-backed delta is not silently
removed by the progressive model.

Misebox Basic presentation resolves rather than backfills records. Canonical
Kitchen name and slug are required; an existing wordmark or logo is an optional
enhancement. An authored projected media backdrop is used when present,
otherwise Misebox supplies its ecosystem-owned default blue `#2563eb` and
reports the source as `misebox-default`. Generic Kitchen models and FireUX Core
do not own this ecosystem fallback. Missing identity media remains honestly
absent and never produces invented branding.
The Template One Root comparison reads the current public Kitchen detail and
presents that Basic result directly. Its identity card may use the real Place
image with the canonical Kitchen name; the accompanying ledger always reports
Place image, logo, wordmark and primary-colour provenance, including explicit
`Missing` values rather than hiding incomplete fields.
Console comparison is strictly additive. Pizza the Action first renders the
same resolved Basic contract—Misebox default blue, canonical name and its
Demo-owned logo, with missing Place image and wordmark stated—then renders its
source-owned Console `PageStyle` improvement. A Console specimen must never
offer less identity evidence than Root.

One neutral Menu section and item provide shared sample content at this level.
They belong to no Kitchen and do not create Menu records. The sample uses the
real default Menu catalogue presentation with no attached Menu style or Console
theme. The Place backdrop remains inspectable above it but does not theme it.

Scene One is the current reusable composition. The three-step Process scene and
Friiites Method adapter remain audit evidence only; neither mounts in the
catalogue preview or live App until the Place migration, Root Kitchen identity,
Console identity and asset-authority gates are complete.
The App preview exposes a compact Level One Hero readout beneath its developer
toolbar. It distinguishes inherited Root inputs (Kitchen name, canonical
wordmark and Place primary colour) from Scene One options (`present` and
identity alignment); header links remain Template One defaults until a real
Kitchen-owned navigation contract exists.
The Misebox template-detail route intentionally uses a minimal route shell
rather than absorbing the default Misebox layout. Catalogue navigation,
fixture selection and prop provenance sit in normal document flow above the
template canvas; the template's own header remains inside Template One. Scene
One currently inherits Core's system sans stack for UI text, while identity
lettering comes from the supplied wordmark artwork. It does not yet consume
Console `PageStyle` typography fields.
Every template-detail state begins with one route-shell inheritance rail.
Root shows `Place → Kitchen`, Console adds `Console`, and App preview adds
`Console → App + Template One`. This is inspection chrome rather than template
anatomy, and keeps the inherited Place surface visible even when the selected
App renders only its final resolved scene.
Every selected specimen shows the same compact Place preview before any richer
level. It uses only the resolved Place primary colour and canonical identity
media, with an explicit missing state, so the starting surface remains visible
independently of whether the selected Kitchen is Root-, Console-, or App-managed.
This preview is route-shell inspection chrome, not Template One anatomy.
The same adjacent Kitchen preview carries the complete visible Place identity
(primary colour and canonical wordmark) forward, then adds the Kitchen name and
its first useful public capability: a menu doorway. The technical Kitchen route
is the action target rather than user-facing content. This shows the effective
progressive surface without reassigning ownership of the Place colour or
identity media to Kitchen. The Kitchen preview is also inspection chrome rather
than Template One anatomy. Root, Console, and App specimens must use these same
two preview components; management mode changes available later layers, never
the anatomy of inherited levels.
The composition is mobile-first: Scene One starts from the compact phone
header, viewport-bounded identity frame and horizontally scrollable developer
props strip, then enhances those same elements for wider viewports without a
second DOM anatomy.
Scene One uses the Place primary colour as its actual base canvas. Template
One's fixed texture is blended over that canvas rather than covering it, and
its backlight remains a separate Template-owned layer. The Deano's editable
Demo fixture uses a deliberately distinct Place primary colour so the preview
proves this Root input instead of comparing two visually indistinguishable
near-black placeholders.

Template records and template application are App-only. Root and Console
Kitchens on this page are inspectable progression specimens, not template
customers or template consumers. They show the inherited atom ownership that
an App template extends: Root → Console → App Template.

Root has no authored theme; its single Place primary colour provides the
fallback behind transparent identity uploads. Console unlocks the Kitchen
theme (`PageStyle`) but never a template. App extends that effective Console
theme with one App-owned template and Brand System. The App assignment governs
all of its tenant and franchise Kitchens; individual Kitchens do not select or
fork the App template.

The Kitchen Identity Console makes that progression explicit and gated. A
resolved Root Kitchen identity must reach 100% before Console presentation can
be edited; inherited Place values satisfy a Root requirement without being
copied into Kitchen overrides. App identity remains locked until both Root and
Console are complete. Until stored Brand System authority exists, the App stage
reports that missing seam instead of persisting an invented local substitute.

## App brand systems and physical applications

A multi-Kitchen App needs one App-owned Brand System rather than a copied theme
or template on every franchise Kitchen. The Brand System is the approval authority for its
palette, identity assets, photographic direction, template assignments and
physical brand applications. All tenant and franchise Kitchens inherit the
App's assigned released version; Kitchen-owned operational identity overrides
remain sparse and must not fork the franchise standard.

Approved artwork, a Dish photograph and a purchasable carton are different
truths:

- an App Brand Asset identifies one approved reusable artwork or media source,
  its role, status, dimensions, rendition and usage notes;
- Dish owns the canonical food photograph and food copy;
- a branded consumable specification describes the required physical item,
  dimensions/material and approved artwork placement;
- Product and Supplier Item describe the actual purchasable offer, pack, SKU
  and supplier terms that may satisfy that specification;
- a Template injection references approved asset/Dish roles and resolved URLs;
  it does not copy files, Dish media or packaging artwork into scene config.

This permits one approved Friiites serving carton to govern every franchise
Kitchen while each Kitchen still selects and stocks a conforming Supplier Item.
The App/brand Console should author and release the standard. Kitchen Console
should show the effective assigned standard and operational conformance/stock,
not become a second brand-authoring surface.

Current source does not yet define stored Brand System, Brand Asset,
consumable-specification or Kitchen brand-release assignment contracts.
`public/img/app/*` remains the runtime asset authority, Dish remains the food
media owner, and Supplier Item remains procurement truth until those bounded
records and their Console ownership are implemented. Do not hide this missing
seam by adding arbitrary URLs to Kitchen, Dish or Template records.

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
- Canonical catalogue: `projects/misebox/misebox-app/app/pages/templates/*`
- Injection/anatomy: `packages/ecosystem/fireux-misebox/src/runtime/template-one*`
  and `TemplateOne*.vue`
- Misebox Basic resolver:
  `packages/ecosystem/fireux-misebox/src/runtime/kitchen-basic-presentation.ts`
- FireUX referral: `projects/fireux/fireux-app/app/pages/templates/*`
- Kitchen capability projection and collection grouping:
  `packages/extensions/fireux-kitchens/src/runtime/server/kitchen/public-projection.ts`
  and `components/Kitchen/Collection/Manager.vue`
- Guard: `scripts/guards/landing-templates.mjs`

## Delta register

| Difference                                   | State      | Reason                                                       |
| -------------------------------------------- | ---------- | ------------------------------------------------------------ |
| Misebox owns canonical anatomy and previews  | accepted   | Kitchen presentation belongs to the Misebox ecosystem        |
| FireUX and Misebox both offer the theme      | accepted   | Commercial doorway differs; template implementation does not |
| FireUX repeats template markup or injections | drift      | FireUX refers to the canonical Misebox implementation        |
| Brand injection creates an App or record     | drift      | Preview identity is not operational ownership                |
| Theme SKU, price or automated install        | to-confirm | Product, Billing and provisioning do not define them         |

## Verification and maintenance

When template anatomy, injection fields, seller routes, purchase semantics,
theme storage or brand ownership changes, update this map and
`docs/ai/templates-context.md`. Verify both storefront routes, every injection
at desktop and phone sizes, media provenance, and the absence of copied
anatomy. Run the focused guard, relevant App builds and `pnpm guard`.

Do not record temporary mockups, generated-image prompts, campaign copy or
individual review history here.
