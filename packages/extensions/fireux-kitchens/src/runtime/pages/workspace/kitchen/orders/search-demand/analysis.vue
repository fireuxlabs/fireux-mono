<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-orders-search-demand-analysis">
      <template #header>
        <LayoutsWorkspaceNavbar title="Orders & Service demand analysis" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchAnalysis
          capability="Orders & Service"
          base-path="/workspace/kitchen/orders/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenOrdersSearchDemand } from '../../../../../kitchen/models/orders-search-demand'

const demand = kitchenOrdersSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
