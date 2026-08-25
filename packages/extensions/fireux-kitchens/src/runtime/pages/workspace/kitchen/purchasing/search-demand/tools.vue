<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-purchasing-search-demand-tools">
      <template #header>
        <LayoutsWorkspaceNavbar title="Purchasing Tool specifications" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchToolSpecifications
          capability="Purchasing"
          base-path="/workspace/kitchen/purchasing/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenPurchasingSearchDemand } from '../../../../../kitchen/models/purchasing-search-demand'

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
