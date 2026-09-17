<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-performance-search-demand-analysis">
      <template #header>
        <LayoutsWorkspaceNavbar title="Performance demand analysis" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchAnalysis
          capability="Performance"
          base-path="/workspace/kitchen/reports/performance/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenPerformanceSearchDemand } from '../../../../../../kitchen/models/performance-search-demand'

const demand = kitchenPerformanceSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
