<template>
  <div>
    <WorkspaceKitchenResearchToolSpecifications
      capability="Ingredients"
      base-path="/workspace/kitchen/prep/ingredients/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenIngredientsSearchDemand } from '../../../../../../kitchen/models/ingredients-search-demand'

const demand = kitchenIngredientsSearchDemand

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
