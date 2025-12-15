---
title: Configuration & Tooling
status: draft
created: 2025-10-15
---

# Configuration & Tooling

This chapter documents the canonical way to configure Nuxt apps, TypeScript, environment variables, and supporting tooling across the mono-repo.

## Nuxt Composition

All FireUX apps wrap Nuxt config through `createFireuxConfig` exported by `fireux-core`:

```ts
// projects/<ecosystem>/<app>/nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(
  createFireuxConfig({
    appName: 'Misebox',
    appShortName: 'Misebox',
    ecosystem: 'misebox',
    modules: ['fireux-misebox'],
    role: 'global',
  })
)
```

`createFireuxConfig`:

- Installs shared modules (Nuxt UI, Nuxt Icon, VueFire, PWA).
- Deduplicates the module list (extensions can be safely registered by tenants).
- Mirrors ecosystem metadata into `runtimeConfig.public`.
- Applies standard Vite, Nitro, and runtime defaults (FS allow list, auto-imports, color config).
- Accepts `includeCore: false` for exceptional cases where `fireux-core` must be omitted (avoid unless migrating legacy projects).

## TypeScript Setup

- Root `tsconfig.json` sets shared compiler options and path aliases.
- Each app extends the base config and maps package aliases to `src/`:

```jsonc
{
  "extends": "../tsconfig.app.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "moduleResolution": "Bundler",
    "paths": {
      "fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"],
      "fireux-jobs/*": ["../../../packages/extensions/fireux-jobs/src/*"],
      "fireux-misebox/*": ["../../../packages/ecosystem/fireux-misebox/src/*"]
    },
    "types": ["nuxt", "vite/client", "@vite-pwa/nuxt"],
    "skipLibCheck": true
  },
  "include": ["./.nuxt/nuxt.d.ts", "./**/*.ts", "./**/*.d.ts"]
}
```

Notes:

- Keep Nuxt defaults (`~`, `@`, `~~`) untouched so they continue to point at `app/`.
- Prefer public exports (`fireux-core/runtime/...`) over legacy aliases like `#fireux-core-runtime`.
- When adding a new package, update workspace `tsconfig.json` and the relevant app configs to maintain path parity.

## Environment Management

- App env template lives at `templates/.env.app.template` and defines the canonical required keys for every app.
- Ecosystem Firebase project config is defined via the TypeScript template `templates/ecosystem.config.template.ts` (public, shared, committed).
- Firebase credentials can be supplied as JSON (`FIREBASE_SERVICE_ACCOUNT`) or split fields (`FIREBASE_PROJECT_ID`, etc.). `createFireuxConfig` normalizes private keys with newline handling.
- Places API access uses `GOOGLE_PLACES_API_KEY`. The helper exposes it via `runtimeConfig.public.googlePlacesApiKey` for both client composables and server handlers.
- Add new env vars through `copilot-documentation/copilot-appendices/README.md` once populated so they remain discoverable.

## Tooling Quick Reference

- **Install**: `pnpm install`
- **Build packages**: `pnpm build:packages`
- **Type-check**: `pnpm typecheck:packages`, `pnpm typecheck:apps`
- **Lint**: `pnpm lint`
- **Dev servers**: `pnpm dev:fireux`, `pnpm dev:misebox`, `pnpm dev:cleanbox`, or `pnpm dev:all`
- **Guards**: scripts under `tools/` (e.g. `tools/guard-tsconfigs.mjs`, `tools/check-app-structure.mjs`)
- **Project scripts**: see `scripts/` directory; most support `--apply` for write mode.

Before committing configuration changes, run lint, type-check, and any relevant guard script to ensure shared settings remain in sync across packages and apps.

Next: read about shared services in [Platform Services](./copilot-04-platform-services.md).
