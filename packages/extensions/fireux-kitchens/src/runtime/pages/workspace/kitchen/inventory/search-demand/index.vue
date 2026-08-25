<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-inventory-search-demand">
      <template #header>
        <LayoutsWorkspaceNavbar title="Inventory search demand" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchEvidence
          capability="Inventory"
          base-path="/workspace/kitchen/inventory/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenInventorySearchDemand } from '../../../../../kitchen/models/inventory-search-demand'

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
