<template>
  <template v-if="item">
    <KitchenMenuItemDetail
      :item="item"
      :menu="menu"
      :kitchen-slug="kitchenSlug"
    />
    <WorkspaceItemDetail :item="item" />
  </template>
</template>

<script setup lang="ts">
import WorkspaceItemDetail from './WorkspaceItemDetail.vue'
import KitchenMenuItemDetail from '../../../../../../menu/components/ItemDetail.vue'
import type { Item } from '../../../../../records/menus/items/item'

defineProps<{ item: Item | null; menu?: string; kitchenSlug?: string }>()
</script>
