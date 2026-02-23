---
title: App Entity Creation (Report)
description: File-by-file report of how FireUX app entities are identified and created, with focus on app id/slug behavior.
---

# App Entity Creation (Report)

This report documents how FireUX app entities are created today, with a focus on the app `id` (which currently acts as the canonical app slug).

## Summary (Slug / ID)

- Canonical app identity is `app.id`
- Firestore app document path is `apps/{appId}`
- There is no separate app slug claim collection today
- In practice, app slug == app document id == `runtimeConfig.public.fireux.id`
- App creation is "ensure" style (create-if-missing), not a generic user-entered slug claim flow

## Core Creation Path (App Firestore Document)

### 1) App ID is defined in app config (`nuxt.config.ts`)

These project configs define the app identity that becomes the Firestore app id:

- `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/projects/fireux/fireux-app/nuxt.config.ts`
- `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/projects/misebox/misebox-app/nuxt.config.ts`
- `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/projects/cleanbox/cleanbox-app/nuxt.config.ts`

Examples in repo now:

- `fireux-app`
- `misebox-app`
- `cleanbox-app`

### 2) `defineFireuxConfig(...)` passes app id into runtime config

File:

- `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/packages/core/fireux-core/src/config/app/fireux.config.ts`

What matters:

- `defineFireuxConfig({ id, name, shortName, ecosystem, role, ... })` receives the app id
- It calls `setRuntime(...)` with `app: { id: app.id, ... }`
- It does not normalize/slugify `app.id`
- It uses `app.id` for Nitro function naming (`toValidJsIdentifier(app.id)`) but that is separate from Firestore app identity

### 3) Runtime config exposes `public.fireux.id`

File:

- `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/packages/core/fireux-core/src/config/app/runtime.ts`

What matters:

- `setRuntime(...)` writes app runtime fields into `runtimeConfig.public.fireux`
- `id` is copied as-is

### 4) `useFireUXConfig()` reads runtime config and exposes `appId`

File:

- `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/app/FireUXConfig.ts`

What matters:

- `buildConfig()` reads `runtimeConfig.public.fireux.id`
- `appId` is required and trimmed
- It is not lowercased/slug-normalized here
- This means app id canon currently depends on config discipline

### 5) UI onboarding triggers app creation

Files:

- `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/packages/core/fireux-core/src/runtime/components/organisms/App/Create/System.vue`
- `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/app/utils/useAppOnboarding.ts`

What happens:

- User completes auth + PIN + env check
- `onProceed()` calls `ensureApp()`
- If created, onboarding also uploads default brand assets and patches the app doc

### 6) Firestore app entity is created by `useAppEnsure()`

File:

- `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppEnsure.ts`

Creation behavior:

- Reads `fireux.appId` from `useFireUXConfig()`
- Checks `apps/{appId}` with `getDoc(...)`
- If exists: returns `{ created: false, id: appId }`
- If missing: creates `apps/{appId}` via `setDocument('apps', fireux.appId, payload, { creator: true })`

Identity fields written:

- `id: fireux.appId`
- `app_name`, `app_short_name`
- `ecosystem`, `role`
- other default app shape fields

Important invariant:

- Firestore document id and payload `id` are both sourced from the same `fireux.appId`
- This is the current canonical app-id rule

## App Updates (What Does NOT Change App ID)

File:

- `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppUpdate.ts`

Notes:

- Updates read app id from `appRef.value?.id ?? cfg.appId`
- App content fields (`app_name`, `tagline`, bios, media, social links, ecosystem) are updated in-place
- There is no app-id rename flow here
- App identity is effectively immutable in normal runtime flows

## App Model Canon (Shape + Path)

File:

- `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/packages/core/fireux-core/src/runtime/models/core/app.model.ts`

Key details:

- Comment documents path as `/apps/<appId>`
- `App.id` exists as canonical identity field in runtime model shape
- This model is used as runtime canon for app code and drift tooling

## Related Registry API (Separate From Runtime App Doc Creation)

File:

- `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/projects/fireux/fireux-app/server/api/registry.post.ts`

Why it matters:

- This endpoint also writes to an `apps/{id}` path, but in the **registry** database context (`getFirestoreDb('registry')`)
- It normalizes ids with `id.toLowerCase()`
- It slugifies ecosystem (`toSlug(...)`)

Important distinction:

- `registry.post.ts` is not the same as the core runtime app creation path (`useAppEnsure()`)
- Runtime app creation (`/apps/{appId}` in app Firestore) currently trusts config-provided `appId`
- Registry writes introduce normalization that runtime app creation does not

## Current App ID / Slug Rules (Practical Canon)

Today, app id canon is enforced mostly by convention:

- app ids are authored as kebab-case in `nuxt.config.ts`
- runtime config requires non-empty string, trims whitespace
- `useAppEnsure()` creates `apps/{appId}` directly from config

There is no explicit runtime validation like:

- lowercase only
- `[a-z0-9-]` only
- reserved words
- rename/claim transaction

## Drift / Risk Notes (Useful for Future App Entity Work)

- App runtime path and payload `id` stay aligned during creation because both come from `fireux.appId`
- If someone sets a non-canonical `id` in `defineFireuxConfig(...)`, runtime app creation will use it as-is
- Registry API normalizes ids to lowercase, so registry and runtime app docs can drift if config ids are not canonical
- There is no app-id migration/rename flow in core runtime (by design, likely good for now)

## Recommended Phase-1 App Canon Checks (No Big Abstraction Needed)

- Keep `apps/{appId}` as the canonical app identity
- Add a small validation guard in `defineFireuxConfig(...)` (or `useFireUXConfig()`) for app id format
- Document the rule clearly: `app.id` must be stable kebab-case and immutable after launch
- Treat app renames as display-field updates (`app_name`, `app_short_name`), not id changes

## File Map (Quick Reference)

- App ID authored: `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/projects/fireux/fireux-app/nuxt.config.ts`
- Config builder: `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/packages/core/fireux-core/src/config/app/fireux.config.ts`
- Runtime config mapping: `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/packages/core/fireux-core/src/config/app/runtime.ts`
- Runtime config reader: `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/app/FireUXConfig.ts`
- App onboarding trigger: `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/app/utils/useAppOnboarding.ts`
- App onboarding UI: `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/packages/core/fireux-core/src/runtime/components/organisms/App/Create/System.vue`
- App creation ensure: `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppEnsure.ts`
- App updates: `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppUpdate.ts`
- App model canon: `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/packages/core/fireux-core/src/runtime/models/core/app.model.ts`
- Registry-side app id normalization (separate system): `/Users/danielwatson/.codex/worktrees/5536/fireux-mono/projects/fireux/fireux-app/server/api/registry.post.ts`

