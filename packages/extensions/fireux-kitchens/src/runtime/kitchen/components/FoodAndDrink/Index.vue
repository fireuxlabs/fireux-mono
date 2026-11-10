<template>
  <KitchenFoodAndDrinkAI />
  <section class="food-and-drink-summary" aria-label="Food and drink summary">
    <KitchenFoodAndDrinkItemsOverview />
    <KitchenFoodAndDrinkMenusOverview />
    <KitchenFoodAndDrinkPromotionsOverview />
    <KitchenFoodAndDrinkServicesOverview />
  </section>
</template>
<script setup lang="ts">
import { provideFoodAndDrinkIndex } from '../../composables/workspace/food/useFoodAndDrinkIndexContext'
provideFoodAndDrinkIndex()
</script>

<style scoped>
.food-and-drink-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: calc(var(--spacing) * 3);
  align-items: start;
}
</style>
