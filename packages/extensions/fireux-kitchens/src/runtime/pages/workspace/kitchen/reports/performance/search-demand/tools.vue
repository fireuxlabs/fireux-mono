<template>
  <div>
    <WorkspaceKitchenResearchToolSpecifications
      capability="Performance"
      base-path="/workspace/kitchen/reports/performance/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenPerformanceSearchDemand } from '../../../../../../kitchen/models/performance-search-demand'

const demand = kitchenPerformanceSearchDemand

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
