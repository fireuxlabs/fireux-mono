<template>
  <KitchenPrepAndProductionRecipesCollection v-if="storageKitchenId" />
  <MoleculesStateCard
    v-else-if="outcome === 'error'"
    state="error"
    title="Kitchen unavailable"
    description="Your Kitchen could not be loaded. Please try again."
  />
  <p v-else-if="outcome === 'pending'" role="status">Loading Kitchen…</p>
  <UAlert
    v-else-if="outcome === 'missing'"
    color="neutral"
    title="Kitchen not found"
    description="Choose an available Kitchen to manage its Recipes."
  />
  <UAlert
    v-else
    color="neutral"
    title="Select a kitchen"
    description="Choose a Kitchen before managing recipes."
  />
</template>
<script setup lang="ts">
import { useKitchenRecipesContext } from '../../../composables/workspace/recipes/useKitchenRecipesContext'
const { storageKitchenId, outcome } = useKitchenRecipesContext()
</script>
