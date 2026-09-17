<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-recipes-search-demand-analysis">
      <template #header>
        <LayoutsWorkspaceNavbar title="Recipes demand analysis" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchAnalysis
          capability="Recipes"
          base-path="/workspace/kitchen/food/recipes/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenRecipesSearchDemand } from '../../../../../../kitchen/models/recipes-search-demand'

const demand = kitchenRecipesSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
