<template>
  <WorkspaceGroupPage workspace="kitchen" nav-key="workspace-kitchen-food">
    <WorkspaceKitchenFoodAI />
    <WorkspaceKitchenFoodItems />
    <WorkspaceKitchenFoodMenus />
    <WorkspaceKitchenFoodPromotions />
    <WorkspaceKitchenFoodServices />
  </WorkspaceGroupPage>
</template>
<script setup lang="ts">
import { provideFoodAndDrinkIndex } from '../../../composables/workspace/food/useFoodAndDrinkIndexContext'
provideFoodAndDrinkIndex()
</script>
