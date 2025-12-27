# FireUX User — field map + relationships (temp)

Dashboard-specific notes now live in:
- temp/dashboard/overview.md (for /dashboard)
- temp/dashboard/users.md (for /dashboard/user-profile)

Goal: give a practical rundown of what a **User** is in this repo, which Firestore docs it touches, and how it relates to Apps / AppUsers / Profiles so you can ideate a richer dashboard.

This is based on:
- [packages/core/fireux-core/src/runtime/models/core/user.model.ts](packages/core/fireux-core/src/runtime/models/core/user.model.ts)
- user fetch/ensure/update helpers under `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/`

---

## 1) Core identity: `/users/{uid}` (canonical)

The canonical user record lives at:
- Firestore doc: `/users/{uid}`
- Model: `User`

### `User` fields (current)

Required:
- `id: string`
- `display_name: string`
- `avatar: string`
- `created_at: FirebaseTimestamp`

Optional identity:
- `handle?: string`
- `email?: string`
- `bio?: string`
- `updated_at?: FirebaseTimestamp`

Membership:
- `profiles?: string[]`
- `userOf?: string[]` — array of app IDs the user belongs to
- `adminOf?: string[]` — array of app IDs the user admins

Tenant overlay (computed/attached at runtime):
- `role?: 'user' | 'admin'` — not always stored on the core doc; may be derived from app overlay
- `appUser?: AppUser | null` — the app-scoped overlay doc (see below)

Notifications:
- `notifications?: UserNotification[]`

### Notes on how it’s used
- The UI often treats `User` as “the thing to render”, even in tenant mode.
- In tenant mode, the app overlay may override role: see the merge in `useUserFetch`.

---

## 2) App-scoped membership overlay: `/apps/{appId}/users/{uid}`

This is the per-app overlay that tracks the user’s role *inside* an app.

- Firestore doc: `/apps/{appId}/users/{uid}`
- Model: `AppUser`

### `AppUser` fields (current)
- `id: string` (same as uid)
- `role: 'user' | 'admin'`
- `creator_id: string` (who created/added this membership)
- `created_at: FirebaseTimestamp`
- `updated_at?: FirebaseTimestamp`
- `notifications?: UserNotification[]` (app-scoped)

### How it relates to `/users/{uid}`
- The core doc mirrors membership IDs in arrays (`userOf`, `adminOf`).
- The app overlay doc is the source of truth for app-local role and app-local notifications.
- In runtime, `useUserFetch` merges these:
  - if only core exists: returns core
  - if core + appUser exist: returns `{ ...core, role: appUser.role ?? core.role, appUser }`

---

## 3) Notifications: user-level and app-level

Model:
- `NotificationScope = 'ecosystem' | 'app'`
- `UserNotification`:
  - `id`, `message`, `scope`, `created_at`
  - `read?: boolean`
  - `app_id?: string` (used when `scope: 'app'`)

Write paths:
- Core notification push writes into `/users/{uid}.notifications` using `arrayUnion`.
  - Implemented in `useCoreUserUpdate().notifications.push(...)`.
- Membership ensure flows also push notifications when joining apps.

Dashboard ideas this enables:
- “What changed since last visit?” stream
- “You joined X”, “You were promoted to admin”, “New onboarding step”
- scoped filtering (ecosystem vs app)

---

## 4) Profiles: user ties to other entity collections

You have a dedicated **Profile domain** in core. Profiles are separate entities (e.g. domain-specific records) that reference a user.

Where profiles can live:
- Global: `/{collectionName}/{profileId}`
- Tenant-local: `/apps/{appId}/{collectionName}/{profileId}`

How user resolution works:
- `useProfileCollection` hydrates profiles with a user display snapshot.
- It pulls user info from:
  1) the enriched user collection for the active app (`useUserCollection`) and
  2) falls back to direct core lookups in `/users/{uid}`.

Dashboard ideas this enables:
- show “your profiles” across domains (jobs, places, products, etc.)
- show “profiles missing info” or “profiles you own/admin”

---

## 5) Membership mechanics: how a user joins apps

Conceptually there are three linked things:

1) `/apps/{appId}`
- has governance fields like `admin_ids` and `join_requests`

2) `/apps/{appId}/users/{uid}`
- the per-app membership overlay (`AppUser`)

3) `/users/{uid}`
- mirrors membership IDs in `userOf` / `adminOf`

The ensure helper `ensureUserAppMembership(...)` performs:
- create `/apps/{appId}/users/{uid}` if missing
- ensure `/users/{uid}` exists
- update `/users/{uid}.userOf` and possibly `.adminOf`
- optionally push a notification

Admin promotion/demotion cascades:
- `useAppUserUpdate` and `useAppUpdate` update:
  - `/apps/{appId}/users/{uid}.role`
  - `/apps/{appId}.admin_ids`
  - `/users/{uid}.adminOf` (mirror)

---

## 6) Role resolution (global vs tenant)

There are effectively **two role concepts**:

- **Global role** (ecosystem-wide): stored on `/users/{uid}.role` sometimes
- **Tenant role** (within an app): stored in `/apps/{appId}/users/{uid}.role`

The UI helpers resolve admin status roughly like:
- If global runtime: user is admin if `user.role === 'admin'` OR `adminOf` is non-empty
- If tenant runtime: user is admin if `appUser.role === 'admin'` OR user is in `adminOf` for active `appId`

Dashboard ideas this enables:
- show admin-only modules/CTA
- show “you are admin of X apps” badge

---

## 7) The “user.apps” branding overrides (dashboard logos)

Some dashboard components treat `user.apps` as an *optional* per-user override bucket.

Important: `user.apps` is **not typed in the `User` interface** right now; it’s accessed as an untyped field.

Shapes supported by UI code:
- object map: `user.apps[appId] = { avatar_url | logo_url | wordmark_url | ... }`
- array form: `user.apps = [ { id/app_id/appId: '...', avatar_url/logo_url/... }, ... ]`

Usage:
- used to override app branding for the current user (e.g. custom avatar/logo)
- falls back to `apps/{appId}.avatar_url/logo_url/wordmark_url` if not present

Dashboard ideas:
- per-user “favorite app icon” / “pin” / “hide”
- per-user “custom label” or “grouping” for apps

---

## 8) Summary diagram

- `/users/{uid}` (User)
  - identity + membership mirrors + notifications
  - `userOf[]` / `adminOf[]` reference app IDs
  - `profiles[]` references profile IDs (or tag-like IDs) depending on conventions

- `/apps/{appId}` (App)
  - contains `admin_ids[]`, `join_requests[]`, and branding urls

- `/apps/{appId}/users/{uid}` (AppUser)
  - per-app role + per-app notifications

- `/{profilesCollection}/{profileId}` and `/apps/{appId}/{profilesCollection}/{profileId}` (Profile)
  - encourages “user as owner” relationships via `profile.user.id` (or profile ID == uid)

---

## 9) “Rich user” idea prompts (based on existing primitives)

These are grounded in the fields already present:
- Progress: use `profileComplete` (computed from display_name/handle/bio/avatar)
- Membership: show `userOf/adminOf` as “My apps”, with per-app role badges
- Notifications: show scoped inbox (ecosystem + app)
- Profiles: show “My profiles” and “recently updated”
- Per-user app preferences: standardize `user.apps` into a typed structure (future)

