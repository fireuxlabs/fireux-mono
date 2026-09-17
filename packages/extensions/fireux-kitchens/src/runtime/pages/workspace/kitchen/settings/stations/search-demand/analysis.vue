<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-stations-search-demand-analysis">
      <template #header>
        <LayoutsWorkspaceNavbar title="Stations demand analysis" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchAnalysis
          capability="Stations"
          base-path="/workspace/kitchen/settings/stations/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenStationsSearchDemand } from '../../../../../../kitchen/models/stations-search-demand'

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
