App config spine map
Updated: 2026-06-17
Ref: 37fb262f0
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

Important fields:
- `ecosystem`
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
