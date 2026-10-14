<template>
  <section class="workspace-surface">
    <MoleculesStateCard
      v-if="pending || outcome === 'pending'"
      entity="Kitchen payments"
      kind="document"
      loading
    />
    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="Kitchen"
      kind="document"
      state="error"
    />
    <UAlert v-else-if="error" title="Settings unavailable" color="error"
      ><template #description
        ><MoleculesCopyError :message="String(error)" /></template
    ></UAlert>
    <UAlert
      v-else-if="!selectedKitchen"
      title="Choose a Kitchen to configure these settings"
    />
    <Methods
      v-if="selectedKitchen && !pending && !error"
      :fulfilment="fulfilment"
      :kitchen-id="kitchenId"
      :can-write="canWrite"
    />
  </section>
</template>
<script setup lang="ts">
import Methods from './Methods.vue'
import { useKitchenFulfilment } from '../../../../composables/workspace/fulfilment/useKitchenFulfilment'
const {
  selectedKitchen,
  kitchenId,
  canWrite,
  fulfilment,
  pending,
  error,
  outcome,
} = useKitchenFulfilment()
</script>
