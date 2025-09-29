# VueFire currentUser checklist (cross-app)

Purpose: quickly diagnose and fix the warning

> [VueFire] useCurrentUser() called before the VueFireAuth module was added to the VueFire plugin. This will fail in production.

This usually means either the VueFire auth module isn’t enabled/registered yet, or something calls `useCurrentUser()` too early (e.g., at module import time or before Nuxt modules/plugins finish initializing).

## What “good” looks like

- nuxt-vuefire module is present and configured with auth.enabled = true
- Firebase app initializes via core plugin (`firebase.client.ts`) without touching auth
- `useCurrentUser()` is only called inside component setup or inside the body of a composable function (not at top-level, not during import evaluation)
- No duplicate/competing versions of `nuxt-vuefire` in the workspace
- No custom plugin calls `useCurrentUser()` during plugin registration

## 1) Verify Nuxt config per app

For each app (e.g., `projects/*/*-app/nuxt.config.ts`):

- Uses `createFireuxConfig({ ... })` from core
- Doesn’t override `vuefire.auth.enabled` to false
- Includes the tenant module under `modules` (that’s fine; core adds `nuxt-vuefire` itself)

Example (FireUX app):

```ts
// projects/fireux/fireux-app/nuxt.config.ts
export default defineNuxtConfig({
  ...createFireuxConfig({
    appName: 'FireUX',
    appShortName: 'FireUX',
    ecosystem: 'fireux',
    modules: ['fireux-fireux'],
    role: 'global',
  }),
})
```

Core ensures:

```ts
// packages/core/fireux-core/src/runtime/utils/fireux-config.ts
['nuxt-vuefire', { auth: { enabled: true, sessionCookie: false }, ... }]
```

## 2) Check Firebase config/env

- In dev, core logs show if required fields are missing/mismatched
- Ensure all `FIREBASE_*` env vars are from the same Firebase web app snippet
  - Required: `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_APP_ID`
- Missing values won’t directly cause this warning, but keeping them consistent prevents secondary issues

## 3) Find early `useCurrentUser()` calls

Look for any call that happens at import time or in a plugin’s top-level scope.

Wrong patterns:

```ts
// BAD: top-level during import evaluation
import { useCurrentUser } from 'vuefire'
const user = useCurrentUser() // executes too early

// BAD: plugin calling it directly on evaluate
export default defineNuxtPlugin(() => {
  const user = useCurrentUser() // too early in some contexts
})
```

Good patterns:

```ts
// In a composable
export function useSomething() {
  const user = useCurrentUser() // called when composable is used
  // ...
}

// In a component
;<script setup>const user = useCurrentUser() // inside setup()</script>

// In a plugin (rarely needed): delay until app is ready
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    // now safe to read reactive user if absolutely necessary
  })
})
```

## 4) Confirm plugin order and content

- Core plugin `firebase.client.ts` only initializes the Firebase app and deliberately avoids using auth APIs
- Ensure no app/tenant adds a plugin that imports `useCurrentUser()` at top-level
- If you need auth in a plugin, prefer a small composable consumed by components instead

## 5) Version sanity: one `nuxt-vuefire`

- Ensure a single compatible `nuxt-vuefire` version across the workspace (hoisted by pnpm)
- If multiple versions appear in lockfile or `package.json`, align them (e.g., pin to `^1.1.x` everywhere)

Optional checks:

- Inspect root `package.json` for duplicate `nuxt-vuefire` ranges
- `pnpm why nuxt-vuefire` to verify single resolution (run in repo root)

## 6) Tenant modules and layouts

- Tenants should not register VueFire themselves; rely on core’s `createFireuxConfig`
- Layout/components should import `useAuth()` or `useCurrentUser()` only inside setup(), not at module top-level

## 7) Quick app-by-app checklist

For each app in `projects/`:

- nuxt.config.ts uses `createFireuxConfig()` and does not disable `vuefire.auth`
- No app-registered plugin calls `useCurrentUser()` at top-level
- No tenant/extension plugin calls `useCurrentUser()` at top-level
- Run dev once; verify no “[VueFire] useCurrentUser() called before …” warning

## 8) Guarding UI while auth resolves

Even when configured correctly, `useCurrentUser()` is tri-state in the client:

- `undefined` → resolving
- `null` → resolved, no user
- `{ uid, ... }` → resolved, authenticated

Pattern:

```ts
const user = useCurrentUser()
const authReady = computed(() => user.value !== undefined)
```

Use `authReady` to show a skeleton in nav/header until auth resolves.

## If the warning persists

- Re-check for top-level calls in any newly added files (esp. plugins under tenant/extension)
- Align `nuxt-vuefire` dependency versions
- If needed, add a minimal repro in a scratch route and narrow down imports until the warning disappears

Notes:

- Core files for reference:
  - `packages/core/fireux-core/src/runtime/utils/fireux-config.ts`
  - `packages/core/fireux-core/src/runtime/plugins/firebase.client.ts`
- Typical component using auth:
  - `packages/core/fireux-core/src/runtime/components/layouts/Header.vue`
