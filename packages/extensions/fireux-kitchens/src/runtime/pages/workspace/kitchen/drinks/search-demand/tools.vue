<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-drinks-search-demand-tools">
      <template #header>
        <LayoutsWorkspaceNavbar title="Drinks Tool specifications" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchToolSpecifications
          capability="Drinks"
          base-path="/workspace/kitchen/drinks/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenDrinksSearchDemand } from '../../../../../kitchen/models/drinks-search-demand'

const demand = kitchenDrinksSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
