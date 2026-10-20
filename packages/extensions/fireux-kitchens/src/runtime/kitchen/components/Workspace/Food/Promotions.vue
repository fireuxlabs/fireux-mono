<template>
  <WorkspaceKitchenNavigationChild
    nav-key="workspace-kitchen-food"
    child-key="promotions"
  >
    <WorkspaceKitchenFoodSummary :summary="catalogue.promotions" />
  </WorkspaceKitchenNavigationChild>
</template>
<script setup lang="ts">
import { useFoodAndDrinkIndexContext } from '../../../composables/workspace/food/useFoodAndDrinkIndexContext'
const { catalogue } = useFoodAndDrinkIndexContext()
</script>
