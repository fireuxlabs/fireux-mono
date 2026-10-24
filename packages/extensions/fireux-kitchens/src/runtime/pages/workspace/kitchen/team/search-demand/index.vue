<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-team-search-demand">
      <template #header>
        <WorkspaceNavbar title="Team search demand" />
      </template>

      <template #body>
        <WorkspaceKitchenResearchEvidence
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
