# Landing templates context

Updated: 2026-09-11
Ref: 53fa40ee6
Role: living context
Scope: FireUX landing-template catalogue and brand-injection family

## Inheritance

This context inherits `AGENTS.md` and `docs/ai/gpt-context.md`. Template copy
also follows `docs/concepts/product-language.md`; ecosystem-owned evidence
continues to inherit its own scoped context.

## Purpose and scope

Use this context for the Misebox-owned Kitchen-template catalogue, reusable
template anatomy, preview-only brand injections, and FireUX catalogue
referrals. The current family baseline is Template One.

The foundational meaning and ownership test live in
`docs/concepts/templates.md`. Templates own reusable presentation structure;
consumer identity, content, assets, routes, and operational values remain
injected owner data.

## Ownership boundaries

- `fireux-misebox` owns Template One's contract, atom anatomy, reusable scene
  compositions and catalogue fixtures.
- Misebox owns the canonical `/templates/template-one` product page. FireUX
  keeps a catalogue referral and does not copy anatomy or fixtures.
- The catalogue also exposes `Default` for Root presentation and `Theme` for
  Workspace presentation. They are presentation levels, not template records.
  Template One is the only current template. Do not publish a nominal Template
  Two with no product purpose. A real Template Two may begin as a separately
  named, structurally aligned proving sibling, then deliberately differentiate
  under the lifecycle in `docs/concepts/spine.md`.
- Template eligibility belongs to the fulfilled Kitchen, not to its management
  tier or the existence of a canonical App. An App is one valid provider and
  proof of the effective assets and theme values, but is not itself a
  functional prerequisite.
- Root owns neither theme nor template. Workspace owns the Kitchen's functional
  Menu palette but never template selection. An App extends the effective
  Workspace theme with one App-owned template applied across all of its
  tenant/franchise Kitchens; franchises do not fork or select templates
  independently.
- Place presentation is intentionally minimal: entity identity media plus one
  semantic `identity_color`, labelled Primary colour in the editor, behind
  transparent identity media. Current persisted Place source still calls it
  `media_backdrop_color`; migrate that field only through the authorized Place
  projection/write family. Rich
  palette and composition inputs begin above Place; do not treat Place
  `brand_palette` compatibility data as the Template One App palette.
- Palette ownership is progressive and non-copying: Place owns one identity
  colour, Kitchen owns no colour override, Workspace owns four functional
  colours, and App stores only roles that extend or override Workspace. Current
  Kitchen `assets.backdrop_color` is migration input, not an owner. App
  source still reviews the effective eight-colour result. Domain-owned App
  attachment seeds a missing Workspace layer from that source, preserves any
  existing Workspace colours, and compacts the canonical App layer. Templates
  resolve Workspace plus App; they never require duplicated values.
- App typography begins with two family inputs only: display and body. Template
  One derives Display, Heading, Body and Label roles from those inputs;
  responsive scales, uploads and per-role overrides remain outside this seam.
- Template One eligibility is inspected outside scene anatomy. Scene One
  consumes canonical wordmark, effective palette, two typography families and
  the unique Kitchen-owned flagship Dish from the bounded Dish projection.
  Missing or multiple flagships render one shared not-ready anatomy; collection
  order is never a fallback. Dish owns food imagery. Optional App Brand Asset
  roles such as marks and patterns remain unapproved until their owner records
  canonical role and usage metadata.
- The `/templates` catalogue selects one Kitchen, displays its effective
  presentation inputs, checks Kitchen-level template readiness, and lists
  compatible presentations. The readiness check reports supplied values and
  canonical asset roles; it does not validate asset binaries or inspect
  Storage. Replacing the temporary specimens with canonical Kitchen
  projections must not change this page anatomy.
- Every Template One surface follows one canonical
  `TemplateOneKitchenProjection → TemplateOnePage` flow. The package owns all
  six scenes; tenant Apps and the catalogue inject Kitchen data and render the
  page directly. Consumer scenes, adapters, copied template CSS, and iframe
  previews are drift.
- Initial duplication between `TemplateOne*` and a future real `TemplateTwo*`
  proving sibling is bounded family construction, not consumer drift and not
  evidence of a shared template engine. Keep both templates independently
  named and working, differentiate Template Two materially, then compare the
  surviving family contract before extracting or guarding cross-template
  machinery.
- A proving Template Two adopts independently established catalogue identity,
  compatibility, readiness, owner-injection, and renderer-boundary checks from
  its first save. Its components, functions, styles, anatomy, and product
  decisions remain `TemplateTwo*`-owned while it differentiates.
- Scene One render readiness is distinct from full Template One content
  readiness. The scene can render from one unique flagship, while the template
  requirements manifest still requires six eligible Dishes plus exactly one
  explicit flagship before reporting complete content readiness.
- A template injection owns tokens, copy, links, and approved media only. It
  never repeats scene markup or template CSS and does not create an App,
  domain, or production record.
- `projects/templates/fireux-template` remains the neutral starter App;
  it is not the catalogue implementation or a container for presentation
  templates. Its config declares Core, Blogs and Products native layers in
  their established order; it does not inherit FireUX main-App runtime pages.
- Friiites remains a Misebox tenant App and visual proving reference. Core owns
  no template-specific presentation.
- Template injections consume canonical asset roles, never filenames unique to
  one brand. Firebase Storage is durable authority. The owning App may resolve
  its identical bundled `public/img/app/<filename>` first and Storage second;
  cross-App catalogues use the owner App's Storage URL only. Missing roles stay
  missing and never fall back to another brand or asset kind. Misebox must not
  mount or inspect a sibling tenant App's bundle to populate its catalogue.
- Template anatomy preserves Page → Scenes → Layers → Elements. Page chrome is
  outside scenes; neutral hooks are `data-landing-scene` and
  `data-scene-layer`.
- A template-consuming App starts from its App-owned `templates` layout. That
  layout keeps header/page chrome in normal document flow and mounts the page;
  reusable scenes never compensate for header height or position. Extract a
  shared configurable header only after a second real App proves the contract.
- Core owns landing motion infrastructure. Template One declares semantic
  hero parts and reveal directions, then calls Core's `useLandingMotion` once
  at its shared page root. Scenes never import GSAP, create observers, or add a
  competing motion abstraction. Reduced-motion and visible fallbacks remain
  Core responsibilities.

## Authority and current source

1. `packages/ecosystem/fireux-misebox/src/runtime/models/template-one.ts`
2. `packages/ecosystem/fireux-misebox/src/runtime/content/template-one-fixtures.ts`
3. `packages/ecosystem/fireux-misebox/src/runtime/components/TemplateOne/*`
4. `projects/misebox/misebox-app/app/pages/templates/*`
5. `projects/fireux/fireux-app/app/pages/templates/*`
6. `docs/concepts/landing-templates.md`
7. `docs/concepts/templates.md`
8. `docs/concepts/theming.md`

Brand copy and assets must point back to current owner source. Missing assets
remain explicit in the injection metadata and polished in the preview; never
reconstruct a wordmark or borrow another identity.

## Refresh and verification

When adding anatomy, a progression specimen, an injection field, or a catalogue member, inspect the
current proving App and nearest public catalogue/detail route, change the
narrowest owner, verify affected contracts through source review and relevant
source-owned tests, and visually verify every injection at desktop and phone
widths. Run the owning App production build and `git diff --check` before
handoff. The former landing-template guard and
repository guard suite are removed.

Update this file only when the stable scope, authority, or ownership boundary
changes. Keep temporary asset requests, campaign drafts, and task status out.
