<template>
  <div>
    <WorkspaceKitchenResearchToolSpecifications
      capability="Suppliers"
      base-path="/workspace/kitchen/stock/suppliers/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenSuppliersSearchDemand } from '../../../../../../kitchen/models/suppliers-search-demand'

const demand = kitchenSuppliersSearchDemand

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
