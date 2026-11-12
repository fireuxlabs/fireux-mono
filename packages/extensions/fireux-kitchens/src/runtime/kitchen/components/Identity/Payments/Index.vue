<template>
  <section class="workspace-surface">
    <FireState
      v-if="pending || outcome === 'pending'"
      entity="Kitchen payments"
      outcome="pending"
    />
    <FireState
      v-else-if="outcome === 'error'"
      entity="Kitchen"
      outcome="error"
    />
    <UAlert v-else-if="error" title="Settings unavailable" color="error">
      <template #description>
        <FireCopyError :message="String(error)" /></template
    ></UAlert>
    <UAlert
      v-else-if="!selectedKitchen"
      title="Choose a Kitchen to configure these settings"
    />
    <KitchenIdentityPaymentsMethods
      v-if="selectedKitchen && !pending && !error"
      :fulfilment="fulfilment"
      :kitchen-id="kitchenId"
      :can-write="canWrite"
    />
  </section>
</template>
<script setup lang="ts">
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'

import { useKitchenFulfilment } from '../../../composables/fulfilment/useKitchenFulfilment'
const {
  selectedKitchen,
  kitchenId,
  canWrite,
  fulfilment,
  pending,
  error,
  outcome,
} = useKitchenFulfilment(useKitchenWorkspace().id)
</script>
