# Theming and branded presentation

Updated: 2026-08-20
Ref: d1a7d5eec
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
brand; Kitchen presentation capabilities consume the linked Place identity and
their own configuration without adding theme or media fields to Kitchen.

Media stays with the entity whose truth it depicts. Place owns location and
Kitchen venue identity, Dish owns Dish imagery, and App owns genuinely App-wide
identity and artwork. Concept art is
not Live entity evidence.

A brand injection is preview/configuration data: approved tokens, type intent,
copy, links and media references. It does not create a tenant App, production
record or second media authority, and it never duplicates template markup or
CSS.

## Asset resolution contract

Branded presentation uses one role language through the progressive owner
flow: `Place → Kitchen → App`. A role keeps one filename and relative path;
moving into an App does not rename `logo.png`, `wordmark-light.png`,
`wordmark-dark.png`, `cover.png` or `thumbnail.png`.

Identity preparation is progressive and validates both availability and dimensions:

- Root: `logo.png`, `wordmark-light.png`, `wordmark-dark.png`.
- Workspace: the Root family plus `cover.png` and `thumbnail.png`.
- App template readiness uses the same five canonical masters as Workspace:
  `logo.png`, both surface wordmarks, `cover.png` and `thumbnail.png`, but checks
  their canonical App-owned Firebase Storage paths rather than browser fixture
  URLs.

The owning App bundle additionally carries `wordmark.png`, `favicon.ico`,
`pwa/icon-192.png` and `pwa/icon-512.png`. Those are build outputs and runtime
assets, not extra Storage-master decisions for template readiness. Core owns
the runtime PWA manifest and composes its identity, colours, and versioned icon
URLs from App config plus this bundle; tenant Apps must not add a static local
manifest.

The executable stage contract lives in
`runtime/models/operations/entity-asset-onboarding.ts`. Inspection surfaces
must show missing or invalid roles honestly before branded template work begins.

Firebase Storage is the durable binary authority. App identity objects use
`apps/<appId>/img/app/<filename>`, matching the owning bundle's
`public/img/app/<filename>`. The owning App resolves its bundled URL first for
fast delivery, then its recorded Firebase Storage URL. A Main App or catalogue
showing another App has no authority to use its own bundle for that tenant and
therefore resolves the tenant's Storage URL only. Local failure may advance to
the same role in Storage; it may never advance to another brand or another
asset role.

Full App onboarding enforces this boundary. Initialization creates the App
record and first administrator membership; it does not rename media
publication as initialization. The validated five-file Storage sync must also
populate every canonical `App.media` URL before the App is fully onboarded.
Failed or partial publication remains retryable and must be reported as
incomplete onboarding; it does not erase the App's initialized state or reopen
the initialization blocker.

The same progressive rule applies to authored colour. App source carries the
reviewed effective eight-role palette. Initialization stores it while no lower
Workspace layer exists. Domain-owned attachment derives a missing four-role
`AppX.workspace.theme.palette`, preserves an existing Workspace palette, then
compacts `App.theme.palette` to App-only additions and material overrides.
Runtime presentation resolves Workspace plus App into the effective eight roles.
Kitchen root remains sparse and owns no identity-colour override.

Place and Kitchen remain Storage-backed and dynamically inherited. Their
current trusted targets (`places/<id>/{logo|wordmark}` and
`kitchens/<id>/identity/.../current`) predate the same-relative-path contract
and are migration debt, not accepted alternate language. Aligning them needs a
guarded object migration that preserves existing recorded download URLs until
cutover. Onboarding and App creation resolve references upward; they do not
copy Place or Kitchen binaries into richer records.

A presentation template owns reusable composition: Page → Scenes → Layers →
Elements, responsive rules and presentation variants. Page and catalogue
chrome remain outside scenes. `projects/templates/fireux-template` remains the
guarded neutral Nuxt starter App; it is not the landing catalogue.

Template One begins at `/templates/template-one` with a four-Kitchen toggle:
the Live Seehotel Bönigen Root Kitchen, the Pizza the Action Workspace Demo, the
Friiites App Kitchen and the Deano's Demo App emulation. The public `/kitchens`
collection does not classify Kitchen records as Root, Workspace, or App. Demo
status never changes the Kitchen entity shape. The Root input is only the Place
primary colour; Seehotel is as complete as Friiites at that level. It is the
first agreed fallback, used behind poor or transparent identity media and
overridden by richer resolved Workspace or App presentation.

The `/templates` catalogue owns the comparison flow: select one Kitchen, then
open a presentation level with the same `?kitchen=<slug>` projection. `Default`
is the included Root presentation, `Theme` is the Workspace presentation, and
Template One is the current App template composition. Default and Theme are grouped
in the catalogue for comparison but are not marketed or modelled as App
templates.
The catalogue displays the selected Kitchen's resolved Root, Workspace and App
presentation configuration, then lists only compatible presentations. Asset
binary validation and Storage inspection remain outside catalogue routes and
template anatomy.
The detail route is a thin compatible-presentation resolver. Default and Theme
use ordinary Core/Nuxt UI page structure; Template One renders its current
Scene One composition. The detail owns no inspection rail, specimen system,
brand switcher, or route CSS. Place presentation is intentionally bounded to one
semantic `presentation.identity_color` input. The UI calls it Primary colour.
Current persisted Place source still names this field
`media_backdrop_color`; renaming that stored
field requires a guarded Place projection/write migration and is deliberately
not hidden inside the Template One change. Current Kitchen
`assets.backdrop_color` and a concurrent onboarding
compatibility path also persist a sparse two-colour `brand_palette` on Place
and Kitchen. Those are migration source, not the target ownership model,
and must not be mistaken for Workspace or App palette authority. The
existing gallery and public Place/business-card presentations may evolve, but
they do not justify more Place theme fields yet. Place `Onboarding/BrandPalette` stays a
coherent App-template value object, not a collection of colour atoms.
Presentation resolves dynamically from Place through Workspace and App layers;
inherited values are not copied upward during onboarding. Current source
models the Place media backdrop and legacy Kitchen Menu PageStyle alongside
the newer Workspace/App palette work. Kitchen-owned identity media remains a
separate source-backed delta; it does not own another colour.

Misebox Basic presentation resolves rather than backfills records. Canonical
Kitchen name and slug are required; an existing wordmark or logo is an optional
enhancement. The projected Place identity colour is used when present,
otherwise Misebox supplies its ecosystem-owned default blue `#2563eb` and
reports the source as `misebox-default`. Generic Kitchen models and FireUX Core
do not own this ecosystem fallback. Missing identity media remains honestly
absent and never produces invented branding.
The catalogue shows the selected specimen's stored colour and typography
layers. It does not create a second identity card, sample Menu, or readiness
ledger.

Scene One is the current reusable composition. The three-step Process scene and
Friiites Method adapter remain audit evidence only; neither mounts in the
catalogue preview or live App until its content is ready. Page header and
navigation remain external chrome; Scene One owns only the dominant
wordmark, supporting copy and action, flagship Dish presentation, fixed
texture/backlight and scroll cue.
Template rendering resolves App-owned identity media through canonical
Storage-backed roles. Misebox remains ignorant of
sibling App bundles: it must not mount their public directories, call their
development ports or copy their assets into the template package. Template One
renders an explicit missing state when Storage has not supplied the role; it
must not invoke Core's semantic FireUX brand fallback for a tenant injection.
For App fixtures, `wordmarkSrc` has one canonical meaning: the App-owned
`img/app/wordmark-dark.png` Storage role. Fixtures cannot point that prop at a
brand-specific nested alternate, a sibling bundle mount or a square
`logo.png`.
The detail route uses the ordinary Misebox landing layout. Identity lettering
comes from supplied wordmark artwork; the two App typography families drive
Scene One copy and label roles. Scene One remains mobile-first and enhances the
same DOM anatomy at wider viewports.
Scene One uses the Place primary colour as its actual base canvas. Template
One's fixed texture is blended over that canvas rather than covering it, and
its backlight remains a separate Template-owned layer. The Deano's editable
Demo fixture uses a deliberately distinct Place primary colour so the preview
proves this Root input instead of comparing two visually indistinguishable
near-black placeholders.
The original high-detail stone asset and its paired shadow/highlight blend are
Template One constants rather
than injection options. The compositing rule must retain visible stone detail
over both near-black and brighter Place primaries. A fixed multiply channel
retains stone depth and a fixed screen channel retains stone highlights. These
neutral light interactions preserve the source texture's quality while the
Place primary remains the hue authority. The source is desaturated at the
Template layer so no colour embedded in the stone artwork leaks into an
injection. No brand fixture can remove, tint or tune either channel.

Template records and template application are App-only. Root and Workspace
Kitchens on this page are inspectable progression specimens, not template
customers or template consumers. They show the inherited atom ownership that
an App template extends: Root → Workspace → App Template.

App onboarding remains responsible for canonical asset readiness; the
catalogue does not duplicate that validation. Demo fixtures may prove the same
presentation contract without becoming an App and resolve through their
existing Demo Storage authority.

Palette authorship is progressive and remains separated by owner:

- Place owns one `identity_color`, used behind transparent identity media and
  exposed as Primary colour in authoring UI.
- Kitchen Root authors no colour. Current `assets.backdrop_color` values are
  migration input and must collapse into the linked Place authority.
- Workspace owns four reviewed functional colours: `canvas`, `text`, `accent`
  and `accent_contrast`. Derived surfaces, borders and states are renderer
  output rather than authored palette fields.
- App source confirms the effective eight semantic colours: `canvas`,
  `surface`, `canvas_inverted`, `text`, `text_muted`, `ink`, `accent` and
  `accent_contrast`. Canonical App storage keeps only roles that extend or
  override Workspace.

Resolution is dynamic: Place → Workspace → App. Kitchen identity media consumes
the Place colour without forming another palette layer. Inherited
values may seed a missing lower layer during onboarding, after which duplicate
values are removed from the richer owner. The resolved App palette applies
across its Kitchens and franchises; it never belongs to a single Kitchen merely
because that Kitchen is the first consumer. Direct App creation must still
traverse and review the same progressive inputs.

Core defines the four-role Workspace value object, complete eight-role resolved
value object, and sparse App layer. App initialization persists reviewed source
intent, while each domain package owns Workspace derivation and App compaction.
Kitchen attachment seeds a missing Workspace palette and never overwrites an
existing one. Template fixtures use the same resolver and compactor; their
values are still not canonical records. The `/templates` catalogue displays
each stored layer and its provenance rather than repeating the resolved palette
under every owner.

Typography follows the same progressive boundary. Root authors no typography
and uses the Misebox default. Workspace may express bounded title/body font
intent through its current `PageStyle`. App owns exactly two confirmed family
inputs—`display_family` and `body_family`—from which Template One derives
Display, Heading, Body and Label treatments. Templates own role treatment;
Apps do not upload per-role sizes, weights or overrides in this first seam.
The Template One inspection chrome renders one shared typography specimen for
Friiites and Deano's, so switching the Kitchen changes only those two inputs.

Template One Scene One has a bounded requirements contract. Its core ready
state requires the canonical wordmark role, effective App palette, both App
typography families and exactly one Kitchen flagship Dish with `Dish.image`.
The Kitchen-owned flagship projection queries `is_flagship == true`, limits
read-back to two and rejects missing, multiple or image-less results; it never
selects `dishes[0]`. The same scene DOM renders an explicit not-ready state for
an incomplete injection. Food photography remains Dish-owned. Standalone mark
and pattern candidates remain outside the scene contract until approved as App
Brand Asset roles; Template One does not select arbitrary library alternates.

Scene render readiness is intentionally narrower than complete Template One
content readiness. The complete template requires at least six eligible Dishes
and exactly one explicit flagship. The bounded Kitchen/Dish projection now
confirms Friiites at 6/6 with Classic as its unique flagship. Its draft Menu,
zero placeholder prices and disabled ordering remain separate publication and
ordering gates.

Scene One's calibrated composition is Template-owned: a viewport-height canvas,
oversized injected wordmark, lower-left four-line copy/action lockup, and a
large lower-right flagship image overlapping the wordmark and clipping at the
foreground edge. Mobile preserves that anatomy and crops the same elements
rather than replacing them with a separate layout. Brand injections supply the
wordmark, copy, palette, typography and Dish image; they do not supply geometry.

Template-consuming Apps use a consistently named `templates` layout as their
page-level starting point. The layout owns normal-flow App header and page
mounting; scenes do not own header geometry or offset themselves around page
chrome. The first proving layout remains App-owned until a second App confirms
which header contract is genuinely reusable.

The bounded Friiites cutover is implemented by
`scripts/migrate-friiites-palette.mjs`. It uses the protected MCP/Skill mutation
lane, preserves a complete preimage, removes only a Kitchen backdrop override
that duplicates its Place, and refuses to overwrite a different App or Kitchen
palette. That removal is migration evidence, not an accepted Kitchen colour
seam.

Kitchen presentation configuration owns its functional theme outside the
Kitchen root; its linked Place identity colour provides the fallback behind
transparent identity uploads. The workspace unlocks editing that capability
but never a template. App extends that effective theme with one App-owned
template and Brand System. The App assignment governs all of its tenant and
franchise Kitchens; individual Kitchens do not select or fork the App template.

The Kitchen Identity Workspace mirrors onboarding as four explicit capability
layers: Place → Kitchen → Workspace → App. Place edits its Primary identity
colour; Kitchen stores sparse identity media additions but no colour override;
Kitchen stores its functional four-colour palette and optional menu font
choices on its canonical root. The App section appears only for
`management.mode === 'app'` and edits the dedicated App's eight effective
palette roles plus `display_family` and `body_family`; the writer compacts the
palette back to an App-only delta over Workspace. It also reports the universal
five-master readiness established during App onboarding. Template anatomy,
optional Brand Assets and per-role typography controls remain outside this
editor.

Entity edit routes and Workspace composition reuse the same owner-level panels
and trusted mutations. Workspace is another doorway into Place and Kitchen
editing, not a second field contract: Place-owned media never appears as a
Kitchen write, and Workspace/App settings never move onto the Kitchen root.

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
The App/brand Workspace should author and release the standard. Kitchen Workspace
should show the effective assigned standard and operational conformance/stock,
not become a second brand-authoring surface.

Current source does not yet define stored Brand System, Brand Asset,
consumable-specification or Kitchen brand-release assignment contracts.
`public/img/app/*` remains the runtime asset authority, Dish remains the food
media owner, and Supplier Item remains procurement truth until those bounded
records and their Workspace ownership are implemented. Do not hide this missing
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
  `packages/extensions/fireux-kitchens/src/runtime/kitchen/server/identity/theme.ts`
  and `packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Identity/Theme.vue`
- Canonical catalogue: `projects/misebox/misebox-app/app/pages/templates/*`
- Injection/anatomy: `packages/ecosystem/fireux-misebox/src/runtime/template-one*`
  and `TemplateOne*.vue`
- Misebox Basic resolver:
  `packages/ecosystem/fireux-misebox/src/runtime/kitchen-basic-presentation.ts`
- FireUX referral: `projects/fireux/fireux-app/app/pages/templates/*`
- Kitchen capability projection and collection grouping:
  `packages/extensions/fireux-kitchens/src/runtime/kitchen/server/identity/read.ts`
  and `runtime/kitchen/components/Collection/Manager.vue`
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
