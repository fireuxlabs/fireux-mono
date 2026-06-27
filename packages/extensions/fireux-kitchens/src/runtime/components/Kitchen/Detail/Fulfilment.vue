<template>
  <UCard v-if="deliveryZones.length">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">
            Delivery area
          </h2>
          <p class="text-sm text-dimmed">
            Minimum order and delivery fee by zone.
          </p>
        </div>

        <UBadge color="neutral" variant="soft">
          {{ deliveryZones.length }} zone{{ deliveryZones.length === 1 ? '' : 's' }}
        </UBadge>
      </div>
    </template>

    <ClientOnly>
      <KitchenFulfilmentDeliveryZonesMap :zones="deliveryZones" />
    </ClientOnly>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { readKitchenFulfilmentConfig } from '../../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: KitchenSurface | null
}>()

const deliveryZones = computed(() =>
  readKitchenFulfilmentConfig(props.kitchen).delivery_zones
)
</script>
