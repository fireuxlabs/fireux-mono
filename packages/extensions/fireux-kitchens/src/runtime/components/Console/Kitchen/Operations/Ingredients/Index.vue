<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenOperationsIngredientsRead />

    <ConsoleKitchenOperationsIngredientsWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleIngredients } from '../../../../../composables/fireux/console/kitchen/Operations/Ingredients/useKitchenConsoleIngredients'

const { canWrite } = useKitchenConsoleIngredients()
</script>
