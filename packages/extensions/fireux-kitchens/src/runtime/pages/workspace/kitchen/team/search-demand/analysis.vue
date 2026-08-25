<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-team-search-demand-analysis">
      <template #header>
        <LayoutsWorkspaceNavbar title="Team demand analysis" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchAnalysis
          capability="Team"
          base-path="/workspace/kitchen/team/search-demand"
          :demand="demand"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { kitchenTeamSearchDemand } from '../../../../../kitchen/models/team-search-demand'

const demand = kitchenTeamSearchDemand

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
