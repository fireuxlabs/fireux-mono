# Spine

Updated: 2026-08-20
Ref: d1a7d5eec
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

## Family registry

| Family                        | Map                          | Strongest current evidence                                                                          | Current status                                                                                                                                      |
| ----------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Apps That Slap ecosystem      | `apps-that-slap.md`          | Existing `fireux-slap` package, App registry, Firebase binding, and presentation contract           | Stable ecosystem spine is aligned; legacy App classifications require source-backed review before migration                                         |
| Sharer ecosystem              | `sharer.md`                  | `fireux-sharer`, registered Sharer global App, and registered Kjordi tenant App                      | Ecosystem and tenant-App boundary are established; Share Profile persistence and QR consumption remain to-confirm                                    |
| Workspace entity                | `family-workspace-entity.md`   | `scripts/guards/workspace-indexes.mjs`                                                                | Index spine is strong; lifecycle sheets still vary                                                                                                  |
| Operation, Capability, and Tool | `family-operation-capability-tool.md` | Operation catalogues, Tool registries, and `scripts/guards/operation-tools.mjs`                | Shared vocabulary and classification axes are established; reusable implementations still require named sibling evidence                           |
| Like-menu operation           | `family-like-menu.md`        | `scripts/guards/like-menu-family.mjs`                                                               | Menus is the guarded records-then-tools reference; new members require deliberate adoption                                                          |
| Entity Collection Page              | `family-entity-collection-page.md` | Route pages plus collection-manager contracts                                                       | Ordinary Directories share a shell; App-owned branded families retain their own aesthetic                                                           |
| Entity detail                 | `family-entity-detail.md`    | Bounded SSR projections and route pages                                                             | Transport rule is strong; route identity and actions are incomplete                                                                                 |
| Tenant/global                 | `family-tenant-global.md`    | App config, `useFireUXConfig`, and `useWorkspace`                                                     | Runtime mode is shared; transfer and second-tenant proof remain incomplete                                                                          |
| Menu                          | `family-menu.md`             | Entity declarations and menu route guard                                                            | Identity and route contexts are strong; content migration remains active                                                                            |
| Menu ordering                 | `menu-ordering.md`           | Menu route grammar, order models, and lifecycle composables                                         | One lifecycle is mapped; the older funnel tree remains migration debt                                                                               |
| Place/Kitchen media           | `place-kitchen-media.md`     | Place/Kitchen models, projectors, media writers, and entity authority guard                         | Media ownership is shared; Place `identity_color`, legacy field names, and removal of Kitchen colour overrides remain a guarded migration           |
| Finance                       | `finance.md`                 | Finance primitives, trusted fact producer, and `scripts/guards/finance.mjs`                         | Money and immutable fact ownership are guarded; new producers require dated authoritative operations                                                |
| Marketplace                   | `marketplace.md`             | `fireux-marketplace` models, trusted handlers, and closed raw Rules                                 | Marketplace Store is a root Workspace Entity and owns Store Team, Offers, and Orders                                                                |
| Supplier                      | `suppliers.md`               | `SupplierEntity`, atomic onboarding, Supplier Workspace, and Workspace authority guards             | Supplier owns identity, Team, Catalogue, Ingredients, and Items; Store publication remains marketplace-owned                                        |
| Collection manager            | `collection-manager.md`      | Shared directory components, manager siblings, and CSS guards                                       | Ownership roles are clear; presentation classes still need deliberate classification                                                                |
| Card                          | `card-family.md`             | Prop-driven Card variants plus `scripts/guards/components.mjs`                                      | Cell/Pill/Preview are canonical; legacy Cards/Profile paths are frozen migration debt                                                               |
| Core models                   | `core-models.md`             | Canonical model files plus entity-authority and user-app-access guards                              | App, Ecosystem, User/AppUser, and Project ownership is explicit; named stored projections remain migration debt                                     |
| Product language              | `product-language.md`        | Atomic source fields, child surfaces, operation catalogues, and parent composition                  | Bottom-up derivation is defined; existing cross-repo copy still needs progressive review                                                            |
| Landing templates             | `landing-templates.md`       | Canonical Kitchen projection, package-owned six-scene page, two brand injections, and focused guard | Template One is the baseline; a future real Template Two may enter as a separately named proving sibling before deliberate differentiation          |
| Theming                       | `theming.md`                 | Core primitives, App/Kitchen brand ownership, injections, templates, and seller doorways            | FireUX owns canonical previews; FireUX and Misebox may offer one shared theme family                                                                |
| Blog                          | `blog.md`                    | Blog root/directory response plus `scripts/guards/blog-authority.mjs`                               | Blog truth and ecosystem-wide publication are shared; authored story language remains owner-defined                                                 |
| Search visibility             | `search-visibility.md`       | Core SEO runtime plus `scripts/guards/seo-spine.mjs`                                                | Route identity, private indexing, and bounded Jobs discovery are guarded; metadata adoption, entity graphs, and multilingual URLs remain incomplete |
| Create                        | `create.md`                  | `useXCreate` siblings, trusted endpoints, and `createStrategy.ts`                                   | Create families are classified; plan metadata and optional-field handling are not aligned                                                           |
| Tool provider                 | `tool-provider.md`           | Core registry, loader, iframe protocol, and provider APIs                                           | Transport is shared; Go QR wrappers and dogfood config contain duplication                                                                          |
| AI document processing        | `ai-document-processing.md`  | `fireux-ai` document loop and Kitchen Menu adapter                                                  | Ownership is clear; only one domain adapter has proved the shared contract                                                                          |
| Translation and reviewed copy | `translation.md`             | Sproochli copy model, Kitchen attachment/Menu projection, trusted draft endpoint, and copy guard    | Authority and attachment are shared; reviewed-copy persistence and reviewer UI remain to-confirm                                                    |
| Firestore entity stack        | `firestore-entity.md`        | `scripts/guards/canon.mjs` and entity authority guards                                              | Folder spine is guarded; family-specific reads differ by authority                                                                                  |
| Server API                    | `server-api.md`              | Package registration and shared server primitives                                                   | Placement is clear; no-op hooks and repeated authority parsing remain                                                                               |
| Runtime package               | `runtime-package.md`         | Module wiring and package guards                                                                    | Registration spine is shared; package lanes own deliberate deltas                                                                                   |
| Runtime filesystem            | `runtime-filesystem.md`      | Module registration, entity ownership, and path guards                                              | Declared Entity families use scoped Nuxt spines; shared/system and Nuxt entrypoints remain at the package root                                      |
| App config                    | `app-config.md`              | `defineFireuxConfig`, Nuxt overrides, and `FireUXConfig`                                            | Runtime role is explicit; repeated project defaults are drift                                                                                       |
| Brand assets                  | `brand-assets.md`            | Core source family plus `scripts/guards/fireux-brand-assets.mjs`                                    | FireUX identity is Core-owned; parent ecosystem and App projections are guarded                                                                     |
| Layout                        | `layouts.md`                 | `AppShell` and current runtime layouts                                                              | Ownership is clear; slot versus direct route rendering is `to-confirm`                                                                              |
| Debug                         | `debug.md`                   | `DevDebugPanel`                                                                                     | One payload and renderer contract; inline and launcher lifecycle modes are configuration, not separate families                                     |
| Privacy-first measurement     | `privacy-measurement.md`     | Shared legal surface plus `scripts/guards/privacy-measurement.mjs`                                  | No tracking is active; the bounded aggregate server/admin family must land before collection begins                                                 |
| Repository performance        | `repository-performance.md`  | `scripts/measure-workspace.mjs` and the root verification commands                                  | Measurement is reproducible; timing budgets remain to-confirm until repeated reference-environment evidence exists                                  |
| Lasagne architecture          | `lasagne.md`                 | Entity composables, domain controllers, Workspace providers, and structural shells                    | Dependency direction is defined; touched prop-relay workflows should move toward domain-owned controllers without a universal entity framework      |

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

- Keep the guard-backed Workspace index and Menu route spines intact.
- Use explicit delta registers in family maps.
- Keep source and guards above prose in the authority order.
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
- Reconcile descriptive entities with the executable matrix before adding more
  root or scoped ceremony.
- Consolidate the duplicate Go QR wrappers and dogfood payloads behind the
  existing provider contract.
- Move the old Kitchen order funnel tree onto the mapped Menu Order lifecycle.

### Later

- Promote repeated, proven family contracts into guards.
- Do not guard unresolved product choices or cosmetic prose.
- Prove a second AI document domain before generalizing review persistence.
- Test the two layout renderer lanes before choosing or guarding one syntax.
- Promote `CreatePlan` metadata only if real consumers need to query it.
