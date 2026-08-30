<template>
  <ul class="collection-stack" aria-label="Menus">
    <li v-for="menu in menus" :key="menu.id">
      <CollectionCell
        :title="menu.name"
        :description="menu.kitchen?.name || menu.description"
        :to="menuRoutePath({ scope: rootMenuRouteScope(), menuId: menu.id })"
      />
    </li>
  </ul>
</template>
<script setup lang="ts">
import CollectionCell from 'fireux-core/runtime/components/Collection/Cell.vue'
import type { MenuDirectoryEntry } from '../../models/menu-collection.model'
import { menuRoutePath, rootMenuRouteScope } from '../../../kitchen/utils/kitchen-menu-route'
defineProps<{ menus: MenuDirectoryEntry[] }>()
</script>
