<template>
  <section v-if="kitchenCells.length" class="menu-directory-group">
    <div class="menu-directory-group__heading">
      <div>
        <h2>Connected to Kitchens</h2>
        <p>Food, Drinks, and custom menus published from a Kitchen.</p>
      </div>
      <span>{{ kitchenCells.length }}</span>
    </div>
    <ul class="collection-stack" aria-label="Menus connected to Kitchens">
      <li v-for="cell in kitchenCells" :key="cell.to">
        <CollectionCell :cell="cell" />
      </li>
    </ul>
  </section>

  <section v-if="documentCells.length" class="menu-directory-group">
    <div class="menu-directory-group__heading">
      <div>
        <h2>Standalone menus</h2>
        <p>
          Published directly from a document, photo, or PDF without a Kitchen.
        </p>
      </div>
      <span>{{ documentCells.length }}</span>
    </div>
    <ul class="collection-stack" aria-label="Standalone menus">
      <li v-for="cell in documentCells" :key="cell.to">
        <CollectionCell :cell="cell" />
      </li>
    </ul>
  </section>

  <DevDebugPanel
    title="Menus collection surface"
    context="Published root Menu doorways grouped by their structured Kitchen or standalone document source."
    object-origin="passed"
    :objects="{ menus: props.menus }"
    :derived="{ cells }"
    launcher
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CollectionCell from 'fireux-core/runtime/components/Collection/Cell.vue'
import type { CollectionCellData } from 'fireux-core/runtime/models/utils/collection-cell'
import type { MenuDirectoryEntry } from '../../models/menu-collection.model'
import {
  menuRoutePath,
  rootMenuRouteScope,
} from '../../../kitchen/utils/kitchen-menu-route'

const props = defineProps<{ menus: MenuDirectoryEntry[] }>()
const surfaceLabels: Record<string, string> = {
  delivery: 'Delivery',
  collection: 'Collection',
  pre_order: 'Pre-order',
  kiosk: 'Kiosk',
}
const fileKindLabel = (menu: MenuDirectoryEntry) => {
  if (menu.file_kind === 'pdf') return 'PDF'
  if (menu.file_kind === 'photo') return 'Photo'
  return 'Document'
}
const isKitchenMenu = (menu: MenuDirectoryEntry) =>
  menu.kind === 'menu' || Boolean(menu.source?.kitchen_id)
const toCell = (menu: MenuDirectoryEntry): CollectionCellData => {
  const kitchenBacked = isKitchenMenu(menu)
  return {
    title: menu.name,
    description: menu.description,
    image: kitchenBacked
      ? menu.kitchen?.logo_image_url || menu.kitchen?.image_url
      : undefined,
    imageStyle: 'avatar',
    fallbackIcon: kitchenBacked ? 'i-lucide-chef-hat' : 'i-lucide-file-text',
    meta: kitchenBacked
      ? menu.source?.kitchen_name || menu.kitchen?.name
      : 'No Kitchen required',
    badges: kitchenBacked
      ? [
          'Connected to Kitchen',
          'Browse',
          ...(menu.contexts || []).map(
            (context) => surfaceLabels[context] || context
          ),
        ]
      : ['Standalone menu', fileKindLabel(menu)],
    actionLabel: 'Open menu',
    to: menuRoutePath({ scope: rootMenuRouteScope(), menuId: menu.id }),
  }
}
const kitchenCells = computed<CollectionCellData[]>(() =>
  props.menus.filter(isKitchenMenu).map(toCell)
)
const documentCells = computed<CollectionCellData[]>(() =>
  props.menus.filter((menu) => !isKitchenMenu(menu)).map(toCell)
)
const cells = computed(() => ({
  kitchen: kitchenCells.value,
  standalone: documentCells.value,
}))
</script>

<style scoped>
.menu-directory-group {
  display: grid;
  gap: calc(var(--spacing) * 4);
}
.menu-directory-group + .menu-directory-group {
  margin-top: calc(var(--spacing) * 10);
}
.menu-directory-group__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
}
.menu-directory-group__heading h2,
.menu-directory-group__heading p {
  margin: 0;
}
.menu-directory-group__heading h2 {
  color: var(--ui-text-highlighted);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
}
.menu-directory-group__heading p,
.menu-directory-group__heading > span {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}
.menu-directory-group__heading p {
  margin-top: var(--spacing);
}
</style>
