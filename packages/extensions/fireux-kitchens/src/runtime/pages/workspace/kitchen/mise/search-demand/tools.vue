<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-mise-search-demand-tools">
      <template #header>
        <LayoutsWorkspaceNavbar title="Mise Tool specifications" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchToolSpecifications
          capability="Mise"
          base-path="/workspace/kitchen/mise/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenMiseSearchDemand } from '../../../../../kitchen/models/mise-search-demand'

const demand = kitchenMiseSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
