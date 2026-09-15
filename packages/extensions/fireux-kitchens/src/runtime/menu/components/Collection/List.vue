<template>
  <KitchenCollectionList v-if="kitchenCards.length" :cards="kitchenCards" />

  <section v-if="documentCells.length" class="menu-directory-group">
    <div>
      <h2 class="text-xl font-semibold tracking-tight text-highlighted">
        Menus without a Kitchen
      </h2>
      <p class="mt-1 text-sm text-muted">Independent menus, photos and PDFs.</p>
    </div>
    <UPageGrid
      as="ul"
      class="list-none menu-directory-group__menus"
      aria-label="Menus without a Kitchen"
    >
      <li v-for="cell in documentCells" :key="cell.to">
        <UPageCard
          class="rounded-xl"
          :ui="{
            container: 'p-5 sm:p-5',
            body: 'w-full min-w-0',
          }"
          :title="cell.title"
          :description="cell.description"
          :to="cell.to"
        >
          <template #body>
            <div class="menu-document-row">
              <div
                class="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
              >
                <UIcon name="i-lucide-file-text" class="size-6" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="font-semibold text-highlighted">{{ cell.title }}</h3>
                <p v-if="cell.description" class="mt-1 text-sm text-muted">
                  {{ cell.description }}
                </p>
              </div>
              <UBadge
                v-for="badge in cell.badges"
                :key="badge"
                color="neutral"
                variant="subtle"
                >{{ badge }}</UBadge
              >
              <UIcon
                name="i-lucide-arrow-right"
                class="size-5 shrink-0 text-muted"
              />
            </div>
          </template>
        </UPageCard>
      </li>
    </UPageGrid>
  </section>

  <DevDebugPanel
    title="Menus collection surface"
    context="Passed Kitchen groups and standalone Menu cells. KitchenCollectionList owns the shared Kitchen card projection."
    object-origin="passed"
    :objects="{ menus: props.menus, kitchens: props.kitchens }"
    :derived="{ cells }"
    launcher
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CollectionCellData } from 'fireux-core/runtime/models/utils/collection-cell'
import type { MenuDirectoryEntry } from '../../models/menu-directory.response'
import {
  menuRoutePath,
  rootMenuRouteScope,
} from '../../../kitchen/utils/kitchen-menu-route'

import type { KitchenCollectionRecord } from '../../../kitchen/composables/useKitchenCollection'
import { useKitchenInterface } from '../../../kitchen/composables/useKitchenInterface'

const props = defineProps<{
  menus: MenuDirectoryEntry[]
  kitchens: KitchenCollectionRecord[]
}>()
const { surface, interface: makeKitchenCard } = useKitchenInterface()
const kitchenCards = computed(() =>
  props.kitchens.flatMap((kitchen) => {
    const resolved = surface({ kitchen, place: kitchen.place })
    const card = resolved ? makeKitchenCard(resolved) : null
    return card ? [card] : []
  })
)
const fileKindLabel = (menu: MenuDirectoryEntry) => {
  if (menu.file_kind === 'pdf') return 'PDF'
  if (menu.file_kind === 'photo') return 'Photo'
  return 'Document'
}
const isKitchenMenu = (menu: MenuDirectoryEntry) =>
  Boolean(menu.source?.kitchen_id || menu.source?.kitchen_slug)
const toCell = (menu: MenuDirectoryEntry): CollectionCellData => {
  return {
    title: menu.name,
    description: menu.description,
    badges: [fileKindLabel(menu)],
    actionLabel: 'Open menu',
    to: menuRoutePath({ scope: rootMenuRouteScope(), menuId: menu.id }),
  }
}
const documentCells = computed<CollectionCellData[]>(() =>
  props.menus.filter((menu) => !isKitchenMenu(menu)).map(toCell)
)
const cells = computed(() => ({
  kitchen: kitchenCards.value,
  standalone: documentCells.value,
}))
</script>

<style scoped>
.menu-directory-group {
  display: grid;
  gap: calc(var(--spacing) * 4);
  padding-top: calc(var(--spacing) * 8);
  border-top: 1px solid var(--ui-border);
}
.menu-directory-group__menus {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr));
}
.menu-document-row {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 4);
  width: 100%;
}
</style>
