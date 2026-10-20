<template>
  <div v-if="isDev" class="flex items-start justify-end gap-2">
    <DiagnosticsDebugPanel
      object-origin="fetched"
      launcher
      include-route
      title="Kitchen menus debug"
      context="Kitchen menu workspace · /workspace/kitchen/food-and-drink/menus"
      :objects="menusDebug"
      :derived="{}"
      :default-open="false"
    />
  </div>

</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Menu } from '../../../../menu/models/menu.model'
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
} = useKitchenMenusContext()

const isDev = import.meta.dev

const text = (value: unknown) => String(value ?? '').trim()
const menuDebugRow = (menu: Menu) => {

  return {
    id: text(menu.id),
    name: text(menu.name),
    status: text(menu.status),
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
