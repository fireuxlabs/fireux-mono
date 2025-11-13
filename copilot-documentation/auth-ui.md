# Auth UI — Reference

This document summarizes the authentication UI used across the FireUX mono-repo, its pages and key child components, and how they integrate with the underlying composables and profile/tenant flows. Use this doc for dissemination and as a quick integration reference for tenant projects.

## Table of contents

- Overview
- Pages
  - `packages/core/fireux-core/src/runtime/pages/auth.vue`
- Components
  - `packages/core/fireux-core/src/runtime/components/organisms/Auth/System.vue` (OrganismsAuthSystem)
  - `packages/core/fireux-core/src/runtime/components/organisms/Auth/Authenticated.vue` (OrganismsAuthAuthenticated) — referenced by the system component
- Composables and helpers
  - `useAuth` (firebase auth wrapper)
- Migration / notes

---

## Overview

This separation lets tenants inherit a polished, narrative-driven auth experience while keeping per-tenant onboarding logic in the parent page.

---

Purpose

- Top-level public sign-in page with a branded hero card, contextual copy, and follow-up CTAs stacked directly beneath the auth form. It auto-creates the core profile on first sign-in (falling back to the CTA if provisioning fails).
- Shows ecosystem and tenant context using `useFireUXConfig()` (ecosystem, appName, role, appId) to populate the badge, hero text, and feature list.
- Embeds `OrganismsAuthSystem` with `redirect-on-success` disabled and `show-authenticated-card="false"` so the page can present the post-auth CTAs directly below the form.
- After the user signs in and `useUser()` resolves, the card shows the follow-up CTAs in-place:
  Key local state & handlers

- `isSignedIn` — derived from `useAuth().uid`.
- `coreUser`, `appUser`, `pending`, `ensureCore`, `ensureApp` — from `useUser()`.
- `creatingCore` / `joiningApp` — local loading refs used by the CTA buttons.
- `onCreateCore()` — calls `ensureCore()` and toggles `creatingCore`.
- The hero card background tints itself using the configured `primaryColor` for the current app/tenant.

---

Purpose

- Encapsulates the sign-in UI: provider buttons, email/password form, sign-up toggle, and success panel.
- Handles both tenant (join) and global sign-in behaviour.

Public API

- `redirectOnSuccess?: boolean` (default: `true`) — when true the component navigates to `redirectTarget` after successful auth; when false it emits `signed-in` so the parent can continue.
- `redirectTarget?: string` (default: `/`) — route to navigate to when `redirectOnSuccess` is true.
- `showAuthenticatedCard?: boolean` (default: `true`) — when false the internal authenticated success card is hidden so the parent can control follow-up UI (used by the shared `/auth` page).
- `signed-in` — emitted when sign-in completes and `redirectOnSuccess` is false.

Internal behaviour

- Uses `useAuth()` to access `authState`, `signInWithGoogle`, `signInWithEmailPassword`, `signUpWithEmailPassword`.
- Accepts tenant context from `useFireUXConfig()` and adjusts copy and form behaviour accordingly.
- Renders a clear success state (when `authState === 'AUTHENTICATED'`) via `OrganismsAuthAuthenticated` when `showAuthenticatedCard` is true.
- Renders provider button(s) and a custom email/password form; the default view keeps the lightweight ghost Google button and inline error surface so the parent page can control surrounding messaging.

Accessibility & UX

- Password field includes a visibility toggle in the redesigned layout.

### `OrganismsAuthAuthenticated` (referenced)

---

- Wrapper around Firebase auth flows for sign-in, sign-up, provider sign-in and reactive auth state (uid, isAuthenticated, etc.).
- Exposed functions used by the auth UI: `signInWithGoogle`, `signInWithEmailPassword`, `signUpWithEmailPassword`, `authState`, `uid`.
- `useUser()` (core)

  - High-level grouped user helpers: returns `coreUser`, `appUser`, `pending`, and merges into computed `user` (overlay). Also provides `ensureCore()` and `ensureApp()` helpers used by `auth.vue` CTAs.

  - `ensureCore()` creates a core `users/{uid}` document if missing.
  - `ensureApp()` creates app membership `apps/{appId}/users/{uid}` if tenant-scoped membership is missing.

- `useFireUXConfig()`
  - Runtime configuration accessor that provides `appName`, `ecosystem`, `role`, `appId` and derived flags `isTenant` / `isGlobal`.

---

## Integration examples

```vue
<template>
  <OrganismsAuthSystem
    :redirect-on-success="false"
    :show-authenticated-card="false"
    @signed-in="onAuthSignedIn"
  />
</template>

<script setup>
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser'

const { coreUser, appUser, pending, ensureCore, ensureApp } = useUser()

// parent may simply react to the composable refs. Example CTA handler:
async function onCreateCore() {
  await ensureCore()
}
</script>
```

2. Simple standalone use (auto-redirect):

```vue
<OrganismsAuthSystem redirect-on-success redirect-target="/dashboard" />
```

---

## Flows and UX guidance

- For tenant join flows, require a core profile first. The recommended UX is:

  1. Sign in / Sign up on `/auth` (auto-provision core profile via `ensureUser`).
  2. If auto-provision fails, show a CTA to create it (call `ensureCore`).
  3. If tenant and `coreUser` exists but `appUser` missing, show a CTA to join the tenant (call `ensureApp`).
  4. Only after both are present show success and let the user continue.

- When using third-party auth providers (Google), the parent page should typically not rely on automatic redirects; prefer the `signed-in` emit to confirm sign-in and keep the user on the CTA flow.

---

- Page: `packages/core/fireux-core/src/runtime/pages/auth.vue`
- Component: `packages/core/fireux-core/src/runtime/components/organisms/Auth/System.vue`

- If a tenant previously overrode `pages/professionals.vue` or other auth-related pages, mention that the shared module now handles the `/auth` page and that tenant-level overrides will take precedence. To adopt the shared flow, delete or refactor tenant overrides.

- Keep `useUserEnsure` behavior consistent: `ensureCore()` and `ensureApp()` are the canonical helpers for creating the corresponding DB entries.

- [ ] Verify you can sign in with Google and the parent page stays (when `redirect-on-success=false`).
- [ ] Verify automatic core profile provisioning after first sign-in (CTA only appears if provisioning fails).
- [ ] For tenant projects, verify `Join <Tenant>` CTA appears after core creation and calls `ensureApp()`.

- Add a one-page PDF export for dissemination.

Tell me which follow-up you'd prefer and I will add it next.
await ensureCore()
