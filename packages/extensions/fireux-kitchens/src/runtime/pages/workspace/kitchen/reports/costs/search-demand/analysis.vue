<template>
  <div>
    <WorkspaceKitchenResearchAnalysis
      capability="Costs"
      base-path="/workspace/kitchen/reports/costs/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenCostsSearchDemand } from '../../../../../../kitchen/models/costs-search-demand'

const demand = kitchenCostsSearchDemand

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
