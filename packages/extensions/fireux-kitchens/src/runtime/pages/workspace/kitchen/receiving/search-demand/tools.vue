<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-receiving-search-demand-tools">
      <template #header>
        <LayoutsWorkspaceNavbar title="Receiving Tool specifications" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchToolSpecifications
          capability="Receiving"
          base-path="/workspace/kitchen/receiving/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenReceivingSearchDemand } from '../../../../../kitchen/models/receiving-search-demand'

const demand = kitchenReceivingSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
