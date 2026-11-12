<template>
  <div>
    <WorkspaceKitchenResearchToolSpecifications
      capability="Items"
      base-path="/workspace/kitchen/menu/items/search-demand"
      :demand="demand"
    />
  </div>
</template>

<script setup lang="ts">
import { kitchenItemsSearchDemand } from '../../../../../../kitchen/models/items-search-demand'

const demand = kitchenItemsSearchDemand

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
