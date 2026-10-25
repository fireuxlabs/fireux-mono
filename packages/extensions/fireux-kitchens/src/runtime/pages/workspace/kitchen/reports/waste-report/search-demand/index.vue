<template>
  <div>
    <WorkspaceKitchenResearchEvidence
      capability="Waste Report"
      base-path="/workspace/kitchen/reports/waste-report/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenWasteReportSearchDemand } from '../../../../../../kitchen/models/waste-report-search-demand'

const demand = kitchenWasteReportSearchDemand

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
