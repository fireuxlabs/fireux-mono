<template>
  <section class="workspace-surface">
    <!-- Tools: add operation-level actions here when a real tool emerges. -->
    <WorkspaceKitchenOperationsRecipesRead />

    <UAlert
      v-if="readOnly"
      color="neutral"
      variant="soft"
      title="Read only"
      description="This kitchen can be inspected, but changes are disabled."
    />

    <WorkspaceOperationWritePanel
      v-if="canWrite"
      title="Create recipe"
      description="Add a recipe to this kitchen."
    >
      <WorkspaceKitchenOperationsRecipesWrite />
    </WorkspaceOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { provideKitchenRecipesWorkspace } from '../../../../composables/workspace/operations/Recipes/useKitchenRecipesWorkspace'

const { readOnly, canWrite } = provideKitchenRecipesWorkspace()
</script>
