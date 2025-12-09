# Core Composables Inventory (temp)

Updated: 2025-12-07
Scope: `packages/core/fireux-core/src/runtime/composables`
Intent: quick, human-friendly map of FireUX core composables (global + tenant overlays). Descriptive only; not a spec.

## Legend (roles)

- Facade: entry point bundling fetch/computed/actions.
- Fetch/State: raw Firestore listeners or computed merges.
- Ensure: creates/backs up required docs.
- Mutate: write/update helpers.
- UI: view-model mappers / UX glue.
- Stub: placeholder; not wired yet.

## At-a-glance (by domain)

- Core runtime: config, auth/storage, onboarding helpers, nav macros, toast/clipboard, dev health, Nuxt state atoms.
- Firestore plumbing: operations CRUD/search, scoped loaders, ensure helpers, util queries.
- Users: fetch/merge core+app, ensure core+membership, updates (profile/avatar/tags/notifications/roles), UI mappers, collection hydrator.
- Profiles: fetch core+app, ensure, updates, collection with user enrichment.
- Apps (tenants): fetch/collection, ensure app doc + membership, updates (content/social/avatar/admins), join-requests helper, env check.
- Stubs/gaps: delete handlers (user/profile/app), `firestore/objects` empty.

## Core layer

- `core/config/FireUXConfig.ts` (Facade) — runtime config (appId, ecosystem, role, tenant/global flags, URLs, branding).
- `core/firebase/useAuth.ts` (Fetch/State) — VueFire auth refs; sign-in/out; `useRequireUser.ts` blocks until resolved; `useImageStorage.ts` uploads and serves defaults.
- `core/app/useAppOnboarding.ts` (State) — onboarding steps/status; utils: `useAvatarProxy.ts` (fallback avatar), `useBreadcrumbs.ts` (label/path helpers), `useEditHandler.ts` (mutation guard wrapper).
- `core/routing/nav/defineNav.ts` (UI) — macro emitting page `nav` meta; presets `presets.ts` (default/landing/dashboard/dev); `useNav.ts` builds filtered nav from router + tenant mode.
- `core/ui/useToastify.ts` (UI) — toast bus; `core/dev/useDevClipboard.ts` (UI) — copy with dev logging.
- `core/dev/health/useDevHealth.ts` (Facade) — aggregates dev health checks; `checks/useDevAdminHealth.ts` emits admin-account status; `types.ts` shapes.
- `state/useAppState.ts`, `useUserState.ts`, `useProfileState.ts` (State) — Nuxt atoms (app data/loading; user; profile-by-type).

## Firestore operations & utils

- `operations/*` (Mutate/Fetch) — CRUD/search wrappers plus `useFirestoreManager.ts` for typed set/update.
- `utils/useEnsureCommon.ts` (Ensure) — `requireUid()`, avatar upload with candidate fallbacks.
- `utils/useFirestoreUtils.ts` (Fetch/Mutate) — tenant-aware collection paths, uniqueness checks, field/subcollection queries.
- `utils/useScoped.ts` (Fetch/UI) — load core/app collections or docs with tenant-aware fallback, projector hook, loading flags.

## Firestore core: users

- Facade: `firestore/core/user/useUser.ts` — auth uid fetch, exposes CTA/admin flags, UI mappers, ensure/update/delete helpers.
- Fetch/State: `main/useUserFetch.ts` (core+app doc merge), `state/useUserComputed.ts` (cta/admin/profile keys), `state/useUserInterface.ts` (pill/cell/profile view models), `main/useUserCollection.ts` (hydrates app members with core docs).
- Ensure: `core/useCoreUserEnsure.ts` (ensure `/users/{uid}`), `app/useUserEnsure.ts` alias `useAppUserEnsure` (core ensure + tenant membership + optional redirect). Helpers: `utils/ensureHelpers.ts` (create core doc, ensure app membership, notifications, handle generator).
- Mutate: `mutations/useCoreUserUpdate.ts` (rename, avatar set/upload, bio, tags, notifications), `mutations/useAppUserUpdate.ts` (role change, app-scoped notifications), `mutations/useUserUpdate.ts` (aggregates core+app actions, uid fallbacks), `utils/forms/useUserFormatting.ts` (normalize/validate display name, handle, email, bio, avatar URL).
- Delete: `delete/useUserDelete.ts` (Stub) — logs only.
- UI: `state/useUserInterface.ts` (admin-aware pills/cells/profiles with runtime metadata).

## Firestore core: profiles

- Facade: `firestore/core/profile/useProfile.ts` — auth-uid fetch wrapper (core/app refs only).
- Fetch/State: `main/useProfileFetch.ts` (core/app listeners), `state/useProfileComputed.ts` (merge app overlay onto core), `collection/useProfileCollection.ts` (core+tenant collections with user enrichment).
- Ensure: `core/useProfileEnsure.ts` (creates core doc and tenant doc; tags user.profile).
- Mutate: `mutations/useProfileUpdate.ts` (updates core vs tenant scope based on role/scope param).
- Delete: `delete/useProfileDelete.ts` (Stub).

## Firestore core: apps (tenants)

- Facade: `firestore/core/app/useApp.ts` — bundles fetch/computed/interface helpers.
- Fetch/State: `data/fetch.ts` (`useAppFetch` by id), `state/computed.ts` (`isInitialized`, adminIds, current-user admin), `state/interface.ts` (card/pill/cell props), `main/useAppCollection.ts` (all apps), `data/users.ts` (tenant users), `internal/useAppJoinRequests.ts` (maps join_requests, approve/reject wiring).
- Ensure: `data/ensure.ts` (`useAppEnsure`) creates `/apps/{appId}` with creator admin + ensures membership.
- Mutate: `actions/update.ts` (`useAppUpdate`) updates description/instagram/avatar, upload avatar, handle join requests, toggle admin role; `internal/forms/validation.ts` + `.../formatting.ts` for app field validation/format. `actions/delete.ts` (Stub) for cascading delete.
- Env/onboarding: `internal/useEnvCheck.ts` (fetch `/api/app/env-check` summary); `core/app/useAppOnboarding.ts` tracks onboarding progress.

## Firestore scoped/general

- `firestore/utils/useScoped.ts` — scoped doc/collection loader with projector hooks; `getScopedDoc` legacy helper.
- `firestore/objects/` — empty placeholder.

## Firestore operations (shared)

- `operations/useFirestoreCreate.ts`, `useFirestoreRead.ts`, `useFirestoreUpdate.ts`, `useFirestoreDelete.ts`, `useFirestoreSearch.ts`, `useFirestoreManager.ts` — VueFire/Firestore wrappers for typed paths and status flags.

## Dev layer

- `dev/health/*` — see core/dev health; re-export at `composables/dev/health/useDevHealth.ts`.

## UI layer

- `ui/useToastify.ts` — toast emitter (string + options).

## State wrappers (top-level)

- `state/useAppState.ts`, `state/useUserState.ts`, `state/useProfileState.ts` — Nuxt state atoms for app/user/profile slots.

## Notable stubs / gaps

- App delete (`firestore/core/app/actions/delete.ts`), Profile delete (`firestore/core/profile/delete/useProfileDelete.ts`), User delete (`firestore/core/user/delete/useUserDelete.ts`).
- `firestore/objects/` empty.

## Quick reading order

1. `core/config/FireUXConfig.ts`
2. `core/firebase/useAuth.ts` + `useRequireUser.ts`
3. `firestore/core/user/useUser.ts` and `firestore/core/app/useApp.ts`
4. `firestore/utils/useScoped.ts` + `operations/*`
5. `core/routing/nav/*`
