# Tenant Packages Report (2025-09-04)

This report captures the current state of tenant packages and proposes alignment strategies so all apps share the same conventions and wiring.

## Inventory

- Tenants
  - `packages/tenants/fireux-misebox`
  - `packages/tenants/fireux-cleanbox`
  - `packages/tenants/fireux-fireux` (new; hosts FireUX app service account and future FireUX-specific assets)
- Extensions (not tenants)
  - `packages/extensions/fireux-jobs`
  - `packages/extensions/fireux-places`

## Current State by Tenant

### fireux-misebox

- Service account: `packages/tenants/fireux-misebox/config/service-account.json` (expected path)
- App(s): `projects/misebox/misebox-app` (port 3001), `projects/misebox/niederhorn` (port 3003)
- Env:
  - `projects/misebox/misebox-app/.env` created (Firebase, APP_ID=misebox-app, GOOGLE_APPLICATION_CREDENTIALS to tenant path)
  - `projects/misebox/niederhorn/.env` exists with Firebase + APP_ID; ensure APP_ID matches the Firestore `apps/{id}` doc
- Nuxt config:
  - Aligned: `compatibilityDate: '2025-09-01'`
  - Modules: `['fireux-misebox']`
- Notes:
  - Removed Nuxt Content usage on landing page to avoid unresolved component during early dev
  - Dev pages updated to non-prefixed core component names

### fireux-cleanbox

- Service account: `packages/tenants/fireux-cleanbox/config/service-account.json` (expected path)
- App(s): `projects/cleanbox/cleanbox-app` (port 3002), `projects/cleanbox/richies-reinigung` (port 3004)
- Env:
  - `projects/cleanbox/cleanbox-app/.env` created (Firebase, APP_ID=cleanbox-app)
  - `projects/cleanbox/richies-reinigung/.env` created (inherits CleanBox Firebase for now; replace later)
- Nuxt config:
  - Ensure `compatibilityDate: '2025-09-01'` and tenant modules when wiring (not modified in this batch)

### fireux-fireux (new)

- Purpose: host secrets and tenant-specific assets for the FireUX app
- Service account: place secret at `packages/tenants/fireux-fireux/config/service-account.json` (git-ignored)
- App(s): `projects/fireux/fireux-app` (port 3000)
- Env:
  - `projects/fireux/fireux-app/.env` updated to `GOOGLE_APPLICATION_CREDENTIALS=../../../packages/tenants/fireux-fireux/config/service-account.json`
- Nuxt config:
  - Already aligned to `compatibilityDate: '2025-09-01'`

## Cross-Tenant Alignment Strategies

1. Environment + Secrets

- Standardize per-app `.env` keys:
  - Firebase: `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`, `FIREBASE_MEASUREMENT_ID`
  - App: `APP_ID`, `APP_NAME`, `APP_SHORT_NAME`, `APP_PRIMARY_COLOR`, `APP_NEUTRAL_COLOR`, `APP_ICON`, `PROJECT_NAME`, `DOMAIN`, `PIN`
  - Secrets: prefer `FIREBASE_SERVICE_ACCOUNT` (JSON string) or `GOOGLE_APPLICATION_CREDENTIALS` (relative path to the tenant package `config/service-account.json`)
- Keep service accounts under tenant packages (`packages/tenants/<tenant>/config/service-account.json`) and .gitignore them locally.
- Add a root `.env.example` that documents these keys; leave values empty.

2. Nuxt Config

- Use `createFireuxConfig()` with per-app defaults and add:
  - `compatibilityDate: '2025-09-01'`
  - Tenant module list: e.g. `['fireux-misebox']` (avoid piling unrelated modules per app)
- Provide defaults when env is missing for `appName`, `appShortName`, `primaryColor`, `neutralColor` to ensure local dev starts without setup.

3. Runtime Config App Settings (recommended improvement)

- Map `APP_ID` and core app settings to `runtimeConfig.public.appSettings` from `createFireuxConfig()` so `useFireUXConfig()` resolves the active app correctly on both server and client.
- Proposed addition to `createFireuxConfig()` (pseudocode):
  - `runtimeConfig.public.appSettings = { appId: process.env.APP_ID, appName: opts.appName, ... }`
- Benefit: fixes cases where `useApp()` computes a null doc ref due to missing `appId` and prevents false "needs initialization".

4. Component Naming

- Core components: no `Fire` prefix; use path-based names (e.g., `OrganismsAppCardsPill`).
- Extensions may keep their prefixes (e.g., Jobs/Places), but tenants should follow the core pattern.
- Completed: dev pages updated to remove `Fire*` prefixes; `DevNav` used in `dev` layout.

5. Debug + Onboarding UX

- App shells use `<ClientOnly><Teleport> <AppDebug/> </Teleport></ClientOnly>` pinned above modals.
- Onboarding modal uses `OrganismsAppOnboarding`.
- Completed for FireUX + Niederhorn; can be mirrored where desired.

6. SSR Firebase Admin

- VueFire warns if SSR+auth is enabled without admin credentials. Provide either:
  - `FIREBASE_SERVICE_ACCOUNT` (JSON string), or
  - `GOOGLE_APPLICATION_CREDENTIALS` pointing to tenant service-account.json
- FireUX app now uses the `fireux-fireux` tenant path for this.

## Lean apps: what lives where

Goal: keep each app as a thin Nuxt wrapper. Push brand- or tenant-specific things into tenant packages, and push shared behavior into core.

- Core (shared by all tenants)
  - Nuxt module: `fireux-core` with `createFireuxConfig()` as the single entry to map env → runtimeConfig (public + server-only).
  - Server routes (registered by core):
    - `/api/health` (shared health endpoint) — MOVED to core and live.
    - `/api/app` (app metadata), `/api/app/env-check`.
    - Firestore utilities and Stripe endpoints that are generic (already present under core runtime/server/api).
  - Plugins and wiring: VueFire defaults, PWA defaults, component auto-registration, layouts, pages scaffolding, error pages.
  - Debug/onboarding UX: provide `AppDebug` and `OrganismsAppOnboarding` components and styles from core; apps can opt-in in their shell.
  - Runtime config shape: expose `public.appSettings` with `appId`, `ecosystem` and firebase config, plus server-only `firebaseServiceAccount`.

- Tenant package (per system/brand)
  - Module: `fireux-<tenant>` that installs `fireux-core` and supplies tenant defaults/options.
  - Secrets location (not committed): `packages/tenants/<tenant>/config/service-account.json` (referenced by app via `GOOGLE_APPLICATION_CREDENTIALS`).
  - Branding and content:
    - Theme tokens: primary/neutral colors, appName/shortName, icon name, favicon/logo assets.
    - PWA manifest defaults (name, colors, start URL).
    - Optional locale/i18n strings, email templates, legal pages (terms/privacy) as static content.
  - Optional tenant features: enable/disable extensions (e.g., jobs, places) via module options; avoid placing secrets in the package.

- App (thin wrapper per deployment)
  - Minimal `nuxt.config.ts`: call `createFireuxConfig()` and include only its tenant module in `modules: ['fireux-<tenant>']`.
  - Minimal `.env`: Firebase client keys + `APP_ID`; secrets via `FIREBASE_SERVICE_ACCOUNT` (JSON) or `GOOGLE_APPLICATION_CREDENTIALS` (tenant path).
  - App shell: optionally includes `<ClientOnly><Teleport><AppDebug/></Teleport></ClientOnly>` and onboarding modal.
  - Pages: only app-specific routes that truly differ from core defaults; prefer overrides by providing same path under app if needed.

## Concrete move list (apps → tenant/core)

- Move to core (shared):
  - `/server/api/health.get.ts` → now in core and auto-registered.
  - Any generic diagnostics: env check, app info (already in core), simple Firestore helpers, Stripe generic endpoints.
  - Shared plugins (firebase config exposure, component auto-imports), layouts (dev, dashboard, design, docs), and dev pages.

- Move to tenant:
  - Branding: colors, names, icons, PWA manifest defaults, static brand assets (icons, logos, og images).
  - Tenant module options (e.g., enable Places/Jobs extension); avoid secrets in code.
  - Localized copy (optional): tenant-specific strings for landing and marketing sections.

- Keep in app (only if necessary):
  - Truly app-unique routes or feature flags not shared within the tenant system.
  - Temporary development overrides.

## Directory and wiring conventions

- Tenant package
  - `packages/tenants/<tenant>/src/module.ts` — Nuxt module that installs `fireux-core` and exports options.
  - `packages/tenants/<tenant>/config/service-account.json` — local-only secret file (git-ignored).
  - `packages/tenants/<tenant>/src/runtime/**` — optional runtime assets (icons, styles, locales).
  - `package.json` should export `./src/module.ts` as `"."` and `./src/runtime` if needed.

- App
  - Add dependency: `"fireux-<tenant>": "workspace:*"` and list it in `modules`.
  - Call `createFireuxConfig({ ecosystem, appName, appShortName, primaryColor, neutralColor, vuefire?: {...}, pwa?: {...} })` and rely on tenant defaults.
  - `.env` contains only env that varies by deployment; do not duplicate tenant defaults.

## Migration plan (per app)

1. Add app dependency on its tenant package and set `modules: ['fireux-<tenant>']`.
2. Prune `nuxt.config.ts` to a `createFireuxConfig()` call plus a small override block if needed.
3. Prune `.env` to the minimal set; move brand defaults to tenant module options; keep secrets via `FIREBASE_SERVICE_ACCOUNT` or `GOOGLE_APPLICATION_CREDENTIALS`.
4. Relocate any shared server routes to core (health — done; env/app — already in core); delete app-local copies.
5. Move icons/manifest/logos to tenant; set defaults through tenant module.
6. Verify `/api/health` and `/api/app` respond; check `runtimeConfig.public.appSettings.appId` is correct.

## Automation and checks

- Scripts
  - Extend `scripts/create-tenant.js` to also add the tenant module as an app dependency and scaffold brand assets.
  - Add a lint that warns if an app defines a route that exists in core (to avoid duplication).

- Quality gates
  - Build + typecheck at root; ensure each app boots with only its tenant module.
  - `/api/health` present in all apps (served from core).
  - Runtime config contains `public.firebaseConfig` and `public.appSettings`.

## Recent alignment applied

- Health endpoint moved to core and auto-registered by `fireux-core`.
- `createFireuxConfig()` now exposes `public.appSettings` with `appId` and `ecosystem`.
- FireUX app dev uses `vuefire.auth.sessionCookie=false` to avoid SA requirement until the tenant SA is added.

## Backlog

- Add tenant-module defaults for brand tokens (colors, names) to further prune app `.env`.
- Provide a core plugin to optionally auto-inject `AppDebug` overlay so apps don’t need shell changes.
- Provide an `apps/<id>` existence check API in core to surface onboarding/completion status.

## Status Snapshot

- Tenants present: Misebox, Cleanbox, FireUX (new)
- Env files created: FireUX, Misebox app, Cleanbox app, Richies app
- Nuxt config alignment: FireUX + Niederhorn aligned; Misebox aligned in this pass
- Dev page cleanup: `Fire*` prefixes removed in core dev pages
- Content renderer: removed from Misebox landing for now
- Service accounts: Tenant paths standardized; FireUX moved to `fireux-fireux`

## Next Steps

- Add `appSettings` mapping in `createFireuxConfig()` to expose `APP_ID` and related settings at runtime (unblocks `useApp()` everywhere)
- Create a root-level `.env.example` and (optionally) de-duplicate app-level `.env` with overrides per tenant
- Sweep remaining Fire-prefixed usages in extensions only if needed; keep as-is if intentional
- Add a small dev-only `/api/db` browser per app for quick collection/document inspection

---

## Side-by-side comparison (tenants)

This section contrasts the three children under `packages/tenants/` as of 2025-09-04.

### fireux-misebox
- Purpose: Misebox system (used by `misebox-app`, `niederhorn`).
- package.json
  - name: `fireux-misebox`, version: `0.1.0`, private.
  - main/types: `./src/module.ts`; exports: `.`, `./runtime/*`, `./package.json`.
  - deps: `fireux-core`, `fireux-places`.
  - peerDeps: Nuxt 4.0.3 family, Vue 3.5.x, vuefire 3.2.x, firebase 11.10.0, firebase-admin, stripe, @vueuse/core.
  - scripts: `nuxt-module-build` toolchain (build/dev/clean), engines pinned.
- src structure
  - `src/config/*`: components/composables/models/pages/layouts/plugins/server/runtime config fns.
  - `src/runtime/*`: assets, components, composables, layouts, models, pages; shims.
  - `module.ts`: installs `fireux-core`, applies config fns, `configureRuntime(nuxt, 'misebox')`, sets `nitro.experimental.wasm=true`.
- secrets path: `config/service-account.json` (git-ignored).
- docs: `docs/` present.

### fireux-cleanbox
- Purpose: CleanBox system (used by `cleanbox-app`, `richies-reinigung`).
- package.json
  - name: `fireux-cleanbox`, version: `0.1.0`, private.
  - main/types: `./src/module.ts`; exports: `.`, `./runtime/*`, `./package.json`.
  - deps: `fireux-core`.
  - peerDeps: Nuxt 4.0.3 family, Vue 3.5.x, vuefire 3.2.x, firebase 11.10.0, firebase-admin, stripe, @vueuse/core.
  - scripts: `nuxt-module-build` toolchain, engines pinned.
- src structure
  - `src/config/*`: components/composables/models/pages/layouts/plugins/server/runtime config fns (same pattern as Misebox).
  - `src/runtime/*`: composables, layouts, models (leaner than Misebox runtime; no assets/pages folder).
  - `module.ts`: installs `fireux-core`, applies config, `configureRuntime(nuxt, 'cleanbox')`, sets `nitro.experimental.wasm=true`.
- secrets path: `config/service-account.json` (git-ignored).
- docs: no `docs/` folder currently.

### fireux-fireux
- Purpose: FireUX tenant (currently used to host FireUX app service account and future assets).
- package.json
  - name: `fireux-fireux`, version: `0.0.0`, private.
  - main: `./src/module.ts`; exports: `.`, `./src/runtime/index.ts`.
  - deps/devDeps: none declared (minimal).
- src structure
  - `src/module.ts`: installs `fireux-core`; no config pipeline yet.
  - `src/runtime/index.ts`: placeholder entry (runtime exists, minimal).
- secrets path: `config/service-account.json` (git-ignored).
- docs: `README.md` present.

## Key differences and implications
- Config pipeline
  - Misebox/Cleanbox: full `src/config/*` pipeline (components, composables, models, pages, layouts, plugins, server, runtime) and runtime contributions.
  - FireUX: minimal module (core install only). Good for “lean app” strategy; can be expanded later if FireUX needs tenant-specific runtime assets.
- Dependencies
  - Misebox depends on `fireux-places`; Cleanbox does not. Both peer-depend on Nuxt/Vue/VueFire/Firebase.
  - FireUX has no explicit deps; relies on app calling `createFireuxConfig()` and the tenant existing mainly for secrets/assets.
- Runtime contributions
  - Misebox contributes assets/pages; Cleanbox contributes only composables/layouts/models; FireUX contributes none today.
- Build tooling
  - Misebox/Cleanbox use `@nuxt/module-builder` scripts; FireUX does not (no build scripts as it ships source only).

## Alignment suggestions (low-risk)
- package.json shape
  - Add `files: ["src/**/*"]`, `exports["./package.json"]` to `fireux-fireux` for parity.
  - Consider adding `@nuxt/module-builder` dev flow to `fireux-fireux` if it grows beyond trivial.
  - Add engines field to `fireux-fireux` to match Node/pnpm constraints.
- Docs
  - Add `docs/` to Cleanbox for symmetry (or remove from Misebox if not used).
- Runtime
  - Keep FireUX minimal unless a real tenant runtime surface appears. Otherwise, scaffold the same `src/config/*` pattern later.
- Nitro
  - All tenants already set `nitro.experimental.wasm=true` in their module setup where applicable.

## Decision guide
- If an app needs brand/runtime assets and route scaffolding: add them under its tenant (`src/runtime/**`) and wire via `src/config/*` fns.
- If an app is purely brand + secrets: keep tenant minimal (FireUX style) and rely on core + app `createFireuxConfig()` overrides.

