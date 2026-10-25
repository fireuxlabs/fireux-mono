<template>
  <div>
    <WorkspaceKitchenResearchToolSpecifications
      capability="Inventory"
      base-path="/workspace/kitchen/stock/inventory/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenInventorySearchDemand } from '../../../../../../kitchen/models/inventory-search-demand'

const demand = kitchenInventorySearchDemand

definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
