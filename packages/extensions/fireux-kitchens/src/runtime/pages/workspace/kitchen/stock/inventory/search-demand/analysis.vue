<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-inventory-search-demand-analysis">
      <template #header>
        <LayoutsWorkspaceNavbar title="Inventory demand analysis" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchAnalysis
          capability="Inventory"
          base-path="/workspace/kitchen/stock/inventory/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenInventorySearchDemand } from '../../../../../../kitchen/models/inventory-search-demand'

const demand = kitchenInventorySearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
