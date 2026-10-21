<template>
  <section class="min-w-0">
    <div v-if="storageKitchenId" class="space-y-6">
      <KitchenPrepAndProductionIngredientsCollection />
    </div>

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
      description="Choose an available Kitchen to manage its Ingredients."
    />
    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Select a kitchen"
      description="Choose a kitchen before managing ingredients."
    />
  </section>
</template>

<script setup lang="ts">
import { useKitchenIngredientsContext } from '../../../composables/workspace/ingredients/useKitchenIngredientsContext'

const { storageKitchenId, outcome } = useKitchenIngredientsContext()
</script>
