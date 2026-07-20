App config spine map
<!-- Concurrent edit — 2026-07-19 17:06 CEST — Directory Authority Cutover: clarify App versus Ecosystem database authority. -->
Updated: 2026-07-19
Ref: 565ebd668
Role: map, not canon

Purpose:
Map how FireUX project apps declare identity, modules, domains, consoles, and app mode.

Vertical links:
- Parent: fireux.md
- Child: family-tenant-global.md
- Child: console.md

Horizontal links:
- runtime-package.md
- pnpm.md

Core files:
- `fireux-core/config/app/fireux.config`
- `fireux-core/config/app/nuxt-overrides`
- `fireux-core/runtime/composables/fireux/app/FireUXConfig`

App pattern:
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
- `modules` lists explicit extension capabilities. The app package declares
  those workspace dependencies directly; ecosystem packages do not bundle
  domain extensions on the app's behalf.

Important fields:
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
- `navHiddenKeys`

Mode differences:
- Global apps can expose multiple domains and consoles.
- Tenant apps usually pin console targets through `consoleConfig.<family>.targetIds`.
- Standalone is a FireUX-owned mode.

Working rule:
Do not duplicate app mode logic in domain code. Read it through `useFireUXConfig` and `useConsole`.
