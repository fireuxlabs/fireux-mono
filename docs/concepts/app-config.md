# App config spine map

Updated: 2026-11-07
Ref: a38377207
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

## Current sources

- `packages/extensions/fireux-app/package.json` (`fireux-app/config`)
- `packages/extensions/fireux-ecosystem/package.json` (`fireux-ecosystem/config`)
- `packages/core/fireux-core/src/config/app/nuxt-defaults.ts`
- `packages/core/fireux-core/src/runtime/app/composables/config/FireUXConfig.ts`

## Configuration boundaries

`FireuxAppConfig` is the authored assembly input. The App bundle validates it
and publishes the normalized `RuntimeApp` projection; Core `useFireUXConfig`
reads that projection for browser and server consumers. Build-only context,
Auth installation settings and secret bindings are not public runtime fields.
`app.config.ts` owns Nuxt UI, navigation and the optional `theme` palette and
typography. Core `useAppHead` and the server manifest read that same native App
config through `useAppConfig`; `resolveAppTheme` validates the palette. Theme is
not an assembly input or a field in `runtimeConfig.public.fireux`.

App-authored research stays in `app/search-demand.ts`, outside Nuxt assembly.
Core's `runtime/app/models/search-demand.ts` owns its contract,
`runtime/app/utils/search-demand.ts` validates references, and
`runtime/app/server/research/load-search-demand.ts` loads it only on the server.
Research proposals do not enable runtime capabilities.

## Configuration source names

- `nuxt-defaults.ts` applies shared Nuxt defaults.
- `seo-config.ts` resolves indexing policy and extension sitemap contributions.
- `seo-routes.ts` normalizes route inputs and discovers static sitemap routes.
- `seo-content.ts` derives public routes and descriptions from App literature,
  reusing `seo-routes.ts` normalization. Sitemap document lists are filtered once
  after App and extension contributions are merged.

These are FireUX integration files, not Nuxt-reserved filenames. Nuxt's native
`nuxt.config.ts` and `app.config.ts` remain the App entrypoints.

## Ecosystem Workspace layers

Apps select the owning ecosystem's native composed layer:

- `fireux-fireux/project-layer`
- `fireux-misebox/kitchen-layer`
- `fireux-buenohost/property-layer`
- `fireux-bringli/supplier-layer`
- `fireux-granite/portfolio-layer`

These group existing domain and ecosystem layers without changing their runtime
precedence. The App still declares its Workspaces and extra capabilities. Named
ecosystems declare conditional domain dependencies through native
`moduleDependencies`, allowing App-supplied module options to apply normally.
They do not import the App bundle. Plain Apps omit Workspace compositions.
An explicit Core layer remains where its position establishes priority; Core-only
Apps use the identical default layer list supplied by `fireux-app`.

## Module options

Use App `modules` tuples for package-owned configuration. For example:

```ts
modules: [
  ['fireux-core', { componentCatalogue: true }],
  ['fireux-kitchens', { ordering: { channels: ['pos', 'kiosk', 'website'] } }],
]
```

The App bundle places one configured Core module in its existing registration
position. Core's catalogue option publishes registered names through its generated
template; it needs no public runtime marker. Kitchens validates its opt-in channels
and projects them into the existing `public.ordering` contract used by readers and
trusted commands. Omitted ordering options enable no channels. App declarations
do not patch these runtime fields manually.

## App pattern

- Tenant and standalone Apps import `defineFireuxApp` from `fireux-app/config`.
  Main Apps import `defineFireuxEcosystem` from `fireux-ecosystem/config`.
  Export the result directly. Project Apps do not own a
  second assembly object just to append native layers: `extends` passes through
  the existing builder with Nuxt’s own type and priority. Repeated runtime or
  framework behavior belongs in its Core, ecosystem, or extension owner.
  The App bundle appends the Core and default extension layers; App `extends`
  entries retain their declared priority above it.
- `ecosystem` automatically loads exactly one `fireux-<ecosystem>` module.
  Do not repeat that package in `modules`.
- `role` uses `AppRole` from Core's canonical App model. App configuration and
  runtime policy share that type instead of defining another role union.
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
- The App bundle keeps `srcDir: 'app'` to override package layers' `srcDir: '.'`.
  Nuxt discovers the root `public/` directory; Core does not repeat the viewport
  or register that public folder again. Metadata scanning uses Nuxt's default `after-resolve` timing; shared
  route policies run at `pages:resolved`.
- Core automatically includes `app/assets/styles/main.css` when the App owns
  that conventional stylesheet. The stylesheet remains App-owned, but its
  registration is not a project Nuxt override.
- Core supplies the native Nuxt `app.pageTransition` default. It is presentation
  config, not a `FireuxAppConfig` or runtime field.
- Core opts every App into Nuxt's version-5 compatibility defaults through the
  shared Nuxt baseline. Apps do not repeat or override
  `future.compatibilityVersion`; compatibility repairs belong to the lowest
  Core, ecosystem, or extension owner that implements the affected behavior.
- Blogs, Products and AI are universal App defaults owned by `fireux-app`. The
  bundle adds their modules and native layers when omitted. `modules` lists
  additional extensions and may configure a default module. Keep direct package
  dependencies for explicit imports or configuration. An App may keep explicit
  layer positions where its declared Nuxt precedence needs them. Named Ecosystem
  packages may compose their domain modules; the shared `fireux-ecosystem`
  bundle is selected only by Main Apps.
- Documentation is an App-owned opt-in layer. Ecosystem Main Apps host their
  shared guides. Tenant and standalone Apps include documentation only when
  their product needs it, or link to the owning Ecosystem's guides.
- A reusable extension owns its shared runtime integration defaults and
  environment resolution. For example, `fireux-kitchens` owns the Bringli
  Supplier-directory configuration, `fireux-places` owns Google Maps and
  Places provider configuration, and `fireux-go-qr` owns its provider origin.
  Project Apps do not repeat those runtime values.
- Firebase SSR region and execution identity belong to the selected
  ecosystem's required `ssr` configuration. Shared ecosystem setup applies that
  region to both Nitro Firebase region fields; Core has no named-ecosystem
  fallback or environment override for it. Apps inherit them and do not
  repeat deployment identity in the bundle configuration.
- `workspaceConfig.<family>.origin` optionally declares an App-owned Workspace
  origin. The registered route with `nav.key: workspace-<family>` still owns Home.
  Core exposes an internal path for return/selection and an origin-aware URL for
  public entry actions; the App owns root rendering and obsolete-route removal.
- The authored `FireuxAppConfig` owns identity, role, capability, Workspace declarations. App navigation presentation lives in
  the existing `app/app.config.ts`, under `navigation.hiddenKeys` and
  `navigation.overrides`; Core `useNav` reads it directly through `useAppConfig`.
  It is not deployment runtime configuration. Authentication stays Core-owned; entry routes carry
  mode and redirect intent. Pricing is App-owned product literature: each Main App keeps a
  thin `useXPricing` wrapper over Core `usePricing`; commercial copy does not
  enter the bundle configuration or public runtime config. `RuntimeApp` derives from
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
  metadata loader. Shared literature types live in Core
  `runtime/app/models/meta-content.ts`; the pure `defineFireuxMeta` helper lives
  in `runtime/app/utils/define-app-meta.ts`. Workspace capability vocabulary
  belongs to `runtime/workspace/models/capability-families.ts`. App metadata’s optional `legal.notices` are App-owned additions to
  Core's shared `/legal` page; `readAppMeta` exposes only the validated public
  projection. Core platform documents remain shared, and an installed extension
  does not add legal content unless the App explicitly composes it.
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
Core's `config/app/seo-config.ts` normalizes that contract; `runtime/server/utils/seo-sitemaps.ts`
applies it to counts, page queries and final document eligibility. A domain may
contribute `additionalPublicFilters`, explicit scalar equality conditions beside
its primary public field. `src/utils/sitemap-public-filters.ts` validates these
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
- Navigation belongs in `app/app.config.ts`, alongside App presentation.
  Its optional `navigation.hiddenKeys` and `navigation.overrides` affect only
  inherited route presentation, never route existence or authorization.

Completing User setup creates a basic AppUser. App admins can change its role
or subscription.

## Mode differences

- Global apps can expose multiple domains and workspaces.
- Apps declare Workspace capabilities. Each root Entity owns target authority
  through `team/{uid}`; AppUser owns only App membership, capability, and
  lifecycle.
- Standalone is a FireUX-owned mode.

## App entrance and optional Workspace

Use `FireuxApp` when no Workspaces are declared, and `FireuxWorkspaceApp` when
`workspaces` is non-empty. Global, tenant and standalone roles share this rule. `role` owns
the App relationship, `workspaces` declares capabilities, and `homePath` owns
the public Home navigation destination. An empty Workspace list loads no
Workspace frame. Route metadata still selects the frame for each page.

Ecosystem Main Apps with Workspaces use a thin native index route to open the
registered Workspace entrance through `useWorkspaceEntryCta`, preserving query
and fragment. Their traditional public landing is `/home`, also declared as
`homePath`. The shared sidebar exposes this Home link when it differs from the
Workspace entrance. The first declared Workspace supplies the default entrance.
FireUX retains its authored public `/` and `homePath: '/'`.
Tenant and standalone entrances remain App-owned. Root selection follows the existing Workspace declaration; there is no
parallel entrance configuration or role-specific root.

Misebox uses the same host for Home, Workspace, sign-in and public tools. Its
former host-switching middleware and declared Kitchen Workspace origin are
removed. Optional cross-origin entry support remains a generic Core capability
for a separately justified App; it is not the default.

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
- Core's `app/server/onboarding/brand-assets.ts` checks local file types and
  decoding against `app-media-requirements.ts`. The same inspector gates
  production App builds, `pnpm check:assets` and packaged release assets; it
  does not verify remote Storage contents or approve artwork.
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
| Apps receive Blogs, Products and AI by default                      | `accepted` | The App bundle composes editorial, catalogue and AI capabilities; other extensions remain App-specific           |
| A tenant App pins Workspace target IDs in Nuxt config               | `drift`    | Derive bounded targets from root management, Team, and AppUser authority                                         |
| Apps present inherited directory navigation differently             | `accepted` | `app.config.navigation` changes App-level discovery only; the owning route keeps its canonical key and authority |
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
