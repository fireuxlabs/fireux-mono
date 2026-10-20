<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-recipes-search-demand">
      <template #header>
        <LayoutsWorkspaceNavbar title="Recipes search demand" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchEvidence
          capability="Recipes"
          base-path="/workspace/kitchen/prep/recipes/search-demand"
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
