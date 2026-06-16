<template>
  <section class="console-surface space-y-4">
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
                {{ source.file_name || 'Menu source file' }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <UBadge :color="kindColor" variant="soft">
                {{ source.file_kind || 'document' }}
              </UBadge>
              <UBadge :color="statusColor" variant="soft">
                {{ source.status }}
              </UBadge>
            </div>
          </div>
        </template>

        <dl class="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt class="text-dimmed">File type</dt>
            <dd class="font-medium text-highlighted">{{ source.file_type || 'Unknown' }}</dd>
          </div>
          <div>
            <dt class="text-dimmed">Storage owner</dt>
            <dd class="font-medium text-highlighted">
              {{ source.storage_app_id || source.app_id || 'Selected app' }}
            </dd>
          </div>
        </dl>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold text-highlighted">Source file</h2>
              <p class="text-sm text-dimmed">
                Review the uploaded document before turning it into a structured menu.
              </p>
            </div>
            <UButton
              v-if="source.file_url"
              :to="source.file_url"
              target="_blank"
              rel="noopener"
              icon="i-lucide-external-link"
              variant="soft"
            >
              Open file
            </UButton>
          </div>
        </template>

        <img
          v-if="isPhoto && source.file_url"
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
} from '../../../../../models/menu/menu-source-upload.model'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'

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
const isPhoto = computed(() => source.value?.file_kind === 'photo')
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
  const kind = source.value?.file_kind as MenuSourceUploadKind | undefined
  if (kind === 'photo') return 'primary'
  if (kind === 'pdf') return 'success'
  return 'neutral'
})
const debug = computed(() => ({
  ...menusDebug.value,
  uploadId: uploadId.value,
  hasSource: Boolean(source.value),
  source: source.value,
}))
</script>
