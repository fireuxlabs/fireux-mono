<template>
  <section class="workspace-surface">
    <UPageHeader
      title="Integrations"
      description="Connect your kitchen to the places customers find you."
    />
    <MoleculesStateCard
      v-if="outcome === 'pending' || outcome === 'idle'"
      entity="Kitchen"
      loading
    />
    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="Kitchen"
      state="error"
    />
    <template v-else-if="selectedKitchen">
      <KitchenOrderingSetup :key="kitchenId" :kitchen-id="kitchenId" in-workspace />
      <WorkspaceKitchenIntegrationsWebsiteOrdering
        :key="kitchenId"
        :kitchen="selectedKitchen"
      />
      <UPageCard
        title="Delivery & payment"
        description="Delivery zones and payment methods."
        to="/workspace/kitchen/fulfilment"
        icon="i-lucide-map-pinned"
      />
    </template>
    <UAlert v-else title="Choose a Kitchen to set up website ordering" />
  </section>
</template>
<script setup lang="ts">
import KitchenOrderingSetup from '../../Ordering/Setup.vue'
import { useKitchenWorkspaceIdentity } from '../../../composables/workspace/identity/useKitchenWorkspaceIdentity'
const { selectedKitchen, kitchenId, outcome } = useKitchenWorkspaceIdentity()
</script>
