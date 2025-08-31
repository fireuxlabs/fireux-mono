# Firebase Integration Guide (FireUX Monorepo)

This document consolidates all Firebase/VueFire initialization and configuration across the FireUX monorepo, from core to the Niederhorn app. It will help diagnose double-initialization and auth errors like `Firebase: Error (auth/already-initialized)`.

## Overview

- Client SDK: firebase 11.10.0, vuefire 3.2.2, nuxt-vuefire ^1.1.0
- Server SDK: firebase-admin (used in Nitro API routes)
- Initialization sources:
  - nuxt-vuefire module config (preferred, global)
  - core plugin `firebase.client.ts` (client-only init + anon sign-in)

Warning: If both nuxt-vuefire and a custom plugin initialize auth, you can see `auth/already-initialized`. Prefer one source of truth for auth init.

---

## Core: nuxt module config (createFireuxConfig)

File: `packages/core/fireux-core/src/config/app/fireux-config.ts`

Key snippet:

- Registers `nuxt-vuefire` with client config from environment variables
- Enables `auth: { enabled: true, ssr: true }`
- Exposes public `runtimeConfig.public.firebaseConfig` (client-safe)

```
modules: [
  'fireux-core',
  ...optionalModules,
  '@nuxt/ui',
  [
    '@vite-pwa/nuxt',
    { registerType: 'autoUpdate', devOptions: { enabled: false } },
  ],
  [
    'nuxt-vuefire',
    {
      config: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      },
      auth: { enabled: true, ssr: true },
      admin: { serviceAccount: process.env.GOOGLE_APPLICATION_CREDENTIALS },
    },
  ],
]

runtimeConfig.public.firebaseConfig = { ...same keys as above }
```

Implication: nuxt-vuefire will create the Firebase App and Auth instance. It also installs its own client plugin `vuefire-auth-plugin.client.mjs`.

---

## Core: client plugin (firebase.client.ts)

File: `packages/core/fireux-core/src/runtime/plugins/firebase.client.ts`

Current behavior:

- Initializes Firebase app using `runtimeConfig.public.firebaseConfig` if no app exists
- Gets `getAuth(app)` and attempts anonymous sign-in on first mount via `onAuthStateChanged`

```
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
if (import.meta.client) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) await signInAnonymously(auth)
  })
}
```

Interaction with nuxt-vuefire:

- nuxt-vuefire also initializes the app and auth and may call `initializeAuth()` internally.
- If both attempt to initialize auth, you can see `auth/already-initialized`.

Resolution options:

1. Let nuxt-vuefire own initialization + auth. Remove or no-op custom client plugin.
2. Keep custom plugin but disable nuxt-vuefire auth init: set `auth: { enabled: false }` in module config. Not recommended if you rely on `useCurrentUser()` SSR timing.

Recommended: Remove duplicate initialization in the custom plugin. Use vuefire composables `useFirebaseApp()`, `useFirebaseAuth()` instead of raw SDK.

Minimal safe plugin sketch (if needed):

```
export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    // Access existing app/auth from vuefire
    const auth = useFirebaseAuth()
    // Optional: custom behavior using provided auth
  }
})
```

---

## App config: Niederhorn

File: `projects/misebox/niederhorn/nuxt.config.ts`

- Uses `createBaseNuxtConfig` ➜ `createFireuxConfig`
- Inherits nuxt-vuefire with `auth.ssr = true`

No additional Firebase plugins in the app layer were found.

---

## Server-side admin usage

Example: `packages/core/fireux-core/src/runtime/server/api/firestore/update-document.post.ts`

- Uses `firebase-admin` to initialize with service account when available.
- This is separate from client SDK and not related to the `auth/already-initialized` error.

---

## Root cause of `auth/already-initialized`

- nuxt-vuefire initializes Auth via its client plugin when `auth.enabled = true`.
- The custom core plugin also calls `getAuth(app)` right after ensuring an app, and triggers listeners/anon sign-in. If vuefire already set up Auth with `initializeAuth()`, re-invoking related init paths can cause `auth/already-initialized`.

## Fix plan

- Option A (preferred): Remove or neuter `firebase.client.ts` so it doesn’t create app/auth.
  - Replace it with a plugin that only reads `useFirebaseAuth()` and never calls initializeApp/getAuth directly.
  - Remove anonymous auto sign-in; use explicit flows or vuefire’s auth state.
- Option B: Disable vuefire auth init by setting `auth: { enabled: false }` in `fireux-config.ts` and handle auth entirely in the plugin. This may break SSR user hydration patterns.

Given your SSR needs and existing vuefire composables across the repo, Option A is recommended.

---

## Environment requirements

Ensure these are present in the app’s environment (e.g., `projects/misebox/niederhorn/.env`):

- FIREBASE_API_KEY
- FIREBASE_AUTH_DOMAIN
- FIREBASE_PROJECT_ID
- FIREBASE_STORAGE_BUCKET
- FIREBASE_MESSAGING_SENDER_ID
- FIREBASE_APP_ID
- FIREBASE_MEASUREMENT_ID (optional)

nuxt-vuefire reads them via the module config; also mirrored under `runtimeConfig.public.firebaseConfig`.

---

## Quick checklist to clear the error

- [ ] Remove duplicate Firebase initialization from `firebase.client.ts`
- [ ] Use `useFirebaseApp()`/`useFirebaseAuth()` from vuefire instead
- [ ] Keep `auth: { enabled: true, ssr: true }` in nuxt-vuefire
- [ ] Verify single app instance via `getApps().length === 1` in dev console
- [ ] Restart dev server after changes

---

## References

- nuxt-vuefire docs: https://vuefire.vuejs.org/nuxt/getting-started.html
- Firebase Auth initializeAuth: https://firebase.google.com/docs/auth/web/custom-dependencies
