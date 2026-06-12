<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenOperationsRecipesRead />

    <UAlert
      v-if="readOnly"
      color="neutral"
      variant="soft"
      title="Read only"
      description="This kitchen can be inspected, but changes are disabled."
    />

    <ConsoleKitchenOperationsRecipesWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleRecipes } from '../../../../../composables/fireux/console/kitchen/operations/Recipes/useKitchenConsoleRecipes'

const { readOnly, canWrite } = useKitchenConsoleRecipes()
</script>
