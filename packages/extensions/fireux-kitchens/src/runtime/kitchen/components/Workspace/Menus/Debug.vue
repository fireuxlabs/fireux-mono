<template>
  <div v-if="isDev" class="flex items-start justify-end gap-2">
    <UButton
      icon="i-lucide-brain"
      size="xs"
      color="neutral"
      variant="soft"
      @click="contextOpen = true"
    >
      Show context
    </UButton>

    <DevDebugPanel
      object-origin="fetched"
      launcher
      include-route
      title="Kitchen menus debug"
      context="Kitchen menu workspace · /workspace/kitchen/menus"
      :objects="menusDebug"
      :derived="{}"
      :default-open="false"
    />
  </div>

  <UModal
    v-if="isDev"
    v-model:open="contextOpen"
    title="Menu context"
    description="Saved knowledge available to MiseboxAiMenu for this Kitchen."
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template #body>
      <pre
        v-if="menuConfig.context"
        class="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-lg border border-default bg-elevated p-4 text-sm text-highlighted"
        >{{ menuConfig.context }}</pre
      >
      <UAlert
        v-else
        color="neutral"
        variant="soft"
        title="No Menu context saved"
        description="Ask Misebox AI to summarise the current Menus to create the first records snapshot."
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { KitchenMenu } from '../../../../menu/models/kitchen-menu.model'
import type { MenuSourceUpload } from '../../../../menu/models/menu-source-upload.model'
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'

// Operation entry spine: docs/concepts/workspace.md
const {
  kitchenId,
  activeKitchenAppId,
  collectionPath,
  menus,
  rawMenus,
  menuSources,
  pending,
  menuConfig,
} = useKitchenMenusContext()

const isDev = import.meta.dev
const contextOpen = ref(false)

const text = (value: unknown) => String(value ?? '').trim()
const menuDebugRow = (menu: KitchenMenu) => {
  const menuKitchenId = text(menu.kitchen_id)

  return {
    id: text(menu.id),
    name: text(menu.name),
    status: text(menu.status),
    kitchenId: menuKitchenId,
    belongsToSelectedKitchen: menuKitchenId === kitchenId.value,
  }
}
const rawArchivedMenus = computed(() =>
  (rawMenus.value ?? []).filter((menu) => menu.status === 'archived')
)
const sourceDebugRow = (source: MenuSourceUpload) => ({
  id: text(source.id),
  status: text(source.status),
  fileKind: text(source.file_kind),
  fileName: text(source.file_name),
  filesCount: Number(source.files_count) || 0,
  hasMatchingMenu: menus.value.some(
    (menu) => text(menu.id) === text(source.id)
  ),
})
const menusDebug = computed(() => ({
  objects: {
    menus: menus.value.map(menuDebugRow),
    archivedMenus: rawArchivedMenus.value.map(menuDebugRow),
    sources: menuSources.value.map(sourceDebugRow),
  },
  derived: {
    kitchenId: kitchenId.value,
    activeKitchenAppId: activeKitchenAppId.value,
    collectionPath: collectionPath.value,
    menusCount: menus.value.length,
    rawMenusCount: (rawMenus.value ?? []).length,
    archivedMenusCount: rawArchivedMenus.value.length,
    sourcesCount: menuSources.value.length,
    pending: pending.value,
  },
}))
</script>
