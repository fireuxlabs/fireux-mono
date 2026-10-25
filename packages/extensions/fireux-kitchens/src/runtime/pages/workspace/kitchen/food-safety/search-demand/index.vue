<template>
  <div>
    <WorkspaceKitchenResearchEvidence
      capability="Food Safety"
      base-path="/workspace/kitchen/food-safety/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenFoodSafetySearchDemand } from '../../../../../kitchen/models/food-safety-search-demand'

const demand = kitchenFoodSafetySearchDemand

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
