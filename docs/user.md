# User model report: VueFire, CoreUser, AppUser

This document explains how authentication and user profiles are wired across FireUX using VueFire, and how CoreUser and AppUser interact.

## Overview

- Auth: nuxt-vuefire provides Firebase Auth composables (useCurrentUser, useFirebaseAuth).
- Core identity: CoreUser in collection `core-users`.
- App identity: AppUser per app in `apps/{appId}/users/{uid}`.

## Module and runtime wiring

- nuxt module order (from createFireuxConfig):
  1. @nuxt/ui, @nuxt/icon
  2. nuxt-vuefire with auth: { enabled: true }
  3. @vite-pwa/nuxt (PWA)
  4. fireux-core (module)
- fireux-core registers a client plugin `firebase.client.ts` that initializes the Firebase app using `runtimeConfig.public.firebaseConfig`. It does NOT initialize auth. VueFire registers auth.

## Composables

### useAuth (auth helpers)

File: `packages/core/fireux-core/src/runtime/composables/firebase/useAuth.ts`

- Imports `useFirebaseAuth` and `useCurrentUser` from VueFire.
- Provides sign-in flows (Google, email) and sign-out.
- After sign-in/up, calls `useCoreUser().ensureCoreUser()` to ensure a CoreUser document exists.
- Exposes:
  - currentUser (VueFire reactive user)
  - authState (computed: AUTHENTICATED | NOT_AUTHENTICATED)
  - signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword, signOutUser

### useCoreUser (global identity)

File: `packages/core/fireux-core/src/runtime/composables/firestore/CoreUser/useCoreUser.ts`

- Reads the current Firebase user via `useCurrentUser()`.
- Builds a doc ref to `core-users/{uid}` and subscribes with `useDocument`.
- Also fetches the full collection `core-users` via helper `useFirestoreManager().firestoreFetchCollection`.
- Returns:
  - coreUser (reactive document)
  - coreUsers (array of all core users)
  - helpers: ensure/update/delete/computed
- Note: This composable currently calls `useCurrentUser()` without SSR guards. If used during SSR/hydration, ensure it is invoked client-side or add the same guard pattern used in AppUser (see below) if needed.

### useAppUser (app-scoped identity)

File: `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUser.ts`

- Uses `useFireUXConfig()` to read `appId` from runtime config.
- Uses `useFirestore()` and guarded `useCurrentUser()`:
  - On server it returns `ref(null)`; on client, it uses VueFire’s `useCurrentUser()`.
  - Document ref is null on server or when user/appId isn’t available.
- Subscribes to `apps/{appId}/users/{uid}` with `useDocument`.
- Optionally fetches collection `apps/{appId}/users` on client when `appId` is present.
- Returns:
  - appUser (reactive document or null)
  - appUsers (array or [] when not available)
  - helpers: ensure/utils/update/subscription/computed
- This SSR-safe guard prevents the warning: "useCurrentUser() called before the VueFireAuth module was added".

## Models

### CoreUser model

File: `packages/core/fireux-core/src/runtime/models/core/coreUser.model.ts`

- Shape for global identity stored in `core-users`.
- Fields: id, email, avatar, userOf[], adminOf[], created_at, and optional metadata (created_in, updated_at, dob, appId, etc.).
- Namespaced card view types for UI components.

### AppUser model

File: `packages/core/fireux-core/src/runtime/models/core/appUser.model.ts`

- Shape for app-scoped identity stored at `apps/{appId}/users/{uid}`.
- Fields: id, uid, email, avatar, display_name, role, subscription, preferences, profiles, etc.
- Namespaced card view types for UI components.

## Data flow

- Sign-in:
  - VueFire manages Firebase Auth; `useCurrentUser()` becomes non-null on client.
  - `useAuth()` post-process calls `ensureCoreUser()` to create/update `core-users/{uid}`.
- App scope:
  - Pages/components call `useAppUser()` to subscribe to the app-specific user at `apps/{appId}/users/{uid}`.
  - If called during SSR, the composable yields null and an empty array until client mounts.

## SSR/client timing and best practices

- Prefer calling user-scoped composables in `onMounted()` when they depend on VueFire auth.
- If a composable must be SSR-safe, guard access to `useCurrentUser()` and Firestore references using `import.meta.client` as done in `useAppUser`.
- If needed, mirror the same guard logic in `useCoreUser` to avoid SSR timing issues.

## Configuration

- `createFireuxConfig()` wires `nuxt-vuefire` with `auth: { enabled: true }` and passes Firebase config from env vars to runtime config (exposed as `public.firebaseConfig`).
- The client plugin `firebase.client.ts` initializes the app using that config and leaves auth for VueFire.

## Known runtime errors to address (post-push)

- Firestore PERMISSION_DENIED seen on FireUX app: verify Firebase project envs, auth state, and Firestore rules for the attempted reads.
- Asset route warnings are out of scope for this report and will be addressed separately.

## Update summary (2025-09-09)

New files

- `packages/core/fireux-core/src/runtime/plugins/app-user.client.ts`
  - Client-only plugin that hydrates AppUser/AppUsers into global state via `useState`.
- `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUserState.ts`
  - Convenience composable to read hydrated `appUser` and `appUsers` from state.

Changed files

- `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUser.ts`
  - SSR-safe guard around `useCurrentUser` and Firestore doc/collection usage (client-only).
- `packages/core/fireux-core/src/runtime/composables/firestore/CoreUser/useCoreUser.ts`
  - Added SSR guard for `useCurrentUser`; client-only collection fetch.
- `packages/core/fireux-core/src/config/plugins-config.ts`
  - Registers the new `app-user.client.ts` hydrator plugin (client mode).

Usage note

- For UI, prefer `useAppUserState()` to read `appUser` instead of re-subscribing to Firestore in each component.
