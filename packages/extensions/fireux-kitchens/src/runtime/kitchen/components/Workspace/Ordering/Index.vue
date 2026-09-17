<template>
  <section class="workspace-surface">
    <UPageHeader title="Ordering" />
    <MoleculesStateCard
      v-if="outcome === 'pending'"
      entity="Kitchen ordering"
      kind="document"
      loading
    />
    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="Kitchen ordering"
      kind="document"
      state="error"
    />
    <div v-else-if="selectedKitchen" class="ordering-services">
      <UCard v-for="entry in entries" :key="entry.type">
        <div class="ordering-service-row">
          <div>
            <h2>{{ entry.label }}</h2>
            <p>{{ entry.summary }}</p>
          </div>
          <UButton
            :to="`/workspace/kitchen/orders/ordering/${entry.type}`"
            :aria-label="`Configure ${entry.label}`"
            icon="i-lucide-chevron-right"
            color="neutral"
            variant="ghost"
          />
        </div>
      </UCard>
    </div>
    <UAlert v-else title="Choose a Kitchen to configure ordering" />
    <div class="ordering-links">
      <UButton
        to="/workspace/kitchen/fulfilment"
        label="Delivery zones & payments"
        icon="i-lucide-wallet"
        color="neutral"
        variant="outline"
      />
      <UButton
        to="/workspace/kitchen/channels"
        label="Channels"
        icon="i-lucide-panels-top-left"
        color="neutral"
        variant="outline"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenOrdering } from '../../../composables/workspace/ordering/useKitchenOrdering'
import { KitchenOrderTypes } from '../../../models/order-lifecycle.model'
import { kitchenOrderTypeLabel } from '../../../utils/kitchen-order-label'
const { selectedKitchen, outcome, services } = useKitchenOrdering()
const entries = computed(() =>
  KitchenOrderTypes.map((type) => {
    const service = services.value.find((item) => item.type === type)
    return {
      type,
      label: kitchenOrderTypeLabel(type),
      summary: !service?.enabled
        ? 'Off'
        : service.availability?.paused
          ? 'Paused'
          : `${service.menu_ids.length} Menus`,
    }
  })
)
</script>
<style scoped>
.ordering-services {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
  gap: 1rem;
}
.ordering-service-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
h2 {
  margin: 0;
  font-weight: 600;
}
p {
  margin: 0.3rem 0 0;
  color: var(--ui-text-muted);
}
.ordering-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
</style>
