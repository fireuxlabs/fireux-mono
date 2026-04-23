<template>
  <section class="console-surface space-y-4">
    <OrganismsConsoleKitchenRecipesRead
      :recipes="recipes"
      :pending="pending"
    />

    <OrganismsConsoleKitchenRecipesWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleRecipes } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleRecipes'

const { recipes, pending, canWrite } = useKitchenConsoleRecipes()
</script>
