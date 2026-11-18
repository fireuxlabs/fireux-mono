<template>
  <FireState v-if="feedback" :outcome="feedback" entity="menus" />
  <Collection.Grid
    v-else-if="visibleMenus.length"
    :menus="visibleMenus"
    :palette="palette"
  />
  <p v-else role="status">{{ emptyMessage }}</p>
</template>
<script setup lang="ts">
import * as Collection from './index'
import { useMenuOverviewCollection } from './useCollection'

const { feedback, visibleMenus, emptyMessage, palette } =
  useMenuOverviewCollection()
</script>
