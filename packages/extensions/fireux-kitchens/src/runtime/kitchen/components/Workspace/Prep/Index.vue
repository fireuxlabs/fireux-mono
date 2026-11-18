<template>
  <WorkspacePageHeader
    title="Prep &amp; Production"
    :description="description"
    variant="primary"
  />
  <KitchenWorkspacePrepOverview />
  <KitchenWorkspacePrepCreate />
  <UPageGrid as="section" aria-label="Preparation and production tools">
    <KitchenWorkspacePrepPlanOverview />
    <KitchenWorkspacePrepBatchesOverview />
    <KitchenWorkspacePrepPreparationsOverview />
    <KitchenWorkspacePrepRecipesOverview />
    <KitchenWorkspacePrepIngredientsOverview />
    <KitchenWorkspacePrepStationsOverview />
  </UPageGrid>
  <KitchenWorkspacePrepAi />
</template>

<script setup lang="ts">
import { useKitchenWorkspacePrep } from '../../../composables/workspace/prep/index'

const { description } = useKitchenWorkspacePrep()
</script>
