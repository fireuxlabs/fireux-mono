# Firebase client plugin: history, variants, and guidance

This document captures the evolution of the Firebase client plugin used by FireUX Core, the key differences between historical versions, and a recommended approach going forward.

## Current location

- Path: `packages/core/fireux-core/src/runtime/plugins/firebase.client.ts`

## Rename/move timeline

- 2025-07-20 (R100): `packages/fireux-core/src/runtime/plugins/firebase.client.ts` → `packages/core/fireux-core/src/runtime/plugins/firebase.client.ts` (commit `abeb1405`)
- 2025-07-15 (R100): `packages/fireux-core/src/runtime/firebase.client.ts` → `packages/fireux-core/src/runtime/plugins/firebase.client.ts` (commit `58f2553a`)
- 2025-06-08 (A): Initial add at `packages/fireux-core/src/runtime/firebase.client.ts` (commit `4dda5806`)

## Notable historical variants

Below are the most relevant implementations and what set them apart. Snippets are abridged for clarity.

### 2025-07-15 – plugins folder variant (post-move)

- Reads a single `firebaseConfig` object from `useRuntimeConfig().public`.
- Uses `getApps()/getApp()` to avoid duplicate initialization.
- Optional client-only anonymous sign-in safeguard.

```ts
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import type { FirebaseOptions } from 'firebase/app'

export default defineNuxtPlugin(() => {
  const {
    public: { firebaseConfig },
  } = useRuntimeConfig()

  const app = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig as FirebaseOptions)
  const auth = getAuth(app)

  if (import.meta.client) {
    onAuthStateChanged(auth, async (user) => {
      if (!user) await signInAnonymously(auth)
    })
  }
})
```

### 2025-06-14 – fix + ensure anonymous sign-in

- Same as above, explicitly ensures anon sign-in on client when no user is present.

Key point: still uses `public.firebaseConfig` and the `getApps()/getApp()` guard.

### 2025-06-12 – simpler variant

- Uses `public.firebaseConfig` and init guard.
- No anonymous sign-in logic.

### 2025-09-01 – current main-branch variant

- Reads individual keys from `useRuntimeConfig().public`, preferring `NUXT_*`-prefixed names with non-prefixed fallbacks.
- Immediately calls `initializeApp` (no `getApps()/getApp()` guard).
- Provides `firebaseApp`, `auth`, `db`, and `storage` via Nuxt app injection.

```ts
const config = useRuntimeConfig().public
const firebaseApp = initializeApp({
  apiKey: config.NUXT_FIREBASE_API_KEY || config.apiKey,
  authDomain: config.NUXT_FIREBASE_AUTH_DOMAIN || config.authDomain,
  projectId: config.NUXT_FIREBASE_PROJECT_ID || config.projectId,
  storageBucket: config.NUXT_FIREBASE_STORAGE_BUCKET || config.storageBucket,
  messagingSenderId:
    config.NUXT_FIREBASE_MESSAGING_SENDER_ID || config.messagingSenderId,
  appId: config.NUXT_FIREBASE_APP_ID || config.appId,
  measurementId: config.NUXT_FIREBASE_MEASUREMENT_ID || config.measurementId,
})
```

## Config strategies

Two supported ways to supply Firebase config to the client plugin:

1. Single object (legacy, simple)

- Expose `runtimeConfig.public.firebaseConfig` as a complete `FirebaseOptions` object (apiKey, authDomain, projectId, …).
- Pros: compact; consistent with older code.
- Cons: requires serializing the whole object into public runtime config.

2. Split keys (current, granular)

- Expose individual keys in `runtimeConfig.public`, ideally using `NUXT_FIREBASE_*` env vars:
  - `NUXT_FIREBASE_API_KEY`, `NUXT_FIREBASE_AUTH_DOMAIN`, `NUXT_FIREBASE_PROJECT_ID`,
    `NUXT_FIREBASE_STORAGE_BUCKET`, `NUXT_FIREBASE_MESSAGING_SENDER_ID`, `NUXT_FIREBASE_APP_ID`,
    `NUXT_FIREBASE_MEASUREMENT_ID`
- Pros: conventional for Nuxt 3/4 public env; easier to verify per-key.
- Cons: more fields to manage.

## Recommended hybrid implementation

- Keep the split-keys approach so runtime config works with `NUXT_*` env vars.
- Add the safe init guard (`getApps()/getApp()`) to prevent duplicate init during HMR or multiple loads.
- Optionally retain client-only anonymous sign-in if your product requires immediate access before auth.

Pseudocode of the hybrid shape:

```ts
const cfg = useRuntimeConfig().public
const options = {
  apiKey: cfg.NUXT_FIREBASE_API_KEY || cfg.apiKey,
  authDomain: cfg.NUXT_FIREBASE_AUTH_DOMAIN || cfg.authDomain,
  projectId: cfg.NUXT_FIREBASE_PROJECT_ID || cfg.projectId,
  storageBucket: cfg.NUXT_FIREBASE_STORAGE_BUCKET || cfg.storageBucket,
  messagingSenderId:
    cfg.NUXT_FIREBASE_MESSAGING_SENDER_ID || cfg.messagingSenderId,
  appId: cfg.NUXT_FIREBASE_APP_ID || cfg.appId,
  measurementId: cfg.NUXT_FIREBASE_MEASUREMENT_ID || cfg.measurementId,
}

const app = getApps().length ? getApp() : initializeApp(options)
```

## Runtime config tips

- Client-visible values must live under `runtimeConfig.public`.
- With env files, prefer `NUXT_*` prefixes for client exposure (e.g., `NUXT_FIREBASE_API_KEY`).
- Quick sanity check in a page or plugin:

```ts
console.log('Firebase public config', useRuntimeConfig().public)
```

Ensure `apiKey` is a non-empty string; otherwise the Firebase SDK will throw `auth/invalid-api-key` at init.

## SSR/admin note

If using SSR auth features (e.g., via `nuxt-vuefire`) and you see warnings about server-side configuration, provide an Admin SDK service account on the server side (not exposed to client) and initialize the admin instance in a server-only plugin or Nitro runtime. Do not put admin credentials in `public` runtime config.

## Decision helpers

- Want simplest setup and you already have a combined object? Use the “single object” strategy and the 2025‑07‑15 variant.
- Prefer explicit envs and clarity in Nuxt runtime? Use the “split keys” strategy; add the init guard as shown above.
- Need immediate unauthenticated access? Keep the client-only anonymous sign-in block from 2025‑06‑14/07‑15.

## References

- Commits: `4dda5806` (add), `61a3e733`, `e673fbba`, `58f2553a` (move to plugins), `abeb1405` (move into core nesting)
- File paths (historical):
  - `packages/fireux-core/src/runtime/firebase.client.ts`
  - `packages/fireux-core/src/runtime/plugins/firebase.client.ts`
  - `packages/core/fireux-core/src/runtime/plugins/firebase.client.ts`
