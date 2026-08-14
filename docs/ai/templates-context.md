# Landing templates context

Updated: 2026-08-12
Ref: 93c271035
Role: living context
Scope: FireUX landing-template catalogue and brand-injection family

## Inheritance

This context inherits `AGENTS.md` and `docs/ai/gpt-context.md`. Template copy
also follows `docs/concepts/product-language.md`; ecosystem-owned evidence
continues to inherit its own scoped context.

## Purpose and scope

Use this context for the Misebox-owned Kitchen-template catalogue, reusable
template anatomy, preview-only brand injections, and FireUX catalogue
referrals. The current proving member is Template One.

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
  Console presentation. They are progressive presentation levels, not App
  template records. Template One is the only current App template; do not add
  a placeholder second template before a real composition proves it.
- Templates are available only to App-managed Kitchens. Root and Console
  Kitchens appear on the Template One page only as progression specimens that
  expose the inherited atom inputs an App template extends.
- Root owns neither theme nor template. Console owns Kitchen Menu `PageStyle`
  but never template selection. An App extends the effective Console theme with
  one App-owned template applied across all of its tenant/franchise Kitchens;
  franchises do not fork or select templates independently.
- Place presentation is intentionally minimal: entity identity media plus one
  semantic `identity_backdrop_color` fallback behind transparent uploads. Current
  persisted Place source still calls it `media_backdrop_color`; migrate that
  field only through the guarded Place projection/write family. Rich
  palette and composition inputs begin above Place; do not treat Place
  `brand_palette` compatibility data as the Template One App palette.
- Palette ownership is progressive and non-copying: Place owns one identity
  backdrop, Kitchen may sparsely override it, Console owns four functional
  colours, and App stores only roles that extend or override Console. App
  source still reviews the effective eight-colour result. Domain-owned App
  attachment seeds a missing Console layer from that source, preserves any
  existing Console colours, and compacts the canonical App layer. Templates
  resolve Console plus App; they never require duplicated values.
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
- The `/templates` catalogue has only three responsibilities: select one
  Kitchen (temporarily from four development specimens), display that
  Kitchen's Root/Console/App presentation configuration, and list compatible
  presentations. It does not validate asset binaries, inspect Storage, render
  scenes, or own Template-One-specific readiness machinery. Replacing the
  temporary selector with one canonical Kitchen projection must not change
  this page anatomy.
- Scene One render readiness is distinct from full Template One content
  readiness. The scene can render from one unique flagship, while the template
  requirements manifest still requires six eligible Dishes plus exactly one
  explicit flagship before reporting complete content readiness.
- A template injection owns tokens, copy, links, and approved media only. It
  never repeats scene markup or template CSS and does not create an App,
  domain, or production record.
- `projects/templates/fireux-template` remains the guarded neutral starter App;
  it is not the catalogue implementation or a container for presentation
  templates.
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
- Shared landing motion remains outside this family. Do not add GSAP,
  ScrollTrigger, or a competing motion abstraction here.

## Authority and current source

1. `packages/ecosystem/fireux-misebox/src/runtime/template-one.ts`
2. `packages/ecosystem/fireux-misebox/src/runtime/template-one-fixtures.ts`
3. `packages/ecosystem/fireux-misebox/src/runtime/TemplateOne*.vue`
4. `projects/misebox/misebox-app/app/pages/templates/*`
5. `projects/fireux/fireux-app/app/pages/templates/*`
6. `scripts/guards/landing-templates.mjs`
7. `docs/concepts/landing-templates.md`
8. `docs/concepts/templates.md`
8. `docs/concepts/theming.md`

Brand copy and assets must point back to current owner source. Missing assets
remain explicit in the injection metadata and polished in the preview; never
reconstruct a wordmark or borrow another identity.

## Refresh and verification

When adding anatomy, a progression specimen, an injection field, or a catalogue member, inspect the
current proving App and nearest public catalogue/detail route, change the
narrowest owner, update the focused guard, and visually verify every injection
at desktop and phone widths. Run the owning App production build and mandatory
`pnpm guard` before handoff.

Update this file only when the stable scope, authority, or ownership boundary
changes. Keep temporary asset requests, campaign drafts, and task status out.
