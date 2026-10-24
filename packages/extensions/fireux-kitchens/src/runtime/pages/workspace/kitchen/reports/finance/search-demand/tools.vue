<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-finance-search-demand-tools">
      <template #header>
        <WorkspaceNavbar title="Sales Tool specifications" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchToolSpecifications
          capability="Sales"
          base-path="/workspace/kitchen/reports/finance/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenSalesSearchDemand } from '../../../../../../kitchen/models/sales-search-demand'

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
