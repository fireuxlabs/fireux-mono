<template>
  <div>
    <WorkspaceKitchenResearchEvidence
      capability="Stations"
      base-path="/workspace/kitchen/stations/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenStationsSearchDemand } from '../../../../../kitchen/models/stations-search-demand'

const demand = kitchenStationsSearchDemand

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
