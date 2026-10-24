<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-receiving-search-demand-analysis">
      <template #header>
        <WorkspaceNavbar title="Receiving demand analysis" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchAnalysis
          capability="Receiving"
          base-path="/workspace/kitchen/stock/receiving/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenReceivingSearchDemand } from '../../../../../../kitchen/models/receiving-search-demand'

const demand = kitchenReceivingSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
