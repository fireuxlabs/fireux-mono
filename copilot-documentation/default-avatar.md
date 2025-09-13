# default-avatar.md

Purpose: Describe our default avatar strategy, storage layout, and how to seed a default image so avatar URLs are always valid.

Effective: 2025-09-12

## What we already have

- Upload utilities:
  - `useMediaStorage.uploadUserAvatar(source, uid)` builds a path under `apps/{appId}/users/{uid}/avatar.jpg` and returns a public URL.
  - `useAppFirebaseStorage.uploadFile(path, blob)` is the low-level uploader.
- Ensure flows:
  - `useCoreUserEnsure` currently writes `{ avatar: u.photoURL }` when present but does not create a default.
  - `useAppUserEnsure` copies a core avatar into app storage if the URL contains `core-users` and otherwise uses the core URL directly. It can currently pass `undefined` if no avatar is set.
- Assets present in hosted apps:
  - Several projects reference `/img/default-avatar.png`, indicating we have a static default asset available in app public folders.

## Storage namespaces

- Core namespace (proposed): `core-users/{uid}/avatar.png`
  - Canonical location for a user's default/generated avatar.
- App namespace (existing): `apps/{appId}/users/{uid}/avatar.jpg`
  - When an AppUser is created, we may copy the core avatar here for per-app storage.

## Default avatar source

- Primary: generated initials avatar (SVG→PNG) uploaded to `core-users/{uid}/avatar.png` using `useMediaStorage` (or a core-aware variant).
- Fallback: static asset URL, e.g. `/img/default-avatar.png` (must exist in each app’s public folder or a shared assets module).

## Where to plug it in

- Core: `useCoreUserEnsure.ts`
  - If no `photoURL` and no existing `avatar`, generate/upload default and set `avatar`.
- App: `useAppUserEnsure.ts`
  - Use `...(appAvatarUrl ? { avatar: appAvatarUrl } : {})` so undefined is never written.

## Implementation notes

- `useMediaStorage` paths are app-scoped. For core avatars, either:
  1. Extend `useMediaStorage` with `uploadCoreUserAvatar(file, uid)` → `core-users/{uid}/avatar.png` (no `apps/{appId}` prefix), or
  2. Temporarily reuse `useAppFirebaseStorage.uploadFile('core-users/...')` directly in CoreUser ensure.
- Always guard writes: never set `avatar: undefined`.
- SSR-safe: generation should occur in client or Nitro server context; if unavailable, write static fallback path.

## Minimal contract

- Input: `{ uid, email, displayName, photoURL }`
- Output: a non-empty avatar URL in CoreUser; AppUser inherits or copies.
- Error handling: upload failures fall back to static `/img/default-avatar.png`.

## Next steps

- Add `uploadCoreUserAvatar` utility or inline path upload in `useCoreUserEnsure`.
- Patch `useAppUserEnsure` to omit undefined `avatar`.
- Optional: backfill script to set avatars for existing core users missing one.
