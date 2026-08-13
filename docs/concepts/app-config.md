# App config spine map

Updated: 2026-08-04
Ref: 1d6857c57
Role: map, not canon

## Purpose

Map how FireUX project apps declare identity, modules, domains, consoles, and app mode.

## Vertical links

- Parent: fireux.md
- Child: family-tenant-global.md
- Child: console.md

## Horizontal links

- runtime-package.md
- pnpm.md

## Core files

- `packages/core/fireux-core/src/config/app/fireux.config.ts`
- `packages/core/fireux-core/src/config/app/modules.ts`
- `packages/core/fireux-core/src/config/app/design-packs.ts`
- `packages/core/fireux-core/src/config/app/nuxt-baseline.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/app/FireUXConfig.ts`

## App pattern

- Import `defineFireuxConfig` and export it directly. Project Apps do not own a
  second Nuxt-override layer; repeated runtime or framework behavior belongs in
  its Core, ecosystem, or extension owner.
- `ecosystem` automatically loads exactly one `fireux-<ecosystem>` module.
  Do not repeat that package in `modules`.
- `ecosystem` is the package/Firebase binding key, not an entity relationship.
- `projectId` names the canonical FireUX Project entity.
- Optional `ecosystemId` names the canonical Ecosystem entity. Direct Project
  Apps omit it even when they use the `fireux` infrastructure binding.
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
- The authored `FireuxAppConfig` owns identity, role, capability, Console, and
  navigation declarations. Authentication stays Core-owned; entry routes carry
  mode and redirect intent. Pricing is App-owned product literature: each Main App keeps a
  thin `useXPricing` wrapper over Core `usePricing`; commercial copy does not
  enter `defineFireuxConfig` or public runtime config. `RuntimeApp` derives from
  App config and makes normalized
  arrays/defaults explicit; `useFireUXConfig` maps that runtime shape to the
  consumer names once. Browser and trusted-server consumers use the same
  event-aware reader; Console consumers do not parse `runtimeConfig` again.
- Keep `nuxt.config.ts` as a declarative composition root. Content, pricing,
  onboarding, stored relationships, and executable behavior belong in their
  domain composable, stored authority, or owning package—not a top-level helper
  or imported App-config profile.
- Authored `app/meta.ts` is pure data and may be consumed by browser or server
  presentation. Its `defineFireuxMeta` helper and types stay free of Node-only
  dependencies; filesystem and Markdown loading belong to Core's config-only
  metadata loader.
- Core `resolveConsoleCanCreate` owns the shared explicit-override then
  non-tenant fallback. Console UI and trusted entity onboarding use that same
  policy instead of repeating it inside each domain.
- `useFireUXConfig` reads and freezes the current runtime config. It has no
  process-global cache or unused Nuxt injection provider, so HMR and multi-App
  processes cannot reuse a partially compared App shape.
- App initialization has no cosmetic client PIN. Authentication opens the
  environment check, while the trusted bootstrap endpoint verifies the
  configured developer UID and existing App-admin state before writing.

## Important fields

- `ecosystem`
- `projectId`
- `ecosystemId`, optional
- `databaseId`, optional
- `id`
- `name`
- `shortName`
- `role`
- `modules`
- `consoles`
- `consoleConfig`
- `domains`
- `profiles`
- `selfJoinEnabled`: bootstrap and UX intent for self-joining. A new canonical
  App receives this value; its stored `self_join_enabled` field is the server
  enforcement authority.
- `designPack`: optional typed app-wide presentation preset. Omit it for the
  Nuxt UI baseline; `{ preset: 'sci-fire' }` conditionally bundles the
  Core-owned Sci-Fire layer. This is an explicit main-App choice and is not
  inferred from `role` or `ecosystem`.
- `navHiddenKeys`
- `navOverrides`: app-scoped presentation deltas for inherited route
  navigation, keyed by the route's canonical `nav.key`. Overrides may change
  label, icon, order, position, device visibility, or target layouts; they do
  not change route existence, domain authority, authentication, or App
  membership.

## Mode differences

- Global apps can expose multiple domains and consoles.
- Apps declare Console capabilities. Each entity family's persisted same-id
  App-support records own target relationships and operator/team access;
  AppUser owns only App membership, capability, and lifecycle.
- Standalone is a FireUX-owned mode.

## Working rule

Do not duplicate app mode logic in domain code. Read it through `useFireUXConfig` and `useConsole`.

App-wide design packs are selected at build/config time through
`defineFireuxConfig`; components do not branch on them at runtime. The plural
`designPacks` field remains for named, surface-specific runtime configuration
such as `publicMenu` and is not an alternate app-chrome loader.

Apps inherit the Core page transition. Route-specific exceptions use
`definePageMeta`; app shells do not set `NuxtPage` transition props. A repeated
App-wide need is a missing shared seam and must be promoted before use.

## App media

- Canonical paths, validation, upload, and App-field updates are owned by the
  core App media runtime.
- `pnpm audit:app-media` is a read-only cross-check against that truth.
- Root bulk upload, reset, and deletion scripts are retired migration tooling;
  do not recreate a second App media writer under `scripts/`.

## Delta register

| Difference                                                          | State      | Reason or alignment trigger                                                                                        |
| ------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| Global, tenant, and standalone roles differ                         | `accepted` | App role is product/runtime truth and drives route scope, not a project-local convenience flag                     |
| Direct Project Apps may omit `ecosystemId`                          | `accepted` | Infrastructure binding and canonical Ecosystem relationship are separate concepts                                  |
| Apps declare different extension modules                            | `accepted` | Capability ownership is explicit per app; ecosystem packages do not smuggle optional domains into every consumer   |
| Blog loads for every App while Products is explicit                 | `accepted` | Blog is the universal editorial surface; Product capability exists only in Apps that currently declare it          |
| A tenant App pins Console target IDs in Nuxt config                 | `drift`    | Persist bounded targets and operator/team access in that entity family's same-id App-support records               |
| Apps present inherited public navigation differently                | `accepted` | `navOverrides` changes app-level discovery only; the owning route keeps its canonical key and authority            |
| App-specific Nuxt overrides exist                                   | `drift`    | Promote framework and runtime behavior to its Core, ecosystem, or extension owner                                  |
| A main App explicitly selects the Core Sci-Fire design pack         | `accepted` | Nuxt UI remains the universal default while a reviewed ecosystem App may add shared atmosphere without copying CSS |
| Tenant or white-label styling inferred from ecosystem or role       | `drift`    | Design-pack adoption is explicit; product role and visual theme are separate contracts                             |
| A project copies Sci-Fire selectors or styles                       | `drift`    | The conditional stylesheet and Nuxt UI variant configuration belong to Core                                        |
| An app disables or replaces the Core page transition globally       | `drift`    | Apps inherit the shared default; route-specific exceptions belong in page meta                                     |
| A project app shell or stylesheet copies the shared page transition | `drift`    | Keep shared behavior in Core and route-specific exceptions in page meta                                            |
| Repeating a shared default in many project `nuxt.config.ts` files   | `drift`    | Move the stable value to the Core config spine and leave only genuine app values locally                           |
| Repeating an extension integration URL in project runtime config    | `drift`    | Let the consuming extension own its default and environment resolution; Apps retain only genuine endpoint deltas   |
| A standalone App uses the FireUX ecosystem database                 | `drift`    | Provision its dedicated named database or classify the project explicitly as a non-production harness              |
| A client PIN appears to protect App initialization                  | `drift`    | Remove the cosmetic gate; authenticated server UID authorization is the write boundary                             |
| A second runtime parser or global cache mirrors App config          | `drift`    | Derive the runtime contract from `FireuxAppConfig` and normalize it once in `useFireUXConfig`                      |
| App brand structure differs by project                              | `drift`    | Keep one `/img/app` runtime family and explicit source/projection authority; only the owned artwork differs        |

## Alignment roadmap

- Now: keep project configs declarative and read mode through
  `useFireUXConfig()` rather than recomputing it.
- Next: audit repeated project overrides and promote only genuinely universal
  values to Core.
- Later: guard any config invariant only after tenant, global, and standalone
  apps all prove it.
