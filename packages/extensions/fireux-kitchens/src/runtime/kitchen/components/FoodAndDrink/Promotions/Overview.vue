<template>
  <WorkspaceKitchenNavigationChild
    nav-key="workspace-kitchen-food"
    child-key="promotions"
  >
    <KitchenFoodAndDrinkSummary :summary="catalogue.promotions" />
  </WorkspaceKitchenNavigationChild>
</template>
<script setup lang="ts">
import { useFoodAndDrinkIndexContext } from '../../../composables/workspace/food/useFoodAndDrinkIndexContext'
const { catalogue } = useFoodAndDrinkIndexContext()
</script>
