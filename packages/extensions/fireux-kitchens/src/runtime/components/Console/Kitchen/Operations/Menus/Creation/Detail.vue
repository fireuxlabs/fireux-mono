<template>
  <section class="console-surface console-surface--compact">
    <UBreadcrumb :items="breadcrumbItems" />

    <UAlert
      v-if="!source && !menuSourcesPending"
      color="neutral"
      variant="soft"
      title="Menu source not found"
      description="This uploaded menu source is missing or no longer available."
    />

    <template v-else-if="source">
      <UCard>
        <template #header>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold text-highlighted">
                {{ source.id }}
              </h2>
              <p class="text-sm text-dimmed">
                {{ source.source_url || source.file_name || 'Menu source' }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <UBadge :color="kindColor" variant="soft">
                {{ sourceKind }}
              </UBadge>
              <UBadge :color="statusColor" variant="soft">
                {{ source.status }}
              </UBadge>
            </div>
          </div>
        </template>

        <dl class="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt class="text-dimmed">Source type</dt>
            <dd class="font-medium text-highlighted">{{ sourceKind }}</dd>
          </div>
          <div>
            <dt class="text-dimmed">Files</dt>
            <dd class="font-medium text-highlighted">{{ sourceFiles.length }}</dd>
          </div>
          <div>
            <dt class="text-dimmed">Storage owner</dt>
            <dd class="font-medium text-highlighted">
              {{ source.storage_app_id || source.app_id || 'Selected app' }}
            </dd>
          </div>
          <div v-if="source.source_provider">
            <dt class="text-dimmed">Provider</dt>
            <dd class="font-medium text-highlighted">{{ source.source_provider }}</dd>
          </div>
        </dl>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold text-highlighted">Source file</h2>
              <p class="text-sm text-dimmed">
                Review the saved source before turning it into a structured menu.
              </p>
            </div>
            <UButton
              v-if="sourceLink"
              :to="sourceLink"
              target="_blank"
              rel="noopener"
              icon="i-lucide-external-link"
              variant="soft"
            >
              Open source
            </UButton>
          </div>
        </template>

        <UAlert
          v-if="source.source_url"
          color="info"
          variant="soft"
          title="Menu URL source"
          description="This source is a live menu or ordering URL. AI processing will read the fetched page content and map visible menu data into a review draft."
        />
        <img
          v-else-if="isPhoto && source.file_url"
          :src="source.file_url"
          :alt="source.file_name || source.id"
          class="max-h-[70vh] w-full rounded-lg object-contain"
        />
        <iframe
          v-else-if="source.file_url"
          :src="source.file_url"
          :title="source.file_name || source.id"
          class="h-[70vh] w-full rounded-lg border border-default"
        />
        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="Source file unavailable"
          description="This upload record does not have a file URL."
        />

        <div
          v-if="sourceFiles.length > 1"
          class="mt-4 grid gap-2"
        >
          <UButton
            v-for="file in sourceFiles"
            :key="file.storage_path || file.file_url"
            :to="file.file_url"
            target="_blank"
            rel="noopener"
            color="neutral"
            variant="soft"
            icon="i-lucide-file-image"
            class="justify-start"
          >
            {{ file.file_name || 'Menu source file' }}
          </UButton>
        </div>
      </UCard>
    </template>

    <DevJson
      title="Kitchen menu source debug"
      context="Kitchen menu source · /console/kitchen/menus/uploads/[uploadId]"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import type {
  MenuSourceUploadKind,
  MenuSourceUploadStatus,
} from '../../../../../../models/kitchen/menu/menu-source-upload.model'
import { useKitchenConsoleMenus } from '../../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'

const route = useRoute()
const { menuSources, menuSourcesPending, debug: menusDebug } =
  useKitchenConsoleMenus()

const text = (value: unknown) => String(value ?? '').trim()
const uploadId = computed(() => {
  const raw = route.params.uploadId
  return text(Array.isArray(raw) ? raw[0] : raw)
})
const source = computed(
  () => menuSources.value.find((item) => text(item.id) === uploadId.value) ?? null
)
const sourceKind = computed<MenuSourceUploadKind>(() => {
  if (source.value?.source_url) return 'url'
  return source.value?.file_kind || 'document'
})
const sourceFiles = computed(() =>
  Array.isArray(source.value?.files) && source.value.files.length
    ? source.value.files
    : source.value?.file_url
      ? [
          {
            file_url: source.value.file_url,
            file_name: source.value.file_name,
            storage_path: source.value.storage_path,
          },
        ]
      : []
)
const isPhoto = computed(() => source.value?.file_kind === 'photo')
const sourceLink = computed(() =>
  text(source.value?.source_url) || text(source.value?.file_url)
)
const breadcrumbItems = computed(() => [
  {
    label: 'Menus',
    icon: 'i-lucide-book-open',
    to: '/console/kitchen/menus',
  },
  {
    label: 'Menu sources',
    icon: 'i-lucide-file-up',
    to: '/console/kitchen/menus',
  },
  {
    label: source.value?.id || 'Source detail',
    icon: 'i-lucide-file-search',
  },
])
const statusColor = computed(() => {
  const status = source.value?.status as MenuSourceUploadStatus | undefined
  if (status === 'published') return 'success'
  if (status === 'archived') return 'neutral'
  if (status === 'extracting') return 'info'
  return 'warning'
})
const kindColor = computed(() => {
  const kind = sourceKind.value
  if (kind === 'photo') return 'primary'
  if (kind === 'pdf') return 'success'
  if (kind === 'url') return 'info'
  return 'neutral'
})
const debug = computed(() => ({
  ...menusDebug.value,
  uploadId: uploadId.value,
  hasSource: Boolean(source.value),
  source: source.value,
}))
</script>
