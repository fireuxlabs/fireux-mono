<template>
  <section>
    <div v-if="storageKitchenId">
      <KitchenPrepAndProductionIngredientsCollection />
    </div>

    <UAlert
      v-else-if="outcome === 'error'"
      title="Kitchen unavailable"
      description="Your Kitchen could not be loaded. Please try again."
      color="error"
      variant="soft"
      role="alert"
      aria-live="assertive"
    >
      <template #actions>
        <FireCopyError
          message="Kitchen unavailable&#10;Your Kitchen could not be loaded. Please try again."
        />
      </template>
    </UAlert>
    <p v-else-if="outcome === 'pending'" role="status">Loading Kitchen…</p>
    <UAlert
      v-else-if="outcome === 'empty'"
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
