<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-waste-report-search-demand-tools">
      <template #header>
        <LayoutsWorkspaceNavbar title="Waste Report Tool specifications" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchToolSpecifications
          capability="Waste Report"
          base-path="/workspace/kitchen/waste-report/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenWasteReportSearchDemand } from '../../../../../kitchen/models/waste-report-search-demand'

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
