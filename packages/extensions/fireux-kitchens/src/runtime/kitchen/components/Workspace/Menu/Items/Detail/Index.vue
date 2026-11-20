<template>
  <Detail.Status :outcome="outcome" />
  <KitchenMenuItemDetail
    v-if="item"
    :item="item"
    :menu="menu"
    :kitchen-slug="kitchenSlug"
  />
  <Detail.Basics :item="item" />
  <template v-if="item">
    <Detail.Menus class="item-capability" />
    <Detail.Prep v-if="dev" class="item-capability" />
    <Detail.Team v-if="dev" class="item-capability" />
    <Detail.Diagnostics v-if="dev" />
  </template>
</template>

<script setup lang="ts">
import type { ReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
import * as Detail from './index'
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

<style scoped>
.item-capability {
  min-inline-size: 0;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  padding: calc(var(--spacing) * 4);
}

.item-capability :deep(pre) {
  overflow-x: auto;
}
</style>
