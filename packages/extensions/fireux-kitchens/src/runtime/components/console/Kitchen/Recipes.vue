<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleKitchenRecipesRead :recipes="recipes" />

    <OrganismsConsoleKitchenRecipesWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleRecipes } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleRecipes'

const { recipes, canWrite } = useKitchenConsoleRecipes()
</script>
