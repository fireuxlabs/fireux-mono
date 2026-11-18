<template>
  <WorkspacePageHeader
    title="Prep &amp; Production"
    :description="description"
    variant="primary"
  />
  <KitchenWorkspacePrepOverview />
  <KitchenWorkspacePrepCreate />
  <KitchenWorkspacePrepAi />
  <UPageGrid as="section" aria-label="Preparation and production tools">
    <KitchenWorkspacePrepPreparationsOverview />
    <KitchenWorkspacePrepRecipesOverview />
    <KitchenWorkspacePrepIngredientsOverview />
    <KitchenWorkspacePrepStationsOverview />
    <KitchenWorkspacePrepPlanOverview />
    <KitchenWorkspacePrepBatchesOverview />
  </UPageGrid>
</template>

<script setup lang="ts">
import { useKitchenWorkspacePrep } from '../../../composables/workspace/prep/index'

const { description } = useKitchenWorkspacePrep()
</script>
