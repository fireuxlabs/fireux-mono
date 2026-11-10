<template>
  <WorkspacePageHeader
    title="Menus"
    :description="description"
    variant="primary"
  />
  <NuxtLink
    to="/workspace/kitchen/menu/menus"
    aria-label="Manage menus"
    class="workspace-surface workspace-surface--compact"
  >
    <KitchenMenuSummary :summary="catalogue.menus" />
  </NuxtLink>
  <KitchenMenuAI />
  <section
    class="menu-summary"
    aria-label="Items, promotions and services summary"
  >
    <KitchenMenuItemsOverview />
    <KitchenMenuPromotionsOverview />
    <KitchenMenuServicesOverview />
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { provideMenuGroupIndex } from '../../composables/workspace/menu-group/useMenuGroupIndexContext'
const { kitchenName, catalogue } = provideMenuGroupIndex()
const description = computed(
  () =>
    `Manage ${kitchenName.value ? `${kitchenName.value}'s` : "your Kitchen's"} menus, items, promotions and services and some collective stuff.`
)
</script>

<style scoped>
.menu-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
  gap: calc(var(--spacing) * 3);
  align-items: start;
}
</style>
