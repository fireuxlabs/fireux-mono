<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-waste-report-search-demand-analysis">
      <template #header>
        <WorkspaceNavbar title="Waste Report demand analysis" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchAnalysis
          capability="Waste Report"
          base-path="/workspace/kitchen/reports/waste-report/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenWasteReportSearchDemand } from '../../../../../../kitchen/models/waste-report-search-demand'

const demand = kitchenWasteReportSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
