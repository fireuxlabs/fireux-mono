<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-stations-search-demand-tools">
      <template #header>
        <LayoutsWorkspaceNavbar title="Stations Tool specifications" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchToolSpecifications
          capability="Stations"
          base-path="/workspace/kitchen/stations/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenStationsSearchDemand } from '../../../../../kitchen/models/stations-search-demand'

const demand = kitchenStationsSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
