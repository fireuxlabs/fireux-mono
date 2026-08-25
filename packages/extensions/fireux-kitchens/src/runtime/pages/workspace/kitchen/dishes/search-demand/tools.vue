<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-dishes-search-demand-tools">
      <template #header>
        <LayoutsWorkspaceNavbar title="Dishes Tool specifications" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchToolSpecifications
          capability="Dishes"
          base-path="/workspace/kitchen/dishes/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenDishesSearchDemand } from '../../../../../kitchen/models/dishes-search-demand'

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
