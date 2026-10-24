<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-menus-search-demand-analysis">
      <template #header>
        <WorkspaceNavbar title="Menus demand analysis" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchAnalysis
          capability="Menus"
          base-path="/workspace/kitchen/food-and-drink/menus/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenMenusSearchDemand } from '../../../../../../kitchen/models/menus-search-demand'

const demand = kitchenMenusSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
