<template>
  <ul class="collection-stack" aria-label="Menus">
    <li v-for="cell in cells" :key="cell.to">
      <CollectionCell :cell="cell" />
    </li>
  </ul>
  <DevDebugPanel
    title="Menus collection surface"
    context="Passed Menu records and their final shared cell projection."
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
const cells = computed<CollectionCellData[]>(() =>
  props.menus.map((menu) => ({
    title: menu.name,
    description: menu.kitchen?.name || menu.description,
    to: menuRoutePath({ scope: rootMenuRouteScope(), menuId: menu.id }),
  }))
)
</script>
