<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-ingredients-search-demand-analysis">
      <template #header>
        <LayoutsWorkspaceNavbar title="Ingredients demand analysis" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchAnalysis
          capability="Ingredients"
          base-path="/workspace/kitchen/ingredients/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenIngredientsSearchDemand } from '../../../../../kitchen/models/ingredients-search-demand'

const demand = kitchenIngredientsSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
