<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-suppliers-search-demand-analysis">
      <template #header>
        <WorkspaceNavbar title="Suppliers demand analysis" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchAnalysis
          capability="Suppliers"
          base-path="/workspace/kitchen/stock/suppliers/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenSuppliersSearchDemand } from '../../../../../../kitchen/models/suppliers-search-demand'

const demand = kitchenSuppliersSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
