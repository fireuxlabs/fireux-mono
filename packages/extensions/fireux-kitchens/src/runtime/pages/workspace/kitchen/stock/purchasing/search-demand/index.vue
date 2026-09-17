<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-purchasing-search-demand">
      <template #header>
        <LayoutsWorkspaceNavbar title="Purchasing search demand" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchEvidence
          capability="Purchasing"
          base-path="/workspace/kitchen/stock/purchasing/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenPurchasingSearchDemand } from '../../../../../../kitchen/models/purchasing-search-demand'

const demand = kitchenPurchasingSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
