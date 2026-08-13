# Theming and branded presentation

Updated: 2026-08-12
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

## Asset resolution contract

Branded presentation uses one role language through the progressive owner
flow: `Place → Kitchen → App`. A role keeps one filename and relative path;
moving into an App does not rename `logo.png`, `wordmark-light.png`,
`wordmark-dark.png`, `cover.png` or `thumbnail.png`.

Identity preparation is progressive and validates both availability and dimensions:

- Root: `logo.png`, `wordmark-light.png`, `wordmark-dark.png`.
- Console: the Root family plus `cover.png` and `thumbnail.png`.
- App template readiness uses the same five canonical masters as Console:
  `logo.png`, both surface wordmarks, `cover.png` and `thumbnail.png`, but checks
  their canonical App-owned Firebase Storage paths rather than browser fixture
  URLs.

The owning App bundle additionally carries `wordmark.png`, `favicon.ico`,
`pwa/icon-192.png` and `pwa/icon-512.png`. Those are build outputs and runtime
assets, not extra Storage-master decisions for template readiness.

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

App initialization enforces this boundary. Creating the App record alone is
not readiness: the validated five-file Storage sync must also populate every
canonical `App.media` URL before initialization can complete. Failed or partial
sync remains retryable and does not release the App shell.

The same progressive rule applies to authored colour. App source carries the
reviewed effective eight-role palette. Initialization stores it while no lower
Console layer exists. Domain-owned attachment derives a missing four-role
`AppX.console.theme.palette`, preserves an existing Console palette, then
compacts `App.theme.palette` to App-only additions and material overrides.
Runtime presentation resolves Console plus App into the effective eight roles.
Kitchen root remains sparse, and an identity backdrop override equal to Place
is omitted.

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
the Live Seehotel Bönigen Root Kitchen, the Pizza the Action Console Demo, the
Friiites App Kitchen and the Deano's Demo App emulation. The public `/kitchens`
collection classifies real Kitchen records
directly from `Kitchen.management.mode`: Root, Console and App. Demo status
never changes that capability classification. The Root input is only the Place
primary colour; Seehotel is as complete as Friiites at that level. It is the
first agreed fallback, used behind poor or transparent identity media and
overridden by richer resolved Console or App presentation. Level Two compares the same

The `/templates` catalogue owns the comparison flow: select one Kitchen, then
open a presentation level with the same `?kitchen=<slug>` projection. `Default`
is the included Root presentation, `Theme` is the Console presentation, and
Template One/Two are App template compositions. Default and Theme are grouped
in the catalogue for comparison but are not marketed or modelled as App
templates.
It also owns the selected Kitchen's complete asset-readiness ledger, keeping
validation outside template anatomy and leaving detail routes focused on the
applied composition.
The detail route retains a compact Kitchen switcher so direct links remain
useful. Kitchen selection determines identity, assets and inherited theme;
template selection determines composition. Template Two initially shares the
same low-level proving scene while retaining its own routable template identity
and future anatomy ownership.

Menu sample using the existing `Kitchen.menus.style` / `PageStyle` contract:
Seehotel shows the resolved default Menu baseline with no authored Console
override, while Pizza the Action shows its source-owned Demo Console theme.
Friiites and Deano's do not receive invented Console values before their App
template work begins. Place presentation is intentionally bounded to one
semantic `presentation.identity_backdrop_color` input. Current persisted Place
source still names this field `media_backdrop_color`; renaming that stored
field requires a guarded Place projection/write migration and is deliberately
not hidden inside the Template One change. A concurrent onboarding
compatibility path also persists a sparse two-colour `brand_palette` on Place
and Kitchen. That is current source, but it is not the target ownership model
and must not be mistaken for Console or App palette authority. The
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
The App preview exposes Scene One beneath its developer toolbar. Page header
and navigation remain external chrome; Scene One owns only the dominant
wordmark, supporting copy and action, flagship Dish presentation, fixed
texture/backlight and scroll cue.
Template inspection resolves App-owned identity media only through the owning
App record and canonical Storage projection. Misebox remains ignorant of
sibling App bundles: it must not mount their public directories, call their
development ports or copy their assets into the template package. Template One
renders an explicit missing state when Storage has not supplied the role; it
must not invoke Core's semantic FireUX brand fallback for a tenant injection.
For App fixtures, `wordmarkSrc` has one canonical meaning: the App-owned
`img/app/wordmark-dark.png` Storage role. Fixtures cannot point that prop at a
brand-specific nested alternate, a sibling bundle mount or a square
`logo.png`. Friiites and Deano's remain explicitly missing until their App
Storage projections supply that canonical role.
The Misebox template-detail route intentionally uses a minimal route shell
rather than absorbing the default Misebox layout. Catalogue navigation,
fixture selection and prop provenance sit in normal document flow above the
template canvas. Identity lettering comes from the supplied wordmark artwork;
the two App typography families drive the derived Scene One copy and label
roles.
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
The original high-detail stone asset and its paired shadow/highlight blend are
Template One constants rather
than injection options. The compositing rule must retain visible stone detail
over both near-black and brighter Place primaries. A fixed multiply channel
retains stone depth and a fixed screen channel retains stone highlights. These
neutral light interactions preserve the source texture's quality while the
Place primary remains the hue authority. The source is desaturated at the
Template layer so no colour embedded in the stone artwork leaks into an
injection. No brand fixture can remove, tint or tune either channel.

Template records and template application are App-only. Root and Console
Kitchens on this page are inspectable progression specimens, not template
customers or template consumers. They show the inherited atom ownership that
an App template extends: Root → Console → App Template.

The Template One inspection page checks readiness before App template work.
Root and Console show their progressive inherited requirements but do not
claim template eligibility. An App is template-ready only when Firebase
Storage contains all five canonical masters: logo, both surface wordmarks,
cover and thumbnail. `wordmark.png`, favicon and PWA icons are bundle outputs,
not extra Storage-master decisions, and remain the owning App build's
responsibility.

Demo fixtures may prove the same five-role template input without becoming an
App. Their deterministic Demo data supplies relative object references which
resolve to the existing Demo Firebase Storage authority; the inspection page
validates those resolved URLs and dimensions directly. It labels this as Demo
template assets and never queries or invents `apps/<demo-id>/...` ownership.
Within the fixed `demo/misebox-app` authority, template assets use the same
App-shaped relative family as real Apps:
`apps/<demo-id>/img/app/<filename>`. Deano's fulfils the five roles with its
approved combined lockup preserved unchanged: the same transparent wide
lockup is valid on both surfaces, while cover and thumbnail use brand-only
graphic presentation without Dish media.

Palette authorship is progressive and remains separated by owner:

- Place owns one `identity_backdrop_color`, used only behind transparent
  identity media.
- Kitchen Root normally authors no colour. It may store one sparse identity
  backdrop override when the Place value does not suit that Kitchen.
- Console owns four reviewed functional colours: `canvas`, `text`, `accent`
  and `accent_contrast`. Derived surfaces, borders and states are renderer
  output rather than authored palette fields.
- App source confirms the effective eight semantic colours: `canvas`,
  `surface`, `canvas_inverted`, `text`, `text_muted`, `ink`, `accent` and
  `accent_contrast`. Canonical App storage keeps only roles that extend or
  override Console.

Resolution is dynamic: Place → Kitchen override → Console → App. Inherited
values may seed a missing lower layer during onboarding, after which duplicate
values are removed from the richer owner. The resolved App palette applies
across its Kitchens and franchises; it never belongs to a single Kitchen merely
because that Kitchen is the first consumer. Direct App creation must still
traverse and review the same progressive inputs.

Core defines the four-role Console value object, complete eight-role resolved
value object, and sparse App layer. App initialization persists reviewed source
intent, while each domain package owns Console derivation and App compaction.
Kitchen attachment seeds a missing Console palette and never overwrites an
existing one. Template fixtures use the same resolver and compactor; their
values are still not canonical records. The `/templates` catalogue displays
each stored layer and its provenance rather than repeating the resolved palette
under every owner.

Typography follows the same progressive boundary. Root authors no typography
and uses the Misebox default. Console may express bounded title/body font
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
that duplicates its Place, and refuses to overwrite a different App or Console
palette.

Root has no authored theme; its single Place backdrop provides the fallback
behind transparent identity uploads. Console unlocks a functional theme but
never a template. App extends that effective Console theme with one App-owned
template and Brand System. The App assignment governs all of its tenant and
franchise Kitchens; individual Kitchens do not select or fork the App template.

The Kitchen Identity Console mirrors onboarding as four explicit capability
layers: Place → Kitchen → Console → App. Place edits only its identity backdrop;
Kitchen stores sparse identity additions or overrides; Console stores its
functional four-colour palette and optional menu font choices on the same-id
AppKitchen support record. The App section appears only for
`management.mode === 'app'` and edits the dedicated App's eight effective
palette roles plus `display_family` and `body_family`; the writer compacts the
palette back to an App-only delta over Console. It also reports the universal
five-master readiness established during App onboarding. Template anatomy,
optional Brand Assets and per-role typography controls remain outside this
editor.

Entity edit routes and Console composition reuse the same owner-level panels
and trusted mutations. Console is another doorway into Place and Kitchen
editing, not a second field contract: Place-owned media never appears as a
Kitchen write, and Console/App settings never move onto the Kitchen root.

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
