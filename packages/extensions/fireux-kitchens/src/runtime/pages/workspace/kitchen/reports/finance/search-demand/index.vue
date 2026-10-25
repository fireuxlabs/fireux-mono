<template>
  <div>
    <WorkspaceKitchenResearchEvidence
      capability="Sales"
      base-path="/workspace/kitchen/reports/finance/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenSalesSearchDemand } from '../../../../../../kitchen/models/sales-search-demand'

const demand = kitchenSalesSearchDemand

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
