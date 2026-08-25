<template>
  <section class="workspace-surface">
    <WorkspaceKitchenRecipesRead />

    <UAlert
      v-if="readOnly"
      color="neutral"
      variant="soft"
      title="Read only"
      description="This kitchen can be inspected, but changes are disabled."
    />

  </section>
</template>

<script setup lang="ts">
import { useKitchenRecipesWorkspace } from '../../../composables/workspace/Recipes/useKitchenRecipesWorkspace'

const { readOnly } = useKitchenRecipesWorkspace()
</script>
