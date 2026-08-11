# Landing templates context

Updated: 2026-08-10
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

## Ownership boundaries

- `fireux-misebox` owns Template One's contract, atom anatomy and fixtures.
- Misebox owns the canonical `/templates/template-one` product page. FireUX
  keeps a catalogue referral and does not copy anatomy or fixtures.
- A template injection owns tokens, copy, links, and approved media only. It
  never repeats scene markup or template CSS and does not create an App,
  domain, or production record.
- `projects/templates/fireux-template` remains the guarded neutral starter App;
  it is not the catalogue implementation or a container for presentation
  templates.
- Friiites remains a Misebox tenant App and visual proving reference. Core owns
  no template-specific presentation.
- Template anatomy preserves Page → Scenes → Layers → Elements. Page chrome is
  outside scenes; neutral hooks are `data-landing-scene` and
  `data-scene-layer`.
- Shared landing motion remains outside this family. Do not add GSAP,
  ScrollTrigger, or a competing motion abstraction here.

## Authority and current source

1. `packages/ecosystem/fireux-misebox/src/runtime/template-one.ts`
2. `packages/ecosystem/fireux-misebox/src/runtime/template-one-fixtures.ts`
3. `packages/ecosystem/fireux-misebox/src/runtime/TemplateOneAtoms.vue`
4. `projects/misebox/misebox-app/app/pages/templates/*`
5. `projects/fireux/fireux-app/app/pages/templates/*`
6. `scripts/guards/landing-templates.mjs`
7. `docs/concepts/landing-templates.md`
8. `docs/concepts/theming.md`

Brand copy and assets must point back to current owner source. Missing assets
remain explicit in the injection metadata and polished in the preview; never
reconstruct a wordmark or borrow another identity.

## Refresh and verification

When adding anatomy, an injection field, or a catalogue member, inspect the
current proving App and nearest public catalogue/detail route, change the
narrowest owner, update the focused guard, and visually verify every injection
at desktop and phone widths. Run the owning App production build and mandatory
`pnpm guard` before handoff.

Update this file only when the stable scope, authority, or ownership boundary
changes. Keep temporary asset requests, campaign drafts, and task status out.
