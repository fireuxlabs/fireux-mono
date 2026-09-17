<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-waste-search-demand-tools">
      <template #header>
        <LayoutsWorkspaceNavbar title="Waste Tool specifications" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchToolSpecifications
          capability="Waste"
          base-path="/workspace/kitchen/stock/waste/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenWasteSearchDemand } from '../../../../../../kitchen/models/waste-search-demand'

const demand = kitchenWasteSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
