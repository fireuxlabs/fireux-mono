# Spine

Updated: 2026-11-14
Ref: 5916a6874
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

## App and Ecosystem composition spine

This cross-cutting spine connects a concrete App's choices to the selected
bundles, named Ecosystem composition, extension modules and layers, and Core
mechanics. It describes their collaboration; it does not create a new source
owner or replace the App, package, and dependency boundaries.

```text
App nuxt.config.ts
  ├─ tenant or standalone → defineFireuxApp
  └─ Main App             → defineFireuxEcosystem → defineFireuxApp
                                                    ↓
                                         Nuxt App composition
                           ├─ modules: Ecosystem, Core, defaults,
                           │  App selections and module dependencies
                           ├─ extends: App-selected native layers,
                           │  Main App layer when applicable, defaults
                           └─ runtime projection: identity, Workspaces,
                              domain/profile selections and App policy
```

Module registration and native layer composition are complementary paths.
Follow both from the App recipe into their owning packages. Core supplies
neutral mechanics consumed by those owners.

### Where capability choices belong

| Choice                              | Selection point                                           | Owning implementation                                  |
| ----------------------------------- | --------------------------------------------------------- | ------------------------------------------------------ |
| Standard App capabilities           | App bundle defaults                                       | The selected extension modules and native layers       |
| Main App surfaces                   | `defineFireuxEcosystem`, requiring role `global`          | Shared `fireux-ecosystem` runtime layer                |
| Named Ecosystem                     | App's `ecosystem` value selects `fireux-<ecosystem>`      | Named Ecosystem module and its bindings                |
| Workspace composition               | App's `workspaces` plus selected native Workspace layer   | Named Ecosystem composition and domain Workspace owner |
| Additional capabilities and options | App's `modules` tuples and `extends`                      | Selected package's module options and runtime layer    |
| Access to an operation              | Current membership, entitlement, target and domain policy | Owning readers, access checks and trusted commands     |

Workspace declarations and layer selection must agree. For example, Misebox's
module conditionally registers Kitchens for the `kitchen` Workspace, while
`fireux-misebox/kitchen-layer` composes the Kitchen and Misebox native layers.
Installing a module or exposing a route establishes availability; authorization
remains with the owning access checks and trusted commands.

### Responsibility and source

- **Concrete App:** owns deployment, identity, role, its module/layer/workspace
  selection, App policy, and App-specific presentation. Its `nuxt.config.ts`
  is the actual composition recipe.
- **`fireux-app`:** `defineFireuxApp` validates and assembles the standard App,
  including shared modules, default layers, and runtime projection. Its defaults
  select the standard capabilities; concrete Apps select additional capabilities
  and package-owned options.
- **`fireux-ecosystem`:** `defineFireuxEcosystem` requires a Main App role, adds
  the shared Main App layer, and delegates standard assembly to `fireux-app`.
- **Named Ecosystem package:** owns real cross-extension composition, bindings,
  and Ecosystem-specific layers or module dependencies. Its module and layer
  entrypoints are selected by concrete Apps; they do not replace the standard
  App bundle.
- **Extensions:** own their domain modules, registered runtime entrypoints,
  layers, records, and trusted behavior.
- **Core:** supplies product-neutral Nuxt and Firebase mechanics used by the
  App and extension owners. It does not select a named Ecosystem or product.

Current source to trace:

- Builders: [`fireux-app/config`](../../packages/extensions/fireux-app/src/config.ts),
  [`fireux-ecosystem/config`](../../packages/extensions/fireux-ecosystem/src/config.ts),
  and [App defaults](../../packages/extensions/fireux-app/src/defaults.ts).
- Runtime layers: [App layer](../../packages/extensions/fireux-app/src/runtime/nuxt.config.ts),
  [Main App layer](../../packages/extensions/fireux-ecosystem/src/runtime/nuxt.config.ts),
  and the selected named Ecosystem modules/layers.
- Named composition example: [Misebox module](../../packages/ecosystem/fireux-misebox/src/module.ts)
  and [Kitchen Workspace layer](../../packages/ecosystem/fireux-misebox/src/config/app/kitchen-layer.ts).
- Concrete consumers: [Misebox Main App](../../projects/misebox/misebox-app/nuxt.config.ts),
  [La Tap Berne tenant](../../projects/misebox/la-tap-berne/nuxt.config.ts),
  and [Slap Main App](../../projects/slap/slap-app/nuxt.config.ts).
- Companion maps: [App config](app-config.md),
  [tenant/global/standalone roles](family-tenant-global.md),
  [Nuxt 4 integration](nuxt4.md),
  [runtime package contract](runtime-package.md), and
  [runtime filesystem](runtime-filesystem.md).

### Codex links

Keep one durable concept anchor for this concern. Bounded outcome tasks can
share that anchor over time; each task identifies the concrete App consumers
and shared or named packages it will actually change. Use the exact concept ID
`docs/concepts/spine.md#app-and-ecosystem-composition-spine`; add the relevant
App config, role, or Nuxt sub-concept IDs when they are part of the outcome.
Do not create one task per `nuxt.config.ts` when a single bounded change owns
the cross-App composition contract. For a family-wide audit, enumerate the
maintained consumers in that task's acceptance scope.

The [Codex map workflow](../../tools/ide/README.md#repository-and-codex-map)
joins task links only when supplied thread metadata includes exact `ownerPaths`
and `conceptPaths`. This concept anchor provides durable navigation; live chat
assignment and status require that external snapshot. Keep task IDs and status
out of this map.

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
vocabulary while retaining `useKitchens` and
`useCompanyCollection`. The family job is evidence for those fundamentals;
identical copied implementation is not. Keep an unresolved proposed
fundamental `to-confirm` instead of building ceremony around it.

### 3. Differentiating

Keep both siblings working while the new member develops at least one material
product difference. Material differences may change requirements, anatomy,
interaction, lifecycle, authority, inputs, or outcomes. Names, brand tokens,
copy, and fixture values alone do not materially differentiate a member.

Align already-proved family vocabulary and outcomes early, while preserving
named member seams such as `useKitchens`, `useCompanyCollection`,
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

| Responsibility                  | Current map                                                                    | Source to inspect                                                                |
| ------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| App and Ecosystem composition   | This section, `app-config.md`, `family-tenant-global.md`, `nuxt4.md`           | App configs, bundle builders, named Ecosystem module/layer entrypoints           |
| Runtime discovery and ownership | `runtime-package.md`, `runtime-filesystem.md`                                  | Package manifests, modules, native layers, App configs and generated Nuxt output |
| Entity classification and data  | `entities.md`, `firestore-entity.md`, `core-models.md`                         | Models, named readers/writers and authority checks                               |
| Workspace and capabilities      | `family-workspace-entity.md`, `family-workspace-capability-tool.md`            | Domain Workspace compositions, selection readers and commands                    |
| Routes and presentation         | `pages.md`, `components.md`, `composables.md`, `family-entity-detail.md`       | Actual route consumers, component registration and live detail readers           |
| Kitchen and Menu                | `family-menu.md`, `menu-ordering.md`, `order-processing-kitchen-fulfilment.md` | Kitchen/Menu models, trusted commands and `fireux-kitchens/src/test`             |
| Other domains                   | `suppliers.md`, `marketplace.md`, `finance.md`                                 | Owning package implementation and source-owned tests                             |
| Product and publishing          | `product-language.md`, `blog.md`, `landing-templates.md`                       | Current presentation and supported authoring commands                            |
| Infrastructure                  | `server-api.md`, `app-config.md`, `brand-assets.md`, `search-visibility.md`    | Current registration, configuration, assets and tests                            |
| Ecosystems                      | `apps-that-slap.md`, `sharer.md`, scoped `docs/ai` contexts                    | Ecosystem/App composition and direct dependencies                                |

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
