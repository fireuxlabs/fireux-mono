<template>
  <section class="console-surface space-y-6">
    <template v-if="selectedKitchen">
      <UAlert
        v-if="readOnly"
        color="neutral"
        variant="soft"
        title="Read only"
        description="This kitchen can be inspected, but changes are disabled."
      />

      <section class="space-y-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">Create</h2>
          <p class="text-sm text-dimmed">
            Create a menu, then upload source photos or PDFs for AI review.
          </p>
        </div>
        <ConsoleKitchenOperationsMenusWrite />
        <ConsoleKitchenOperationsMenusUpload />
      </section>

      <section class="space-y-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">View</h2>
          <p class="text-sm text-dimmed">
            Review menus linked to this kitchen.
          </p>
        </div>
        <ConsoleKitchenOperationsMenusSources />
        <ConsoleKitchenOperationsMenusRead />
      </section>

      <DevJson
        title="Kitchen menus debug"
        context="Kitchen menu console · /console/kitchen/menus"
        :data="menusDebug"
        :default-open="false"
      />
    </template>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Select a kitchen"
      description="Choose a kitchen before managing menus."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'

const {
  selectedKitchen,
  kitchenId,
  activeKitchenAppId,
  collectionPath,
  menus,
  rawMenus,
  menuSources,
  pending,
  readOnly,
  canWrite,
} = useKitchenConsoleMenus()

const text = (value: unknown) => String(value ?? '').trim()
const menuDebugRow = (menu: Record<string, unknown>) => {
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
  rawMenus.value.filter((menu) => menu.status === 'archived')
)
const sourceDebugRow = (source: Record<string, unknown>) => ({
  id: text(source.id),
  status: text(source.status),
  fileKind: text(source.file_kind),
  fileName: text(source.file_name),
  hasMatchingMenu: menus.value.some((menu) => text(menu.id) === text(source.id)),
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
    rawMenusCount: rawMenus.value.length,
    archivedMenusCount: rawArchivedMenus.value.length,
    sourcesCount: menuSources.value.length,
    pending: pending.value,
    readOnly: readOnly.value,
    canWrite: canWrite.value,
  },
}))
</script>
