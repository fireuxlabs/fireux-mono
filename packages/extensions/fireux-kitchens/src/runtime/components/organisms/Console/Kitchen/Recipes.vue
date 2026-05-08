<template>
  <section class="console-surface space-y-6">
    <OrganismsConsoleKitchenRecipesRead />

    <OrganismsConsoleKitchenRecipesWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleRecipes } from '../../../../composables/fireux/app/kitchen-console/useKitchenConsoleRecipes'

const { canWrite } = useKitchenConsoleRecipes()
</script>
