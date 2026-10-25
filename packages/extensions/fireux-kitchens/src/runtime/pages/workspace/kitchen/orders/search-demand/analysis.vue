<template>
  <div>
    <WorkspaceKitchenResearchAnalysis
      capability="Orders & Service"
      base-path="/workspace/kitchen/orders/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenOrdersSearchDemand } from '../../../../../kitchen/models/orders-search-demand'

const demand = kitchenOrdersSearchDemand

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
