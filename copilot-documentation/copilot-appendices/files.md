# Collected source: updaters, storage, editors, parents, and avatar picker

This document aggregates the full source of the requested files for quick reference.

---

## packages/core/fireux-core/src/runtime/composables/firestore/user/useUserUpdate.ts

```ts
// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserUpdate.ts
import type { Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import type { User } from '../../../models/core/user.model'
import { useFirestoreUpdate } from '../useFirestoreUpdate'
import { useImageStorage } from '../../firebase/useImageStorage'

/**
 * Environment-aware updater for a user's docs.
 * - If `userRef` provided → writes to that user's doc.
 * - Else → writes to the signed-in user's doc.
 * Scopes:
 *   - Global → core-users/{uid}
 *   - Tenant → apps/{appId}/users/{uid}
 * NOTE: This composable only WRITES finalized data; uploading is done elsewhere.
 */
export function useUserUpdate(userRef?: Ref<User | null>) {
  const authRef = useCurrentUser()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()

  const resolveTarget = () => {
    const id = userRef?.value?.id ?? authRef.value?.uid
    if (!id) throw new Error('Not signed in and no userRef.id provided')
    if (isTenant) {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return { collection: `apps/${appId}/users`, id }
    }
    return { collection: 'core-users', id }
  }

  /** Generic partial update for arbitrary user fields */
  const updateFields = async (partial: Partial<User>) => {
    const { collection, id } = resolveTarget()
    await updateDocument<User>(collection, id, partial)
  }

  /** Update display_name in the correct scope */
  const updateDisplayName = async (display_name: string) => {
    await updateFields({ display_name } as Partial<User>)
  }

  /** Avatar: build `${collection}/${id}/avatar` and upload via useImageStorage */
  const updateAvatar = async (source: Blob | string) => {
    const { collection, id } = resolveTarget()
    const path = `${collection}/${id}/avatar`
    const url = await uploadImage(path, source)
    await updateFields({ avatar: url })
    return url
  }

  return { updateFields, updateDisplayName, updateAvatar }
}
```

---

## packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefUpdate.ts

```ts
// packages/core/fireux-core/src/runtime/composables/firestore/profiles/chef/useChefUpdate.ts
import type { Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/firestore/useFirestoreUpdate'
import { useImageStorage } from 'fireux-core/runtime/composables/firebase/useImageStorage'

/**
 * Environment-aware updater for a Chef profile.
 *
 * Behavior mirrors `useUserUpdate`:
 * - If `chefRef` provided → writes to that chef's doc (by `id`).
 * - Else → writes to the signed-in user's chef doc.
 *
 * Scopes:
 *   - Global  → chefs/{uid}
 *   - Tenant  → apps/{appId}/chefs/{uid}
 *
 * NOTE:
 * - This composable only WRITES finalized data (e.g. an avatar DOWNLOAD URL).
 * - Uploading is done elsewhere (e.g. your AvatarPicker / storage utilities).
 */
type WithId = { id: string }

export function useChefUpdate(chefRef?: Ref<WithId | null>) {
  const authRef = useCurrentUser()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { updateDocument } = useFirestoreUpdate()

  const resolveTarget = () => {
    const id = chefRef?.value?.id ?? authRef.value?.uid
    if (!id) throw new Error('Not signed in and no chefRef.id provided')
    if (isTenant) {
      if (!appId) throw new Error('Missing appId for tenant-scoped chef update')
      return { collection: `apps/${appId}/chefs`, id }
    }
    return { collection: 'chefs', id }
  }

  /** Generic partial update for arbitrary chef fields */
  const updateFields = async (partial: Record<string, unknown>) => {
    const { collection, id } = resolveTarget()
    await updateDocument(collection, id, partial)
  }

  /** Update display name */
  const updateDisplayName = async (display_name: string) => {
    await updateFields({ display_name })
  }

  /** Avatar: build `${collection}/${id}/avatar` and upload via useImageStorage */
  const updateAvatar = async (source: Blob | string) => {
    const { collection, id } = resolveTarget()
    const path = `${collection}/${id}/avatar`
    const url = await uploadImage(path, source)
    await updateFields({ avatar: url })
    return url
  }

  return { updateFields, updateDisplayName, updateAvatar }
}
```

---

## packages/core/fireux-core/src/runtime/composables/firebase/useImageStorage.ts

```ts
// packages/core/fireux-core/src/runtime/composables/firebase/useImageStorage.ts
import { useFirebaseStorage } from 'vuefire'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  getStorage,
} from 'firebase/storage'

/**
 * Image Storage (no fallbacks)
 * - Accepts a Blob or URL (URL is fetched via /api/proxy/image)
 * - Uploads to Firebase Storage
 * - Returns the download URL
 */
export function useImageStorage() {
  const storage = useFirebaseStorage()

  const proxiedUrl = (url: string) =>
    url.startsWith('/')
      ? url
      : `/api/proxy/image?url=${encodeURIComponent(url)}`

  async function fetchAsBlob(url: string): Promise<Blob> {
    const proxied = proxiedUrl(url)
    const res = await fetch(proxied, { cache: 'no-store' })
    if (!res.ok) {
      throw new Error(
        `[useImageStorage] fetch failed ${res.status} ${res.statusText}`
      )
    }
    return await res.blob()
  }

  async function toBlob(source: Blob | string): Promise<Blob> {
    return source instanceof Blob ? source : fetchAsBlob(source)
  }

  async function uploadBlobToStorage(
    blob: Blob,
    path: string
  ): Promise<string> {
    const bucket = getStorage()?.app?.options?.storageBucket
    const fileRef = storageRef(storage, path)
    console.log('[useImageStorage] upload', {
      bucket,
      path,
      size: blob.size,
      type: blob.type,
    })

    await uploadBytes(fileRef, blob, { contentType: blob.type })
    const url = await getDownloadURL(fileRef)
    console.log('[useImageStorage] url', url)
    return url
  }

  /**
   * Upload an image to Firebase Storage
   * @param path   Storage path (e.g. "core-users/{uid}/avatar")
   * @param source Blob or URL (required)
   */
  async function uploadImage(
    path: string,
    source: Blob | string
  ): Promise<string> {
    if (!path || !source) {
      throw new Error('[useImageStorage] path and source are required')
    }
    const blob = await toBlob(source)
    return uploadBlobToStorage(blob, path)
  }

  // Optional convenience when you already have a URL
  async function uploadFromUrl(path: string, url: string): Promise<string> {
    const blob = await fetchAsBlob(url)
    return uploadBlobToStorage(blob, path)
  }

  return { uploadImage, uploadFromUrl }
}
```

---

## packages/core/fireux-core/src/runtime/components/organisms/User/Edit.vue

```vue
<!-- packages/core/fireux-core/src/runtime/components/organisms/user/Edit.vue -->
<template>
  <ClientOnly>
    <UCard class="space-y-6">
      <MoleculesFormsFirestoreAvatarPicker
        :src="user?.avatar"
        :alt="user?.display_name || 'User'"
        :update-function="onSaveAvatar"
      />
      <MoleculesFormsFirestoreField
        label="Display Name"
        :firebase-value="user?.display_name"
        placeholder="Enter your display name"
        :update-function="onSaveDisplayName"
      />
    </UCard>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { User } from '../../../models/core/user.model'
import { useUserUpdate } from '../../../composables/firestore/user/useUserUpdate'

defineProps<{ user: User }>()

const { updateDisplayName, updateAvatar } = useUserUpdate()

const onSaveDisplayName = (v: string) => updateDisplayName(v)
const onSaveAvatar = (file: File) => updateAvatar(file)
</script>
```

---

## packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Edit.vue

```vue
<!-- packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Edit.vue -->
<template>
  <ClientOnly>
    <UCard class="space-y-6">
      <MoleculesFormsFirestoreAvatarPicker
        :src="props.chef?.avatar"
        :alt="props.chef?.display_name || 'Chef'"
        :initials="initials"
        :update-function="onSaveAvatar"
      />
      <MoleculesFormsFirestoreField
        label="Display Name"
        :firebase-value="props.chef?.display_name"
        placeholder="Enter your display name"
        :update-function="onSaveDisplayName"
      />
    </UCard>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Chef } from '../../../../models/profiles/Chef.model'
import { useChefUpdate } from '../../../../composables/firestore/profiles/Chef/useChefUpdate'
import { computed } from 'vue'

const props = defineProps<{ chef: Chef }>()
const { updateDisplayName, updateAvatar } = useChefUpdate()

const initials = computed(() => {
  const name = props.chef?.display_name || 'C'
  return name
    .split(' ')
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const onSaveDisplayName = (v: string) => updateDisplayName(v)
const onSaveAvatar = (file: File) => updateAvatar(file)
</script>
```

---

## packages/core/fireux-core/src/runtime/pages/dashboard/user-profile.vue

```vue
<template>
  <UDashboardPanel id="profile">
    <template #header>
      <UDashboardNavbar title="Your Profile" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <client-only>
        <div v-if="user">
          <div class="grid gap-4 md:grid-cols-2">
            <OrganismsUserCardsProfile :user="user" />
            <OrganismsUserEdit :user="user" />
          </div>
        </div>
        <div v-else>
          <UCard>
            <div class="text-center py-8">
              <UIcon
                name="i-heroicons-user-circle"
                class="w-12 h-12 mx-auto mb-4 text-gray-400"
              />
              <p>Loading profile...</p>
            </div>
          </UCard>
        </div>
      </client-only>
    </template>
  </UDashboardPanel>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' })

useHead({ title: 'Your Profile' })

const { user } = useUser()
</script>
```

---

## packages/tenants/fireux-misebox/src/runtime/pages/dashboard/chef-profile.vue

```vue
<template>
  <UPage>
    <UPageBody>
      <OrganismsProfileRoot :config="chefConfig">
        <!-- When a profile exists, render the editor -->
        <template #current-assets="{ profile }">
          <div v-if="profile">
            <h2 class="mb-4">Edit Chef Profile</h2>
            <OrganismsProfilesChefEdit :chef="profile" />
          </div>
        </template>

        <!-- Optional: omit list rendering by leaving #item empty -->
        <template #item="{ profile }"></template>
      </OrganismsProfileRoot>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { chefConfig } from '../../models/profiles/Chef.model'
// Page meta is provided by dashboard layout; explicit meta optional
definePageMeta({ layout: 'dashboard' })
</script>
```

---

## packages/core/fireux-core/src/runtime/components/molecules/forms/firestore/AvatarPicker.vue

```vue
<!-- packages/core/fireux-core/src/runtime/components/molecules/forms/firestore/AvatarPicker.vue -->
<template>
  <div class="avatar-container">
    <UAvatar
      :src="src || ''"
      :alt="alt || 'Avatar'"
      :text="initials || 'U'"
      class="avatar"
    />
    <label class="upload-label">
      <UIcon name="i-lucide-camera" />
      <input
        type="file"
        accept="image/*"
        class="file-input"
        @change="onFileChange"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  src?: string
  alt?: string
  initials?: string
  // Parent-provided handler to process selected file (e.g., upload then update URL)
  updateFunction?: (file: File) => unknown
}>()

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return
  if (props.updateFunction) props.updateFunction(file)
  // reset input so same file can be picked again if desired
  if (input) input.value = ''
}
</script>

<style scoped>
.avatar-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-2);
}
.avatar {
  width: 96px;
  height: 96px;
}
.upload-label {
  position: absolute;
  bottom: -6px;
  right: -6px;
  display: grid;
  place-items: center;
  cursor: pointer;
  background-color: var(--ui-bg-muted);
  padding: 8px;
  border-radius: 9999px;
}
.file-input {
  display: none;
}
</style>
```
