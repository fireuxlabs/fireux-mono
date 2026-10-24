<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-performance-search-demand">
      <template #header>
        <WorkspaceNavbar title="Performance search demand" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchEvidence
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
