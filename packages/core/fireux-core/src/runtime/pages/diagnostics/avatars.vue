<!-- FILE: packages/core/fireux-core/src/runtime/pages/diagnostics/avatars.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Diagnostics · Avatars"
      description="Inspect avatar objects under core-users/ and users/ storage prefixes."
    />

    <UPageBody class="pagebody">
      <div v-if="loading">Loading avatars…</div>
      <div v-else>
        <section v-for="group in avatarGroups" :key="group.prefix">
          <div>
            <h2>Avatars in {{ group.prefix }}/</h2>
            <span>{{ group.items.length }} user(s)</span>
          </div>

          <div>
            <p>
              Copy-ready JSON mapping of id → download URL (null when no avatar
              file is present).
            </p>
            <pre class="overflow-x-auto">{{ group.json }}</pre>
          </div>

          <div v-if="group.items.length > 0">
            <div v-for="avatar in group.items" :key="avatar.path">
              <UAvatar
                v-if="avatar.url"
                :src="avatar.url"
                :alt="avatar.path"
                size="3xl"
              />
              <div v-else>
                <span>No Image</span>
              </div>
              <p>{{ avatar.id }} : {{ avatar.url ?? '(no download URL)' }}</p>
              <p>
                {{ avatar.file }}
              </p>
            </div>
          </div>

          <p v-else>No avatar files found.</p>
        </section>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  getStorage,
  getDownloadURL,
  listAll,
  ref as storageRef,
} from 'firebase/storage'

definePageMeta({
  layout: 'diagnostics',
  title: 'Diagnostics · Avatars',
  description: 'Inspect avatar objects under core-users/ and users/.',
  nav: {
    key: 'dev-avatars',
    label: 'Avatars',
    icon: 'i-lucide-circle-user-round',
    desktop: true,
    group: 'core',
    layouts: ['diagnostics'],
    order: 45,
  },
})

interface AvatarEntry {
  id: string
  file: string
  path: string
  url: string | null
}

interface AvatarGroup {
  prefix: string
  items: AvatarEntry[]
  json: string
}

const avatarGroups = ref<AvatarGroup[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const storage = getStorage()
    const [coreUsers, users] = await Promise.all([
      fetchAvatarGroup(storage, 'core-users'),
      fetchAvatarGroup(storage, 'users'),
    ])

    avatarGroups.value = [coreUsers, users]
  } catch (error) {
    console.error('Failed to load avatar listings', error)
    avatarGroups.value = []
  } finally {
    loading.value = false
  }
})

async function fetchAvatarGroup(
  storage: ReturnType<typeof getStorage>,
  prefix: string
): Promise<AvatarGroup> {
  const groupItems: AvatarEntry[] = []
  const prefixRef = storageRef(storage, prefix)
  const listResponse = await listAll(prefixRef)

  await Promise.all(
    listResponse.prefixes.map(async (userRef) => {
      const id = userRef.name
      const userListing = await listAll(userRef)
      const avatarFile = userListing.items.find((item) =>
        item.name.toLowerCase().startsWith('avatar')
      )

      if (!avatarFile) {
        groupItems.push({
          id,
          file: '(missing)',
          path: `${prefix}/${id}/`,
          url: null,
        })
        return
      }

      try {
        const url = await getDownloadURL(avatarFile)
        groupItems.push({
          id,
          file: avatarFile.name,
          path: avatarFile.fullPath,
          url,
        })
      } catch (error) {
        console.warn(
          `Unable to load avatar for ${id} at ${avatarFile.fullPath}`,
          error
        )
        groupItems.push({
          id,
          file: avatarFile.name,
          path: avatarFile.fullPath,
          url: null,
        })
      }
    })
  )

  groupItems.sort((a, b) => a.id.localeCompare(b.id))

  const jsonPayload = Object.fromEntries(
    groupItems.map((item) => [item.id, item.url ?? null])
  )
  const json = JSON.stringify(jsonPayload, null, 2)

  return { prefix, items: groupItems, json }
}
</script>
