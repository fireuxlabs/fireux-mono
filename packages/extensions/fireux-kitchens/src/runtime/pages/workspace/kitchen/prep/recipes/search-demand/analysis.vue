<template>
  <div>
    <WorkspaceKitchenResearchAnalysis
      capability="Recipes"
      base-path="/workspace/kitchen/prep/recipes/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenRecipesSearchDemand } from '../../../../../../kitchen/models/recipes-search-demand'

const demand = kitchenRecipesSearchDemand

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
