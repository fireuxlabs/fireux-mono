# core-app-user.md

Purpose: Document current CoreUser and AppUser models, ensure flows, and creation payloads/paths to assist debugging and refactors.

Effective: 2025-09-12

Scope: FireUX core and tenant apps (king vs tenant behavior noted).

## Models

- CoreUser (`packages/core/fireux-core/src/runtime/models/core/coreUser.model.ts`)
  - id: string (auth UID / doc id)
  - email: string
  - display_name?: string
  - avatar?: string
  - userOf: string[]
  - adminOf: string[]
  - created_at: FirebaseTimestamp | string | Date
  - updated_at?: FirebaseTimestamp | string | Date
  - profiles?: string[]

- AppUser (`packages/core/fireux-core/src/runtime/models/core/appUser.model.ts`)
  - id: string (doc id, equals uid typically)
  - uid: string (auth UID)
  - email: string
  - display_name: string
  - avatar?: string
  - handle?: string
  - role?: 'user' | 'admin'
  - created_at: FirebaseTimestamp | string | Date
  - updated_at?: FirebaseTimestamp | string | Date

## Ensure flows

- CoreUser ensure
  - File: `runtime/composables/firestore/CoreUser/useCoreUserEnsure.ts`
  - Path: `core-users/{uid}`
  - Behavior:
    - Requires current auth user with uid/email
    - Merges payload
    - Payload fields:
      - id, email, display_name (pref auth.displayName), avatar (from auth.photoURL if present)
      - timestamps: created_at (on first), updated_at (always)

- AppUser ensure
  - File: `runtime/composables/firestore/AppUser/useAppUserEnsure.ts`
  - Path: `apps/{appId}/users/{uid}`
  - Behavior:
    - Requires appId from `useFireUXConfig()` and current auth user
    - Ensures CoreUser exists first (imports `useCoreUserEnsure` if not provided)
    - Fetches app doc at `apps/{appId}` to determine admin_ids
    - Builds slug/handle via `useAppUserUtils()`
    - Attempts to copy avatar from core storage to app storage via `useMediaStorage.uploadUserAvatar()` (if core avatar URL contains `core-users`)
    - Payload fields:
      - uid, email, role ('admin' if uid in app.admin_ids else 'user')
      - display_name (email initially)
      - avatar: app-specific URL (or core avatar URL fallback)
      - handle, slug, bio: ''
    - Adds timestamps via `useFirestoreCreate.setDocument`
    - Updates `core-users/{uid}`: `userOf += appId`

## Known error (current)

- Error surfaced during tenant app user creation:
  - `FirebaseError: invalid-argument: setDoc called with invalid data. Unsupported field value: undefined (found in field avatar in document apps/{appId}/users/{uid})`
  - Likely cause:
    - `coreUserData.avatar` is undefined and the "copy avatar" fetch block runs or the computed `appAvatarUrl` remains undefined
    - When no avatar exists on core user and the copy fails or never runs, `avatar` field may be undefined in the payload
  - Suggested fix:
    - Ensure avatar is either a valid string URL or omitted entirely. Modify payload build:
      - Only include `avatar` key when we have a non-empty string (do not set undefined)
      - Example:
        ```ts
        const appUserData: Partial<AppUser> = {
          uid,
          email: coreUserData.email,
          role: app.admin_ids?.includes(uid) ? 'admin' : 'user',
          display_name: coreUserData.email,
          handle: generateHandle(coreUserData.email),
          slug,
          bio: '',
          ...(appAvatarUrl ? { avatar: appAvatarUrl } : {}),
        }
        ```

## File references

- CoreUser model: `packages/core/fireux-core/src/runtime/models/core/coreUser.model.ts`
- AppUser model: `packages/core/fireux-core/src/runtime/models/core/appUser.model.ts`
- Ensure core user: `packages/core/fireux-core/src/runtime/composables/firestore/CoreUser/useCoreUserEnsure.ts`
- Ensure app user: `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUserEnsure.ts`
- Utils used by ensure:
  - `useAppUserUtils()` (handle/slug): `.../AppUser/useAppUserUtils.ts`
  - `useMediaStorage.uploadUserAvatar()`
  - `useFirestoreCreate.setDocument()` (adds timestamps)

## Next steps

- Patch `useAppUserEnsure.ts` to conditionally include `avatar` only when defined.
- Optionally: if copying fails, fall back to a deterministic placeholder avatar per app.
- Add a small unit/integration test for ensureAppUser payload assembly with core user having/without avatar.
