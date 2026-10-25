<template>
  <section class="workspace-surface">
    <UPageHeader
      title="Integrations"
      description="Connect your kitchen to the places customers find you."
    />
    <FireStateCard
      v-if="outcome === 'pending' || outcome === 'idle'"
      entity="Kitchen"
      loading
    />
    <FireStateCard
      v-else-if="outcome === 'error'"
      entity="Kitchen"
      state="error"
    />
    <template v-else-if="selectedKitchen">
      <KitchenIntegrationsWebsiteOrdering
        :key="kitchenId"
        :kitchen="selectedKitchen"
      />
      <UPageCard
        title="Payments"
        description="Venue payment methods."
        to="/workspace/kitchen/identity/payments"
        icon="i-lucide-map-pinned"
      />
    </template>
    <UAlert v-else title="Choose a Kitchen to set up website ordering" />
  </section>
</template>
<script setup lang="ts">
import { useKitchenWorkspaceIdentity } from '../../composables/workspace/useKitchenWorkspaceIdentity'
const { selectedKitchen, kitchenId, outcome } = useKitchenWorkspaceIdentity()
</script>
