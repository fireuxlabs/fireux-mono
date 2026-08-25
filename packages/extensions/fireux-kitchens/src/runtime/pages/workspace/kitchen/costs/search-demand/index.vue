<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-costs-search-demand">
      <template #header>
        <LayoutsWorkspaceNavbar title="Costs search demand" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchEvidence
          capability="Costs"
          base-path="/workspace/kitchen/costs/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenCostsSearchDemand } from '../../../../../kitchen/models/costs-search-demand'

const demand = kitchenCostsSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
