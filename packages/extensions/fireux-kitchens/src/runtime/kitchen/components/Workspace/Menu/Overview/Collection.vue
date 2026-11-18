<template>
  <FireState
    v-if="!ready"
    :outcome="menusOutcome === 'error' ? 'error' : 'pending'"
    entity="menus"
  />
  <UPageGrid v-else-if="visibleMenus.length" as="ul" aria-label="Kitchen menus">
    <li
      v-for="menu in visibleMenus"
      :key="menu.id"
      class="menu-overview-list-item"
    >
      <KitchenWorkspaceMenuOverviewCard :menu="menu" />
    </li>
  </UPageGrid>
  <p v-else>{{ emptyMessage }}</p>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceMenuOverview } from '../../../../composables/workspace/menu/overview'

const { menusOutcome, visibleMenus, query, status, totalCount } =
  useKitchenWorkspaceMenuOverview()
const ready = computed(() => ['ready', 'empty'].includes(menusOutcome.value))
const emptyMessage = computed(() => {
  if (query.value.trim()) return 'No matching menus.'
  if (status.value === 'published') return 'No published menus yet.'
  if (status.value === 'draft') return 'No draft menus.'
  if (status.value === 'archived') return 'No archived menus.'
  if (totalCount.value)
    return 'No current menus. Choose Archived to view previous menus.'
  return 'No menus yet. Add your first menu to get started.'
})
</script>

<style scoped>
.menu-overview-list-item {
  display: grid;
  min-width: 0;
}
</style>
