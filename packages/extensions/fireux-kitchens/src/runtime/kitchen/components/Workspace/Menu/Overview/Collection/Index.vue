<template>
  <FireState v-if="feedback" :outcome="feedback" entity="menus" />
  <Collection.Grid
    v-else-if="visibleMenus.length"
    :menus="visibleMenus"
    :palette="palette"
    :kitchen-id="kitchenId"
    :timezone="timezone"
  />
  <p v-else role="status">{{ emptyMessage }}</p>
</template>
<script setup lang="ts">
import * as Collection from './index'
import { useMenuOverviewCollection } from './useCollection'

const { feedback, visibleMenus, emptyMessage, palette, kitchenId, timezone } =
  useMenuOverviewCollection()
</script>
