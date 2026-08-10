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

Use this context for the canonical FireUX `/templates` catalogue, reusable
template anatomy, preview-only brand injections, and ecosystem storefront
doorways that offer those themes. The current proving member is Scene One.

## Ownership boundaries

- The FireUX App owns catalogue/detail product chrome, template definitions,
  preview anatomy, and preview injection fixtures.
- FireUX and Misebox may both offer a theme. Misebox owns its `/templates`
  hospitality sales doorway; it links to the canonical FireUX preview and does
  not copy anatomy or injection fixtures.
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

1. `projects/fireux/fireux-app/app/types/landing-template.ts`
2. `projects/fireux/fireux-app/app/content/landing-templates.ts`
3. `projects/fireux/fireux-app/app/components/Template/*`
4. `projects/fireux/fireux-app/app/pages/templates/*`
5. `scripts/guards/landing-templates.mjs`
6. `docs/concepts/landing-templates.md`
7. `docs/concepts/theming.md`

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
