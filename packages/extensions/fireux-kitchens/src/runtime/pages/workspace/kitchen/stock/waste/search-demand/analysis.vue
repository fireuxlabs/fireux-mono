<template>
  <div>
    <WorkspaceKitchenResearchAnalysis
      capability="Waste"
      base-path="/workspace/kitchen/stock/waste/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenWasteSearchDemand } from '../../../../../../kitchen/models/waste-search-demand'

const demand = kitchenWasteSearchDemand

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
