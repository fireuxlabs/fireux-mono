<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-dishes-search-demand">
      <template #header>
        <LayoutsWorkspaceNavbar title="Dishes search demand" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchEvidence
          capability="Dishes"
          base-path="/workspace/kitchen/food/dishes/search-demand"
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
