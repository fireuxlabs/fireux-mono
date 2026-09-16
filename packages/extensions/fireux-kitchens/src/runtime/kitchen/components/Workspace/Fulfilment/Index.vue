<template>
  <section class="workspace-surface">
    <UPageHeader title="Delivery & payments" />
    <MoleculesStateCard
      v-if="pending || outcome === 'pending'"
      entity="Kitchen fulfilment"
      kind="document"
      loading
    />
    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="Kitchen"
      kind="document"
      state="error"
    />
    <UAlert
      v-else-if="error"
      title="Delivery & payments unavailable"
      color="error"
      ><template #description
        ><MoleculesCopyError :message="String(error)" /></template
    ></UAlert>
    <UAlert
      v-else-if="!selectedKitchen"
      title="Choose a Kitchen to configure delivery and payments"
    />
    <WorkspaceKitchenFulfilmentPayments
      v-if="selectedKitchen && !pending && !error"
      :fulfilment="fulfilment"
      :kitchen-id="kitchenId"
      :can-write="canWrite"
    />
    <WorkspaceKitchenFulfilmentDelivery
      v-if="selectedKitchen && !pending && !error"
      :fulfilment="fulfilment"
      :kitchen-id="kitchenId"
      :can-write="canWrite"
    />
  </section>
</template>
<script setup lang="ts">
import { useKitchenFulfilment } from '../../../composables/workspace/fulfilment/useKitchenFulfilment'
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
