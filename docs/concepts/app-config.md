# App config spine map

Updated: 2026-10-07
Ref: bd7ab9559
Role: map, not canon

## Purpose

Map how FireUX project apps declare identity, modules, domains, workspaces, and app mode.

## Vertical links

- Parent: fireux.md
- Child: family-tenant-global.md
- Child: workspace.md

## Horizontal links

- runtime-package.md
- pnpm.md

## Core files

- `packages/core/fireux-core/src/config/app/fireux.config.ts`
- `packages/core/fireux-core/src/config/app/modules.ts`
- `packages/core/fireux-core/src/config/app/nuxt-baseline.ts`
- `packages/core/fireux-core/src/runtime/app/composables/config/FireUXConfig.ts`

## App pattern

- Import `defineFireuxConfig` and export it directly. Project Apps do not own a
  second assembly object just to append native layers: `extends` passes through
  the existing builder with Nuxt’s own type and priority. Repeated runtime or
  framework behavior belongs in its Core, ecosystem, or extension owner.
  Core appends its own native runtime layer as the baseline; App `extends`
  entries retain their declared priority above it.
- `ecosystem` automatically loads exactly one `fireux-<ecosystem>` module.
  Do not repeat that package in `modules`.
- `ecosystem` is the package/Firebase binding key, not an entity relationship.
- `projectId` names the canonical FireUX Project entity.
- Required `ecosystemId` names the canonical Ecosystem entity that contains the
  App. App role does not change this relationship: global, tenant, and
  standalone Apps all belong to an Ecosystem.
- Optional `databaseId` selects the App runtime database. The canonical App
  record lives there; without an override it lives in the Ecosystem binding
  database. The canonical Ecosystem record always stays in the binding's
  identity database and must be read through an explicit identity seam. Do not
  repeat the Ecosystem database id in project config; declare `databaseId` only
  for a genuine App override, including a standalone App-owned database.
- Every production `standalone` App declares its own named `databaseId`; the
  database is created in each Firebase project where that App owns local
  outputs. A standalone App never falls back to the FireUX ecosystem database.
  Global and tenant Apps inherit their ecosystem database unless a separately
  reviewed storage boundary proves otherwise.
- Core automatically includes `app/assets/styles/main.css` when the App owns
  that conventional stylesheet. The stylesheet remains App-owned, but its
  registration is not a project Nuxt override.
- Core supplies the native Nuxt `app.pageTransition` default. It is presentation
  config, not a `FireuxAppConfig` or runtime field.
- Core opts every App into Nuxt's version-5 compatibility defaults through the
  shared Nuxt baseline. Apps do not repeat or override
  `future.compatibilityVersion`; compatibility repairs belong to the lowest
  Core, ecosystem, or extension owner that implements the affected behavior.
- Blog is the one universal default extension and is loaded even when an App
  omits it from `modules`. The App still declares `fireux-blogs` directly in
  its manifest. `modules` lists every additional extension capability and may
  provide custom options for a default module.
- Products are future/explicit, not an App baseline. An App loads and depends
  on `fireux-products` only when it currently owns a real Product capability.
  Ecosystem packages do not bundle domain extensions on an App's behalf.
- A reusable extension owns its shared runtime integration defaults and
  environment resolution. For example, `fireux-kitchens` owns the Bringli
  Supplier-directory configuration, `fireux-places` owns Google Maps and
  Places provider configuration, and `fireux-go-qr` owns its provider origin.
  Project Apps do not repeat those runtime values.
- Firebase SSR region and execution identity belong to the selected
  ecosystem's required `ssr` configuration. Apps inherit them and do not
  repeat deployment identity in `defineFireuxConfig`.
- The authored `FireuxAppConfig` owns identity, role, capability, Workspace declarations. App navigation presentation lives in
  the existing `app/app.config.ts`, under `navigation.hiddenKeys` and
  `navigation.overrides`; Core `useNav` reads it directly through `useAppConfig`.
  It is not deployment runtime configuration. Authentication stays Core-owned; entry routes carry
  mode and redirect intent. Pricing is App-owned product literature: each Main App keeps a
  thin `useXPricing` wrapper over Core `usePricing`; commercial copy does not
  enter `defineFireuxConfig` or public runtime config. `RuntimeApp` derives from
  App config and makes normalized
  arrays/defaults explicit; `useFireUXConfig` maps that runtime shape to the
  consumer names once. Browser and trusted-server consumers use the same
  event-aware reader; Workspace consumers do not parse `runtimeConfig` again.
- Keep `nuxt.config.ts` as a declarative composition root. Content, pricing,
  onboarding, stored relationships, and executable behavior belong in their
  domain composable, stored authority, or owning package—not a top-level helper
  or imported App-config profile.
- Authored `app/meta.ts` is pure data and may be consumed by browser or server
  presentation. Its `defineFireuxMeta` helper and types stay free of Node-only
  dependencies; filesystem and Markdown loading belong to Core's config-only
  metadata loader.
- Core `resolveWorkspaceCanCreate` owns the shared explicit-override then
  non-tenant fallback. Workspace UI and trusted entity onboarding use that same
  policy instead of repeating it inside each domain.
- `useFireUXConfig` reads and freezes the current runtime config. It has no
  process-global cache or unused Nuxt injection provider, so HMR and multi-App
  processes cannot reuse a partially compared App shape.
- App initialization has no cosmetic client PIN. Authentication opens the
  environment check, while the trusted bootstrap endpoint verifies the
  configured developer UID and existing App-admin state before writing.

## Sitemap publication conditions

Domains register canonical sitemap sources through `fireux:seo:sitemaps:extend`.
Core's `config/app/seo.ts` normalizes that contract; `runtime/server/utils/seo-sitemaps.ts`
applies it to counts, page queries and final document eligibility. A domain may
contribute `additionalPublicFilters`, explicit scalar equality conditions beside
its primary public field. `runtime/utils/sitemap-public-filters.ts` validates these
conditions; malformed policy fails closed. Existing owners without additional
conditions keep their current policy. Supplier proves the two-condition case:
active nested Identity and visibility true, matching its directory and public SEO.
Core's `src/test/sitemap-public-filters.test.mjs` exercises registration through
query/result behavior. This is a publication query seam, not mutation authority.

## Important fields

- `ecosystem`
- `projectId`
- `ecosystemId`
- `databaseId`, optional
- `id`
- `name`
- `shortName`
- `role`
- `modules`
- `workspaces`
- `workspaceConfig`
- `domains`
- `profiles`
- `selfJoinEnabled`: initial policy seed for a new canonical App only.
  User onboarding and bootstrap read the stored App `self_join_enabled` policy,
  as the trusted join command does; build-time config does not gate joining
  an existing App.
- Navigation belongs in `app/app.config.ts`, alongside App presentation.
  Its optional `navigation.hiddenKeys` and `navigation.overrides` affect only
  inherited route presentation, never route existence or authorization.

## Mode differences

- Global apps can expose multiple domains and workspaces.
- Apps declare Workspace capabilities. Each root Entity owns target authority
  through `team/{uid}`; AppUser owns only App membership, capability, and
  lifecycle.
- Standalone is a FireUX-owned mode.

## Working rule

Do not duplicate app mode logic in domain code. Read it through `useFireUXConfig` and `useWorkspace`.

App chrome uses the Nuxt UI baseline. The plural `designPacks` field remains
only for named, surface-specific runtime configuration such as `publicMenu`;
it is not an App-wide theme or alternate chrome loader.

Apps inherit the Core page transition. Route-specific exceptions use
`definePageMeta`; app shells do not set `NuxtPage` transition props. A repeated
App-wide need is a missing shared seam and must be promoted before use.

## App media

- The App-owned `public/img/app/*` family is the bundled runtime source. It
  gives the owning App deterministic first paint, manifest/PWA assets and a
  same-origin fallback before any remote App context is available.
- The five identity masters are also published to
  `apps/{appId}/img/app/*` in Firebase Storage. That published copy is how an
  Ecosystem, directory or another App can render the brand without borrowing
  its own bundle.
- Firestore stores the five resulting `App.media.*` URLs. It does not store the
  image binaries and is not a second asset source.
- Canonical paths, validation, upload, and App-field updates are owned by the
  core App media runtime.
- `pnpm audit:app-media` is a read-only cross-check against that truth.
- Root bulk upload, reset, and deletion scripts are retired migration tooling;
  do not recreate a second App media writer under `scripts/`.

Keep the lifecycle states distinct:

- `initialized`: the canonical App record and first administrator membership
  exist;
- `media published`: all five Storage objects and `App.media.*` URLs exist;
- `fully onboarded`: initialization, media publication and any required
  semantic palette are complete.

The App shell blocks initialization only while the canonical App record is
missing. Missing media publication or palette work remains visible as its own
setup status and action, but must not reopen the initialization blocker. An
initialized App awaiting media publication is not an uninitialized App.

## Delta register

| Difference                                                          | State      | Reason or alignment trigger                                                                                      |
| ------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| Global, tenant, and standalone roles differ                         | `accepted` | App role is product/runtime truth and drives route scope, not a project-local convenience flag                   |
| Apps declare different extension modules                            | `accepted` | Capability ownership is explicit per app; ecosystem packages do not smuggle optional domains into every consumer |
| Blog loads for every App while Products is explicit                 | `accepted` | Blog is the universal editorial surface; Product capability exists only in Apps that currently declare it        |
| A tenant App pins Workspace target IDs in Nuxt config               | `drift`    | Derive bounded targets from root management, Team, and AppUser authority                                         |
| Apps present inherited directory navigation differently             | `accepted` | `app.config.navigation` changes App-level discovery only; the owning route keeps its canonical key and authority          |
| App-specific Nuxt overrides exist                                   | `drift`    | Promote framework and runtime behavior to its Core, ecosystem, or extension owner                                |
| An app disables or replaces the Core page transition globally       | `drift`    | Apps inherit the shared default; route-specific exceptions belong in page meta                                   |
| A project app shell or stylesheet copies the shared page transition | `drift`    | Keep shared behavior in Core and route-specific exceptions in page meta                                          |
| Repeating a shared default in many project `nuxt.config.ts` files   | `drift`    | Move the stable value to the Core config spine and leave only genuine app values locally                         |
| An App overrides Nuxt's shared compatibility version                | `drift`    | Keep the repository-wide framework target in Core's Nuxt baseline and repair incompatibilities at their owner    |
| Repeating an extension integration URL in project runtime config    | `drift`    | Let the consuming extension own its default and environment resolution; Apps retain only genuine endpoint deltas |
| A standalone App uses the FireUX ecosystem database                 | `drift`    | Provision its dedicated named database or classify the project explicitly as a non-production harness            |
| A client PIN appears to protect App initialization                  | `drift`    | Remove the cosmetic gate; authenticated server UID authorization is the write boundary                           |
| A second runtime parser or global cache mirrors App config          | `drift`    | Derive the runtime contract from `FireuxAppConfig` and normalize it once in `useFireUXConfig`                    |
| App brand structure differs by project                              | `drift`    | Keep one `/img/app` runtime family and explicit source/projection authority; only the owned artwork differs      |

## Alignment roadmap

- Now: keep project configs declarative and read mode through
  `useFireUXConfig()` rather than recomputing it.
- Next: audit repeated project overrides and promote only genuinely universal
  values to Core.
- Later: guard any config invariant only after tenant, global, and standalone
  apps all prove it.
