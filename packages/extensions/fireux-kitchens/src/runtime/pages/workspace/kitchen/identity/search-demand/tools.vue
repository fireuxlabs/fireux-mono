<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-identity-search-demand-tools">
      <template #header>
        <LayoutsWorkspaceNavbar title="Identity Tool specifications" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchToolSpecifications
          capability="Identity"
          base-path="/workspace/kitchen/identity/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenIdentitySearchDemand } from '../../../../../kitchen/models/identity-search-demand'

const demand = kitchenIdentitySearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
