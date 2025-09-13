---
agent-import:
  source: profile-creation.md
  imported: 2025-09-12
  note: This file was imported for AI agent context. Treat below as legacy human docs.
---

# Profile Creation (Core-only)

Purpose: define a simple, consistent profile creation flow that does NOT create tenant app users. We now create only a CoreUser document and defer any app-specific data.

## Goals

- Single source of truth for identity: `core-users/{uid}` only.
- No writes to tenant collections like `apps/<appId>/users/*` during sign-up/onboarding.
- Keep minimal, portable fields on CoreUser; app context is via `userOf`/`adminOf`.

## Data model (reference)

CoreUser (from `packages/core/fireux-core/src/runtime/models/core/coreUser.model.ts`):

- id: string (Auth UID)
- email: string
- display_name?: string
- avatar?: string
- userOf: string[]
- adminOf: string[]
- created_at: string | Date | FirebaseTimestamp
- updated_at?: string | Date | FirebaseTimestamp
- profiles?: string[]

Notes:

- `profiles` is an optional, global badge list (e.g., ["chef", "supplier"]). Avoid writing tenant-only flags here.
- Avatar is global. If per-app avatars are needed later, store them in an app-scoped settings doc, not an app user.

## Creation flow (happy path)

1. Auth success (Email/Password, OAuth, etc.) yields `uid`, `email`, and possibly `displayName`, `photoURL`.
2. Call `ensureCoreUser(uid, seed, options)` once:
   - If doc exists: merge-update minimal fields and timestamps.
   - If missing: create with seed & defaults.
3. Route to app; UI reads only from `core-users/{uid}`.

Seed fields (safe defaults):

- email: from auth
- display_name?: `auth.displayName || email || undefined`
- avatar?: `auth.photoURL || undefined`
- userOf: include current `appId` on first visit (optional; see below)
- adminOf: empty unless you explicitly elevate
- profiles?: only if onboarding collects global badges
- created_at: server timestamp
- updated_at: server timestamp

## Contract: ensureCoreUser

Inputs:

- uid: string
- seed: Partial<CoreUser> (at least `{ email }`)
- options?: `{ addMembership?: boolean; appId?: string }`

Behavior:

- Upsert `core-users/{uid}` with merge.
- If `options.addMembership && options.appId`, add to `userOf` (array-union).
- Never touch `apps/<appId>/users`.

Outputs:

- The merged CoreUser snapshot or void.

Error modes:

- Permission denied: log + show retry.
- Network/offline: queue a retry; avoid duplicate docs.

Pseudo-code:

```
const doc = await getDoc(coreUsersDoc(uid))
const payload = {
  email: seed.email,
  display_name: seed.display_name ?? auth.displayName ?? seed.email,
  avatar: seed.avatar ?? auth.photoURL,
  ...(options?.addMembership && options.appId
    ? { userOf: FieldValue.arrayUnion(options.appId) }
    : {}),
  created_at: doc.exists() ? doc.data().created_at : serverTimestamp(),
  updated_at: serverTimestamp(),
  ...(Array.isArray(seed.profiles) && seed.profiles.length
    ? { profiles: Array.from(new Set(seed.profiles)) }
    : {}),
}
await setDoc(coreUsersDoc(uid), payload, { merge: true })
```

## Where behavior changes (do NOT do this anymore)

- Do not write to `apps/<appId>/users/{uid}`.
- Do not store tenant-only settings (preferences, addresses, subscriptions, etc.) on CoreUser.
- Do not use legacy `AppUser` checks for access (e.g., `isAppUser`, `isPro`). Use CoreUser + capability checks.
- Do not block app entry on missing app-user; create/merge CoreUser transparently.

## Places to update (flagged)

- Auth callbacks/hooks in each app under `projects/*/*` (where we previously created app users).
- Onboarding forms that wrote to `apps/<appId>/users/{uid}`.
- Profile edit flows calling app-user update composables.
- Any Cloud Functions triggers listening to app-user paths; repoint to `core-users` or retire.
- Firestore rules allowing writes to `apps/<appId>/users/*`.

## Firestore rules

- Block writes to legacy tenant user path to prevent regressions:

```
match /databases/{db}/documents {
  match /apps/{appId}/users/{uid} {
    allow read: if false;
    allow write: if false;
  }
  match /core-users/{uid} {
    allow read: if request.auth != null;
    allow write: if request.auth != null && request.auth.uid == uid;
  }
}
```

- Keep admin elevation guarded by server/callable.

## Migration and cleanup

- Migration has populated `core-users` from Misebox app users.
- Delete legacy app users using the migration script with `--delete` when ready.
- Remove or refactor code paths that depend on `AppUser` (composables, guards, UI components).

## QA checklist

- Sign-up → CoreUser created; no tenant user.
- Re-login → CoreUser `updated_at` updated; no duplicates.
- Switch apps → `userOf` grows by one (optional flow if enabled).
- Profile edit → CoreUser fields update correctly.
- Rules deny any write to `apps/<appId>/users/*`.

## Next steps

- Wire `ensureCoreUser` in shared auth callback(s).
- Remove legacy app-user creation calls and UI dependencies.
- Add rules to block legacy writes and deploy.
- Introduce app-scoped settings collections as needed (without creating app users).
