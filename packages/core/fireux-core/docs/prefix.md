# Env prefixes and runtimeConfig mapping

This note explains how environment variables flow into Nuxt runtimeConfig and then to the client, and where prefixes like NUXT* or NUXT_PUBLIC* are required vs. optional in this repo.

## TL;DR

- Your app .env files may stay unprefixed (e.g., FIREBASE_API_KEY, APP_NAME). That’s fine.
- Values used in the browser must end up in runtimeConfig.public. They are not read directly from process.env on the client.
- Today, the core config reads NUXT*FIREBASE*_ at build time to create runtimeConfig.public.firebaseConfig. If your app uses unprefixed FIREBASE\__, either:
  - add duplicate NUXT*PUBLIC_FIREBASE*_ (or NUXT*FIREBASE*_) entries in the app’s .env, or
  - update the factory to fallback to FIREBASE\_\* (documented below) so no duplication is needed.

## Where values are read today

- In apps’ nuxt.config.ts (per-project):
  - Reads process.env.APP_NAME, APP_SHORT_NAME, APP_PRIMARY_COLOR, APP_NEUTRAL_COLOR.
  - These are build-time only and passed into createFireuxConfig({ appName, ... }).
- In core factory createFireuxConfig (packages/core/fireux-core/src/runtime/utils/fireux-config.ts):
  - Reads process.env.NUXT*FIREBASE*\* to compose vuefire config.
  - Writes runtimeConfig.public.firebaseConfig as a plain object for the client plugin.
  - Also sets runtimeConfig.firebaseServiceAccount (server-only) from FIREBASE_SERVICE_ACCOUNT.
- In the Firebase client plugin (src/runtime/plugins/firebase.client.ts):
  - Reads useRuntimeConfig().public.firebaseConfig on the client and initializes Firebase.
- In server handlers and scripts:
  - Server-only secrets like STRIPE_SECRET_KEY, FIREBASE_SERVICE_ACCOUNT(\_KEY), GOOGLE_PLACES_API_KEY, etc., are read directly via process.env on the server.

## Prefix expectations by surface

- Client-visible (browser):
  - Must be under runtimeConfig.public at runtime. Options to get there:
    - Use NUXT*PUBLIC*\* in .env (Nuxt auto-maps to runtimeConfig.public), or
    - Map manually in nuxt.config (what this repo does via createFireuxConfig), reading env and setting runtimeConfig.public fields.
- Server-only:
  - Can be any names (no Nuxt prefix needed). Keep secrets unprefixed (e.g., STRIPE_SECRET_KEY, FIREBASE_SERVICE_ACCOUNT). Do not place them under runtimeConfig.public.

## Current mappings (effective at runtime)

- App branding from env to client:
  - APP_NAME -> passed to createFireuxConfig -> runtimeConfig.public.appName.
  - APP_SHORT_NAME -> -> runtimeConfig.public.appShortName.
  - APP_PRIMARY_COLOR -> -> runtimeConfig.public.primaryColor.
  - APP_NEUTRAL_COLOR -> -> runtimeConfig.public.neutralColor.
- Firebase client config to client:
  - NUXT_FIREBASE_API_KEY -> runtimeConfig.public.firebaseConfig.apiKey.
  - NUXT_FIREBASE_AUTH_DOMAIN -> runtimeConfig.public.firebaseConfig.authDomain.
  - NUXT_FIREBASE_PROJECT_ID -> runtimeConfig.public.firebaseConfig.projectId.
  - NUXT_FIREBASE_STORAGE_BUCKET -> runtimeConfig.public.firebaseConfig.storageBucket.
  - NUXT_FIREBASE_MESSAGING_SENDER_ID -> runtimeConfig.public.firebaseConfig.messagingSenderId.
  - NUXT_FIREBASE_APP_ID -> runtimeConfig.public.firebaseConfig.appId.
  - NUXT_FIREBASE_MEASUREMENT_ID -> runtimeConfig.public.firebaseConfig.measurementId.
  - NUXT_FIREBASE_RECAPTCHA_V3_KEY -> used for appCheck (server config-time), not exposed unless you choose to.
- Firebase server config (server-only):
  - FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_KEY -> runtimeConfig.firebaseServiceAccount (server-only) and used by server endpoints.
- Other server-only envs (examples):
  - STRIPE*SECRET_KEY, GOOGLE_PLACES_API_KEY, APP*\* used in server routes. These stay on the server.

## If your app envs are unprefixed

- Option A (no code changes): Add NUXT*PUBLIC* (or NUXT\_) duplicates to .env.
  - Example: set both FIREBASE_API_KEY and NUXT_PUBLIC_FIREBASE_API_KEY to the same value.
  - This guarantees the value appears in runtimeConfig.public, and/or matches the current factory’s expectation.
- Option B (preferred long-term): Teach the factory to fallback to unprefixed FIREBASE*\* when NUXT*\* are absent.
  - The idea: apiKey: process.env.NUXT_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY, etc.
  - This removes duplication in app .env files while keeping a single source of truth.

## Quick verification

- In the browser console (client):
  - useRuntimeConfig().public.firebaseConfig should be a non-empty object with a non-empty apiKey.
- On the server (Node):
  - console.log(process.env.FIREBASE_SERVICE_ACCOUNT) should show presence only on the server.

## Known places in repo touching prefixes

- Reads NUXT*FIREBASE*\*: core fireux-config.ts and config-validation.ts.
- Supports NUXT*PUBLIC_FIREBASE*\* (docs and validation helper).
- Apps’ nuxt.config.ts files read unprefixed APP\_\* values.
- Scripts and server routes use unprefixed secret names.

## Recommendation

- Short term: either add NUXT*PUBLIC_FIREBASE*_ in app .env or we add FIREBASE\__ fallbacks in the core factory.
- Medium term: standardize on unprefixed FIREBASE\_\* in app .env and let the core map them into runtimeConfig.public for the client, keeping secrets server-only.
