<!-- FILE: packages/core/fireux-core/src/runtime/pages/dev/avatars.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Dev · Avatars"
      description="Inspect avatar objects under core-users/ and users/ storage prefixes."
    />

    <UPageBody class="pagebody">
      <div v-if="loading" class="text-sm text-gray-500">Loading avatars…</div>
      <div v-else class="space-y-10">
        <section
          v-for="group in avatarGroups"
          :key="group.prefix"
          class="space-y-4"
        >
          <div class="flex items-baseline justify-between gap-4">
            <h2 class="text-lg font-medium">Avatars in {{ group.prefix }}/</h2>
            <span class="text-xs text-gray-500"
              >{{ group.items.length }} user(s)</span
            >
          </div>

          <div class="rounded-xl border bg-background-2 p-4">
            <p class="text-xs text-gray-500 mb-2">
              Copy-ready JSON mapping of id → download URL (null when no avatar
              file is present).
            </p>
            <pre class="text-xs overflow-x-auto whitespace-pre-wrap break-all">{{
              group.json
            }}</pre>
          </div>

          <div
            v-if="group.items.length > 0"
            class="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            <div
              v-for="avatar in group.items"
              :key="avatar.path"
              class="flex flex-col items-center border rounded-xl p-3 bg-background-2"
            >
              <img
                v-if="avatar.url"
                :src="avatar.url"
                :alt="avatar.path"
                class="w-20 h-20 object-cover rounded-full border"
              />
              <div
                v-else
                class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center"
              >
                <span class="text-gray-400 text-xs">No Image</span>
              </div>
              <p class="mt-2 text-[11px] font-mono break-all text-center">
                {{ avatar.id }} : {{ avatar.url ?? '(no download URL)' }}
              </p>
              <p class="mt-1 text-[10px] text-gray-500 break-all text-center">
                {{ avatar.file }}
              </p>
            </div>
          </div>

          <p v-else class="text-sm text-gray-500">No avatar files found.</p>
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
  layout: 'dev',
  title: 'Dev · Avatars',
  description: 'Inspect avatar objects under core-users/ and users/.',
  nav: {
    key: 'dev-avatars',
    label: 'Avatars',
    icon: 'i-lucide-circle-user-round',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
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
