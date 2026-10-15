<template>
  <section class="min-w-0">
    <div v-if="storageKitchenId" class="space-y-4">
      <WorkspaceKitchenDishesCollection />
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
      :description="`Choose an available Kitchen to manage ${catalogue.plural}.`"
    />
    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="Select a kitchen"
      :description="`Choose a kitchen before managing ${catalogue.plural}.`"
    />
  </section>
</template>

<script setup lang="ts">
import { useKitchenDishesContext } from '../../../composables/workspace/dishes/useKitchenDishesContext'

const { storageKitchenId, outcome, catalogue } = useKitchenDishesContext()
</script>
