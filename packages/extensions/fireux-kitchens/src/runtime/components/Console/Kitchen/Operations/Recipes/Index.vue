<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenOperationsRecipesRead />

    <ConsoleKitchenOperationsRecipesWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleRecipes } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleRecipes'

const { canWrite } = useKitchenConsoleRecipes()
</script>
