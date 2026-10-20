<template>
  <WorkspaceKitchenNavigationChild
    nav-key="workspace-kitchen-food"
    child-key="menus"
  >
    <WorkspaceKitchenFoodSummary :summary="catalogue.menus" />
  </WorkspaceKitchenNavigationChild>
</template>
<script setup lang="ts">
import { useFoodAndDrinkIndexContext } from '../../../composables/workspace/food/useFoodAndDrinkIndexContext'
const { catalogue } = useFoodAndDrinkIndexContext()
</script>
