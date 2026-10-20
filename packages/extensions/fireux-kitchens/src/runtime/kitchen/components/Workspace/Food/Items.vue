<template>
  <WorkspaceKitchenNavigationChild
    nav-key="workspace-kitchen-food"
    child-key="items"
  >
    <WorkspaceKitchenFoodSummary :summary="catalogue.items" />
  </WorkspaceKitchenNavigationChild>
</template>
<script setup lang="ts">
import { useFoodAndDrinkIndexContext } from '../../../composables/workspace/food/useFoodAndDrinkIndexContext'
const { catalogue } = useFoodAndDrinkIndexContext()
</script>
