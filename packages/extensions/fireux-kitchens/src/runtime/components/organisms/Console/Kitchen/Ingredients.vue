<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleKitchenIngredientsRead />

    <OrganismsConsoleKitchenIngredientsWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleIngredients } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleIngredients'

const { canWrite } = useKitchenConsoleIngredients()
</script>
