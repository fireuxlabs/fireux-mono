<template>
  <section class="workspace-surface">
    <div v-if="kitchenId" class="space-y-6">
      <WorkspaceKitchenIngredientsRead />
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Select a kitchen"
      description="Choose a kitchen before managing ingredients."
    />
  </section>
</template>

<script setup lang="ts">
import { useKitchenIngredientsWorkspace } from '../../../composables/workspace/Ingredients/useKitchenIngredientsWorkspace'

const { kitchenId } = useKitchenIngredientsWorkspace()
</script>
