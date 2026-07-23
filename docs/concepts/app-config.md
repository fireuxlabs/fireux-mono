# App config spine map

Updated: 2026-07-23
Ref: 796952bf0
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
- `packages/core/fireux-core/src/config/app/nuxt-baseline.ts`
- `packages/core/fireux-core/src/config/app/nuxt-overrides.ts`
- `packages/core/fireux-core/src/runtime/composables/fireux/app/FireUXConfig.ts`

## App pattern

- Import `defineFireuxConfig`.
- Import `withFireuxNuxtConfig`.
- Build one `fireuxConfig`.
- Export `withFireuxNuxtConfig(fireuxConfig, appOverrides)`.
- `ecosystem` automatically loads exactly one `fireux-<ecosystem>` module.
  Do not repeat that package in `modules`.
- `ecosystem` is the package/Firebase binding key, not an entity relationship.
- `projectId` names the canonical FireUX Project entity.
- Optional `ecosystemId` names the canonical Ecosystem entity. Direct Project
  Apps omit it even when they use the `fireux` infrastructure binding.
- Optional `databaseId` selects the App runtime database. The canonical App
  record lives there; without an override it lives in the Ecosystem binding
  database. The canonical Ecosystem record always stays in the binding's
  identity database and must be read through an explicit identity seam.
- Core supplies the native Nuxt `app.pageTransition` default. It is presentation
  config, not a `FireuxAppConfig` or runtime field.
- `modules` lists explicit extension capabilities. The app package declares
  those workspace dependencies directly; ecosystem packages do not bundle
  domain extensions on the app's behalf.

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
- `navHiddenKeys`

## Mode differences

- Global apps can expose multiple domains and consoles.
- Tenant apps usually pin console targets through `consoleConfig.<family>.targetIds`.
- Standalone is a FireUX-owned mode.

## Working rule
Do not duplicate app mode logic in domain code. Read it through `useFireUXConfig` and `useConsole`.

Use `withFireuxNuxtConfig` with `app.pageTransition: false` for a genuine
app-wide transition opt-out, or provide a custom native Nuxt transition there.
The helper preserves the Core app defaults while applying that override.
Route-specific exceptions use `definePageMeta`; app shells do not set
`NuxtPage` transition props. A custom transition name owns its matching local
CSS and does not reuse Core's `fx-page` selector namespace.

## App media

- Canonical paths, validation, upload, and App-field updates are owned by the
  core App media runtime.
- `pnpm audit:app-media` is a read-only cross-check against that truth.
- Root bulk upload, reset, and deletion scripts are retired migration tooling;
  do not recreate a second App media writer under `scripts/`.

## Delta register

| Difference | State | Reason or alignment trigger |
| --- | --- | --- |
| Global, tenant, and standalone roles differ | `accepted` | App role is product/runtime truth and drives route scope, not a project-local convenience flag |
| Direct Project Apps may omit `ecosystemId` | `accepted` | Infrastructure binding and canonical Ecosystem relationship are separate concepts |
| Apps declare different extension modules | `accepted` | Capability ownership is explicit per app; ecosystem packages do not smuggle optional domains into every consumer |
| Tenant apps pin console target IDs | `accepted` | A tenant normally has bounded target scope; global apps derive user-authorized targets |
| App-specific Nuxt overrides exist | `accepted` | External integration or deployment requirements may differ; repeated FireUX defaults belong in `withFireuxNuxtConfig` |
| An app disables or replaces the Core page transition through native Nuxt app config | `accepted` | The shared default remains Core-owned while a deliberate product delta stays explicit |
| A project app shell or stylesheet copies the shared page transition | `drift` | App-wide overrides belong in config and route-specific exceptions belong in page meta |
| Repeating a shared default in many project `nuxt.config.ts` files | `drift` | Move the stable value to the Core config spine and leave only genuine app values locally |

## Alignment roadmap

- Now: keep project configs declarative and read mode through
  `useFireUXConfig()` rather than recomputing it.
- Next: audit repeated project overrides and promote only genuinely universal
  values to Core.
- Later: guard any config invariant only after tenant, global, and standalone
  apps all prove it.
