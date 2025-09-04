# Source & Config Layout — Tenants + Core

> Reference for how core and all tenants are wired: components, composables, pages/layouts, assets, env, and service account placement.

---

## Core: `packages/core/fireux-core`

### Responsibilities

- Shared wiring (runtime → plugins → components → composables → models → layouts → pages → server → assets → errors)
- Shared pages/layouts/dev scaffolding
- Shared server APIs (`/api/health`, `/api/app`, `/api/app/env-check`, general helpers)
- Design system CSS/SCSS registration

### Components

- **No prefix**, `pathPrefix: true`, `global: true`
- Config: `src/config/components-config.ts`
  - Registers `./runtime/components/**`
- Usage examples:
  - `<OrganismsAppOnboarding />`
  - `<LayoutsHeader />`

### Composables

- Auto-import:
  - `./runtime/composables/**`
  - `./runtime/utils/**`

### Assets

- Injected into `nuxt.options.css`:
  - `./runtime/assets/styles/main.css`
  - `./runtime/assets/styles/scss/main.scss`
- Aliases:
  - `#fireux-core-public` → `./runtime/public`
  - `#fireux-core-assets` → `./runtime/assets`

### Server

- Public endpoints registered via `addServerHandler`
- Admin helpers rely on Nitro `runtimeConfig.firebaseServiceAccount`

### Config factory

- `src/runtime/utils/fireux-config.ts`
  - Adds `['nuxt-vuefire', …]`, `['@vite-pwa/nuxt', …]`, `@nuxt/ui`, `@nuxt/icon`
  - Exposes:
    - `runtimeConfig.public.firebaseConfig` (client)
    - `runtimeConfig.public.appSettings` (includes `appId`, `ecosystem`)
    - `runtimeConfig.firebaseServiceAccount` (server-only)

---

## Tenants (general pattern)

### Module

- Each tenant `src/module.ts`:
  - `await installModule('fireux-core')`
  - Delegates to:
    - `configureComponents(resolver, { prefix })`
    - `configureComposables(resolver)`
    - `configureModels(resolver, nuxt?)`
    - `configurePages(resolver, nuxt)`
    - `configureLayouts(resolver, nuxt)`
    - `configurePlugins(resolver)`
    - `configureServer(resolver)`
    - `configureRuntime(nuxt, '<tenantKey>')`
  - Optional: `nuxt.options.nitro.experimental.wasm = true`

### Tenant components

- **Default prefix set in module defaults** (e.g., `defaults: { prefix: 'Mise' }`)
- Registered with `pathPrefix: false`, `global: false`
- Example usage: `<MiseProfileCard />`
- Apps can override: `['fireux-<tenant>', { prefix: 'X' }]`

### Service account

- Location (git-ignored):  
  `packages/tenants/<tenant>/config/service-account.json`
- App `.env` should provide one of:
  - `FIREBASE_SERVICE_ACCOUNT=<JSON string>`
  - `GOOGLE_APPLICATION_CREDENTIALS=../../../packages/tenants/<tenant>/config/service-account.json`

---

## Tenant specifics

### `fireux-fireux`

- **Path**: `packages/tenants/fireux-fireux`
- **Module**: `defaults: { prefix: 'Fireux' }`
- **Apps**: `projects/fireux/fireux-app` (port 3000)
- **App .env**:
  - Firebase client keys (`FIREBASE_*`)
  - `APP_ID=<id>`
  - `GOOGLE_APPLICATION_CREDENTIALS=../../../packages/tenants/fireux-fireux/config/service-account.json` (or `FIREBASE_SERVICE_ACCOUNT`)
- **Notes**: Base FireUX brand; keep app thin.

### `fireux-misebox`

- **Path**: `packages/tenants/fireux-misebox`
- **Module**: `defaults: { prefix: 'Mise' }`
- **Apps**:
  - `projects/misebox/misebox-app` (3001)
  - `projects/misebox/niederhorn` (3003)
- **App .env**:
  - Firebase client keys
  - `APP_ID=<id>`
  - `GOOGLE_APPLICATION_CREDENTIALS=../../../packages/tenants/fireux-misebox/config/service-account.json`
- **Notes**: Landing content simplified; dev pages use non-prefixed core components.

### `fireux-cleanbox`

- **Path**: `packages/tenants/fireux-cleanbox`
- **Module**: `defaults: { prefix: 'Clean' }` (if/when you add)
- **Apps**:
  - `projects/cleanbox/cleanbox-app` (3002)
  - `projects/cleanbox/richies-reinigung` (3004)
- **App .env**:
  - Firebase client keys
  - `APP_ID=<id>`
  - `GOOGLE_APPLICATION_CREDENTIALS=../../../packages/tenants/fireux-cleanbox/config/service-account.json`
- **Notes**: Uses Cleanbox Firebase for now (replace when ready).

---

## App usage

### Minimal `nuxt.config.ts`

```ts
import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig({
  ...createFireuxConfig({
    ecosystem: '<ecosystem>',
    appName: process.env.APP_NAME,
    appShortName: process.env.APP_SHORT_NAME,
    primaryColor: process.env.APP_PRIMARY_COLOR,
    neutralColor: process.env.APP_NEUTRAL_COLOR,
    modules: ['fireux-<tenant>'],
  }),
  compatibilityDate: '2025-09-01',
})
```

### Minimal .env

```
APP_ID=<your-app-id>
APP_NAME=My App
APP_SHORT_NAME=MyApp
APP_PRIMARY_COLOR=#EAB308
APP_NEUTRAL_COLOR=#64748B

FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
FIREBASE_MEASUREMENT_ID=

# Choose one of:
# FIREBASE_SERVICE_ACCOUNT={"type":"service_account", ...}
# or
GOOGLE_APPLICATION_CREDENTIALS=../../../packages/tenants/<tenant>/config/service-account.json
```

---

## Verification

1. Health endpoint

- Visit /api/health
- Check serviceAccount.exists === true and appSettings.appId populated

2. RuntimeConfig logs (dev)

- Confirm public.firebaseConfig shows on server + client
- Confirm public.appSettings.appId and ecosystem

3. Nuxt generated components

- Look into .nuxt/components.d.ts
- Core names: long, path-prefixed (no Fire\*)
- Tenant names: prefixed (e.g., Mise\*), no path prefixes

---

## Conventions (TL;DR)

- Core: no prefix, pathPrefix: true, global components; shared everything.
- Tenants: set defaults.prefix, pathPrefix: false; keep secrets in packages/tenants/<tenant>/config.
- Apps: thin; call createFireuxConfig(), include only its tenant module, provide envs; verify with /api/health.
