# FireUX Update Function Matrix

Canonical editors should resolve to a single prop (the object being edited) and delegate all mutations through the composables below. Each function returns a promise that resolves when the Firestore write completes unless otherwise noted.

## App (`useAppUpdate`)

- `updateDescription(description: string)` – trims input, writes `description`, updates `updated_at`.
- `addAdmin(userId: string)` – adds a user id to `admin_ids`; guards empty input.
- `removeAdmin(userId: string)` – removes a user id from `admin_ids`; refuses to drop the last admin.
- `setAdmins(next: string[])` – overwrites `admin_ids` with a sanitized list (no duplicates, no blanks).
- `updateAdmins(next: string[])` – alias of `setAdmins` that reports a distinct action string.
- `updateSocialLinks(next: Partial<SocialLinks>)` – normalizes empty strings to `null`, persists cleaned map.
- `addUserToApp(userId: string, payload?: Partial<AppUserDoc>)` – upserts `apps/{id}/users/{uid}` and bumps `updated_at`.
- `removeUserFromApp(userId: string)` – deletes `apps/{id}/users/{uid}` and bumps `updated_at`.

## User (`useUserUpdate`)

Call `useUserUpdate()` (or `useUser()`) and destructure the explicit action groups below.

- `core.profile.rename(display_name: string)` – writes to `users/{id}` after formatting/validation.
- `core.profile.setAvatarUrl(url: string | null)` – updates `users/{id}` with a cleaned avatar URL.
- `core.profile.uploadAvatar(source: Blob | File)` – uploads to storage, stores the resulting URL.
- `core.tags.add(tagId: string)` / `core.tags.remove(tagId: string)` – mutates the `profiles` array on the core user document.
- `core.notifications.push(message: string)` – appends a new ecosystem-scoped notification entry.
- `app.membership.setRole(role: 'user' | 'admin')` – updates the tenant overlay record; requires an active `appId` and overlay id.
- `app.notifications.push(message: string)` – app-scoped notification helper writing to `apps/{appId}/users/{id}`.

## Professional (`useProfessionalUpdate`)

- `updateDisplayName(display_name: string)`
- `updateAvatar(source: Blob | string)` – uploads avatar and stores resulting URL.
- `setRelevantExperience(items: RelevantExperienceItem[])` – canonicalizes place ids, syncs `places` roster entries, overwrites `relevant_experience`.
- `setOtherExperience(items: OtherExperienceItem[])` – canonicalizes optional place ids, overwrites `other_experience`.

## Agent (`useAgentUpdate`)

All functions accept optional `scope: 'auto' | 'core' | 'app'` (default `auto`).

- `updateDisplayName(display_name: string, scope?)`
- `updateAvatar(source: Blob | string, scope?)` – uploads avatar and stores resulting URL.

## Chef (`useChefUpdate`)

Functions accept optional `scope: 'auto' | 'core' | 'app'` (default `auto`).

- `updateFields(partial: Record<string, unknown>, scope?)`
- `updateDisplayName(display_name: string, scope?)`
- `updateAvatar(source: Blob | string, scope?)`

## Supplier (`useSupplierUpdate`)

- `updateDisplayName(display_name: string)`
- `updateAvatar(avatar: string)` – expects caller to supply a ready URL.

## Generic Profile (`useProfileUpdate`)

- `updateCore(updateData: Record<string, unknown>, id?: string)` – writes to `profileConfig.collectionName` for the given id (or current user when omitted).
- `updateApp(updateData: Record<string, unknown>, id?: string)` – writes to the tenant overlay `apps/{appId}/{collectionName}`; throws when `appId` is unavailable.
- `updateProfile(updateData: Record<string, unknown>, id?: string)` – alias for `updateCore` to support legacy call sites.
- `updating` – `Ref<boolean>` for in-flight state.
- `updateError` – `Ref<Error | null>` populated on failure.

Use these composables directly inside the canonical `User/Edit.vue`-style editors: bind fields to the reactive prop clone, call the appropriate update function per field, and keep formatting/validation in dedicated helpers.
