# App config spine map

Updated: 2026-11-17
Ref: e20047a13
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
`fireux-ai`'s `runtime/app/models/search-demand.ts` owns its contract,
`runtime/app/utils/search-demand.ts` validates references, and
`runtime/app/server/research/load-search-demand.ts` loads it only on the server.
Its native layer owns `/search-demand` review routes and `/api/app/search-demand`;
static review does not depend on AI execution being enabled. Research proposals
do not enable runtime capabilities.

## App content and styles

Concrete Apps keep authored page copy, contact details and presentation
catalogues in `app/content`, with supporting types beside that content when
only those consumers need them. These modules are explicitly imported; they
are not Nuxt Content collections or an Entity model. Do not collect them in an
`app/config` directory merely because their values are static.

Native `app.config.ts` retains App settings, including UI and presentation
palette metadata. Static CSS lives in `app/assets/styles/main.css`, already
loaded by Core `configureCoreCss`; root App components do not inject CSS strings
through `useHead`. Preserve existing selectors, declarations and palette values
when changing file placement. Brand asset provenance belongs in App documentation,
as in Holzworm's `docs/brand-assets.md`.

Bären's selected public Menu ID lives with its site content and feeds both
its Home link and Menu redirect. This is presentation selection, not authority
over Kitchen or Menu records.

## Environment inputs

`templates/.env.app.template` declares deployment origin, Firebase Web App inputs
and the optional authenticated developer UID once each. App identity comes from
`nuxt.config.ts`; `APP_ID`, `APP_NAME` and `APP_SHORT_NAME` are not environment
inputs. Developer access uses authenticated UID checks, not `DEVELOPER_PIN`.
The current Firebase integration does not configure Analytics or consume
`NUXT_FIREBASE_MEASUREMENT_ID`.

Normal development uses the configured Firebase project. For a local test,
start the Firebase Emulator Hub with Firestore and, when App Auth is enabled,
Authentication, then start Nuxt with `VUEFIRE_EMULATORS=true`. VueFire connects
the default client database and Core connects named databases to the same
discovered host. Nitro requires its SDK emulator hosts to match that discovery.
Missing discovery stops startup. Production uses the configured Firebase
services and rejects SDK emulator hosts.

Current hosted Stripe Checkout uses the existing server credentials; generated
Ignition examples do not advertise `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` without
a browser Stripe consumer. Server secret and webhook settings remain unchanged.

FireUX AI reads its credential from `FIREUX_AI_API_KEY`, including Sproochli's
App-owned environment. `OPENAI_API_KEY` is not a fallback. Renaming the key must
not change its value, enable AI or change provider/mode. The local Codex transport
strips both credential names from its child process and leaves the parent
environment intact; see AI's `src/test/codex-environment.test.mjs`.

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
  ['fireux-kitchens', { ordering: { channels: ['pos', 'kiosk', 'website'] } }],
]
```

The App bundle places one configured Core module in its existing registration
position. Kitchens validates its opt-in channels
and projects them into the existing `public.ordering` contract used by readers and
trusted commands. Omitted ordering options enable no channels. App declarations
do not patch these runtime fields manually.

## AI availability and presentation

The [App defaults](../../packages/extensions/fireux-app/src/defaults.ts) include
AI's module and native layer. Availability does not enable execution: the
[AI module options](../../packages/extensions/fireux-ai/src/module.ts) and
[server configuration](../../packages/extensions/fireux-ai/src/runtime/server/utils/fireux-ai-config.server.ts)
retain enabled/mode/provider configuration, while consuming features retain
their execution and authority checks. Static research remains independent of
execution as described above.

`fireux-ai` owns [provider/model presentation](../../packages/extensions/fireux-ai/src/runtime/components/Workspace/AI/ModelLabel.vue).
Workspace's [Workspace composer](../../packages/extensions/fireux-workspace/src/runtime/workspace/components/AI/Composer.vue)
remains a passive control with a `model` slot; it does not read AI configuration
or choose provider/model labels. The
[Kitchen Test consumer](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Test/AI.vue)
composes those owners without adding an AI dependency to Core.

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
- Optional `projectId` names the canonical FireUX Project for Project-scoped
  integrations. Ordinary Apps still require an Ecosystem binding and
  canonical `ecosystemId`. App initialization checks for the canonical
  Ecosystem in the identity database before writing the App or administrator
  membership, regardless of Project linkage. An App without `projectId`
  records local signup events. The developer-only initialization endpoint can
  provision an Ecosystem before App initialization when the role is global,
  the Project and Ecosystem IDs match, and the App ID is `<ecosystemId>-app`.
  Signup-monitor delivery requires Project scope.
- Required `ecosystemId` names the canonical Ecosystem entity that contains the
  App. App role does not change this relationship: global, tenant, and
  standalone Apps all belong to an Ecosystem.
- Optional `databaseId` selects the App runtime database. The canonical App
  record lives there; without an override it lives in the Ecosystem binding
  database. The canonical Ecosystem record always stays in the binding's
  identity database and must be read through an explicit identity seam. Do not
  repeat the Ecosystem database id in project config; declare `databaseId` only
  for a genuine App override, including a standalone App-owned database.
  An App override preserves the Ecosystem's original identity scope, including
  `(default)` when the binding has no named database.
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
  thin `useXPricing` wrapper over `fireux-app` `usePricing`; commercial copy does not
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
  dependencies. Core's config-only metadata loader uses explicit `app.meta`
  when supplied and otherwise reads `app/meta.ts`. The App builder passes that
  metadata to SEO and private runtime configuration. Shared literature types live in Core
  `runtime/app/literature/types.ts`; the pure `defineFireuxMeta` helper lives
  in `runtime/app/literature/define-meta.ts`. The descriptive vocabulary for
  published Workspace operations lives in
  `runtime/app/literature/capability-families.ts`. App metadata’s optional
  `legal.notices` are App-owned additions to `fireux-app`'s shared `/legal`
  page. `readAppMeta` exposes only the validated public projection. Core
  platform documents remain shared, and an installed extension
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

## Public metadata reference

Core's [public metadata reader](../../packages/core/fireux-core/src/runtime/app/server/index/meta.ts)
publishes allowlisted copy, SEO and sharing fields, legal notices and public
images. App metadata and page-level head overrides retain their own sources.

The [shared viewer](../../packages/extensions/fireux-app/src/runtime/components/Meta/Index.vue)
reads the response once with native Nuxt data, presents copy as escaped text,
offers read retry and reuses the shared Legal notice presenter.
[FireUX](../../projects/fireux/fireux-app/app/pages/meta.vue) and
[Misebox](../../projects/misebox/misebox-app/app/pages/meta.vue) explicitly
supply their own route, header, JSON link and `noindex,follow` policy. Other
Apps opt in through their own routes. Check the public response, head, links
and desktop/mobile rendering alongside the
[viewer tests](../../packages/extensions/fireux-app/src/test/components/Meta.test.mjs).

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
- `projectId`, optional
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

Every App uses `FireuxApp`, across global, tenant and standalone roles. `role`
owns the App relationship, `workspaces` declares capabilities, and `homePath`
owns the public Home destination. Pages select the native Workspace layout
through `layout: 'workspace'`; Nuxt loads its UI asynchronously. An empty
Workspace list retains the ordinary App root and exposes no Workspace entrance.
The existing middleware checks configured availability independently of rendering.

Workspace middleware reads this declaration through `useFireUXConfig` on both
server and client before client sign-in checks. Route path and metadata identify
the family; query parameters do not enable Workspaces. See [route checks](pages.md#route-availability-and-sign-in).

The existing Workspace-first Main App pattern uses a thin native index route to
open the registered Workspace entrance through `useWorkspaceEntryCta`, preserving
query and fragment. Bringli, BuenoHost and Granite retain this pattern with public
Home at `/home`, declared as `homePath`. The first declared Workspace supplies
the default Workspace entrance; the sidebar exposes public Home separately.

FireUX retains its authored public `/`. Misebox Main explicitly uses a public
directory Home at `/` with `homePath: '/'`, while Kitchen Workspace remains at
`/workspace/kitchen`; see the [Misebox entrance contract](../../packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md#apps-and-workspace).
These App-owned product differences do not change the root-component rule above,
Workspace authority or other App/tenant entrances. They introduce no parallel
entrance configuration or role-specific root component.

Misebox uses the same host for Home, Workspace, sign-in and public tools. Its
former host-switching middleware and declared Kitchen Workspace origin are
removed. Optional cross-origin entry support remains a generic Core capability
for a separately justified App; it is not the default.

## Working rule

Do not duplicate app mode logic in domain code. Read it through `useFireUXConfig` and `useWorkspace`.

App chrome uses the Nuxt UI baseline and the App's native theme settings.
Public Menu presentation follows the
[Menu family's palette inheritance](family-menu.md#presentation-inheritance).

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
  decoding against `app/media/requirements.ts`. The same inspector gates
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
