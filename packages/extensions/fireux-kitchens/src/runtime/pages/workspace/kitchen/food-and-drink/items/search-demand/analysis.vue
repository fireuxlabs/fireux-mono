<template>
  <div>
    <WorkspaceKitchenResearchAnalysis
      capability="Dishes"
      base-path="/workspace/kitchen/food-and-drink/items/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenDishesSearchDemand } from '../../../../../../kitchen/models/dishes-search-demand'

const demand = kitchenDishesSearchDemand

definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
