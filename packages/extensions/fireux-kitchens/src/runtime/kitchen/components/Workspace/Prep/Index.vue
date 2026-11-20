<template>
  <WorkspacePageHeader
    title="Prep &amp; Production"
    :description="description"
    variant="primary"
  />
  <section aria-labelledby="production-heading" class="kitchen-overview-group">
    <h2 id="production-heading" class="fx-type-card-heading">Production</h2>
    <UPageGrid>
      <KitchenWorkspacePrepPlanOverview />
      <KitchenWorkspacePrepBatchesOverview />
    </UPageGrid>
  </section>
  <KitchenWorkspacePrepOverview />
  <section aria-labelledby="prep-tools-heading" class="kitchen-overview-group">
    <h2 id="prep-tools-heading" class="fx-type-card-heading">Prep library</h2>
    <UPageGrid>
      <KitchenWorkspacePrepPreparationsOverview
        :summary="summaries.preparations"
      />
      <KitchenWorkspacePrepRecipesOverview :summary="summaries.recipes" />
      <KitchenWorkspacePrepIngredientsOverview
        :summary="summaries.ingredients"
      />
      <KitchenWorkspacePrepStationsOverview :summary="summaries.stations" />
    </UPageGrid>
  </section>
  <details class="kitchen-record-assistant">
    <summary>Ask KitchenAI about prep</summary>
    <KitchenWorkspacePrepAi />
  </details>
</template>

<script setup lang="ts">
import KitchenWorkspacePrepStationsOverview from './Stations/Overview.vue'
import KitchenWorkspacePrepRecipesOverview from './Recipes/Overview.vue'
import { useKitchenWorkspacePrep } from '../../../composables/workspace/prep/index'

const { description, summaries } = useKitchenWorkspacePrep()
</script>

<style scoped>
@import '../overview.css';
@import '../record-tools.css';
</style>
