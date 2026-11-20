<template>
  <p v-if="outcome === 'pending'" role="status">Loading item…</p>
  <UAlert
    v-else-if="outcome === 'error'"
    color="error"
    title="Item unavailable"
    description="This item could not be loaded."
  />
  <p v-else-if="outcome === 'empty'" role="status">Item not found.</p>
  <p v-else-if="outcome === 'idle'" role="status">
    Select a Kitchen to view this item.
  </p>
  <KitchenMenuItemDetail
    v-if="item"
    :item="item"
    :menu="menu"
    :kitchen-slug="kitchenSlug"
  />
  <WorkspaceItemDetail :item="item" />
  <FireDisclosurePanel
    v-if="item"
    title="Menu placements"
    description="Saved menu sections that include this item."
  >
    <ItemMenuPlacements />
  </FireDisclosurePanel>
  <FireDisclosurePanel v-if="item && dev" title="Item diagnostics">
    <KitchenWorkspaceMenuItemData />
  </FireDisclosurePanel>
</template>

<script setup lang="ts">
import type { ReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
import ItemMenuPlacements from './ItemMenuPlacements.vue'
import KitchenWorkspaceMenuItemData from './ItemData.vue'
import WorkspaceItemDetail from './WorkspaceItemDetail.vue'
import KitchenMenuItemDetail from '../../../../../../menu/components/ItemDetail.vue'
import type { Item } from '../../../../../records/menus/items/item'

defineProps<{
  item: Item | null
  outcome: ReadOutcome
  menu?: string
  kitchenSlug?: string
}>()
const dev = import.meta.dev
</script>
