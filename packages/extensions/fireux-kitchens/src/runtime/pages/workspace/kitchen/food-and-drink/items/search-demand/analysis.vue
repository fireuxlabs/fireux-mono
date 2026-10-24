<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-dishes-search-demand-analysis">
      <template #header>
        <WorkspaceNavbar title="Dishes demand analysis" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchAnalysis
          capability="Dishes"
          base-path="/workspace/kitchen/food-and-drink/items/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenDishesSearchDemand } from '../../../../../../kitchen/models/dishes-search-demand'

const demand = kitchenDishesSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
