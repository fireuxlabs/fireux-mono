<template>
  <section class="console-surface">
    <!-- Tools: add operation-level actions here when a real tool emerges. -->
    <ConsoleKitchenOperationsRecipesRead />

    <UAlert
      v-if="readOnly"
      color="neutral"
      variant="soft"
      title="Read only"
      description="This kitchen can be inspected, but changes are disabled."
    />

    <ConsoleOperationWritePanel
      v-if="canWrite"
      title="Create recipe"
      description="Add a recipe to this kitchen."
    >
      <ConsoleKitchenOperationsRecipesWrite />
    </ConsoleOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { provideKitchenRecipesWorkspace } from '../../../../../composables/fireux/console/kitchen/operations/Recipes/useKitchenRecipesWorkspace'

const { readOnly, canWrite } = provideKitchenRecipesWorkspace()
</script>
