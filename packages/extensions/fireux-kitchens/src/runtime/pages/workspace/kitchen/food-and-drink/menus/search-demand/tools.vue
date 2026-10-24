<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-menus-search-demand-tools">
      <template #header>
        <WorkspaceNavbar title="Menus Tool specifications" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchToolSpecifications
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
