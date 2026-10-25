<template>
  <div>
    <WorkspaceKitchenResearchEvidence
      capability="Purchasing"
      base-path="/workspace/kitchen/stock/purchasing/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenPurchasingSearchDemand } from '../../../../../../kitchen/models/purchasing-search-demand'

const demand = kitchenPurchasingSearchDemand

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
