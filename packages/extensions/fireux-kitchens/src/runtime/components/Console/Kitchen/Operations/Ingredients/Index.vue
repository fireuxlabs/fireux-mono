<template>
  <section class="console-surface space-y-6">
    <!-- Tools: add operation-level actions here when a real tool emerges. -->
    <ConsoleKitchenOperationsIngredientsRead />

    <ConsoleOperationWritePanel
      v-if="canWrite"
      title="Add ingredient"
      description="Select or create an ingredient for this kitchen."
    >
      <ConsoleKitchenOperationsIngredientsWrite />
    </ConsoleOperationWritePanel>
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleIngredients } from '../../../../../composables/fireux/console/kitchen/operations/Ingredients/useKitchenConsoleIngredients'

const { canWrite } = useKitchenConsoleIngredients()
</script>
