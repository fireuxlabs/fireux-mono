<template>
  <UPageGrid v-if="menus.length" as="ul" aria-label="Kitchen menus">
    <li v-for="menu in menus" :key="menu.id" class="menu-overview-list-item">
      <KitchenMenuMenusOverviewCard :menu="menu" />
    </li>
  </UPageGrid>
  <p v-else>
    {{
      searching
        ? 'No matching menus.'
        : 'No menus yet. Create your first menu to get started.'
    }}
  </p>
</template>
<script setup lang="ts">
import type { Menu } from '../../../../../menu/models/menu.model'
defineProps<{ menus: Menu[]; searching: boolean }>()
</script>

<style scoped>
.menu-overview-list-item {
  display: grid;
  min-width: 0;
}
</style>
