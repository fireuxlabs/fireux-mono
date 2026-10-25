<template>
  <div>
    <WorkspaceKitchenResearchToolSpecifications
      capability="Receiving"
      base-path="/workspace/kitchen/stock/receiving/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenReceivingSearchDemand } from '../../../../../../kitchen/models/receiving-search-demand'

const demand = kitchenReceivingSearchDemand

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
