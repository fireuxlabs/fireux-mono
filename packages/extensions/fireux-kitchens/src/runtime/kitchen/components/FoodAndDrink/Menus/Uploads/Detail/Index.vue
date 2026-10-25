<template>
  <section class="workspace-surface workspace-surface--compact">
    <UBreadcrumb :items="breadcrumbItems" />

    <FireCopyError
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
      <KitchenFoodAndDrinkMenusProcess
        :key="`${kitchenId}/${uploadId}`"
        :context="processContext"
      />
      <FireDisclosurePanel title="Original document" :default-open="false">
        <KitchenFoodAndDrinkMenusUploadsDetailFile
          :source="source"
          :files="sourceFiles"
        />
      </FireDisclosurePanel>
    </template>

    <FireDiagnosticsDebugPanel
      object-origin="fetched"
      launcher
      include-route
      title="Kitchen menu source debug"
      context="Kitchen menu source · /workspace/kitchen/food-and-drink/menus/uploads/[uploadId]"
      :objects="debug"
      :derived="{}"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceMenuSources } from '../../../../../composables/workspace/menus/useKitchenWorkspaceMenuSources'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenMenusContextSource } from '../../../../../composables/workspace/menus/useKitchenMenusContext'

const { menuSources, menuSourcesPending, menuSourcesError } =
  useKitchenWorkspaceMenuSources()
const {
  kitchenId,
  activeKitchenAppId,
  canWrite,
  debug: menusDebug,
} = useKitchenMenusContextSource()

const text = (value: unknown) => String(value ?? '').trim()
const uploadId = useRouteParam('uploadId')
const source = computed(
  () =>
    menuSources.value.find((item) => text(item.id) === uploadId.value) ?? null
)
const processContext = {
  menu: computed(() => null),
  source,
  menuId: uploadId,
  kitchenId,
  activeKitchenAppId,
  canWrite,
}
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
    to: '/workspace/kitchen/food-and-drink/menus',
  },
  {
    label: 'Menu sources',
    icon: 'i-lucide-file-up',
    to: '/workspace/kitchen/food-and-drink/menus',
  },
  {
    label: source.value?.file_name || 'Menu import',
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
