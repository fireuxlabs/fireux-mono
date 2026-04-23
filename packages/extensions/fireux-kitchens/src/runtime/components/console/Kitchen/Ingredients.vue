<template>
  <section class="console-surface space-y-4">
    <OrganismsConsoleKitchenIngredientsRead
      :ingredients="ingredients"
      :pending="pending"
    />

    <OrganismsConsoleKitchenIngredientsWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleIngredients } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleIngredients'

const { ingredients, pending, canWrite } = useKitchenConsoleIngredients()
</script>
