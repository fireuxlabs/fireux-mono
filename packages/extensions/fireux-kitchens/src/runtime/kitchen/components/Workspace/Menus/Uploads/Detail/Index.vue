<template>
  <section class="workspace-surface workspace-surface--compact">
    <UBreadcrumb :items="breadcrumbItems" />

    <MoleculesCopyError
      v-if="menuSourcesError"
      :message="String(menuSourcesError)"
    />
    <p v-else-if="menuSourcesPending" role="status">Loading menu source…</p>
    <UAlert
      v-else-if="!source"
      color="neutral"
      variant="soft"
      title="Menu source not found"
      description="This uploaded menu source is missing or no longer available."
    />

    <template v-else-if="source">
      <WorkspaceKitchenMenusUploadsDetailSummary
        :source="source"
        :file-count="sourceFiles.length"
      />
      <WorkspaceKitchenMenusUploadsDetailFile
        :source="source"
        :files="sourceFiles"
      />
    </template>

    <DiagnosticsDebugPanel
      object-origin="fetched"
      launcher
      include-route
      title="Kitchen menu source debug"
      context="Kitchen menu source · /workspace/kitchen/menus/uploads/[uploadId]"
      :objects="debug"
      :derived="{}"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenMenusContextSource } from '../../../../../composables/workspace/menus/useKitchenMenusContext'

const {
  menuSources,
  menuSourcesPending,
  menuSourcesError,
  debug: menusDebug,
} = useKitchenMenusContextSource()

const text = (value: unknown) => String(value ?? '').trim()
const uploadId = useRouteParam('uploadId')
const source = computed(
  () =>
    menuSources.value.find((item) => text(item.id) === uploadId.value) ?? null
)
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
const breadcrumbItems = computed(() => [
  {
    label: 'Menus',
    icon: 'i-lucide-book-open',
    to: '/workspace/kitchen/menus',
  },
  {
    label: 'Menu sources',
    icon: 'i-lucide-file-up',
    to: '/workspace/kitchen/menus',
  },
  {
    label: source.value?.id || 'Source detail',
    icon: 'i-lucide-file-search',
  },
])
const debug = computed(() => ({
  ...menusDebug.value,
  uploadId: uploadId.value,
  hasSource: Boolean(source.value),
  source: source.value,
}))
</script>
