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
    <Detail.Document v-if="dev" />
    <Detail.Menus />
    <Detail.Prep />
    <Detail.Team />
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
