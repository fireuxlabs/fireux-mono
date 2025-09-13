# recentchage.md

Date: 2025-09-12
Scope: Core avatar pipeline, AppUser ensure payload, media storage utilities, docs

## Why

- Prevent Firestore `invalid-argument` errors caused by `avatar: undefined` during AppUser creation.
- Ensure every CoreUser has a valid, non-empty avatar URL from day one.

## What changed

- CoreUser ensure: default avatar
  - File: `packages/core/fireux-core/src/runtime/composables/firestore/CoreUser/useCoreUserEnsure.ts`
  - Behavior:
    - Prefer existing CoreUser `avatar` → auth `photoURL` → upload default asset to core storage and use returned URL; fallback to static if upload fails.
    - Renamed local `u` → `user` for clarity.
  - Key code:
    - Uses `useMediaStorage().uploadCoreAvatar('/img/default-avatar.png', user.uid)` and falls back to `'/img/default-avatar.png'`.

- Media storage util: core avatar uploader
  - File: `packages/core/fireux-core/src/runtime/composables/firebase/useMediaStorage.ts`
  - Additions:
    - `sourceToBlob(source: File | string)` supporting File, data URL, or http(s)/relative URL.
    - `uploadCoreAvatar(source, uid)` → writes to `core-users/{uid}/avatar.jpg` (no `apps/{appId}` prefix).
    - `uploadImage` now uses `sourceToBlob`.

- AppUser ensure: guard avatar payload
  - File: `packages/core/fireux-core/src/runtime/composables/firestore/AppUser/useAppUserEnsure.ts`
  - Change:
    - Include `avatar` only when defined: `...(appAvatarUrl ? { avatar: appAvatarUrl } : {})`.

- Documentation
  - Added: `copilot-documentation/coreuser-avatar-creation.md` (default avatar plan + backfill outline)
  - Added: `copilot-documentation/default-avatar.md` (namespaces, flows, and wiring)

## Storage paths (now canonical)

- Core avatar: `core-users/{uid}/avatar.jpg` (public download URL after upload)
- App-scoped copy (unchanged): `apps/{appId}/users/{uid}/avatar.jpg`
- Static fallback (no upload): `/img/default-avatar.png`

## Impact

- New CoreUsers always have a valid `avatar` string → AppUser creation no longer fails on undefined avatar.
- Core avatar exists in an app-agnostic namespace; apps can copy if/when needed.

## Risks / compatibility

- Requires the default asset `/img/default-avatar.png` to be present in public assets.
- Upload occurs client-side (uses Canvas/Image) → on SSR or no-canvas contexts we rely on static fallback path.
- No schema changes; only payload behavior and utilities extended.

## Quality gates

- Typecheck: changed files show no TypeScript errors.
- Linting: informational warnings remain
  - Nested callback depth in `useMediaStorage.ts` (canvas toBlob path).
  - Cognitive complexity in `ensureAppUser` function.
- Runtime: avatar field is guaranteed non-empty string in CoreUser ensure; AppUser payload omits undefined avatar.

## How to validate (quick)

- New sign-in flow on any app:
  1. Sign in, ensure CoreUser is created.
  2. Check Firestore `core-users/{uid}` → avatar is a full URL or `/img/default-avatar.png`.
  3. Trigger AppUser creation on a tenant app → no Firestore invalid-argument on avatar.

## Follow-ups (optional)

- Add `scripts/backfill-core-avatars.ts` to set avatars for legacy CoreUsers.
- Replace static default with generated initials SVG→PNG for a personalized default.
- Refactor the two lint hotspots (nesting/complexity) when convenient.
