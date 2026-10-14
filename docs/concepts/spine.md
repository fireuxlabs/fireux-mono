# Spine

Updated: 2026-10-01
Ref: 2807ceca9
Role: map, not canon

## Purpose

Explain how FireUX finds and protects repeatable system shape without turning
every historical difference into an exception.

Prefer the word `spine`. A spine is a shared shape proved by current source,
guards, and working siblings. Domain deltas are allowed only after the shared
shape is visible.

The Place/Kitchen media ownership and single Place identity-colour spine is
mapped in `docs/concepts/place-kitchen-media.md`.

The hard-cutover evidence required before an Entity migration is complete is
mapped in [Entity canonical migration](entity-canonical-migration.md).

## Family growth lifecycle

FireUX grows a family through controlled named-sibling evolution:

`baseline → proving sibling → differentiating → established spine`

This lifecycle applies to the seam being changed, not automatically to an
entire product. A family may have an established collection contract while its
editor or workflow remains a baseline.

### 1. Baseline

Complete the first named member at the seam being tested. It must be useful in
its own right, correctly owned, readable, and passing its current checks. Reuse
existing FireUX, Core, Nuxt UI, domain, security, accessibility, and lifecycle
fundamentals; a baseline is not permission to rebuild proven lower layers.

Do not fork an unresolved implementation merely to compare two copies of the
same uncertainty.

### 2. Proving sibling

A second real member may begin as an intentionally aligned structural copy of
the baseline. Give it its own honest domain or product names, owner, files, and
entrypoints so it can evolve independently. Copy only the bounded family seam;
do not duplicate storage authority, consumer records, brand assets, fixtures,
or an existing lower-level spine.

A proving sibling requires a real product purpose and a declared
differentiation question or brief. The final design may remain `to-confirm`,
but the map must explain why the independent member exists and which product
dimension it will explore. A placeholder, renamed alias, theme swap, fixture,
or second consumer of the same member does not qualify. Initial equivalence is
a construction technique, not evidence of a shared contract.

### Share fundamentals early

Controlled duplication does not mean duplicating known fundamentals. Share a
lower mechanism or family protocol from the first sibling save when its reason
exists independently in current source, an established spine, or unavoidable
product and domain truth. Typical examples are identity and registration,
compatibility or readiness outcomes, authorization, failure vocabulary,
accessibility, and safe transport primitives.

A template catalogue may require each template to expose identity,
compatibility, readiness, and a renderer boundary while every template keeps
its own anatomy. Collection members may share lower read mechanics and outcome
vocabulary while retaining `useKitchenCollection` and
`useCompanyCollection`. The family job is evidence for those fundamentals;
identical copied implementation is not. Keep an unresolved proposed
fundamental `to-confirm` instead of building ceremony around it.

### 3. Differentiating

Keep both siblings working while the new member develops at least one material
product difference. Material differences may change requirements, anatomy,
interaction, lifecycle, authority, inputs, or outcomes. Names, brand tokens,
copy, and fixture values alone do not materially differentiate a member.

Align already-proved family vocabulary and outcomes early, while preserving
named member seams such as `useKitchenCollection`, `useCompanyCollection`,
`TemplateOnePage`, and `TemplateTwoPage`. Do not insert member-name branches,
large optional contracts, pass-through wrappers, or a generic engine merely
to hide the proving duplication.

### 4. Compare and establish

After material differentiation, compare:

- ownership and dependency direction;
- authority and source data;
- inputs, outputs, readiness, failure, and lifecycle;
- structure, behaviour, and presentation responsibilities; and
- the reasons each difference exists.

Classify differences as `accepted`, `migration`, `drift`, or `to-confirm`.
Promote a spine candidate only when at least two real members still use the
same contract for the same reason. The candidate becomes an established spine
when named members consume it through the same ownership and dependency
direction and behavioural verification protects it.

The correct comparison may leave deliberate named duplication and extract
nothing. Shared ancestry, identical filenames, visual similarity, or applying
the same bug fix to both siblings is not sufficient evidence.

### Promotion and evidence

Before a third sibling or permanent family guard, record the comparison in the
smallest family map. Name the baseline, proving sibling, reused fundamentals,
material differentiation, surviving invariant, accepted deltas, and non-goals.
Guards protect semantic ownership and behaviour after promotion; they do not
freeze temporary duplicate files, one member's copy, scene count, or exact
anatomy as a family-wide contract.

Keep the save that establishes a baseline, creates a proving sibling,
differentiates it, or extracts a spine focused on that family phase. When using
`pnpm gitsave`, provide a commit message that names the family and the phase or
invariant instead of relying on the generated filename summary.

## Before editing

1. Name the family.
2. Name its growth phase and the baseline or nearest working sibling.
3. Name the proven fundamentals to reuse.
4. Name what must match.
5. Name what may differ and why.
6. For a proving sibling, name its real product purpose, differentiation
   question, comparison trigger, and non-goals.
7. Patch the smallest useful slice.

If a difference has no reason, treat it as drift. If the reason is temporary
compatibility, treat it as migration debt rather than a permanent family delta.

## Delta test

Every observed difference belongs to exactly one state:

- `accepted`: keep it because product meaning, authority, or data ownership
  requires it.
- `migration`: remove it after a named migration or compatibility cutover.
- `drift`: align it because no reviewed reason exists.
- `to-confirm`: do not build more ceremony until the product decision exists.

An accepted or migration delta must name its reason, owner, source evidence,
and alignment or removal trigger. See `documentation.md` for the full writing
contract.

## Family navigation and evidence

Family maps remain navigation, not executable certification. The former
`scripts/` guard suite was removed. A historical guard name must not be cited
as current enforcement or as evidence that a family is aligned.

| Responsibility | Current map | Source to inspect |
| --- | --- | --- |
| Runtime discovery and ownership | `runtime-package.md`, `runtime-filesystem.md` | Package manifests, modules, native layers, App configs and generated Nuxt output |
| Entity classification and data | `entities.md`, `firestore-entity.md`, `core-models.md` | Models, named readers/writers and authority checks |
| Workspace and capabilities | `family-workspace-entity.md`, `family-workspace-capability-tool.md` | Domain Workspace compositions, selection readers and commands |
| Routes and presentation | `pages.md`, `components.md`, `composables.md`, `family-entity-detail.md` | Actual route consumers, component registration and live detail readers |
| Kitchen and Menu | `family-menu.md`, `menu-ordering.md`, `order-processing-kitchen-fulfilment.md` | Kitchen/Menu models, trusted commands and `fireux-kitchens/src/test` |
| Other domains | `suppliers.md`, `marketplace.md`, `finance.md` | Owning package implementation and source-owned tests |
| Product and publishing | `product-language.md`, `blog.md`, `landing-templates.md` | Current presentation and supported authoring commands |
| Infrastructure | `server-api.md`, `app-config.md`, `brand-assets.md`, `search-visibility.md` | Current registration, configuration, assets and tests |
| Ecosystems | `apps-that-slap.md`, `sharer.md`, scoped `docs/ai` contexts | Ecosystem/App composition and direct dependencies |

Nuxt entrypoint discovery and FireUX Entity ownership are different contracts.
Entity folders require explicit registration or imports. Different Entities need
not contain the same roles. Generic lower mechanics cannot depend on domain
owners, while upper composition can consume several domains. Folder names alone
prove neither security nor AI performance; navigation benefits remain an
experience-based rationale unless measured.

## Stop signals

- A tiny behavior needs many unrelated files.
- A helper name hides confusion instead of naming a real seam.
- A new layer duplicates an existing core seam.
- A proposed proving sibling has no real product purpose or differentiation
  question.
- Initial sibling equivalence is presented as proof of a shared contract.
- A project app starts owning reusable domain behavior.
- A family difference is described but not classified.
- Documentation calls current drift an accepted pattern without evidence.

## Current recommendations

### Now

- Preserve verified Workspace index and Menu route behavior through their current tests.
- Use explicit delta registers in family maps.
- Keep current source and executable checks above prose in the authority order.
- Preserve root `Menu` versus scoped `KitchenMenu` as separate entity and
  create contracts.
- Remove no-op parity files and new pass-through helpers instead of treating
  file-count symmetry as architecture.

### Next

- Align Entity Collection Page presentation where no product reason explains the current
  split.
- Resolve route identity per Entity Detail instead of changing all
  `[id]` and `[slug]` routes mechanically.
- Keep Kitchen root, required Place, and root-owned Team composition
  strict; do not reintroduce pre-release compatibility identity.
- Reconcile descriptive Entities with current identity, authority and consumers
  before adding root or scoped ceremony.
- Consolidate the duplicate Go QR wrappers and dogfood payloads behind the
  existing provider contract.
- Keep the rebuilt Kitchen Ordering boundary aligned with the Menu-owned customer flow; see `order-processing-kitchen-fulfilment.md`.

### Later

- Promote repeated, proven family contracts into guards.
- Do not guard unresolved product choices or cosmetic prose.
- Prove a second AI document domain before generalizing review persistence.
- Test the two layout renderer lanes before choosing or guarding one syntax.
- Promote `CreatePlan` metadata only if real consumers need to query it.
