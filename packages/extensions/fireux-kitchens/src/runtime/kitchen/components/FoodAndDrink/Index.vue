<template>
  <WorkspacePageHeader
    title="Menus"
    :description="description"
    variant="primary"
  />
  <NuxtLink
    to="/workspace/kitchen/food-and-drink/menus"
    aria-label="Manage menus"
    class="workspace-surface workspace-surface--compact"
  >
    <KitchenFoodAndDrinkSummary :summary="catalogue.menus" />
  </NuxtLink>
  <KitchenFoodAndDrinkAI />
  <section
    class="food-and-drink-summary"
    aria-label="Items, promotions and services summary"
  >
    <KitchenFoodAndDrinkItemsOverview />
    <KitchenFoodAndDrinkPromotionsOverview />
    <KitchenFoodAndDrinkServicesOverview />
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { provideFoodAndDrinkIndex } from '../../composables/workspace/food/useFoodAndDrinkIndexContext'
const { kitchenName, catalogue } = provideFoodAndDrinkIndex()
const description = computed(
  () =>
    `Manage ${kitchenName.value ? `${kitchenName.value}'s` : "your Kitchen's"} menus, items, promotions and services and some collective stuff.`
)
</script>

<style scoped>
.food-and-drink-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
  gap: calc(var(--spacing) * 3);
  align-items: start;
}
</style>
