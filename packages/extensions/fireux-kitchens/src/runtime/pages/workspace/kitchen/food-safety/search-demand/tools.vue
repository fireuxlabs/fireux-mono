<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-food-safety-search-demand-tools">
      <template #header>
        <WorkspaceNavbar title="Food Safety Tool specifications" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchToolSpecifications
          capability="Food Safety"
          base-path="/workspace/kitchen/food-safety/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenFoodSafetySearchDemand } from '../../../../../kitchen/models/food-safety-search-demand'

const demand = kitchenFoodSafetySearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
