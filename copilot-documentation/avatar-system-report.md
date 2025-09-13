# Avatar system report

Purpose: Inventory where avatars come from, how they’re stored/displayed, known edge cases, and a short plan to centralize defaults and helpers.

Effective: 2025-09-12

## Sources and storage

- Core user avatars
  - Upload path: `core-users/{uid}/avatar.jpg`
  - Uploader: `useMediaStorage.uploadCoreAvatar()` in `useMediaStorage.ts`
  - Ensured during core-user creation: `CoreUser/useCoreUserEnsure.ts` uploads a default if missing.

- App user avatars
  - Avatar field on model: `AppUser.avatar` (string URL)
  - Creation: `AppUser/useAppUserEnsure.ts`
    - Strategy: reuse CoreUser avatar URL, else auth `photoURL`, else a static default.
    - No client-side copy to avoid CORS; URL reuse only.
  - Optional upload (user-initiated): `useMediaStorage.uploadUserAvatar()` → `apps/{appId}/users/{uid}/avatar.jpg`

- External/provider avatars
  - Google or other provider `photoURL` values can be used as-is.
  - Display proxy: `useAvatarProxy.getProxiedAvatarUrl()` via `/api/proxy/google-avatar` for CORS-safe rendering in UI.

## Display and editing touch points

- Header/user UI: `components/layouts/Header.vue` uses `appUser?.avatar`.
- User lists/cards: multiple `UAvatar` and `<img>` bindings use `user.avatar` or `coreUser.avatar`.
- Edit flow: `components/molecules/forms/firestore/AvatarSelection.vue`
  - Shows proxied URL for preview.
  - Calls `uploadUserAvatar(file, uid)` then updates user’s `avatar` with the returned Storage URL.

## Defaults and constants

- Current default fallbacks observed
  - AppUser ensure: `'/img/default-avatar.png'`
  - Some extension UI: `'/default-avatar.png'`
  - Inconsistency: two default paths in code. Standardize to one.

## Edge cases and rules of thumb

- Avoid downloading-and-reuploading Storage URLs on the client (CORS + wasted bandwidth).
- Prefer URL reuse for CoreUser → AppUser at creation time; only copy/upload when a user explicitly selects a new image.
- Use the server proxy only for external provider images at render-time; do not persist proxy URLs to the database.
- For SSR-safe utilities, avoid initializing Firebase just to compute a default string.

## Gaps and cleanups

- Centralized default avatar
  - Introduce `getDefaultAvatarUrl()` in `useMediaStorage.ts` and use it everywhere a default is needed.
  - Expose a single constant `DEFAULT_AVATAR_URL` to prevent drift.

- API surface consolidation (minimal, backwards-compatible)
  - Keep existing upload methods.
  - Add named exports:
    - `DEFAULT_AVATAR_URL: string`
    - `getDefaultAvatarUrl(): string`

## Proposed tiny refactors (phase 1)

- `useMediaStorage.ts`
  - Add and export `DEFAULT_AVATAR_URL` and `getDefaultAvatarUrl()` (no Firebase dependencies).

- `AppUser/useAppUserEnsure.ts`
  - Replace hard-coded `'/img/default-avatar.png'` with `getDefaultAvatarUrl()`.

## Future considerations (phase 2)

- Config override
  - Allow tenants/apps to override the default avatar path via config (e.g., public runtime config) if needed.

- Admin copy (optional)
  - If we need per-app copies of Core avatars, prefer a server/Admin SDK function to copy blobs within Storage.

## Acceptance checks

- New users always have `AppUser.avatar` set: Core URL → auth photoURL → default URL.
- No client-side fetch+reupload of Firebase Storage images.
- All new places needing a default use `getDefaultAvatarUrl()`.
