<template>
  <WorkspacePageHeader
    class="border border-red-500"
    title="Prep &amp; Production"
    :description="description"
    variant="primary"
  />
  <KitchenPrepAndProductionOverview class="border border-blue-500" />
  <KitchenPrepAndProductionCreate class="border border-orange-500" />
  <KitchenPrepAndProductionAi class="border border-purple-500" />
  <UPageGrid
    as="section"
    class="border border-pink-500"
    aria-label="Preparation and production tools"
  >
    <KitchenPrepAndProductionPreparationsOverview />
    <KitchenPrepAndProductionRecipesOverview />
    <KitchenPrepAndProductionIngredientsOverview />
    <KitchenPrepAndProductionStationsOverview />
    <KitchenPrepAndProductionPlanOverview />
    <KitchenPrepAndProductionBatchesOverview />
  </UPageGrid>
</template>

<script setup lang="ts">
import { useKitchenPrepWorkspace } from '../../composables/workspace/prep/useKitchenPrepWorkspace'

const { description } = useKitchenPrepWorkspace()
</script>
