<template>
  <WorkspaceGroupPage workspace="kitchen" nav-key="workspace-kitchen-food">
    <KitchenFoodAndDrinkAI />
    <KitchenFoodAndDrinkItemsOverview />
    <KitchenFoodAndDrinkMenusOverview />
    <KitchenFoodAndDrinkPromotionsOverview />
    <KitchenFoodAndDrinkServicesOverview />
  </WorkspaceGroupPage>
</template>
<script setup lang="ts">
import { provideFoodAndDrinkIndex } from '../../composables/workspace/food/useFoodAndDrinkIndexContext'
provideFoodAndDrinkIndex()
</script>
