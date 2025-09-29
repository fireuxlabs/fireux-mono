---
title: User updater (useUserUpdate)
status: draft
updated: 2025-09-26
---

Purpose: Define the contract and usage of the unified user updater composable that persists display name and avatar to the correct Firestore document based on tenant context.

Location: packages/core/fireux-core/src/runtime/composables/firestore/user/useUserUpdate.ts

Key ideas

- Read-only user state comes from VueFire (useCurrentUser + useDocument). This composable only performs writes.
- Uploads are NOT handled here. Upload files first with useMediaStorage (e.g., uploadCoreAvatar) then pass the resulting URL to updateAvatar.
- Target selection:
  - If running inside an app/tenant with appId available: write to apps/{appId}/users/{uid}
  - Otherwise (global role): write to core-users/{uid}
  - No mirroring between core and app at this time.
- Uses updateDocument() from useFirestoreUpdate to get automatic timestamps and app-aware paths.
- Shared helper useScopedUpdater centralizes the tenancy routing logic. It provides updateUsers() for core/app user docs and updateTenantCollection() for tenant-only collections.
- Avatar updates append a version query (?v=timestamp) to bust caches and ensure immediate UI refresh after upload.

API

- updateDisplayName(display_name: string): Promise<void>
  - Validates that a user is authenticated, then updates the selected user doc with { display_name }
- updateAvatar(avatar: string): Promise<void>
  - Accepts a URL (already uploaded). Updates the selected user doc with { avatar }

Example usage (component)

<script setup lang="ts">
import { useUserUpdate } from '#imports'
import { useMediaStorage } from '#imports'

const { updateDisplayName, updateAvatar } = useUserUpdate()
const { uploadCoreAvatar } = useMediaStorage()

async function onSaveName(name: string) {
  await updateDisplayName(name)
}

async function onUpload(file: File, uid: string) {
  // 1) Upload to Storage
  const url = await uploadCoreAvatar(file, uid)
  // 2) Persist URL to Firestore user doc
  await updateAvatar(url)
}
</script>

Notes

- If future behavior requires optionally updating both core and app docs, add a mode flag (e.g., mirror: 'none' | 'core' | 'app' | 'both'). Current default is 'none' (single target only).
- For local dev uploads, ensure Firebase Storage CORS allows localhost:3000 and the required headers (see storage CORS appendix or the CORS snippet in the session notes).
- The helper lives at packages/core/fireux-core/src/runtime/composables/firestore/useScopedUpdater.ts and also powers tenant-only updaters like chefs (via updateTenantCollection).
