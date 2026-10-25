<template>
  <div>
    <WorkspaceKitchenResearchEvidence
      capability="Team"
      base-path="/workspace/kitchen/team/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenTeamSearchDemand } from '../../../../../kitchen/models/team-search-demand'

const demand = kitchenTeamSearchDemand

definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
