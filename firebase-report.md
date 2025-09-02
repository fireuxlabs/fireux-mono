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
- Server secrets (Nitro only):
  - `runtimeConfig.firebaseServiceAccount` from `FIREBASE_SERVICE_ACCOUNT` (stringified credentials)
  - Never exposed to the client

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

## Next steps (optional)

- If any Auth timing warnings appear, consider making the core client plugin a no-op and let VueFire fully own initialization
- Add small smoke tests to validate `runtimeConfig.public.firebaseConfig` is present and VueFire plugin registers
