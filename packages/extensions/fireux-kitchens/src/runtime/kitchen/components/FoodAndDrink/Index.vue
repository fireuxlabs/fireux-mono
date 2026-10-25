<template>
  <KitchenFoodAndDrinkAI />
  <KitchenFoodAndDrinkItemsOverview />
  <KitchenFoodAndDrinkMenusOverview />
  <KitchenFoodAndDrinkPromotionsOverview />
  <KitchenFoodAndDrinkServicesOverview />
</template>
<script setup lang="ts">
import { provideFoodAndDrinkIndex } from '../../composables/workspace/food/useFoodAndDrinkIndexContext'
provideFoodAndDrinkIndex()
</script>
