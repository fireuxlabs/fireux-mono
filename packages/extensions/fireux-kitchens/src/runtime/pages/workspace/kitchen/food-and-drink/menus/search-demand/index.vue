<template>
  <div>
    <WorkspaceKitchenResearchEvidence
      capability="Menus"
      base-path="/workspace/kitchen/food-and-drink/menus/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenMenusSearchDemand } from '../../../../../../kitchen/models/menus-search-demand'

const demand = kitchenMenusSearchDemand

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
