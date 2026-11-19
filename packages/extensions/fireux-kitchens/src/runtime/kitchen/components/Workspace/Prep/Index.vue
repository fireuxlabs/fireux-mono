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
      <KitchenWorkspacePrepPreparationsOverview />
      <KitchenWorkspacePrepRecipesOverview />
      <KitchenWorkspacePrepIngredientsOverview />
      <KitchenWorkspacePrepStationsOverview />
    </UPageGrid>
  </section>
  <details class="kitchen-record-assistant">
    <summary>Ask KitchenAI about prep</summary>
    <KitchenWorkspacePrepAi />
  </details>
</template>

<script setup lang="ts">
import KitchenWorkspacePrepRecipesOverview from '../../../workspace/prep/recipes/Overview.vue'
import { useKitchenWorkspacePrep } from '../../../composables/workspace/prep/index'

const { description } = useKitchenWorkspacePrep()
</script>

<style scoped>
@import '../overview.css';
@import '../record-tools.css';
</style>
