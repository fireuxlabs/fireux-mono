<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-finance-search-demand-analysis">
      <template #header>
        <LayoutsWorkspaceNavbar title="Sales demand analysis" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchAnalysis
          capability="Sales"
          base-path="/workspace/kitchen/finance/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenSalesSearchDemand } from '../../../../../kitchen/models/sales-search-demand'

const demand = kitchenSalesSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
