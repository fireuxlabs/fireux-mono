# Firebase report

A concise overview of how Firebase is wired across the monorepo, how apps consume it, and safe practices to avoid double initialization.

## Architecture

- Source of truth: nuxt-vuefire module is configured via the app config factory.
  - File: `packages/core/fireux-core/src/runtime/utils/fireux-config.ts`
  - Adds `['nuxt-vuefire', vuefireMerged]` to `modules`
  - Exposes `runtimeConfig.public.firebaseConfig` for client-side access
- Optional client plugin (core): minimalist initializer that only ensures a Firebase app exists if none.
  - File: `packages/core/fireux-core/src/runtime/plugins/firebase.client.ts`
  - Does NOT touch Auth; VueFire owns auth initialization
- Runtime config baked early by the core module
  - File: `packages/core/fireux-core/src/config/runtime-config.ts`
  - Ensures `runtimeConfig.public.fireux.core.enabled = true` and that `public` exists

## Multi-tenant integration: core ↔ tenants ↔ apps

- Core (shared for all tenants)
  - Config factory: `packages/core/fireux-core/src/runtime/utils/fireux-config.ts`
    - Provides `createFireuxConfig()` which maps env → `nuxt-vuefire` and `runtimeConfig`.
    - Uses an env helper that treats empty strings as undefined to avoid invalid VueFire configs.
    - Exposes `runtimeConfig.public.appSettings = { appId?, ecosystem }` (no fake default). Warns in dev if `APP_ID` is missing.
  - SSR/admin utilities and routes
    - Admin helper: `packages/core/fireux-core/src/runtime/server/utils/getAdmin.ts`
    - Shared routes (registered by core): `/api/health`, `/api/app`, `/api/app/env-check`, Firestore helpers, Stripe endpoints.
    - Health: `packages/core/fireux-core/src/runtime/server/api/health.get.ts` reports SA path and `appSettings`.
  - Plugins and wiring: VueFire defaults, PWA defaults, component/layout/page scaffolding.

- Tenant packages (per system/brand)
  - Own module (e.g., `fireux-misebox`, `fireux-cleanbox`, `fireux-fireux`) that installs `fireux-core` and supplies tenant defaults.
  - Store service account locally (not committed): `packages/tenants/<tenant>/config/service-account.json` (git-ignored).
  - Provide brand defaults and options (names, colors, PWA manifest defaults, optional feature toggles for extensions).

- Apps (thin wrappers per deployment)
  - Minimal `nuxt.config.ts`: call `createFireuxConfig()`; include only its tenant module in `modules: ['fireux-<tenant>']` when linking tenants explicitly.
  - Minimal `.env`: Firebase client keys and `APP_ID`. Provide server creds via:
    - `FIREBASE_SERVICE_ACCOUNT` (JSON string), or
    - `GOOGLE_APPLICATION_CREDENTIALS` path to the tenant `config/service-account.json`.
  - Optional debug overlay and onboarding in app shell.

## Initialization order

- `configureRuntime(nuxt, 'core')` runs first to bake runtime values.
- `configurePlugins(resolver)` runs next so plugins can safely read `useRuntimeConfig()`.
- Remaining setup (components/composables/models/pages/layouts/server/assets/errors) occurs afterward.
- Apps include VueFire through `createFireuxConfig()` and their `nuxt.config`.

## Configuration surface

- Environment→VueFire mapping (client):
  - In `createFireuxConfig()` the following env vars map to `vuefire.config` and `runtimeConfig.public.firebaseConfig`:
    - `FIREBASE_API_KEY`
    - `FIREBASE_AUTH_DOMAIN`
    - `FIREBASE_PROJECT_ID`
    - `FIREBASE_STORAGE_BUCKET`
    - `FIREBASE_MESSAGING_SENDER_ID`
    - `FIREBASE_APP_ID`
    - `FIREBASE_MEASUREMENT_ID`
  - Optional App Check key: `FIREBASE_RECAPTCHA_V3_KEY`
  - Empty-string envs are treated as undefined in core to avoid invalid VueFire configs.
- Server secrets (Nitro only):
  - `runtimeConfig.firebaseServiceAccount` from `FIREBASE_SERVICE_ACCOUNT` (stringified credentials)
  - Never exposed to the client

## Service account storage strategy

- Per-tenant storage
  - Path: `packages/tenants/<tenant>/config/service-account.json` (git-ignored).
  - Apps reference via `GOOGLE_APPLICATION_CREDENTIALS=../../../packages/tenants/<tenant>/config/service-account.json` or set `FIREBASE_SERVICE_ACCOUNT`.
- Resolution rules in practice
  - VueFire SSR auth and admin helpers support either a JSON string (`FIREBASE_SERVICE_ACCOUNT`) or a file path (`GOOGLE_APPLICATION_CREDENTIALS`).
  - Prefer JSON string for CI/CD; prefer path locally to avoid storing secrets in shell history.
- Dev ergonomics
  - If SSR auth cookies are not needed during local dev, you can set `vuefire.auth.sessionCookie=false` in the app’s `nuxt.config.ts` to avoid admin initialization until secrets are in place.

## What initializes Firebase?

- VueFire initializes Firebase app/auth on the client when configured via `nuxt.config`.
- The core client plugin is minimal and HMR-safe:
  - If `getApps().length === 0` then `initializeApp(firebaseConfig)`
  - Else calls `getApp()` to ensure default app exists
  - No auth initialization here
- To avoid races, keep VueFire enabled and do not call `initializeAuth`/`getAuth` in custom plugins before VueFire.

## Composables and usage

- Common composables relying on Firebase:
  - `useAuth` (VueFire-based), `useFirebaseStorage`, `useMediaStorage`
  - Firestore helpers: `useFirestoreManager`, `useFirestoreRead/Create/Update/Delete`, model-specific composables under `src/runtime/composables/firestore/**`
- Example (client-side):
  - `const { currentUser } = useAuth()`
  - `const { getDoc, setDoc } = useFirestoreManager()`

## SSR considerations

- Use client guards for browser-only APIs:
  - `if (process.client) { /* call useAuth/useFirebaseStorage here */ }`
  - Or defer to `onMounted` when needed
- Server-side Firebase Admin access should use `runtimeConfig.firebaseServiceAccount` in server routes/utilities only
  - See `packages/core/fireux-core/src/runtime/server/utils/getAdmin.ts`

## Diagnostics and health

- `/api/health` (core)
  - Reports `serviceAccount.envPath`, resolved absolute path, `exists`, `size`, and whether `FIREBASE_SERVICE_ACCOUNT` is present.
  - Returns `appSettings` so you can confirm `APP_ID` and `ecosystem` at runtime.
- `/api/app` (core)
  - Returns app metadata including links to the health endpoint.
- `/api/app/env-check` (core)
  - Quick view of required/optional env variable presence.

## Troubleshooting

- Error "auth/already-initialized" or duplicate app/auth warnings:
  - Remove or noop any custom Firebase init; rely on VueFire
  - Ensure module order: runtime → plugins → rest
- Warning "useCurrentUser called before VueFire":
  - Delay Auth-dependent composables to client or onMounted
- Missing config on client:
  - Check `runtimeConfig.public.firebaseConfig` is present (the app logs runtimeConfig on boot in dev)
- Duplicate symbol warnings (unrelated to Firebase):
  - Prefer direct model imports over aggregate `models/index.ts` or rename duplicates

## Current status

- Runtime: baked and visible on server/client
- VueFire: configured through `createFireuxConfig()` with auth enabled by default
- Core client plugin: minimal initializer; safe with VueFire (no auth calls)

### Tenant snapshot (Firebase + SA)

- Misebox (`fireux-misebox`)
  - SA: `packages/tenants/fireux-misebox/config/service-account.json` (present locally)
  - Apps: `misebox-app` (3001), `niederhorn` (3003). Ensure `APP_ID` aligns to Firestore `apps/{id}`.
- Cleanbox (`fireux-cleanbox`)
  - SA: `packages/tenants/fireux-cleanbox/config/service-account.json` (path prepared; add file locally)
  - Apps: `cleanbox-app` (3002), `richies-reinigung` (3004).
- FireUX (`fireux-fireux`)
  - SA: `packages/tenants/fireux-fireux/config/service-account.json` (missing; add locally or use `FIREBASE_SERVICE_ACCOUNT`)
  - App: `fireux-app` (3000); currently dev can run without SSR cookies.

## Next steps (optional)

- If any Auth timing warnings appear, consider making the core client plugin a no-op and let VueFire fully own initialization
- Add small smoke tests to validate `runtimeConfig.public.firebaseConfig` is present and VueFire plugin registers
- Add a CI check that fails when `APP_ID` is missing (optional stricter mode) and when neither SA variable is provided while SSR auth is enabled
- Extend `scripts/create-tenant.js` to scaffold tenant SA path and set `.env` `GOOGLE_APPLICATION_CREDENTIALS` template
