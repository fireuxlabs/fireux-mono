<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-waste-search-demand-analysis">
      <template #header>
        <WorkspaceNavbar title="Waste demand analysis" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchAnalysis
          capability="Waste"
          base-path="/workspace/kitchen/stock/waste/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenWasteSearchDemand } from '../../../../../../kitchen/models/waste-search-demand'

const demand = kitchenWasteSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
