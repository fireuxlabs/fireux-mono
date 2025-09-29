---
title: Avatar system — storage, URLs, ensure, update
status: draft
updated: 2025-09-26
---

Purpose: Document how avatars work end-to-end: storage layout, URL semantics, creation/ensure flows, update flows, cache/CORS, and the key source files.

## High-level model

- Canonical fields
  - Core user doc (core-users/{uid}): avatar: string
  - App user doc (apps/{appId}/users/{uid}): avatar: string
- Storage strategy
  - We pin avatar objects to stable paths to keep URLs stable:
    - Core: core-users/{uid}/avatar.jpg
    - App: apps/{appId}/users/{uid}/avatar.jpg (future; currently only core uploader exists)
- URL semantics
  - After upload, we fetch a public download URL via Firebase Storage and persist it in Firestore.
  - Because download URLs can be cached and our object path is stable, we append a version query (?v=timestamp) on writes to force refresh in the UI.

## Upload pipeline

- Upload API: useImageStorage.uploadImage(path: string, source: File | string): Promise<string>
  - Resizes client-side to JPEG (max width ~400), uploads to the provided path (e.g., core-users/{uid}/avatar.jpg), returns a download URL.
  - On failures (e.g., remote CORS while fetching source), falls back to DEFAULT_AVATAR_URL.
- Storage SDK wrapper: useFirebaseStorage.uploadFile(path, blob)
  - Thin wrapper for uploadBytes + getDownloadURL.

Key files

- packages/core/fireux-core/src/runtime/composables/firebase/useImageStorage.ts
- packages/core/fireux-core/src/runtime/composables/firebase/useFirebaseStorage.ts

## Creation/ensure flows

- useUserEnsure
  - Ensures core user doc exists; picks a safe source for avatar in order:
    1. user.core.avatar
    2. auth.photoURL
    3. default avatar
  - Uploads to core path via uploadImage(`core-users/${uid}/avatar.jpg`, source) and writes resulting URL to core-users/{uid}. If CORS/resize fail, uses default URL.
  - In tenant context, also ensures app user doc with avatar defaulting to core avatar URL.

Key file

- packages/core/fireux-core/src/runtime/composables/firestore/user/useUserEnsure.ts

## Update flows

- Shared routing helper: useScopedUpdater (routes users to core/app and supports tenant-only collections)
  - Routes writes to core or app based on tenancy (global → core-users; tenant → apps/{appId}/collection)
  - Avoids tagging core users with appId; blocks global writes to tenant-only collections.
- User updater: useUserUpdate()
  - updateDisplayName(name): writes to the correct user doc
  - updateAvatar(url): writes avatar URL and appends ?v=timestamp to force refresh
- Chef updater (tenant-only): useChefUpdate()
  - Same pattern; updateAvatar(url) writes versioned URL

Key files

- packages/core/fireux-core/src/runtime/composables/firestore/useScopedUpdater.ts
- packages/core/fireux-core/src/runtime/composables/firestore/user/useUserUpdate.ts
- packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefUpdate.ts

## Display and proxy

- AvatarSelection.vue displays the avatar and handles file input; uses:
  - useImageStorage.uploadImage(`core-users/${uid}/avatar.jpg`, file) → upload
  - useUserUpdate.updateAvatar(url) → persist
  - useAvatarProxy.getProxiedAvatarUrl(url) → proxy Google profile images via /api to avoid GET CORS

Key file

- packages/core/fireux-core/src/runtime/components/molecules/forms/firestore/AvatarSelection.vue
- packages/core/fireux-core/src/runtime/composables/app/utils/useAvatarProxy.ts
- packages/core/fireux-core/src/runtime/server/api/proxy/google-avatar.ts

## Storage paths and helpers

- AvatarManager utilities
  - getCoreUserAvatarPath(uid): core-users/{uid}/avatar
  - getAppUserAvatarPath(appId, uid): {appId}/users/{uid}/avatar
  - generateStorageUrl(bucket, path): build a public API endpoint URL
  - isAppSpecificAvatar / isCoreUserAvatar / isExternalAvatar helpers

Key file

- packages/core/fireux-core/src/runtime/models/utils/avatarManager.ts

## CORS and caching

- CORS
  - Uploads require proper bucket CORS settings. Ensure localhost:3000 and the Firebase upload headers are allowed in dev.
  - GET display of Google-hosted images is proxied via server/api to bypass their CORS; this does not affect Storage uploads.
- Caching
  - Because avatar object path is stable, append a version query on writes to force cache refresh in clients/CDNs.

## Open items / future

- Add app-scoped avatar uploader: uploadAppUserAvatar(file, appId, uid) → apps/{appId}/users/{uid}/avatar.jpg for explicit app-specific avatars.
- Consider centralizing the versioning step in useImageStorage (e.g., a helper to append ?v=timestamp) to DRY.
- Optionally propagate core avatar changes to app user docs when appropriate (policy decision).
