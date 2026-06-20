<template>
  <section class="console-surface space-y-6">
    <UBreadcrumb :items="breadcrumbItems" />
    <ConsoleKitchenOperationsMenusDetails />
    <UCard v-if="menu">
      <template #header>
        <div>
          <h2 class="text-base font-semibold text-highlighted">Source document</h2>
          <p class="text-sm text-dimmed">
            Attach the original PDF or photo before comparing AI output to the current menu.
          </p>
        </div>
      </template>

      <ConsoleKitchenOperationsMenusUpload
        :upload-id="menuId"
        :lock-slug="true"
        :replace-existing="true"
        title="Upload source document"
        description="Upload the original source files so later AI passes can flag differences against this menu."
        cta-label="Upload source"
      />
    </UCard>
    <UCard v-if="menu">
      <template #header>
        <div>
          <h2 class="text-base font-semibold text-highlighted">Storage check</h2>
          <p class="text-sm text-dimmed">
            Client-side check for the source files stored against this menu.
          </p>
        </div>
      </template>

      <div class="space-y-4">
        <dl class="grid gap-3 text-sm md:grid-cols-3">
          <div>
            <dt class="text-dimmed">Storage folder</dt>
            <dd class="break-all font-mono text-xs text-highlighted">
              {{ storageFolderPath || 'Missing menu storage context' }}
            </dd>
          </div>
          <div>
            <dt class="text-dimmed">Upload record files</dt>
            <dd class="font-medium text-highlighted">
              {{ sourceRecordFiles.length }}
            </dd>
          </div>
          <div>
            <dt class="text-dimmed">Storage files</dt>
            <dd class="font-medium text-highlighted">
              {{ storageCheckItems.length }}
            </dd>
          </div>
        </dl>

        <p
          v-if="storageCheckPending"
          class="text-sm text-dimmed"
        >
          Checking Storage...
        </p>
        <p
          v-else-if="storageCheckError"
          class="text-sm text-error"
        >
          {{ storageCheckError }}
        </p>
        <p
          v-else-if="!storageCheckItems.length"
          class="text-sm text-dimmed"
        >
          No files found in this Storage folder.
        </p>

        <div
          v-else
          class="grid gap-2"
        >
          <UButton
            v-for="item in storageCheckItems"
            :key="item.fullPath"
            :to="item.url || undefined"
            :target="item.url ? '_blank' : undefined"
            :rel="item.url ? 'noopener' : undefined"
            color="neutral"
            variant="soft"
            icon="i-lucide-file-check-2"
            class="justify-start"
            :disabled="!item.url"
          >
            {{ item.name }}
          </UButton>
        </div>
      </div>
    </UCard>
    <ConsoleKitchenOperationsMenusProcess />
    <ConsoleKitchenOperationsMenusSectionsRead />
    <ConsoleKitchenOperationsMenusSectionsCreate />
    <ConsoleKitchenOperationsMenusPublish />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  getDownloadURL,
  listAll,
  ref as storageRef,
} from 'firebase/storage'
import { useFirebaseStorage } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useKitchenConsoleMenu } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenu'

type StorageCheckItem = {
  name: string
  fullPath: string
  url: string
}

const {
  menu,
  menuId,
  kitchenId,
  activeKitchenAppId,
  menuSources,
} = useKitchenConsoleMenu()
const storage = useFirebaseStorage()
const storageCheckItems = ref<StorageCheckItem[]>([])
const storageCheckPending = ref(false)
const storageCheckError = ref('')
const text = (value: unknown) => String(value ?? '').trim()
const source = computed(
  () => menuSources.value.find((item) => text(item.id) === menuId.value) ?? null
)
const sourceRecordFiles = computed(() =>
  Array.isArray(source.value?.files) && source.value.files.length
    ? source.value.files
    : source.value?.storage_path
      ? [
          {
            storage_path: source.value.storage_path,
            file_name: source.value.file_name,
          },
        ]
      : []
)
const storageFolderPath = computed(() => {
  const appId = text(activeKitchenAppId.value)
  const selectedKitchenId = text(kitchenId.value)
  const selectedMenuId = text(menuId.value)

  return appId && selectedKitchenId && selectedMenuId
    ? `apps/${appId}/kitchens/${selectedKitchenId}/menu-uploads/${selectedMenuId}/source`
    : ''
})
const breadcrumbItems = computed(() => [
  {
    label: 'Menus',
    icon: 'i-lucide-book-open',
    to: '/console/kitchen/menus',
  },
  {
    label: String(menu.value?.name || 'Menu details').trim(),
    icon: 'i-lucide-list-tree',
  },
])

if (import.meta.client) {
  watch(
    storageFolderPath,
    async (path) => {
      storageCheckItems.value = []
      storageCheckError.value = ''

      if (!path) return

      storageCheckPending.value = true

      try {
        const listing = await listAll(storageRef(storage, path))
        const files = await Promise.all(
          listing.items.map(async (item) => ({
            name: item.name,
            fullPath: item.fullPath,
            url: await getDownloadURL(item),
          }))
        )

        storageCheckItems.value = files.sort((a, b) =>
          a.fullPath.localeCompare(b.fullPath)
        )
      } catch (error) {
        storageCheckError.value =
          error instanceof Error
            ? error.message
            : 'Storage check failed.'
      } finally {
        storageCheckPending.value = false
      }
    },
    { immediate: true }
  )
}
</script>
